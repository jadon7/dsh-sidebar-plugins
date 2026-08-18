import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import clsx from 'clsx'
import type {
  SessionId, SessionSummary, WorkspaceId, WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  FishLogo,
  IconChecklistOutline14,
  IconCloseOutline16,
  IconDataOutline16,
  IconEllipsisOutline16,
  IconGoalOutline16,
  IconLinkOutline16,
  IconListPenOutline16,
  IconNewChatOutline16,
  IconPaperclipOutline16,
  IconPlayOutline16,
  IconPlusOutline16,
  IconSearchOutline16,
  IconSettingsOutline16,
  IconUserOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './FeishuChat.module.css'

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

export type FeishuChatEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'feishuChat'> & {
  toggleSidebar: () => void
  openSession: (id: SessionId) => void
  startSession: (workspaceId?: WorkspaceId) => void
}

const CHAT_TABS = ['消息', '云文档', '文件'] as const

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
  if (session.pendingInteraction !== undefined || session.running) return stateOf(session)
  const minutes = Math.max(0, Math.floor((Date.now() - session.updatedAt) / 60_000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  return hours < 24 ? `${hours} 小时` : `${Math.floor(hours / 24)} 天`
}

function toneOf(session: SessionSummary): 'waiting' | 'running' | 'idle' {
  if (session.pendingInteraction !== undefined) return 'waiting'
  if (session.running) return 'running'
  return 'idle'
}

function avatarToneOf(session: SessionSummary): string {
  return css[`avatarTone${session.id.charCodeAt(session.id.length - 1) % 6}`]!
}

function useCenterColumnBox(open: boolean): CenterColumnBox | null {
  const [box, setBox] = useState<CenterColumnBox | null>(null)

  useEffect(() => {
    if (!open) {
      setBox(null)
      return
    }
    const center = document.querySelector<HTMLElement>('[data-slot="conversation"]')?.parentElement
    if (center === null || center === undefined) return
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

function FeishuSidebar({
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
  const [railActive, setRailActive] = useState('消息')
  const needle = query.trim().toLocaleLowerCase()
  const entries = groups
    .flatMap(group => group.sessions.map(session => ({ group, session })))
    .sort((left, right) => right.session.updatedAt - left.session.updatedAt)
  const shown = entries.filter(({ group, session }) => needle.length === 0
    || group.title.toLocaleLowerCase().includes(needle)
    || titleOf(session).toLocaleLowerCase().includes(needle))
  const shortcuts = entries.slice(0, 10)
  const pendingCount = entries.filter(({ session }) => session.pendingInteraction !== undefined).length

  return (
    <aside className={css.feishuSidebar} style={{ top: box.top, width: box.left, height: box.height }}>
      <nav className={css.appRail} aria-label="飞书导航">
        <div className={css.railProfile}><FishLogo size={24} /></div>
        <button type="button" aria-label="搜索" onClick={() => { document.querySelector<HTMLInputElement>(`.${css.search} input`)?.focus() }}><IconSearchOutline16 size={20} /></button>
        <button type="button" aria-label="新会话" onClick={() => { startSession() }}><IconPlusOutline16 size={20} /></button>
        <button type="button" className={css.messageRailButton} aria-pressed={railActive === '消息'} onClick={() => { setRailActive('消息') }}><IconNewChatOutline16 size={20} /><span>消息</span>{pendingCount > 0 && <em>{pendingCount}</em>}</button>
        <button type="button" aria-pressed={railActive === '日历'} onClick={() => { setRailActive('日历') }}><IconChecklistOutline14 size={20} /><span>日历</span></button>
        <button type="button" aria-pressed={railActive === '云文档'} onClick={() => { setRailActive('云文档') }}><IconDataOutline16 size={20} /><span>云文档</span></button>
        <button type="button" aria-pressed={railActive === '工作台'} onClick={() => { setRailActive('工作台') }}><IconListPenOutline16 size={20} /><span>工作台</span></button>
        <button type="button" aria-pressed={railActive === '任务'} onClick={() => { setRailActive('任务') }}><IconGoalOutline16 size={20} /><span>任务</span></button>
        <button type="button" aria-pressed={railActive === '通讯录'} onClick={() => { setRailActive('通讯录') }}><IconUserOutline16 size={20} /><span>通讯录</span></button>
        <button type="button" aria-pressed={railActive === '更多'} onClick={() => { setRailActive('更多') }}><IconEllipsisOutline16 size={20} /><span>更多</span></button>
        <button type="button" className={css.railBottom} aria-pressed={railActive === '设置'} onClick={() => { setRailActive('设置') }}><IconSettingsOutline16 size={20} /><span>设置</span></button>
      </nav>

      <section className={css.sessionPane}>
        <header className={css.paneHeader}>
          <div><span>≡</span><strong>消息</strong></div>
          <div>
            <button type="button" title="新会话" onClick={() => { startSession() }}><IconPlusOutline16 /></button>
            <button type="button" title="退出飞书模式" onClick={close}><IconCloseOutline16 /></button>
          </div>
        </header>
        <div className={css.shortcutStrip}>
          {shortcuts.map(({ group, session }) => (
            <button
              type="button"
              key={session.id}
              className={clsx(session.id === current && css.shortcutCurrent)}
              title={`${group.title} · ${titleOf(session)}`}
              onClick={() => { openSession(session.id) }}
            >
              <span className={clsx(css.shortcutAvatar, avatarToneOf(session))}>{titleOf(session).slice(0, 1)}</span>
              <small>{titleOf(session)}</small>
            </button>
          ))}
        </div>
        <label className={css.search}><IconSearchOutline16 /><input value={query} onChange={event => { setQuery(event.target.value) }} placeholder="搜索项目或会话" /></label>
        <div className={css.listHeading}><strong>会话</strong><span>{entries.length}</span></div>
        <div className={css.projectList}>
          {shown.map(({ group, session }) => (
            <button
              type="button"
              key={session.id}
              className={clsx(css.sessionRow, session.id === current && css.current)}
              onClick={() => { openSession(session.id) }}
            >
              <span className={clsx(css.sessionAvatar, avatarToneOf(session))}>{titleOf(session).slice(0, 1)}</span>
              <span className={css.sessionCopy}><strong>{titleOf(session)}</strong><small>{group.title} · {stateOf(session)}</small></span>
              <em className={css[toneOf(session)]}>{rowStateOf(session)}</em>
            </button>
          ))}
          {shown.length === 0 && <p className={css.empty}>没有匹配的项目或会话</p>}
        </div>
      </section>
    </aside>
  )
}

function FeishuChrome({
  box, current, workspace, close,
}: {
  box: CenterColumnBox
  current: SessionSummary | undefined
  workspace: WorkspaceView | undefined
  close: () => void
}) {
  const [tab, setTab] = useState<(typeof CHAT_TABS)[number]>('消息')
  const title = current === undefined ? '请选择会话' : titleOf(current)
  const state = current === undefined ? '未选择会话' : stateOf(current)
  const sessionCount = workspace?.sessionIds.length ?? (current === undefined ? 0 : 1)
  const style: CSSProperties = { top: box.top, left: box.left, width: box.width, height: box.height }

  return (
    <section className={css.feishuPanel} style={style}>
      <header className={css.chatHeader}>
        <div className={css.headerMain}>
          <div className={css.headerIdentity}>
            <span className={clsx(css.headerAvatar, current !== undefined && avatarToneOf(current))}>{title.slice(0, 1)}</span>
            <span className={css.headerCopy}>
              <span className={css.headerTitleLine}><strong>{title}</strong><small>{workspace?.title ?? '独立会话'} · {sessionCount} 个会话</small><em>{state}</em></span>
            </span>
          </div>
          <div className={css.headerActions}>
            <button type="button" title="搜索"><IconSearchOutline16 /></button>
            <button type="button" title="视频会议"><IconPlayOutline16 /></button>
            <button type="button" title="会话成员"><IconUserOutline16 /></button>
            <button type="button" title="更多"><IconEllipsisOutline16 /></button>
            <button type="button" title="退出飞书模式" onClick={close}><IconCloseOutline16 /></button>
          </div>
        </div>
        <nav className={css.chatTabs}>
          {CHAT_TABS.map(item => <button type="button" key={item} aria-pressed={tab === item} onClick={() => { setTab(item) }}>{item === '消息' && <IconNewChatOutline16 size={14} />}{item === '文件' && <IconPaperclipOutline16 size={14} />}{item === '云文档' && <IconLinkOutline16 size={14} />}{item}</button>)}
          <button type="button" className={css.addTab} title="添加标签"><IconPlusOutline16 size={14} /></button>
        </nav>
      </header>
    </section>
  )
}

export function FeishuChatEntry({
  wide, t, toggleSidebar, openSession, startSession, useSessions, useWorkspaces,
}: FeishuChatEntryProps) {
  const [open, setOpen] = useState(false)
  const sessions = useSessions(state => state)
  const workspaces = useWorkspaces(state => state)
  const box = useCenterColumnBox(open)

  useEffect(() => {
    document.body.toggleAttribute('data-dsh-feishu-chat', open)
    return () => { document.body.removeAttribute('data-dsh-feishu-chat') }
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
      {open && box !== null && <><FeishuSidebar box={box} groups={groups} current={sessions.current} openSession={openSession} startSession={startSession} close={close} /><FeishuChrome box={box} current={current} workspace={workspace} close={close} /></>}
    </>
  )
}
