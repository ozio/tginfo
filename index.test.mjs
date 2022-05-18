import tginfo from './index.mjs'
import {
  ERROR_NOT_TELEGRAM_LINK
} from './constants.mjs'

const userHandle = 'mr_ozio'
const userWebURL = `https://t.me/${userHandle}`
const userTgURL = `tg://resolve?domain=${userHandle}`
const userHandleAt = `@${userHandle}`
const channelPreviewURL = `https://t.me/s/${userHandle}`
const inviteCode = 'iNviTeC0De'
const inviteHandle = `+${inviteCode}`
const inviteWebURL = `https://t.me/+${inviteCode}`
const inviteWebURLOld = `https://t.me/joinchat/${inviteCode}`
const inviteTgURL = `tg://join?invite=${inviteCode}`

const badURL1 = 'https://google.com'
const badURL2 = 'https://linkedin.com/durov'
const badURL3 = 'https://tele.me/joinchat/durov'
const badURL4 = 'tg://join?domain=durov'
const badURL5 = 'tg://resolve?invite=durov'
const badURL6 = 'https://t.me/durov/verni/stenu'
const badURL7 = 'tg://resolve'
const badURL8 = 'ftp://t.me/durov'
const badURL9 = 'ftp://resolve?invite=durov'

it('Should convert anything to web URL', async () => {
  const a1 = await tginfo(userHandle, ['weburl'])
  const a2 = await tginfo(userWebURL, ['weburl'])
  const a3 = await tginfo(userTgURL, ['weburl'])
  const a4 = await tginfo(userHandleAt, ['weburl'])
  const a5 = await tginfo(channelPreviewURL, ['weburl'])

  expect(a1.weburl).toBe(userWebURL)
  expect(a2.weburl).toBe(userWebURL)
  expect(a3.weburl).toBe(userWebURL)
  expect(a4.weburl).toBe(userWebURL)
  expect(a5.weburl).toBe(userWebURL)

  const b1 = await tginfo(inviteHandle, ['weburl'])
  const b2 = await tginfo(inviteWebURL, ['weburl'])
  const b3 = await tginfo(inviteWebURLOld, ['weburl'])
  const b4 = await tginfo(inviteTgURL, ['weburl'])

  expect(b1.weburl).toBe(inviteWebURL)
  expect(b2.weburl).toBe(inviteWebURL)
  expect(b3.weburl).toBe(inviteWebURL)
  expect(b4.weburl).toBe(inviteWebURL)
})

it('Should throw if wrong URL entered', async () => {
  await expect(tginfo(badURL1, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL2, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL3, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL4, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL5, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL6, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL7, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL8, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL9, [], true)).rejects.toThrow(ERROR_NOT_TELEGRAM_LINK)
})

it('Should contain `error` field if wrong URL entered', async () => {
  await expect(tginfo(badURL1)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL2)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL3)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL4)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL5)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL6)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL7)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL8)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
  await expect(tginfo(badURL9)).resolves.toHaveProperty('error', ERROR_NOT_TELEGRAM_LINK)
})
