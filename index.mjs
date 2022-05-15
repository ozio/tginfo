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

const cleanUnicode = (text) => {
  return text
    .replaceAll('&#33;', '!')
    .replaceAll('&#036;', '$')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
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

    if (url.pathname.startsWith('/joinchat/')) {
      handle = `+${url.pathname.slice(10)}`
    } else if (url.host === 'resolve') {
      handle = url.searchParams.get('domain')
    } else if (url.host === 'join') {
      handle = `+${url.searchParams.get('invite')}`
    } else {
      handle = url.pathname.split('/').pop()
    }
  } catch (e) {
    handle = input

    if (handle[0] === '@') {
      handle = handle.slice(1)
    }
  }

  url = `${TG_DOMAIN}/${handle}`

  return url
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

const tginfo = async (input, attrs = []) => {
  const url = convertInputToURL(input)

  if (attrs.length === 1 && attrs[0] === 'weburl') {
    return { weburl: url }
  }

  const html = await request(url)
  const values = getAttrsFromHTML(html, url)

  if (attrs.length === 0) return values

  return Object.fromEntries(
    Object.entries(values).filter(([key]) => attrs.includes(key) || key === 'error')
  )
}

export default tginfo
