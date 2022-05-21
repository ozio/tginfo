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
`Usage: ${BIN} <slug/url> [options...]

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
const green = (text) => `[32m${text}[39m`
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

if (values.title || values.webUrl) {
  const line = Array.from({ length: (values.title || values.webUrl).length }, () => '─').join('')

  print('', bold(values.title || values.webUrl))
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

if (values.verified) {
  print('Verified', green(values.verified))
}

if (values.username) {
  print('Username', `${dim('@')}${values.username}`, true)
}

if (values.info) {
  const info = values.info.replaceAll(
    '\n',
    `\n${''.padEnd(PADDING + 2, ' ')}`
  )

  let label = 'Info'

  if (values.type === TYPE_USER) {
    label = 'Bio'
  } else if (values.type === TYPE_BOT) {
    label = 'About'
  }

  print(label, `${dim('“')}${info}${dim('”')}`, true)
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

if (values.tgUrl) {
  print('Telegram URL', cyan(underline(values.tgUrl)))
}

if (values.webUrl) {
  print('Web URL', cyan(underline(values.webUrl)))
}

if (values.previewUrl) {
  print('Preview URL', cyan(underline(values.previewUrl)))
}

if (values.image) {
  print('Image', `\n${values.image}`)
}

console.log()
