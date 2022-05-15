type TGAttribute =
  'type'
  | 'weburl'
  | 'tgurl'
  | 'username'
  | 'title'
  | 'image'
  | 'description'
  | 'verified'
  | 'preview'
  | 'subscribers'
  | 'members'
  | 'online'
  | 'error'

type TGType = 'user' | 'bot' | 'private_channel' | 'public_channel' | 'private_group' | 'public_group'

type TGValues = {
  type: TGType;
  weburl: string;
  tgurl: string;
  username: string;
  title: string;
  image: string;
  description: string;
  verified: boolean;
  preview: string;
  subscribers: number;
  members: number;
  online: number;
  error: string;
}

declare const tginfo: (linkOrHandle: string, attributes: TGAttribute[]) => Promise<Partial<TGValues>>

export = tginfo
