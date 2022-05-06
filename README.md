WhoIsTG
=======

A utility to get information about a Telegram username or URL.

Using as CLI
------------

You could install it as a global package: 

```shell
npm install -g whoistg
whoistg mr_ozio
```

Or you could run it without installation using `npx`:

```shell
npx whoistg https://t.me/mr_ozio
```

Using as JS Module
------------------

First you have to install it using command `npm install whoistg`

Then import in code:

```js
import whoistg from 'whoistg'

const information = await whoistg('mr_ozio')

{
  verified: false,
  url: 'https://t.me/mr_ozio',
  handle: '@mr_ozio',
  title: 'Nikolay Solovyov',
  image: 'https://cdn4.telegram-cdn.org/file/GKdrxj...Xuw8CzvA.jpg',
  description: '[object Object]',
  tgurl: 'tg://resolve?domain=mr_ozio',
  type: 'user'
}
```

License
-------
MIT © [Nikolay Solovyov](https://ozio.io)
