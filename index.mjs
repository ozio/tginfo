import https from 'node:https'

import {
  TG_DOMAIN,
  EXCEPTIONAL_BOT_NAMES,
  ATTRIBUTES,
  ERROR_NOT_TELEGRAM_LINK,
  ERROR_USER_DOES_NOT_EXIST,
  ERROR_LINK_EXPIRED,
  TYPE_USER,
  TYPE_BOT,
  TYPE_PUBLIC_GROUP,
  TYPE_PRIVATE_GROUP,
  TYPE_PUBLIC_CHANNEL,
  TYPE_PRIVATE_CHANNEL,
  REGEX_USERNAME,
  REGEX_INVITECODE,
} from './constants.mjs'

const botExceptions = new Set(EXCEPTIONAL_BOT_NAMES)

const objectAttrsOrder = Object.fromEntries(ATTRIBUTES.map((a, i) => [a, i]))

const cleanUnicode = (text) => {
  return text
    .replaceAll('&#33;', '!')
    .replaceAll('&#39;', '\'')
    .replaceAll('&#036;', '$')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
}

const sortValues = (object, order) => {
  return Object.fromEntries(
    Object
      .entries(object)
      .sort(([a], [b]) => order[a] - order[b])
  )
}

const pickValues = (object, pick) => {
  return Object.fromEntries(
    Object
      .entries(object)
      .filter(([key]) => pick.includes(key) || key === 'error')
  )
}

const request = async (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      res.on('data', (data) => {
        resolve(data.toString())
      })
    })

    req.on('error', reject)

    req.end()
  })
}

const isValidUsername = (rawUsername) => {
  if (!rawUsername || rawUsername.startsWith('+')) return false

  const username = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername

  if (EXCEPTIONAL_BOT_NAMES.includes(username)) return true

  return REGEX_USERNAME.test(username)
}

const isValidInviteCode = (rawCode) => {
  if (!rawCode || rawCode.startsWith('@')) return false

  const code = rawCode.startsWith('+') ? rawCode.slice(1) : rawCode

  return REGEX_INVITECODE.test(code)
}

const getSlugFromInput = (input) => {
  let slug

  try {
    let url = new URL(input)

    const { protocol, host, pathname, searchParams } = url

    if (protocol === 'tg:') {
      if (host === 'resolve') {
        slug = searchParams.get('domain')
      } else if (host === 'join') {
        const invite = searchParams.get('invite')

        if (invite) slug = `+${invite}`
      }
    } else if (
      (protocol === 'http:' || protocol === 'https:') &&
      (host === 't.me' || host === 'telegram.me' || host === 'telegram.dog')
    ) {
      if (pathname.startsWith('/joinchat/')) {
        slug = `+${pathname.slice(10)}`
      } else if (pathname.startsWith('/s/')) {
        slug = cutBetween(pathname.slice(2), '/', '?')
      } else {
        slug = cutBetween(pathname, '/', '?')
      }
    }
  } catch (e) {
    slug = input
  }

  if (isValidUsername(slug)) {
    slug = slug.startsWith('@') ? slug.slice(1) : slug
  } else if (isValidInviteCode(slug)) {
    slug = slug.startsWith('+') ? slug : `+${slug}`
  } else {
    slug = null
  }

  if (!slug) {
    return null
  }

  return slug
}

const slugToTelegramWebUrl = (slug) => {
  if (!isValidUsername(slug) && !isValidInviteCode(slug)) return null

  return `https://t.me/${slug}`
}

const slugToTelegramURL = (slug) => {
  if (!isValidUsername(slug) && !isValidInviteCode(slug)) return null

  if (slug.startsWith('+')) {
    return `tg://join?invite=${slug.slice(1)}`
  } else {
    return `tg://resolve?domain=${slug}`
  }
}

const cutBetween = (string, start, end) => {
  let foundStartIndex = 0
  let foundEndIndex = 0
  let isStartHasFound = false

  let output = ''

  for (let i = 0, l = string.length; i < l; i++) {
    const char = string[i]

    if (isStartHasFound) {
      output += char

      if (end[foundEndIndex] === char) {
        foundEndIndex++

        if (foundEndIndex === end.length) {
          output = output.slice(0, end.length * -1)
          break
        }
      } else {
        foundEndIndex = 0
      }
    } else {
      if (start[foundStartIndex] === char) {
        foundStartIndex++

        if (foundStartIndex === start.length) {
          isStartHasFound = true
        }
      } else {
        foundStartIndex = 0
      }
    }
  }

  return output
}

const getAttrsFromHTML = (html) => {
  const values = {}
  const lines = html.split('\n')

  for (const line of lines) {
    if (!values.title && line.startsWith('<meta property="og:title"')) {
      console.log(line)
      values.title = cleanUnicode(cutBetween(line, 'content="', '">'))

      if (values.title.startsWith('Telegram: Contact')) {
        return { error: ERROR_USER_DOES_NOT_EXIST }
      }

      if (values.title === 'Join group chat on Telegram') {
        return { error: ERROR_LINK_EXPIRED }
      }

      continue
    }

    if (!values.image && line.startsWith('<meta property="og:image"')) {
      values.image = cutBetween(line, 'content="', '">')

      if (values.image === 'https://telegram.org/img/t_logo.png') {
        values.image = undefined
      }
      continue
    }

    if (!values.info && line.startsWith('<meta property="og:description"')) {
      values.info = cleanUnicode(cutBetween(line, 'content="', '">'))
        .replaceAll('\t', '\n')
        .trim()

      if (values.info === `You can contact @${values.username} right away.`) {
        delete values.info
      } else if (values.info === `You can view and join @${values.username} right away.`) {
        delete values.info
      }

      continue
    }

    if (!values.verified && line.includes('<i class="verified-icon">')) {
      values.verified = true
      continue
    }

    if (!values.type) {
      if (line.includes('">Join Channel</a>')) {
        values.type = TYPE_PRIVATE_CHANNEL
        continue
      }

      if (line.includes('">Preview channel</a>')) {
        values.type = TYPE_PUBLIC_CHANNEL
        values.previewUrl = `${TG_DOMAIN}/s/${values.username}`
        continue
      }

      if (line.includes('">Join Group</a>')) {
        values.type = TYPE_PRIVATE_GROUP
        continue
      }

      if (line.includes('">View in Telegram</a>')) {
        values.type = TYPE_PUBLIC_GROUP
        continue
      }

      if (line.includes('">Send Message</a>')) {
        const lcUsername = values.username.toLowerCase()

        if (lcUsername.endsWith('bot') || botExceptions.has(lcUsername)) {
          values.type = TYPE_BOT
        } else {
          values.type = TYPE_USER
        }
        continue
      }
    }

    if (!values.username && line.includes('<title>Telegram: Contact ')) {
      values.username = cutBetween(line, 'Contact @', '<')
    }

    if (line.startsWith('<div class="tgme_page_extra">')) {
      const string = cutBetween(line, '">', '<')

      if (!string) continue

      string.split(', ')
        .forEach(part => {
          const value = parseInt(part.replace(/\D/g, ''))

          if (part.includes('subscriber')) {
            values.subscribers = value
          } else if (part.includes('online')) {
            values.online = value
          } else if (part.includes('member')) {
            values.members = value
          }
        })
    }
  }

  values.verified = !!values.verified

  return values
}

const tginfo = async (input, attrs = [], throwOnError = false) => {
  const _attrs = attrs.filter(attr => ATTRIBUTES.includes(attr))

  let values = {}

  const slug = getSlugFromInput(input)

  if (slug) {
    values.webUrl = slugToTelegramWebUrl(slug)
    values.tgUrl = slugToTelegramURL(slug)

    const hasTgUrl = _attrs.includes('tgUrl')
    const hasWebUrl = _attrs.includes('webUrl')
    const hasType = _attrs.includes('type')
    const hasWrongName = EXCEPTIONAL_BOT_NAMES.includes(slug)

    if (_attrs.length === 1) {
      if (hasWebUrl) {
        return { webUrl: values.webUrl }
      }
      if (hasTgUrl) {
        return { tgUrl: values.tgUrl }
      }
      if (hasType && hasWrongName) {
        return { type: TYPE_BOT }
      }
    } else if (_attrs.length === 2) {
      if (hasTgUrl && hasWebUrl) {
        return { webUrl: values.webUrl, tgUrl: values.tgUrl }
      }
      if (hasType && hasWebUrl && hasWrongName) {
        return { type: TYPE_BOT, webUrl: values.webUrl }
      }
      if (hasType && hasTgUrl && hasWrongName) {
        return { type: TYPE_BOT, tgUrl: values.tgUrl }
      }
    } else if (_attrs.length === 3) {
      if (hasType && hasWebUrl && hasTgUrl && hasWrongName) {
        return { type: TYPE_BOT, webUrl: values.webUrl, tgUrl: values.tgUrl }
      }
    }

    const url = values.webUrl

    values = {
      ...values,
      ...getAttrsFromHTML(await request(url)),
    }
  } else {
    values.error = ERROR_NOT_TELEGRAM_LINK
  }

  if (values.error && throwOnError) {
    throw new Error(values.error)
  }

  if (_attrs.length === 0) {
    return sortValues(values, objectAttrsOrder)
  }

  return pickValues(sortValues(values, objectAttrsOrder), _attrs)
}

export default tginfo
