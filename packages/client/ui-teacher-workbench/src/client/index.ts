/** Teacher workbench browser plugin: sidebar entry plus six local UI views. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { TeacherWorkbenchEntry } from './TeacherWorkbench.tsx'
import { en, zh, type TeacherWorkbenchKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Teacher workbench entry and navigation copy. */
    teacherWorkbench: TeacherWorkbenchKey
  }
}

const NS = 'teacherWorkbench'

/** Services required by the teacher workbench plugin. */
export const inject = ['slots', 'locale']

/**
 * Register the locale dictionaries and sidebar entry.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-teacher-workbench: dictionaries')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'teacher-workbench',
    order: 3,
    locale: NS,
  }, TeacherWorkbenchEntry))
}
