/**
 * Taskboard surface: the sidebar-foot entry (`sidebar.footer.action`
 * contribution) plus a full main-area takeover panel embedding the locally
 * running Codex Taskboard service in an iframe — everything right of the
 * sidebar is replaced while it is open. The panel probes the service with a
 * `no-cors` fetch (resolves on any HTTP response, rejects only on a network
 * failure) while it is open, so a stopped service degrades to a clear
 * offline state with a retry instead of a dead iframe.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  IconBranchOutline16, IconChecklistOutline14, IconCloseOutline16,
  IconRefreshOutline16, IconWarningOutline16, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TaskboardKey } from './locales.ts'
import css from './TaskboardPanel.module.css'

/**
 * The local Codex Taskboard service origin (server: `node server/index.mjs`).
 * `?host=codex` switches the app into its embedded mode, which drops its own
 * 220px left navigation column (`.app-shell.embedded`) — inside the harness
 * only the board itself should fill the center area.
 */
export const TASKBOARD_URL = 'http://127.0.0.1:47823/?host=codex'

/**
 * The node-workflow deep link: embedded mode plus `?view=workflow`, which the
 * taskboard app honors as the initial board view (bypassing its own
 * SHOW_WORKFLOW_BOARD_ENTRY toolbar gate).
 */
export const TASKBORD_WORKFLOW_URL = 'http://127.0.0.1:47823/?host=codex&view=workflow'

/** Re-probe cadence while the panel is open. */
const PROBE_INTERVAL_MS = 5000

/**
 * Probe the taskboard service. `no-cors` keeps the probe free of CORS
 * preflight: a live server answers any request (status irrelevant), a dead
 * one rejects the fetch with a network error.
 * @param url - the embedded service URL to probe.
 * @returns whether the service answered.
 */
async function probeTaskboardServer(url: string): Promise<boolean> {
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store' })
    return true
  } catch {
    return false
  }
}

/** Entry props: the sidebar column state + the standard locale seat. */
export type TaskboardEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'taskboard'>

/** Shared entry configuration: what one foot action opens. */
interface EntryConfig {
  /** Embedded service URL the panel iframe loads. */
  url: string
  /** Stable panel element id (aria-controls target). */
  panelId: string
  /** Wide row / panel title copy. */
  label: string
  /** Rail icon. */
  icon: 'issues' | 'workflow'
}

/**
 * The sidebar-foot taskboard entries: rows like the Settings trigger in the
 * wide column, 36px rail circles when collapsed. Clicking toggles the full
 * main-area takeover panel for the configured view.
 * @param props - composed slot props plus the entry configuration.
 * @returns the entry button plus the mounted panel.
 */
function TaskboardEntryBase(props: TaskboardEntryProps & EntryConfig) {
  const { wide, t, url, panelId, label, icon } = props
  const [open, setOpen] = useState(false)
  return (
    <>
      <Tooltip label={label} delayMs={500} disabled={wide}>
        <button
          type="button"
          className={clsx(css.trigger, !wide && css.rail)}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => { setOpen(v => !v) }}
        >
          {icon === 'workflow'
            ? <IconBranchOutline16 size={wide ? 16 : 18} />
            : <IconChecklistOutline14 size={wide ? 14 : 18} />}
          {wide && <span className={css.triggerLabel}>{label}</span>}
        </button>
      </Tooltip>
      {open && (
        <TaskboardPanel
          t={t}
          onClose={() => { setOpen(false) }}
          url={url}
          title={label}
          panelId={panelId}
        />
      )}
    </>
  )
}

/** The issue-board entry (`?host=codex`). */
export function TaskboardEntry(props: TaskboardEntryProps) {
  return (
    <TaskboardEntryBase
      {...props}
      url={TASKBOARD_URL}
      panelId="dsh-taskboard-panel"
      label={props.t('entry')}
      icon="issues"
    />
  )
}

/** The node-workflow entry (`?host=codex&view=workflow`). */
export function WorkflowEntry(props: TaskboardEntryProps) {
  return (
    <TaskboardEntryBase
      {...props}
      url={TASKBORD_WORKFLOW_URL}
      panelId="dsh-taskboard-workflow-panel"
      label={props.t('workflow.entry')}
      icon="workflow"
    />
  )
}

/** Panel props: the locale seat, the close path, and what the panel embeds. */
export interface TaskboardPanelProps {
  t: (key: TaskboardKey) => string
  onClose: () => void
  /** Embedded service URL the iframe loads. */
  url: string
  /** Panel title / accessible name. */
  title: string
  /** Stable panel element id (aria-controls target). */
  panelId: string
}

/** One edge set of the center column in viewport px (left/top/right/bottom). */
export interface CenterColumnBox {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Find the layout's center column — the main area right of the sidebar —
 * through its CSS-module class (lightningcss names it `<hash>_centerCol`,
 * stable local name across builds). The box it occupies is exactly the
 * "everything except the sidebar" region the taskboard takes over, so the
 * panel adapts to collapsed rails, drag-resizing, and narrow-viewport
 * auto-collapse. Falls back to undefined outside the app shell (component
 * tests).
 * @returns the center column element, or undefined.
 */
function centerColumn(): HTMLElement | undefined {
  for (const el of document.querySelectorAll<HTMLElement>('*')) {
    for (const name of el.classList) {
      if (name.endsWith('_centerCol')) return el
    }
  }
  return undefined
}

/**
 * Measure the center column's viewport box.
 * @returns the column's edges, or undefined outside the app shell.
 */
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

/**
 * Track the center column's box while the panel is open: re-measures on
 * column resizes and window resizes.
 * @returns the current box (0-edges fallback outside the app shell).
 */
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

/**
 * The center-area takeover: a fixed layer pinned exactly to the layout's
 * center column — everything right of the sidebar, nothing else (no mask —
 * the sidebar stays visible and usable for toggling). The header row owns
 * title, refresh, and close; the body is either the taskboard iframe or the
 * offline state. Escape and the header Close dismiss it; refresh re-probes
 * and remounts the iframe.
 * @param props - locale seat and close callback.
 * @returns the center-area taskboard panel.
 */
export function TaskboardPanel({ t, onClose, url, title, panelId }: TaskboardPanelProps) {
  const titleId = useId()
  const box = useCenterColumnBox()
  // undefined = probing (first open or after refresh), false = offline,
  // true = the service answered and the iframe mounts.
  const [online, setOnline] = useState<boolean | undefined>(undefined)
  const [generation, setGeneration] = useState(0)

  // Probe on open, on refresh, and on the interval; the generation counter
  // doubles as the iframe key so a refresh reloads the embedded app.
  useEffect(() => {
    let alive = true
    const probe = async (): Promise<void> => {
      const ok = await probeTaskboardServer(url)
      if (alive) setOnline(ok)
    }
    void probe()
    const timer = window.setInterval(() => { void probe() }, PROBE_INTERVAL_MS)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [generation, url])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [onClose])

  // Entering the tab lands on the close button.
  const closeButton = useRef<HTMLButtonElement | null>(null)
  useEffect(() => { closeButton.current?.focus() }, [])

  const refresh = useCallback(() => {
    setOnline(undefined)
    setGeneration(g => g + 1)
  }, [])

  return (
    <aside
      id={panelId}
      className={css.dock}
      style={{ left: box.left, top: box.top, right: box.right, bottom: box.bottom }}
      aria-label={title}
    >
      <div className={css.header}>
        <div className={css.title} id={titleId}>{title}</div>
        <div className={css.actions}>
          <button type="button" className={css.action} onClick={refresh}>
            <IconRefreshOutline16 size={14} />
            <span className={css.hiddenLabel}>{t('refresh')}</span>
          </button>
          <button ref={closeButton} type="button" className={css.action} onClick={onClose}>
            <IconCloseOutline16 size={14} />
            <span className={css.hiddenLabel}>{t('close')}</span>
          </button>
        </div>
      </div>
      {online === false ? (
        <div className={css.offline}>
          <IconWarningOutline16 className={css.offlineIcon} size={20} />
          <p className={css.offlineTitle}>{t('offline.title')}</p>
          <p className={css.offlineHint}>{t('offline.hint')}</p>
          <button type="button" className={css.retry} onClick={refresh}>{t('offline.retry')}</button>
        </div>
      ) : (
        <iframe
          key={generation}
          className={css.frame}
          src={url}
          title={title}
        />
      )}
    </aside>
  )
}
