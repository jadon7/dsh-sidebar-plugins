export const zh = {
  entry: '经典 QQ 聊天',
} satisfies Record<string, string>

export type QQChatKey = keyof typeof zh

export const en = {
  entry: 'Classic QQ chat',
} satisfies Record<QQChatKey, string>
