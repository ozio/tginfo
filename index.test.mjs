import tginfo from './index.mjs'

test('Check web URL', async () => {
  const userHandle = 'mr_ozio'

  const a1 = await tginfo(userHandle, ['weburl'])
  const a2 = await tginfo(`https://t.me/${userHandle}`, ['weburl'])
  const a3 = await tginfo(`tg://resolve?domain=${userHandle}`, ['weburl'])
  const a4 = await tginfo(`@${userHandle}`, ['weburl'])

  expect(a1.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a2.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a3.weburl).toBe(`https://t.me/${userHandle}`)
  expect(a4.weburl).toBe(`https://t.me/${userHandle}`)

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
