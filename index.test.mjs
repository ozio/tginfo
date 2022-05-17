import tginfo from './index.mjs'

it('Should convert anything to web URL', async () => {
  const userHandle = 'mr_ozio'

  const a1 = await tginfo(userHandle, ['weburl'])
  const a2 = await tginfo(`https://t.me/${userHandle}`, ['weburl'])
  const a3 = await tginfo(`tg://resolve?domain=${userHandle}`, ['weburl'])
  const a4 = await tginfo(`@${userHandle}`, ['weburl'])
  const a5 = await tginfo(`https://t.me/s/${userHandle}`, ['weburl'])

  expect(a1.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a2.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a3.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a4.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a5.weburl).toBe(`https://t.me/${userHandle}`)

  const inviteHandle = 'iNviTeC0De'

  const b1 = await tginfo(`+${inviteHandle}`, ['weburl'])
  const b2 = await tginfo(`https://t.me/+${inviteHandle}`, ['weburl'])
  const b3 = await tginfo(`https://t.me/joinchat/${inviteHandle}`, ['weburl'])
  const b4 = await tginfo(`tg://join?invite=${inviteHandle}`, ['weburl'])

  expect(b1.weburl).toBe(`https://t.me/+${inviteHandle}`)
  expect(b2.weburl).toBe(`https://t.me/+${inviteHandle}`)
  expect(b3.weburl).toBe(`https://t.me/+${inviteHandle}`)
  expect(b4.weburl).toBe(`https://t.me/+${inviteHandle}`)
})

test('Should throw if Wrong URL entered', async () => {
  const badURL1 = 'https://google.com'
  const badURL2 = 'https://linkedin.com/durov'
  const badURL3 = 'https://tele.me/joinchat/durov'
  const badURL4 = 'tg://join?domain=durov'
  const badURL5 = 'tg://resolve?invite=durov'
  const badURL6 = 'tg://durov?domain=join'
  const badURL7 = 'tg://resolve'
  const badURL8 = 'ftp://t.me/durov'
  const badURL9 = 'ftp://resolve?invite=durov'

  const err = 'Sorry, this is not a Telegram link.'

  await expect(tginfo(badURL1, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL2, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL3, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL4, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL5, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL6, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL7, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL8, [], true)).rejects.toThrow(err)
  await expect(tginfo(badURL9, [], true)).rejects.toThrow(err)
})
