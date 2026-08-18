export const zh = {
  entry: '个人工作台',
  title: '我的工作台',
  subtitle: '8 月 17 日 · 星期一',
  close: '关闭个人工作台',
  'tab.today': '今天',
  'tab.inbox': '万能收件箱',
  'tab.projects': '项目空间',
  'tab.learning': '英语学习',
  'tab.ideas': '灵感收集',
  'tab.review': '每周复盘',
} satisfies Record<string, string>

export type PersonalWorkbenchKey = keyof typeof zh

export const en = {
  entry: 'Personal workbench',
  title: 'My workbench',
  subtitle: 'Monday, August 17',
  close: 'Close personal workbench',
  'tab.today': 'Today',
  'tab.inbox': 'Universal inbox',
  'tab.projects': 'Projects',
  'tab.learning': 'English',
  'tab.ideas': 'Ideas',
  'tab.review': 'Weekly review',
} satisfies Record<PersonalWorkbenchKey, string>
