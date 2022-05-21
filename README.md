TG Info
=======

Zero dependencies nodejs module to fetch info about a Telegram username or URL.

It **can** get information from invite links, channel/group/user/bots links, usernames and invite codes. Such as:
```
https://t.me/username
https://t.me/username/123
https://t.me/s/username
https://t.me/username_bot
https://t.me/+invite_code
https://t.me/joinchat/invite_code
tg://resolve?domain=username
tg://join?invite=invite_code
username
@username
+invite_code
```

It **cannot** get information from links to messages in private channels or groups, links with a phone number, any links with identifiers in the URL, and phone numbers. Such as:
```
https://t.me/+79261234567
https://t.me/c/1319741318/7290
tg://resolve?phone=79261234567
tg://privatepost?channel=1319741318&post=7290
+79261234567
```

How it works
------------

1. Convert input to Telegram Web URL;
2. Fetch it;
3. Parse it.

_Important: It doesn't work with Telegram API._

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
$ tginfo durov

                Durov's Channel
                ───────────────
          Type  Public Group
      Verified  true
      Username @durov
          Info “Thoughts from the Product Manager / CEO / Founder of Telegram.”
   Subscribers  669,452
  Telegram URL  tg://resolve?domain=durov
       Web URL  https://t.me/durov
         Image  https://cdn1.telegram-cdn.org/file/uJ8Xy...7kp1w.jpg
```

### Usage

```
Usage: tginfo <slug/url> [options...]

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

### `input`

A string with Telegram URL or slug.

### `attributes` _(optional)_

An array of the attributes you need to have in output.

### `throwOnError` _(optional)_

A boolean flag whose inclusion throws an exception if any error occurs.

### Return value

An object with values:

```ts
{
  type: 'user' | 'bot' | 'private_channel' | 'public_channel' | 'private_group' | 'public_group';
  title: string;
  webUrl: string;
  tgUrl: string;
  username?: string;
  info?: string;
  verified?: boolean;
  previewUrl?: string;
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
  webUrl?: string;
}
```

You don't need to add `error` to `attributes`, it will be there anywhay and existance of `error` field could be (and should be) used as error flag.

Available attributes values by types
------------------------------------

|                 | user | bot | private_channel | public_channel | private_group | public_group |
|-----------------|:----:|:---:|:---------------:|:--------------:|:-------------:|:------------:|
| **type**        |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **webUrl**      |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **tgUrl**       |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **title**       |  🟩  | 🟩  |       🟩        |       🟩       |      🟩       |      🟩      |
| **username**    |  🟩  | 🟩  |       🟥        |       🟩       |      🟥       |      🟩      |
| **image**       |  🟧  | 🟧  |       🟧        |       🟧       |      🟧       |      🟧      |
| **info**        |  🟧  | 🟧  |       🟧        |       🟧       |      🟧       |      🟧      |
| **verified**    |  🟧  | 🟧  |       🟥        |       🟧       |      🟥       |      🟥      |
| **previewUrl**  |  🟥  | 🟥  |       🟥        |       🟩       |      🟥       |      🟥      |
| **subscribers** |  🟥  | 🟥  |       🟥        |       🟩       |      🟩       |      🟥      |
| **members**     |  🟥  | 🟥  |       🟥        |       🟥       |      🟥       |      🟩      |
| **online**      |  🟥  | 🟥  |       🟥        |       🟥       |      🟥       |      🟧      |

* 🟩 Always available 
* 🟧 Depends on profile
* 🟥 Not available

License
-------
MIT © [Nikolay Solovyov](https://ozio.io)
