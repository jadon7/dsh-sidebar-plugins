/**
 * Taskboard plugin, browser half: the `sidebar.footer.action` contribution
 * opening the embedded Codex Taskboard panel. No slots are declared here —
 * the entry rides the sidebar's existing foot-action hole, and the panel is
 * the registrant's own overlay.
 * Export discipline: packages/client/AGENTS.md.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the sidebar slot declarations (PropsRuntime
// resolution for `sidebar.footer.action`).
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
// Type-only: pulls ctx.locale into this program.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { TaskboardEntry, WorkflowEntry } from './TaskboardPanel.tsx'
import { en, zh, type TaskboardKey } from './locales.ts'

export type {
  TaskboardEntryProps, TaskboardPanelProps,
} from './TaskboardPanel.tsx'
export type { TaskboardKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Taskboard entry + panel copy. */
    taskboard: TaskboardKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'taskboard'

/** Services required by the taskboard plugin. */
export const inject = ['slots', 'locale']

/**
 * Register the `taskboard` dictionaries and the two sidebar foot actions once
 * the hole is on the ledger.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-taskboard: dictionaries')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'taskboard',
    order: 0,
    locale: NS,
  }, TaskboardEntry))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'taskboard-workflow',
    order: 1,
    locale: NS,
  }, WorkflowEntry))
}
