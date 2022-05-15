import https from 'node:https'

const TG_DOMAIN = 'https://t.me'
// https://telegram.me

const BOTS_WITH_WRONG_NAMES = new Set([
  'botfather',
  'stickers',
  'gamee',
  'gif',
  'imdb',
  'wiki',
  'music',
  'youtube',
  'bold',
  'vote',
  'like',
  'ifttt',
  'telegraph',
  'previews',
  'telegramdonate',
  'stripe',
  'vid',
  'pic',
  'bing',
])

const objectAttrsOrder = Object.fromEntries([
  'type',
  'username',
  'title',
  'description',
  'verified',
  'weburl',
  'tgurl',
  'preview',
  'subscribers',
  'members',
  'online',
  'image',
  'error'
].map((a, i) => [a, i]))

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

const convertInputToURL = (input) => {
  let url
  let handle

  try {
    url = new URL(input)

    if (url.host === 't.me' || url.host === 'telegram.me') {
      if (url.pathname.startsWith('/joinchat/')) {
        handle = `+${url.pathname.slice(10)}`
      } else {
        handle = url.pathname.split('/').pop()
      }
    } else if (url.host === 'resolve') {
      const param = url.searchParams.get('domain')

      if (param) handle = param
    } else if (url.host === 'join') {
      const param = url.searchParams.get('invite')

      if (param) handle = `+${param}`
    }
  } catch (e) {
    handle = input

    if (handle[0] === '@') {
      handle = handle.slice(1)
    }
  }

  if (!handle) {
    throw new Error('Sorry, this is not a Telegram link.')
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
        return { weburl: url, error: `Sorry, this user doesn't seem to exist.` }
      }

      if (values.title === 'Join group chat on Telegram') {
        return { weburl: url, error: 'Sorry, this link has expired.' }
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
      values.description = cleanUnicode(line.split('content="')[1].split('">')[0])
        .replaceAll('\t', '\n')
        .trim()

      if (values.description === `You can contact @${values.username} right away.`) {
        delete values.description
      } else if (values.description === `You can view and join @${values.username} right away.`) {
        delete values.description
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
      values.type = 'private_channel'
      continue
    }

    if (line.includes('">Preview channel</a>')) {
      values.type = 'public_channel'
      values.preview = `${TG_DOMAIN}/s/${values.username}`
      continue
    }

    if (line.includes('">Join Group</a>')) {
      values.type = 'private_group'
      continue
    }

    if (line.includes('">View in Telegram</a>')) {
      values.type = 'public_group'
      continue
    }

    if (line.includes('">Send Message</a>')) {
      if (url.endsWith('bot') || BOTS_WITH_WRONG_NAMES.has(values.username.toLowerCase())) {
        values.type = 'bot'
      } else {
        values.type = 'user'
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
          const value = parseInt(part.replace(/[^0-9]/g, ''))

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
