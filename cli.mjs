import getInfo from './index.mjs'

const PADDING = 15
const linkOrHandle = process.argv.slice(-1)
const attrs = await getInfo(linkOrHandle)

const link = (text) => `[36m[1m[4m${text}[24m[22m[39m`
const dim = (text) => `[2m[1m${text}[22m[22m`
const bold = (text) => `[1m${text}[22m`
const green = (text) => `[32m[1m[3m${text}[23m[22m[39m`
const cyan = (text) => `[36m${text}[39m`

const types = {
  private_channel: 'Private Channel',
  public_channel: 'Public Channel',
  private_group: 'Private Group',
  public_group: 'Public Group',
  user: 'User',
  bot: 'Bot',
}

console.log(link(attrs.url))
console.log()

const print = (k, v) => {
  console.log(`${dim(`${k.padEnd(PADDING, '.')}:`)} ${bold(v)}`)
}

if (attrs.type) {
  print('Type', `${types[attrs.type]}`)
}

if (attrs.handle) {
  print('Handle', `${attrs.handle} ${attrs.verified ? green('verified') : ''}`)
}

if (attrs.title) {
  print('Title', attrs.title)
}

if (attrs.description) {
  print('Description', attrs.description.replaceAll('\n', `\n${''.padEnd(PADDING + 2, ' ')}`))
}

if (attrs.subscribers) {
  print('Subscribers', cyan(attrs.subscribers))
}

if (attrs.members) {
  print('Members', cyan(attrs.members))
}

if (attrs.online) {
  print('Online', cyan(attrs.online))
}

if (attrs.tgurl) {
  print('Telegram URL', attrs.tgurl)
}

if (attrs.image) {
  print('Image', attrs.image)
}
