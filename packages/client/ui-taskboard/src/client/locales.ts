/** `taskboard` namespace dictionaries. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'entry': '任务面板',
  'title': '任务面板',
  'workflow.entry': '节点工作流',
  'refresh': '刷新',
  'close': '关闭',
  'offline.title': '任务面板服务未启动',
  'offline.hint': '请在 taskboard 目录运行 `npm start` 启动服务后重试。',
  'offline.retry': '重试',
} satisfies Record<string, string>

/** The taskboard namespace key union. */
export type TaskboardKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'entry': 'Taskboard',
  'title': 'Taskboard',
  'workflow.entry': 'Workflow',
  'refresh': 'Refresh',
  'close': 'Close',
  'offline.title': 'Taskboard service is not running',
  'offline.hint': 'Start the service with `npm start` in the taskboard directory, then retry.',
  'offline.retry': 'Retry',
} satisfies Record<TaskboardKey, string>
