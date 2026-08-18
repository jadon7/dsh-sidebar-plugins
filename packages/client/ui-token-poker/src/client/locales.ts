/** `tokenPoker` namespace dictionaries. */

/** Simplified Chinese dictionary. */
export const zh = {
  entry: 'Token 德州',
  title: 'Token 德州',
  subtitle: '推理无限注 · 0.5 / 1 MToken · 6 人桌',
  friends: '好友桌 · 4 / 6 在线',
  hand: '牌局',
  invite: '邀请好友',
  invited: '房间码已复制',
  newHand: '重新发牌',
  leave: '离开牌桌',
  pot: '底池',
  betLabel: '下注',
  fold: '弃牌',
  call: '跟注',
  bet: '下注',
  you: '你',
  dealer: '庄',
  'status.default': '轮到你 · Noah 已下注 561K',
  'status.fold': '你已弃牌 · 等待下一手',
  'status.call': '已跟注 · 好友正在思考',
  'status.bet': '已下注 · 好友正在思考',
} satisfies Record<string, string>

/** Token poker dictionary key union. */
export type TokenPokerKey = keyof typeof zh

/** English dictionary. */
export const en = {
  entry: 'Token Poker',
  title: 'Token Poker',
  subtitle: 'No-Limit Inference · 0.5 / 1 MToken · 6-max',
  friends: 'Friends table · 4 / 6 online',
  hand: 'Hand',
  invite: 'Invite friends',
  invited: 'Room code copied',
  newHand: 'Deal again',
  leave: 'Leave table',
  pot: 'Pot',
  betLabel: 'Bet',
  fold: 'Fold',
  call: 'Call',
  bet: 'Bet',
  you: 'You',
  dealer: 'D',
  'status.default': 'Your turn · Noah bet 561K',
  'status.fold': 'You folded · Waiting for the next hand',
  'status.call': 'Called · Friends are thinking',
  'status.bet': 'Bet placed · Friends are thinking',
} satisfies Record<TokenPokerKey, string>
