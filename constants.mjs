export const TG_DOMAIN = 'https://t.me'

export const BIN = 'tginfo'

export const BOTS_WITH_WRONG_NAMES = [
  'botfather',
  'stickers',
  'gamee',
  'gif',
  'imdb',
  'wiki',
  'music',
  'youtube',
  'bold',
  'vote',
  'like',
  'ifttt',
  'telegraph',
  'previews',
  'telegramdonate',
  'stripe',
  'vid',
  'pic',
  'bing',
]

export const ATTRIBUTES = [
  'type',
  'username',
  'title',
  'description',
  'verified',
  'weburl',
  'tgurl',
  'preview',
  'subscribers',
  'members',
  'online',
  'image',
  'error'
]

export const TYPE_BOT = 'bot'
export const TYPE_USER = 'user'
export const TYPE_PUBLIC_CHANNEL = 'public_channel'
export const TYPE_PRIVATE_CHANNEL = 'private_channel'
export const TYPE_PUBLIC_GROUP = 'public_group'
export const TYPE_PRIVATE_GROUP = 'private_group'

export const ERROR_USER_DONT_EXIST = `Sorry, this user doesn't seem to exist.`
export const ERROR_LINK_EXPIRED = 'Sorry, this link has expired.'
export const ERROR_NOT_TELEGRAM_LINK = 'Sorry, this is not a valid Telegram link.'

export const REGEX_USERNAME = /^\w{5,32}$/
export const REGEX_INVITECODE = /^([\w-]{16}|[\w-]{22})$/
