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

import {
  BIN,
  ATTRIBUTES,
  TYPE_USER,
  TYPE_BOT,
  TYPE_PUBLIC_GROUP,
  TYPE_PRIVATE_GROUP,
  TYPE_PUBLIC_CHANNEL,
  TYPE_PRIVATE_CHANNEL,
} from './constants.mjs'
import tginfo from './index.mjs'

const input = argv.slice(2)[0]

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

if (!input || flag('--help')) {
  console.log(
`Usage: ${BIN} <handle/url> [options...]

Options:
  --attrs=ATTR1,ATTR2           display only specific attributes
  --json                        display JSON instead of a human readable view
  --help                        print this message
  --version                     display version

Available attributes:
  ${ATTRIBUTES.slice(0, 7).join(', ')},
  ${ATTRIBUTES.slice(7).join(', ')}

Examples:
  ${BIN} mr_ozio
  ${BIN} tg://resolve?domain=durov --json
  ${BIN} https://t.me/+VcmLW3Xx4-swOTc6 --attrs=title,type,description`
  );

  process.exit(0)
}

if (input.startsWith('--')) {
  console.log(`Unknown attribute: ${input.slice(2)}`);
  process.exit(1)
}

const values = await tginfo(input, attrs)

if (flag('--json')) {
  console.log(JSON.stringify(values))
  process.exit(0)
}

const bold = (text) => `[1m${text}[22m`
const underline = (text) => `[4m${text}[24m`
const dim = (text) => `[2m${text}[22m`
const green = (text) => `[32m[1m[3m${text}[23m[22m[39m`
const cyan = (text) => `[36m${text}[39m`
const yellow = (text) => `[33m${text}[39m`
const red = (text) => `[31m${text}[39m`
const italic = (text) => `[3m${text}[23m`

const types = {
  [TYPE_USER]: 'User',
  [TYPE_BOT]: 'Bot',
  [TYPE_PRIVATE_CHANNEL]: 'Private Channel',
  [TYPE_PUBLIC_CHANNEL]: 'Public Channel',
  [TYPE_PRIVATE_GROUP]: 'Private Group',
  [TYPE_PUBLIC_GROUP]: 'Public Group',
}

const PADDING = 14

const print = (k, v, s) => {
  console.log(`${bold(dim(`${k.padStart(PADDING, ' ')} `))}${s ? '' : ' '}${v}`)
}

console.log()

if (values.title || values.weburl) {
  const line = Array.from({ length: (values.title || values.weburl).length }, () => '─').join('')

  print('', bold(values.title || values.weburl))
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
  print('Username', `@${values.username} ${values.verified ? green('✸') : ''}`)
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

if (values.previewurl) {
  print('Preview URL', cyan(underline(values.previewurl)))
}

if (values.image) {
  print('Image', `\n${values.image}`)
}

console.log()
