import https from 'node:https'

import {
  TG_DOMAIN,
  BOTS_WITH_WRONG_NAMES,
  ATTRIBUTES,
  ERROR_NOT_TELEGRAM_LINK,
  ERROR_USER_DONT_EXIST,
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

const botExceptions = new Set(BOTS_WITH_WRONG_NAMES)

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

  if (BOTS_WITH_WRONG_NAMES.includes(username)) return true

  return REGEX_USERNAME.test(username)
}

const isValidInviteCode = (rawCode) => {
  if (!rawCode || rawCode.startsWith('@')) return false

  const code = rawCode.startsWith('+') ? rawCode.slice(1) : rawCode

  return REGEX_INVITECODE.test(code)
}

const getHandleFromInput = (input) => {
  let handle

  try {
    let url = new URL(input)

    const { protocol, host, pathname, searchParams } = url

    if (protocol === 'tg:') {
      if (host === 'resolve') {
        handle = searchParams.get('domain')
      } else if (host === 'join') {
        const invite = searchParams.get('invite')

        if (invite) handle = `+${invite}`
      }
    } else if (
      (protocol === 'http:' || protocol === 'https:') &&
      (host === 't.me' || host === 'telegram.me')
    ) {
      if (pathname.startsWith('/joinchat/')) {
        handle = `+${pathname.slice(10)}`
      } else if (pathname.startsWith('/s/')) {
        handle = pathname.slice(3)
      } else {
        handle = pathname.slice(1)
      }
    }
  } catch (e) {
    handle = input
  }

  if (isValidUsername(handle)) {
    handle = handle.startsWith('@') ? handle.slice(1) : handle
  } else if (isValidInviteCode(handle)) {
    handle = handle.startsWith('+') ? handle : `+${handle}`
  } else {
    handle = null
  }

  if (!handle) {
    return null
  }

  return handle
}

const handleToTelegramWebUrl = (handle) => {
  if (!isValidUsername(handle) && !isValidInviteCode(handle)) return null

  return `https://t.me/${handle}`
}

const handleToTelegramURL = (handle) => {
  if (!isValidUsername(handle) && !isValidInviteCode(handle)) return null

  if (handle.startsWith('+')) {
    return `tg://join?invite=${handle.slice(1)}`
  } else {
    return `tg://resolve?domain=${handle}`
  }
}

const cutBetween = (string, from, to) => {
  return string.split(from)[1].split(to)[0]
}

const getAttrsFromHTML = (html) => {
  const values = {}
  const lines = html.split('\n')

  for (const line of lines) {
    if (!values.title && line.startsWith('<meta property="og:title"')) {
      values.title = cleanUnicode(cutBetween(line, 'content="', '">'))

      if (values.title.startsWith('Telegram: Contact')) {
        return { error: ERROR_USER_DONT_EXIST }
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

  const handle = getHandleFromInput(input)

  if (handle) {
    values.webUrl = handleToTelegramWebUrl(handle)
    values.tgUrl = handleToTelegramURL(handle)

    const hasTgUrl = _attrs.includes('tgUrl')
    const hasWebUrl = _attrs.includes('webUrl')
    const hasType = _attrs.includes('type')
    const hasWrongName = BOTS_WITH_WRONG_NAMES.includes(handle)

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
      ...getAttrsFromHTML(await request(url), url),
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
