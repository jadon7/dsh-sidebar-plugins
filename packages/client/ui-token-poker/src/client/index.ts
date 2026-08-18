/** Token poker browser plugin: sidebar entry plus local interactive table. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { PokerEntry } from './PokerPanel.tsx'
import { en, zh, type TokenPokerKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Token poker entry and table copy. */
    tokenPoker: TokenPokerKey
  }
}

const NS = 'tokenPoker'

/** Services required by the token poker plugin. */
export const inject = ['slots', 'locale']

/**
 * Register the locale dictionaries and sidebar entry.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-token-poker: dictionaries')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'token-poker',
    order: 2,
    locale: NS,
  }, PokerEntry))
}
