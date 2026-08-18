export const zh = {
  entry: '飞书聊天',
} satisfies Record<string, string>

export type FeishuChatKey = keyof typeof zh

export const en = {
  entry: 'Feishu chat',
} satisfies Record<FeishuChatKey, string>
