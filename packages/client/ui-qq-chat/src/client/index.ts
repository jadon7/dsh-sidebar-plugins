import type { ClientContext, SessionId, WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { QQChatEntry } from './QQChat.tsx'
import { en, zh, type QQChatKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    qqChat: QQChatKey
  }
}

const NS = 'qqChat'
export const inject = ['slots', 'locale', 'layout', 'sessions', 'workspaces']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-qq-chat: dictionaries')
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'qq-chat',
    order: 7,
    locale: NS,
    inject: () => ({
      toggleSidebar: () => { ctx.layout.toggleSidebar() },
      openSession: (id: SessionId) => { ctx.sessions.open(id) },
      startSession: (workspaceId?: WorkspaceId) => { ctx.workspaces.startSession(workspaceId) },
    }),
  }, QQChatEntry))
}
