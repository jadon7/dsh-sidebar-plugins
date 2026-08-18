/** QQ-style desktop pet browser plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { PetCompanionEntry } from './PetCompanion.tsx'
import { en, zh, type PetCompanionKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    petCompanion: PetCompanionKey
  }
}

const NS = 'petCompanion'

/** Services required by the pet companion plugin. */
export const inject = ['slots', 'locale']

/** Register locale dictionaries and the sidebar entry. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-pet-companion: dictionaries')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'pet-companion',
    order: 4,
    locale: NS,
  }, PetCompanionEntry))
}
