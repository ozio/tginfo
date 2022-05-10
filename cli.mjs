#!/usr/bin/env node

const timeStart = new Date().getTime()

import getInfo from './index.mjs'

const linkOrHandle = process.argv.slice(2)[0]

if (linkOrHandle === '--version') {
  const { default: { version } } = await import('./package.json', { assert: { type: 'json' } })
  console.log(`v${version}`)
  process.exit(0)
}

if (!linkOrHandle || linkOrHandle === '--help') {
  console.log('Usage: whoistg [handle/url]')
  console.log()
  console.log('Examples:')
  console.log('  whoistg mr_ozio')
  console.log('  whoistg https://t.me/durov')
  console.log('  whoistg https://t.me/+VcmLW3Xx4-swOTc6')

  process.exit(0)
}

const attrs = await getInfo(linkOrHandle)

const bold = (text) => `[1m${text}[22m`
const link = (text) => `[36m[4m${text}[24m[39m`
const dim = (text) => `[2m[1m${text}[22m[22m`
const green = (text) => `[32m[1m[3m${text}[23m[22m[39m`
const cyan = (text) => `[36m${text}[39m`

const types = {
  user: 'User',
  bot: 'Bot',
  private_channel: 'Private Channel',
  public_channel: 'Public Channel',
  private_group: 'Private Group',
  public_group: 'Public Group',
}

const PADDING = 13

const print = (k, v) => {
  console.log(`${dim(`${k.padStart(PADDING, ' ')} `)} ${v}`)
}

const line = Array.from({ length: (attrs.title || attrs.url).length }, () => '—').join('')

console.log()
print('', bold(attrs.title || attrs.url))
print('', line)

if (attrs.error) {
  print('Error', attrs.error)
  process.exit(0)
}

if (attrs.type) {
  print('Type', `${types[attrs.type]}`)
}

if (attrs.handle) {
  print('Handle', `${attrs.handle} ${attrs.verified ? green('✸') : ''}`)
}

if (attrs.description) {
  print('Description', `"${attrs.description.replaceAll('\n', `\n${''.padEnd(PADDING + 2, ' ')}`)}"`)
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
  print('Telegram URL', link(attrs.tgurl))
}

if (attrs.url) {
  print('Web URL', link(attrs.url))
}

if (attrs.previewUrl) {
  print('Preview URL', link(attrs.previewUrl))
}

if (attrs.image) {
  print('Image', `\n${attrs.image}`)
}

print('Time', `${(new Date().getTime() - timeStart).toLocaleString()}ms`)

console.log()
