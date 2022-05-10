import https from 'node:https'

const TG_DOMAIN = 'https://t.me'

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

const convertToURL = (linkOrHandle) => {
  let url

  try {
    url = new URL(linkOrHandle)
  } catch (e) {
    let handle = linkOrHandle

    if (handle[0] === '@') {
      handle = handle.slice(1)
    }

    url = `${TG_DOMAIN}/${handle}`
  }

  return url
}

const getAttrsFromHTML = (html, url) => {
  const attrs = { verified: false, url }
  const lines = html.split('\n')

  for (const line of lines) {
    /* BASE VALUES */

    if (line.startsWith('<meta property="og:title"')) {
      attrs.title = line.split('content="')[1].split('">')[0]

      if (attrs.title.startsWith('Telegram: Contact')) {
        return { url, error: `Sorry, this user doesn't seem to exist.` }
      }

      if (attrs.title === 'Join group chat on Telegram') {
        return { url, error: 'Sorry, this link has expired.' }
      }

      continue
    }

    if (line.startsWith('<meta property="og:image"')) {
      attrs.image = line.split('content="')[1].split('">')[0]

      if (attrs.image === 'https://telegram.org/img/t_logo.png') {
        attrs.image = undefined
      }
      continue
    }

    if (line.startsWith('<meta property="og:description"')) {
      attrs.description = line.split('content="')[1].split('">')[0]
        .replaceAll('\t', '\n')
        .trim()

      if (attrs.description === `You can contact ${attrs.handle} right away.`) {
        delete attrs.description
      } else if (attrs.description === `You can view and join ${attrs.handle} right away.`) {
        delete attrs.description
      }

      continue
    }

    if (line.startsWith('<meta property="al:ios:url"')) {
      attrs.tgurl = line.split('content="')[1].split('">')[0]
      continue
    }

    if (line.includes('<i class="verified-icon">')) {
      attrs.verified = true
      continue
    }

    /* HANDLE TYPE */

    if (line.includes('">Join Channel</a>')) {
      attrs.type = 'private_channel'
      continue
    }

    if (line.includes('">Preview channel</a>')) {
      attrs.type = 'public_channel'
      attrs.previewUrl = `${TG_DOMAIN}/s/${attrs.handle.slice(1)}`
      continue
    }

    if (line.includes('">Join Group</a>')) {
      attrs.type = 'private_group'
      continue
    }

    if (line.includes('">View in Telegram</a>')) {
      attrs.type = 'public_group'
      continue
    }

    if (line.includes('">Send Message</a>')) {
      if (attrs.tgurl.endsWith('bot')) {
        attrs.type = 'bot'
      } else {
        attrs.type = 'user'
      }
      continue
    }

    if (line.includes('<title>Telegram: Contact ')) {
      attrs.handle = line.split('Contact ')[1].split('<')[0]
    }

    /* ADDITIONAL */

    if (line.startsWith('<div class="tgme_page_extra">')) {
      const string = line.split('">')[1].split('<')[0]

      if (!string) continue

      string.split(', ')
        .forEach(part => {
          const value = parseInt(part.replace(/[^0-9]/g, ''))

          if (part.includes('subscriber')) {
            attrs.subscribers = value
          } else if (part.includes('online')) {
            attrs.online = value
          } else if (part.includes('member')) {
            attrs.members = value
          }
        })
    }
  }

  return attrs
}

const whatistg = async (linkOrHandle) => {
  const url = convertToURL(linkOrHandle)
  const html = await request(url)

  return getAttrsFromHTML(html, url)
}

export default whatistg
