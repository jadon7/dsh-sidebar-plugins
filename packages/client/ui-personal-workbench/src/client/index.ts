import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { PersonalWorkbenchEntry } from './PersonalWorkbench.tsx'
import { en, zh, type PersonalWorkbenchKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    personalWorkbench: PersonalWorkbenchKey
  }
}

const NS = 'personalWorkbench'
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-personal-workbench: dictionaries')
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'personal-workbench',
    order: 6,
    locale: NS,
  }, PersonalWorkbenchEntry))
}
