import tginfo from './index.mjs'
import {
  ERROR_NOT_TELEGRAM_LINK,
  TG_DOMAIN,
} from './constants.mjs'

const userHandle = 'mr_ozio'
const userWebURL = `${TG_DOMAIN}/${userHandle}`
const userTgURL = `tg://resolve?domain=${userHandle}`
const userHandleAt = `@${userHandle}`
const channelPreviewURL = `${TG_DOMAIN}/s/${userHandle}`
const inviteCode = 'iNviTeC0De-12345'
const inviteHandle = `+${inviteCode}`
const inviteWebURL = `${TG_DOMAIN}/+${inviteCode}`
const inviteWebURLOld = `${TG_DOMAIN}/joinchat/${inviteCode}`
const inviteTgURL = `tg://join?invite=${inviteCode}`

const badURL1 = 'https://google.com'
const badURL2 = `https://linkedin.com/${userHandle}`
const badURL3 = `https://tele.me/joinchat/${inviteCode}`
const badURL4 = `tg://join?domain=${inviteCode}`
const badURL5 = `tg://resolve?invite=${userHandle}`
const badURL6 = `${TG_DOMAIN}/durov/verni/stenu`
const badURL7 = `${TG_DOMAIN}/username_that_is_longer_than_it_possible`
const badURL8 = 'tg://resolve?domain=shrt'
const badURL9 = `ftp://t.me/${userHandle}`

it('Should convert anything to web URL', async () => {
  const a1 = await tginfo(userHandle, ['weburl'])
  const a2 = await tginfo(userWebURL, ['weburl'])
  const a3 = await tginfo(userTgURL, ['weburl'])
  const a4 = await tginfo(userHandleAt, ['weburl'])
  const a5 = await tginfo(channelPreviewURL, ['weburl'])

  expect(a1).toHaveProperty('weburl', userWebURL)
  expect(a2).toHaveProperty('weburl', userWebURL)
  expect(a3).toHaveProperty('weburl', userWebURL)
  expect(a4).toHaveProperty('weburl', userWebURL)
  expect(a5).toHaveProperty('weburl', userWebURL)

  const b1 = await tginfo(inviteHandle, ['weburl'])
  const b2 = await tginfo(inviteWebURL, ['weburl'])
  const b3 = await tginfo(inviteWebURLOld, ['weburl'])
  const b4 = await tginfo(inviteTgURL, ['weburl'])

  expect(b1).toHaveProperty('weburl', inviteWebURL)
  expect(b2).toHaveProperty('weburl', inviteWebURL)
  expect(b3).toHaveProperty('weburl', inviteWebURL)
  expect(b4).toHaveProperty('weburl', inviteWebURL)
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
