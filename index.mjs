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

  return REGEX_USERNAME.test(username)
}

const isValidInviteCode = (rawCode) => {
  if (!rawCode || rawCode.startsWith('@')) return false

  const code = rawCode.startsWith('+') ? rawCode.slice(1) : rawCode

  return REGEX_INVITECODE.test(code)
}

const convertInputToURL = (input) => {
  let url
  let handle

  try {
    url = new URL(input)

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
    throw new Error(ERROR_NOT_TELEGRAM_LINK)
  }

  return `${TG_DOMAIN}/${handle}`
}

const getAttrsFromHTML = (html, url) => {
  const values = {
    weburl: url,
    verified: false,
  }
  const lines = html.split('\n')

  for (const line of lines) {
    if (line.startsWith('<meta property="og:title"')) {
      values.title = cleanUnicode(line.split('content="')[1].split('">')[0])

      if (values.title.startsWith('Telegram: Contact')) {
        return { weburl: url, error: ERROR_USER_DONT_EXIST }
      }

      if (values.title === 'Join group chat on Telegram') {
        return { weburl: url, error: ERROR_LINK_EXPIRED }
      }

      continue
    }

    if (line.startsWith('<meta property="og:image"')) {
      values.image = line.split('content="')[1].split('">')[0]

      if (values.image === 'https://telegram.org/img/t_logo.png') {
        values.image = undefined
      }
      continue
    }

    if (line.startsWith('<meta property="og:description"')) {
      values.bio = cleanUnicode(line.split('content="')[1].split('">')[0])
        .replaceAll('\t', '\n')
        .trim()

      if (values.bio === `You can contact @${values.username} right away.`) {
        delete values.bio
      } else if (values.bio === `You can view and join @${values.username} right away.`) {
        delete values.bio
      }

      continue
    }

    if (line.startsWith('<meta property="al:ios:url"')) {
      values.tgurl = line.split('content="')[1].split('">')[0]
      continue
    }

    if (line.includes('<i class="verified-icon">')) {
      values.verified = true
      continue
    }

    if (line.includes('">Join Channel</a>')) {
      values.type = TYPE_PRIVATE_CHANNEL
      continue
    }

    if (line.includes('">Preview channel</a>')) {
      values.type = TYPE_PUBLIC_CHANNEL
      values.previewurl = `${TG_DOMAIN}/s/${values.username}`
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

    if (line.includes('<title>Telegram: Contact ')) {
      values.username = line.split('Contact @')[1].split('<')[0]
    }

    if (line.startsWith('<div class="tgme_page_extra">')) {
      const string = line.split('">')[1].split('<')[0]

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

  return values
}

const tginfo = async (input, attrs = [], throwOnError = false) => {
  let values
  let url

  try {
    url = convertInputToURL(input)
  } catch (e) {
    values = {
      error: e.message,
    }
  }

  if (url) {
    if (attrs.length === 1 && attrs[0] === 'weburl') {
      return { weburl: url }
    }

    /*
    TODO: Get handle and if it is inside bots list then return it without requests
    if (attrs.length === 2 && attrs.includes('weburl') && attrs.includes('type')) {
      if ()
    }
    */

    const html = await request(url)
    values = getAttrsFromHTML(html, url)
  }

  if (values.error && throwOnError) {
    throw new Error(values.error)
  }

  if (attrs.length === 0) return sortValues(values, objectAttrsOrder)

  return pickValues(sortValues(values, objectAttrsOrder), attrs)
}

export default tginfo
