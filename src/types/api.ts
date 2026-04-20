export interface Workspace {
  id: string
  name: string
  planTier: string
  createdAt: string
}

export interface MeData {
  apiKey: {
    expiresAt: string
    keyId: string
    keyPrefix: string
    scopes: string[]
  }
  workspace: {
    id: string
    name: string
  }
}

export interface Account {
  id: string
  analyticsConnectedAt: string | null
  chatCount: number
  color: string | null
  createdAt: string
  displayName: string | null
  lastMessageDate: string | null
  owner: {
    displayName: string | null
    id: string
  }
  phoneNumber: string | null
  platform: string
  telegramUserId: string | null
}

export interface Chat {
  id: string
  chatType: string
  displayName: string | null
  username: string | null
  memberCount: number | null
  participantCount: number | null
  lastMessageDate: string | null
}

export interface MessageEntity {
  length: number
  offset: number
  type: string
  url: string | null
  userId: string | null
}

export interface Message {
  id: number
  date: string
  editDate: string | null
  text: string | null
  actionType: string | null
  entities: MessageEntity[]
  groupedId: string | null
  isEdited: boolean
  isOut: boolean
}

export interface Contact {
  bio: string | null
  firstName: string | null
  isBot: boolean
  isPremium: boolean
  knownByAccounts: Array<{
    accountId: string
    displayName: string | null
    ownerDisplayName: string | null
    ownerUserId: string
    username: string | null
  }>
  lastName: string | null
  sharedGroupCount: number
  totalSharedGroupCount: number
  sharedGroups: Array<{
    chatType: string
    displayName: string | null
    groupId: string
    inviteLink: string | null
    memberCount: number
    participantCount: number
    username: string | null
  }>
  telegramUserId: string
  username: string | null
}
