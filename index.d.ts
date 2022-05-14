type TGAttribute =
  'type'
  | 'url'
  | 'tgurl'
  | 'handle'
  | 'title'
  | 'image'
  | 'description'
  | 'verified'
  | 'previewUrl'
  | 'subscribers'
  | 'members'
  | 'online'
  | 'error'

type TGType = 'user' | 'bot' | 'private_channel' | 'public_channel' | 'private_group' | 'public_group'

type TGValues = {
  type: TGType;
  url: string;
  tgurl: string;
  handle: string;
  title: string;
  image: string;
  description: string;
  verified: boolean;
  previewUrl: string;
  subscribers: number;
  members: number;
  online: number;
}

declare const tginfo: (linkOrHandle: string, attributes: TGAttribute[]) => Promise<Partial<TGValues>>

export = tginfo
