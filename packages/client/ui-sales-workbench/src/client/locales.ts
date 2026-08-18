export const zh = {
  entry: '销售工作台',
  title: '销售管理工作台',
  subtitle: '华东企业业务部 · 2026 年 8 月',
  close: '关闭销售工作台',
  'tab.dashboard': '销售驾驶舱',
  'tab.customers': '线索与客户',
  'tab.pipeline': '商机漏斗',
  'tab.followups': '跟进中心',
  'tab.contracts': '报价与回款',
  'tab.team': '团队与知识库',
} satisfies Record<string, string>

export type SalesWorkbenchKey = keyof typeof zh

export const en = {
  entry: 'Sales workbench',
  title: 'Sales management workbench',
  subtitle: 'East China Enterprise Team · August 2026',
  close: 'Close sales workbench',
  'tab.dashboard': 'Dashboard',
  'tab.customers': 'Leads & customers',
  'tab.pipeline': 'Pipeline',
  'tab.followups': 'Follow-ups',
  'tab.contracts': 'Quotes & payments',
  'tab.team': 'Team & knowledge',
} satisfies Record<SalesWorkbenchKey, string>
