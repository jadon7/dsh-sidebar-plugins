import { useEffect, useState } from 'react'
import clsx from 'clsx'
import {
  IconChecklistOutline14,
  IconCloseOutline16,
  IconDataOutline16,
  IconLightOutline16,
  IconListPenOutline16,
  IconSendOutline16,
  IconThinkOutline16,
  IconUserOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TeacherWorkbenchKey } from './locales.ts'
import { TeacherView, type WorkbenchTab } from './TeacherViews.tsx'
import css from './TeacherWorkbench.module.css'

interface CenterColumnBox {
  left: number
  top: number
  right: number
  bottom: number
}

const TABS: readonly { id: WorkbenchTab, key: TeacherWorkbenchKey }[] = [
  { id: 'dashboard', key: 'tab.dashboard' },
  { id: 'schedule', key: 'tab.schedule' },
  { id: 'records', key: 'tab.records' },
  { id: 'lessons', key: 'tab.lessons' },
  { id: 'academics', key: 'tab.academics' },
  { id: 'habits', key: 'tab.habits' },
  { id: 'students', key: 'tab.students' },
  { id: 'classes', key: 'tab.classes' },
  { id: 'family', key: 'tab.family' },
  { id: 'tools', key: 'tab.tools' },
  { id: 'growth', key: 'tab.growth' },
]

function centerColumn(): HTMLElement | undefined {
  for (const el of document.querySelectorAll<HTMLElement>('*')) {
    for (const name of el.classList) {
      if (name.endsWith('_centerCol')) return el
    }
  }
  return undefined
}

function centerColumnBox(): CenterColumnBox | undefined {
  const rect = centerColumn()?.getBoundingClientRect()
  if (rect === undefined) return undefined
  return {
    left: rect.left,
    top: rect.top,
    right: window.innerWidth - rect.right,
    bottom: window.innerHeight - rect.bottom,
  }
}

function useCenterColumnBox(): CenterColumnBox {
  const [box, setBox] = useState<CenterColumnBox>(() => centerColumnBox() ?? { left: 0, top: 0, right: 0, bottom: 0 })
  useEffect(() => {
    const measure = (): void => {
      const next = centerColumnBox()
      if (next !== undefined) setBox(next)
    }
    measure()
    const column = centerColumn()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined
    if (column !== undefined) observer?.observe(column)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return box
}

function TabIcon({ tab }: { tab: WorkbenchTab }) {
  if (tab === 'dashboard' || tab === 'academics') return <IconDataOutline16 size={15} />
  if (tab === 'schedule') return <IconChecklistOutline14 size={15} />
  if (tab === 'records' || tab === 'habits' || tab === 'classes') return <IconChecklistOutline14 size={15} />
  if (tab === 'lessons') return <IconListPenOutline16 size={15} />
  if (tab === 'students') return <IconUserOutline16 size={15} />
  if (tab === 'family') return <IconSendOutline16 size={15} />
  if (tab === 'tools') return <IconThinkOutline16 size={15} />
  return <IconLightOutline16 size={15} />
}

/** Props for the sidebar teacher workbench entry. */
export type TeacherWorkbenchEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'teacherWorkbench'>

/**
 * Render the sidebar entry and its local workbench panel.
 * @param props - Sidebar width state and locale dictionary.
 * @returns The entry button and optional workbench panel.
 */
export function TeacherWorkbenchEntry({ wide, t }: TeacherWorkbenchEntryProps) {
  const [open, setOpen] = useState(false)
  const panelId = 'dsh-teacher-workbench-panel'
  return (
    <>
      <Tooltip label={t('entry')} delayMs={500} disabled={wide}>
        <button
          type="button"
          className={clsx(css.trigger, !wide && css.rail)}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => { setOpen(value => !value) }}
        >
          <IconListPenOutline16 size={wide ? 16 : 18} />
          {wide && <span className={css.triggerLabel}>{t('entry')}</span>}
        </button>
      </Tooltip>
      {open && <TeacherWorkbenchPanel panelId={panelId} t={t} onClose={() => { setOpen(false) }} />}
    </>
  )
}

function TeacherWorkbenchPanel({
  panelId,
  t,
  onClose,
}: {
  panelId: string
  t: (key: TeacherWorkbenchKey) => string
  onClose: () => void
}) {
  const box = useCenterColumnBox()
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('dashboard')
  const activeLabel = t(TABS.find(tab => tab.id === activeTab)?.key ?? 'tab.dashboard')
  return (
    <aside
      id={panelId}
      data-screen-label="Teacher Workbench"
      className={css.panel}
      style={{ left: box.left, top: box.top, right: box.right, bottom: box.bottom }}
      aria-label={t('title')}
    >
      <header className={css.header}>
        <div className={css.heading}>
          <span className={css.breadcrumb}>{t('title')} <i>›</i> 高二（3）班 · 物理 <i>›</i> {activeLabel}</span>
          <div className={css.titleRow}>
            <strong className={css.title}>高二（3）班 · 运动学单元</strong>
            <span className={css.liveStatus}>第 3 周 · 上课中</span>
          </div>
        </div>
        <div className={css.headerActions}>
          <button type="button" className={css.iconButton} onClick={() => { setActiveTab('classes') }} aria-label="班级管理">
            <IconChecklistOutline14 size={17} />
          </button>
          <button type="button" className={css.iconButton} onClick={() => { setActiveTab('academics') }} aria-label="学业数据">
            <IconDataOutline16 size={17} />
          </button>
          <button type="button" className={css.iconButton} onClick={() => { setActiveTab('family') }} aria-label="家校沟通">
            <IconSendOutline16 size={17} />
          </button>
          <button type="button" className={css.iconButton} onClick={() => { setActiveTab('lessons') }} aria-label="教案管理">
            <IconListPenOutline16 size={17} />
          </button>
          <button type="button" className={css.iconButton} onClick={() => { setActiveTab('schedule') }} aria-label="排课表">
            <IconLightOutline16 size={17} />
          </button>
          <button type="button" className={clsx(css.iconButton, css.iconButtonPrimary)} onClick={() => { setActiveTab('tools') }} aria-label="课堂工具">
            <IconThinkOutline16 size={17} />
          </button>
          <button type="button" className={css.closeButton} onClick={onClose} aria-label={t('close')}>
            <IconCloseOutline16 size={17} />
          </button>
        </div>
      </header>

      <nav className={css.tabs} aria-label="工作台功能" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="teacher-workbench-content"
            className={clsx(css.tab, activeTab === tab.id && css.tabActive)}
            onClick={() => { setActiveTab(tab.id) }}
          >
            <TabIcon tab={tab.id} />
            <span>{t(tab.key)}</span>
          </button>
        ))}
      </nav>

      <section id="teacher-workbench-content" className={css.content} role="tabpanel">
        <TeacherView tab={activeTab} onNavigate={setActiveTab} />
      </section>
    </aside>
  )
}
