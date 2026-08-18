import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import clsx from 'clsx'
import type {
  SessionId, SessionSummary, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  IconNewChatOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './QQChat.module.css'
import { qqSessionAvatars } from './QQAvatarAssets.ts'
import { qqShowFashion, qqShowFriends } from './QQShowAssets.ts'

interface CenterColumnBox {
  top: number
  left: number
  width: number
  height: number
}

interface ProjectGroup {
  workspace?: WorkspaceView
  title: string
  sessions: SessionSummary[]
}

export type QQChatEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'qqChat'> & {
  toggleSidebar: () => void
  openSession: (id: SessionId) => void
  startSession: (workspaceId?: WorkspaceId) => void
}

const MENUS = ['聊天', '娱乐', '应用', '工具']
const ACTIONS = [['✉', '短信'], ['▣', '视频'], ['☎', '语音'], ['📁', '传文件'], ['♧', '邀请'], ['⚑', '举报']] as const

function titleOf(session: SessionSummary): string {
  return session.blank ? '新会话' : session.displayTitle
}

function stateOf(session: SessionSummary): string {
  if (session.pendingInteraction !== undefined) return '待处理'
  if (session.running) return '执行中'
  if (session.completed) return '已完成'
  return '在线'
}

function rowStateOf(session: SessionSummary): string {
  if (session.pendingInteraction !== undefined || session.running || session.completed) return stateOf(session)
  const minutes = Math.max(0, Math.floor((Date.now() - session.updatedAt) / 60_000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  return hours < 24 ? `${hours}小时` : `${Math.floor(hours / 24)}天`
}

function toneOf(session: SessionSummary): 'waiting' | 'running' | 'done' | 'idle' {
  if (session.pendingInteraction !== undefined) return 'waiting'
  if (session.running) return 'running'
  if (session.completed) return 'done'
  return 'idle'
}

function avatarOf(session: SessionSummary): string {
  return qqSessionAvatars[session.id.charCodeAt(session.id.length - 1) % qqSessionAvatars.length]!
}

function useCenterColumnBox(open: boolean): CenterColumnBox | null {
  const [box, setBox] = useState<CenterColumnBox | null>(null)

  useEffect(() => {
    if (!open) {
      setBox(null)
      return
    }
    const center = document.querySelector<HTMLElement>('[data-slot="conversation"]')?.parentElement
    if (center === undefined) return
    const update = (): void => {
      const rect = center.getBoundingClientRect()
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(center)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [open])

  return box
}

function buildGroups(
  ids: readonly SessionId[],
  byId: Record<SessionId, SessionSummary>,
  current: SessionId | undefined,
  workspaces: readonly WorkspaceView[],
  archivedIds: readonly SessionId[],
): ProjectGroup[] {
  const archived = new Set(archivedIds)
  const accounted = new Set<SessionId>()
  const visible = (id: SessionId): SessionSummary | undefined => {
    const session = byId[id]
    if (session === undefined || session.origin === 'subagent' || archived.has(id)) return undefined
    return session.blank && id !== current ? undefined : session
  }
  const groups: ProjectGroup[] = workspaces.map((workspace) => {
    workspace.sessionIds.forEach(id => accounted.add(id))
    return {
      workspace,
      title: workspace.title,
      sessions: workspace.sessionIds.flatMap((id) => {
        const session = visible(id)
        return session === undefined ? [] : [session]
      }),
    }
  })
  const ungrouped = ids.flatMap((id) => {
    if (accounted.has(id)) return []
    const session = visible(id)
    return session === undefined ? [] : [session]
  })
  if (ungrouped.length > 0) groups.push({ title: '其他会话', sessions: ungrouped })
  return groups
}

function ProjectSidebar({
  box, groups, current, openSession, startSession, close,
}: {
  box: CenterColumnBox
  groups: ProjectGroup[]
  current: SessionId | undefined
  openSession: (id: SessionId) => void
  startSession: (id?: WorkspaceId) => void
  close: () => void
}) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const needle = query.trim().toLocaleLowerCase()
  const shown = groups.flatMap((group) => {
    const projectMatch = group.title.toLocaleLowerCase().includes(needle)
    const sessions = group.sessions.filter(session => projectMatch || titleOf(session).toLocaleLowerCase().includes(needle))
    return sessions.length === 0 && !projectMatch ? [] : [{ ...group, sessions }]
  })
  const count = groups.reduce((total, group) => total + group.sessions.length, 0)

  return (
    <aside className={css.qqSidebar} style={{ top: box.top, width: box.left, height: box.height }}>
      <div className={css.sidebarTitle}><strong>🐧 QQ 经典版</strong><button type="button" onClick={close}>×</button></div>
      <div className={css.account}>
        <div className={css.avatar}>深</div>
        <div><strong>DSH 工作区</strong><span><i />在线 · 真实项目与会话</span></div>
        <button type="button" onClick={() => { startSession() }}>＋</button>
      </div>
      <label className={css.search}><span>⌕</span><input value={query} onChange={event => { setQuery(event.target.value) }} placeholder="搜索项目或会话" /></label>
      <div className={css.listTabs}><strong>项目与会话</strong><span>{count}</span></div>
      <div className={css.projectList}>
        {shown.map((group) => {
          const key = group.workspace?.workspaceId ?? 'other'
          const closed = collapsed.has(key)
          return (
            <section key={key}>
              <div className={css.projectHeader}>
                <button type="button" onClick={() => {
                  setCollapsed((value) => {
                    const next = new Set(value)
                    if (next.has(key)) next.delete(key)
                    else next.add(key)
                    return next
                  })
                }}><span>{closed ? '▸' : '▾'}</span><strong>📁 {group.title}</strong><small>{group.sessions.length}</small></button>
                {group.workspace !== undefined && <button type="button" onClick={() => { startSession(group.workspace?.workspaceId) }}>＋</button>}
              </div>
              {!closed && group.sessions.map((session) => (
                <button
                  type="button"
                  key={session.id}
                  className={clsx(css.sessionRow, session.id === current && css.current)}
                  onClick={() => { openSession(session.id) }}
                >
                  <img src={avatarOf(session)} className={css.sessionAvatar} alt="" />
                  <span><strong>{titleOf(session)}</strong><small>{session.cwd ?? group.title}</small></span>
                  <em className={css[toneOf(session)]}>{rowStateOf(session)}</em>
                </button>
              ))}
            </section>
          )
        })}
        {shown.length === 0 && <p className={css.empty}>没有匹配的项目或会话</p>}
      </div>
      <footer className={css.sidebarFooter}><span><i />在线</span><span>{groups.length} 个项目 · {count} 个会话</span></footer>
    </aside>
  )
}

function ChatChrome({
  box, current, workspace, close,
}: {
  box: CenterColumnBox
  current?: SessionSummary
  workspace?: WorkspaceView
  close: () => void
}) {
  const [hint, setHint] = useState('真实 DSH 会话已连接，消息和输入可直接使用')
  const title = current === undefined ? '请选择会话' : titleOf(current)
  const state = current === undefined ? '未选择' : stateOf(current)
  const style: CSSProperties = { top: box.top, left: box.left, width: box.width, height: box.height }

  return (
    <section className={css.qqPanel} style={style}>
      <header className={css.titleBar}>
        <strong>🐧 与 {title} 交谈中 <em>{current?.running ? '执行中' : '在线'}</em></strong>
        <div><button type="button" onClick={() => { setHint('窗口保持在当前工作区') }}>—</button><button type="button" onClick={() => { setHint('当前已是可用大小') }}>□</button><button type="button" onClick={close}>×</button></div>
      </header>
      <nav className={css.menuBar}>{MENUS.map((menu, index) => <button type="button" key={menu} className={index === 0 ? css.active : undefined} onClick={() => { setHint(`${menu}菜单仅作界面展示`) }}>{menu}</button>)}<span>经典模式</span></nav>
      <div className={css.actionBar}>{ACTIONS.map(([icon, label]) => <button type="button" key={label} onClick={() => { setHint(`${label}按钮仅作界面展示`) }}><span>{icon}</span>{label}</button>)}</div>
      <div className={css.contact}>
        <div className={css.avatar}>深</div>
        <div><strong>{title} <i>[{state}]</i></strong><span>{workspace === undefined ? 'DSH 真实会话' : `${workspace.title} · ${workspace.path}`}</span></div>
        <button type="button" onClick={() => { setHint('右侧显示当前真实项目与会话资料') }}>查看资料</button>
      </div>
      <div className={css.notice}>🛡 当前区域显示真实项目对话；发送操作使用 DSH 原有输入框。</div>
      <aside className={css.profile}>
        <section><header><strong>我的 QQ 秀</strong><span>经典形象</span></header><figure className={css.qqShow}><img src={qqShowFashion} alt="我的 QQ 秀" /><figcaption>点击查看我的 QQ 秀</figcaption></figure></section>
        <section><header><strong>对方 QQ 秀</strong><span>在线</span></header><figure className={css.qqShow}><img src={qqShowFriends} alt="对方 QQ 秀" /><figcaption>点击查看对方 QQ 秀</figcaption></figure></section>
      </aside>
      <footer className={css.statusBar}><span><i />{title} · {state}</span><span>{hint}</span><span>QQ 经典窗口</span></footer>
    </section>
  )
}

export function QQChatEntry({
  wide, t, toggleSidebar, openSession, startSession, useSessions, useWorkspaces,
}: QQChatEntryProps) {
  const [open, setOpen] = useState(false)
  const sessions = useSessions(state => state)
  const workspaces = useWorkspaces(state => state)
  const box = useCenterColumnBox(open)

  useEffect(() => {
    document.body.toggleAttribute('data-dsh-qq-chat', open)
    return () => { document.body.removeAttribute('data-dsh-qq-chat') }
  }, [open])

  const groups = useMemo(() => buildGroups(sessions.ids, sessions.byId, sessions.current, workspaces.items, workspaces.archivedSessionIds), [sessions, workspaces])
  const current = sessions.current === undefined ? undefined : sessions.byId[sessions.current]
  const workspace = current === undefined ? undefined : workspaces.items.find(item => item.sessionIds.includes(current.id))
  const close = (): void => { setOpen(false) }

  return (
    <>
      <Tooltip label={t('entry')} delayMs={500} disabled={wide}>
        <button type="button" className={clsx(css.trigger, !wide && css.rail)} aria-pressed={open} onClick={() => {
          if (!open && !wide) toggleSidebar()
          setOpen(value => !value)
        }}><IconNewChatOutline16 size={wide ? 16 : 18} />{wide && <span>{t('entry')}</span>}</button>
      </Tooltip>
      {open && box !== null && <><ProjectSidebar box={box} groups={groups} current={sessions.current} openSession={openSession} startSession={startSession} close={close} /><ChatChrome box={box} current={current} workspace={workspace} close={close} /></>}
    </>
  )
}
