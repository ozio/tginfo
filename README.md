TG Info
=======

Zero dependencies nodejs module to fetch info about a Telegram username or URL.

Using as CLI
------------

Install it as a global package: 

```shell
npm install -g tginfo
tginfo mr_ozio
```

Or run it without installation using `npx`:

```shell
npx tginfo https://t.me/mr_ozio
```

Output be like:
```
$ tginfo mr_ozio

               Nikolay Solovyov
               ————————————————
         Type  User
      Usernae  @mr_ozio
  Description “[object Object]”
 Telegram URL  tg://resolve?domain=mr_ozio
      Web URL  https://t.me/mr_ozio
        Image  https://cdn4.telegram-cdn.org/file/GKdrxj...w8CzvA.jpg
```

### Usage

```
Usage: tginfo <handle/url> [options...]

Options:
  --attrs=ATTR1,ATTR2           display only specific attributes
  --json                        display JSON instead of a human readable view
  --help                        print this message
  --version                     display version
```

Using as JS Module
------------------

Install it using command `npm install tginfo`.

### Syntax

```js
import tginfo from 'tginfo'

await tginfo(input)
await tginfo(input, attributes)
await tginfo(input, attributes, throwOnError)
```

### Parameters

`input`

A string with Telegram URL or handle.

Examples:
- `name`
- `@name`
- `+code`
- `https://t.me/name`
- `https://t.me/+code`
- `https://t.me/s/name`
- `https://t.me/joinchat/code`
- `https://telegram.me/name`
- `tg://resolve?domain=name`
- `tg://join?invite=code`

`attributes` _(optional)_

An array of the attributes you need to have in output.

`throwOnError` _(optional)_

A boolean flag whose inclusion throws an exception if any error occurs.

### Return value

An object with values:

```ts
{
  type: 'user' | 'bot' | 'private_channel' | 'public_channel' | 'private_group' | 'public_group';
  title: string;
  weburl: string;
  tgurl: string;
  username?: string;
  description?: string;
  verified?: boolean;
  preview?: string;
  subscribers?: number;
  members?: number;
  online?: number;
  image?: string;
}
```

If some error will happen then returning object will be:

```ts
{
  error: string;
  weburl?: string;
}
```

You don't need to add `error` to `attributes`, it will be there anywhay and existance of `error` field could be (and should be) used as error flag.

Available attributes values by types
------------------------------------

|                   | user | bot | private_channel | public_channel | private_group | public_group |
|-------------------|:----:|:---:|:---------------:|:--------------:|:-------------:|:------------:|
| **type**          |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **weburl**        |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **tgurl**         |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **title**         |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **username**      |  🟩  | 🟩  |       🟥        |       🟩       |      🟥       |      🟩      |
| **image**         |  🟧  | 🟧  |       🟧        |       🟧       |      🟧       |      🟧      |
| **description**   |  🟧  | 🟧  |       🟧        |       🟧       |      🟧       |      🟧      |
| **verified**      |  🟧  | 🟧  |       🟥        |       🟧       |      🟥       |      🟥      |
| **preview**       |  🟥  | 🟥  |       🟥        |       🟩       |      🟥       |      🟥      |
| **subscribers**   |  🟥  | 🟥  |       🟥        |       🟩       |      🟩       |      🟥      |
| **members**       |  🟥  | 🟥  |       🟥        |       🟥       |      🟥       |      🟩      |
| **online**        |  🟥  | 🟥  |       🟥        |       🟥       |      🟥       |      🟧      |

* 🟩 Always available 
* 🟧 Depends on profile
* 🟥 Not available

License
-------
MIT © [Nikolay Solovyov](https://ozio.io)
