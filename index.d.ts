type TGAttribute = keyof TGValues

type TGType = 'user' | 'bot' | 'private_channel' | 'public_channel' | 'private_group' | 'public_group'

type TGValues = {
  type: TGType;
  webUrl: string;
  tgUrl: string;
  username: string;
  title: string;
  image: string;
  info: string;
  verified: boolean;
  previewUrl: string;
  subscribers: number;
  members: number;
  online: number;
  error: string;
}

declare const tginfo: (input: string, attributes: TGAttribute[], throwOnError?: boolean) => Promise<Partial<TGValues>>

export = tginfo
