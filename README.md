TGInfo
=======

Zero dependencies nodejs module to fetch info about a Telegram username or URL.

Using as CLI
------------

You could install it as a global package: 

```shell
npm install -g tginfo
tginfo mr_ozio
```

Or you could run it without installation using `npx`:

```shell
npx tginfo https://t.me/mr_ozio
```

Output be like:
```
$ tginfo mr_ozio

               Nikolay Solovyov
               ————————————————
         Type  User
       Handle  @mr_ozio
  Description “[object Object]”
 Telegram URL  tg://resolve?domain=mr_ozio
      Web URL  https://t.me/mr_ozio
        Image  https://cdn4.telegram-cdn.org/file/GKdrxj...w8CzvA.jpg
         Time  233ms
```

Using as JS Module
------------------

First you have to install it using command `npm install tginfo` or `yarn add tginfo`

Then import in code:

```js
import tginfo from 'tginfo'

await tginfo('mr_ozio')

{
  url: 'https://t.me/mr_ozio',
  handle: '@mr_ozio',
  title: 'Nikolay Solovyov',
  image: 'https://cdn4.telegram-cdn.org/file/GKdrxj...Xuw8CzvA.jpg',
  description: '[object Object]',
  tgurl: 'tg://resolve?domain=mr_ozio',
  type: 'user',
  verified: false
}
```

Also, you could add an optional parameter if you only need a specific attributes.

```js
await tginfo('mr_ozio', ['title', 'type', 'verified'])

{
  title: 'Nikolay Solovyov'
  type: 'user', 
  verified: false
}
```

Available values
----------------

| attribute/type  | user | bot | private_channel | public_channel | private_group | public_group |
|-----------------|:----:|:---:|:---------------:|:--------------:|:-------------:|:------------:|
| **type**        |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **url**         |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **tgurl**       |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **title**       |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **handle**      |  🟩  | 🟩  |       🟥        |       🟩       |      🟥       |      🟩      |
| **image**       |  🟧  | 🟧  |       🟧        |       🟧       |      🟧       |      🟧      |
| **description** |  🟧  | 🟧  |       🟧        |       🟧       |      🟧       |      🟧      |
| **verified**    |  🟧  | 🟧  |       🟥        |       🟧       |      🟥       |      🟥      |
| **previewUrl**  |  🟥  | 🟥  |       🟥        |       🟩       |      🟥       |      🟥      |
| **subscribers** |  🟥  | 🟥  |       🟥        |       🟩       |      🟩       |      🟥      |
| **members**     |  🟥  | 🟥  |       🟥        |       🟥       |      🟥       |      🟩      |
| **online**      |  🟥  | 🟥  |       🟥        |       🟥       |      🟥       |      🟧      |

* 🟩 Always available at this type 
* 🟧 Depends on profile
* 🟥 Not available at this type

License
-------
MIT © [Nikolay Solovyov](https://ozio.io)
