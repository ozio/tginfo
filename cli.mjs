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
  console.log(
`Usage: whoistg [handle/url]

Examples:
  whoistg mr_ozio
  whoistg https://t.me/durov
  whoistg https://t.me/+VcmLW3Xx4-swOTc6`
  );

  process.exit(0)
}

const attrs = await getInfo(linkOrHandle)

const bold = (text) => `[1m${text}[22m`
const link = (text) => `[36m[4m${text}[24m[39m`
const dim = (text) => `[2m[1m${text}[22m[22m`
const green = (text) => `[32m[1m[3m${text}[23m[22m[39m`
const cyan = (text) => `[36m${text}[39m`
const yellow = (text) => `[33m${text}[39m`
const red = (text) => `[31m${text}[39m`
const italic = (text) => `[3m${text}[23m`

const types = {
  user: 'User',
  bot: 'Bot',
  private_channel: 'Private Channel',
  public_channel: 'Public Channel',
  private_group: 'Private Group',
  public_group: 'Public Group',
}

const PADDING = 14

const print = (k, v, s) => {
  console.log(`${dim(`${k.padStart(PADDING, ' ')} `)}${s ? '' : ' '}${v}`)
}

const line = Array.from({ length: (attrs.title || attrs.url.toString()).length }, () => '─').join('')

console.log()
print('', bold(attrs.title || attrs.url))
print('', line)

if (attrs.error) {
  print('Error', red(attrs.error))
  console.log()
  process.exit(0)
}

if (attrs.type) {
  print('Type', `${types[attrs.type]}`)
}

if (attrs.handle) {
  print('Handle', `${attrs.handle} ${attrs.verified ? green('✸') : ''}`)
}

if (attrs.description) {
  const description = attrs.description.replaceAll(
    '\n',
    `\n${''.padEnd(PADDING + 2, ' ')}`
  )

  print('Description', `“${italic(description)}”`, true)
}

if (typeof attrs.subscribers === 'number') {
  print('Subscribers', yellow(attrs.subscribers.toLocaleString()))
}

if (typeof attrs.members === 'number') {
  print('Members', yellow(attrs.members.toLocaleString()))
}

if (typeof attrs.online === 'number') {
  print('Online', yellow(attrs.online.toLocaleString()))
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
