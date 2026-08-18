import type { ClientContext, SessionId, WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { FeishuChatEntry } from './FeishuChat.tsx'
import { en, zh, type FeishuChatKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    feishuChat: FeishuChatKey
  }
}

const NS = 'feishuChat'
export const inject = ['slots', 'locale', 'layout', 'sessions', 'workspaces']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-feishu-chat: dictionaries')
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'feishu-chat',
    order: 8,
    locale: NS,
    inject: () => ({
      toggleSidebar: () => { ctx.layout.toggleSidebar() },
      openSession: (id: SessionId) => { ctx.sessions.open(id) },
      startSession: (workspaceId?: WorkspaceId) => { ctx.workspaces.startSession(workspaceId) },
    }),
  }, FeishuChatEntry))
}
