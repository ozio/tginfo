#!/usr/bin/env node

import { argv } from 'node:process'

export const flag = (name) => {
  const arg = argv.find(a => a.startsWith(name + '=') || a === name)

  if (arg) {
    const [, value] = arg.split('=')

    return value || true
  }

  return false
}

import tginfo from './index.mjs'

const linkOrHandle = argv.slice(2)[0]

if (flag('--version')) {
  const { default: { version } } = await import('./package.json', { assert: { type: 'json' } })
  console.log(`v${version}`)
  process.exit(0)
}

const attrsString = flag('--attrs')
let attrs = []

if (typeof attrsString === 'string') {
   attrs = attrsString.split(',')
}

if (!linkOrHandle || flag('--help')) {
  console.log(
`Usage: tginfo <handle/url> [options...]

Options:
  --attrs=ATTR1,ATTR2           display only specific attributes
  --json                        display JSON instead of a human readable view
  --help                        print this message
  --version                     display version

Available attributes:
  type, weburl, tgurl, title, username, image, description,
  verified, preview, subscribers, members, online

Examples:
  tginfo mr_ozio
  tginfo tg://resolve?domain=durov --json
  tginfo https://t.me/+VcmLW3Xx4-swOTc6 --attrs=image,verified,members`
  );

  process.exit(0)
}

if (linkOrHandle.startsWith('--')) {
  console.log(`Unknown attribute: ${linkOrHandle.slice(2)}`);
  process.exit(1)
}

const values = await tginfo(linkOrHandle, attrs)

if (flag('--json')) {
  console.log(JSON.stringify(values))
  process.exit(0)
}

const bold = (text) => `[1m${text}[22m`
const underline = (text) => `[4m${text}[24m`
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

console.log()

if (values.title || values.url) {
  const line = Array.from({ length: (values.title || values.url).length }, () => '─').join('')

  print('', bold(values.title || values.url))
  print('', line)
}

if (values.error) {
  print('Error', red(values.error))
  console.log()
  process.exit(0)
}

if (values.type) {
  print('Type', `${types[values.type]}`)
}

if (values.username) {
  print('Username', `${values.username} ${values.verified ? green('✸') : ''}`)
}

if (attrs.includes('verified')) {
  print('Verified', `${values.verified}`)
}

if (values.description) {
  const description = values.description.replaceAll(
    '\n',
    `\n${''.padEnd(PADDING + 2, ' ')}`
  )

  print('Description', `“${description}”`, true)
}

if (typeof values.subscribers === 'number') {
  print('Subscribers', yellow(values.subscribers.toLocaleString()))
}

if (typeof values.members === 'number') {
  print('Members', yellow(values.members.toLocaleString()))
}

if (typeof values.online === 'number') {
  print('Online', yellow(values.online.toLocaleString()))
}

if (values.tgurl) {
  print('Telegram URL', cyan(underline(values.tgurl)))
}

if (values.weburl) {
  print('Web URL', cyan(underline(values.weburl)))
}

if (values.preview) {
  print('Preview URL', cyan(underline(values.preview)))
}

if (values.image) {
  print('Image', `\n${values.image}`)
}

console.log()
