import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { IconCloseOutline16, StateDot, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { petMascotUrl } from './pet-mascot.ts'
import css from './PetCompanion.module.css'

type PetMode = 'idle' | 'running' | 'waiting' | 'review'
type CareKind = 'feed' | 'bath' | 'play'

interface CenterColumnBox {
  top: number
  right: number
  bottom: number
  left: number
}

interface PetVitals {
  hunger: number
  clean: number
  mood: number
}

interface LivePetStatus {
  mode: PetMode
  label: string
  speech: string
  title: string
  dot: StateDotState
}

const MODE_CLASS: Record<PetMode, keyof typeof css> = {
  idle: 'modeIdle',
  running: 'modeRunning',
  waiting: 'modeWaiting',
  review: 'modeReview',
}

const ACTION_CLASS: Record<CareKind, keyof typeof css> = {
  feed: 'actionFeed',
  bath: 'actionBath',
  play: 'actionPlay',
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function centerColumn(): HTMLElement | undefined {
  for (const element of document.querySelectorAll<HTMLElement>('*')) {
    for (const name of element.classList) {
      if (name.endsWith('_centerCol')) return element
    }
  }
  return undefined
}

function readCenterColumnBox(): CenterColumnBox | undefined {
  const rect = centerColumn()?.getBoundingClientRect()
  if (rect === undefined) return undefined
  return {
    top: rect.top,
    right: window.innerWidth - rect.right,
    bottom: window.innerHeight - rect.bottom,
    left: rect.left,
  }
}

function useCenterColumnBox(): CenterColumnBox {
  const [box, setBox] = useState<CenterColumnBox>(() => readCenterColumnBox() ?? {
    top: 0, right: 0, bottom: 0, left: 0,
  })
  useEffect(() => {
    const measure = (): void => {
      const next = readCenterColumnBox()
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

function VitalBar({ label, value }: { label: string, value: number }) {
  return (
    <div className={css.vitalRow}>
      <span>{label}</span>
      <div className={css.vitalTrack} aria-label={`${label} ${value}%`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  )
}

export type PetCompanionEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'petCompanion'>

export function PetCompanionEntry({ wide, useSessions, t }: PetCompanionEntryProps) {
  const [visible, setVisible] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [vitals, setVitals] = useState<PetVitals>({ hunger: 76, clean: 82, mood: 74 })
  const [growth, setGrowth] = useState(42)
  const [coins, setCoins] = useState(28)
  const [notice, setNotice] = useState<string | undefined>()
  const [action, setAction] = useState<CareKind | undefined>()
  const box = useCenterColumnBox()
  const sessions = useSessions(state => state)
  const rows = sessions.ids.map(id => sessions.byId[id]).filter(row => row !== undefined)
  const current = sessions.current === undefined ? undefined : sessions.byId[sessions.current]
  const prioritized = current === undefined ? rows : [current, ...rows.filter(row => row.id !== current.id)]
  const pending = prioritized.find(row => row.pendingInteraction !== undefined)
  const completed = prioritized.find(row => row.completed === true)
  const running = prioritized.find(row => row.running)

  let live: LivePetStatus
  if (pending !== undefined) {
    const label = pending.pendingInteraction === 'approval'
      ? t('status.waitingApproval')
      : pending.pendingInteraction === 'question'
        ? t('status.waitingQuestion')
        : t('status.planReview')
    live = { mode: 'waiting', label, speech: t('speech.waiting'), title: pending.displayTitle, dot: 'warning' }
  } else if (completed !== undefined) {
    live = {
      mode: 'review', label: t('status.review'), speech: t('speech.review'),
      title: completed.displayTitle, dot: 'done',
    }
  } else if (running !== undefined) {
    live = {
      mode: 'running', label: t('status.running'), speech: t('speech.running'),
      title: running.displayTitle, dot: 'ongoing',
    }
  } else {
    live = {
      mode: 'idle', label: t('status.idle'), speech: t('speech.idle'),
      title: current?.displayTitle ?? t('live.none'), dot: 'done',
    }
  }

  const completedIds = rows.filter(row => row.completed === true).map(row => row.id)
  const completedKey = completedIds.join('|')
  const previousCompleted = useRef(new Set<string>(completedIds))
  const previousCurrent = useRef({ id: current?.id, running: current?.running ?? false })

  useEffect(() => {
    const next = new Set<string>(completedIds)
    const rewards = completedIds.filter(id => !previousCompleted.current.has(id)).length
    previousCompleted.current = next
    if (rewards === 0) return
    setGrowth(value => value + rewards * 10)
    setCoins(value => value + rewards * 5)
    setNotice(t('notice.taskComplete'))
  }, [completedKey, t])

  useEffect(() => {
    const prior = previousCurrent.current
    const stopped = prior.id === current?.id && prior.running && current?.running === false
      && current?.pendingInteraction === undefined
    previousCurrent.current = { id: current?.id, running: current?.running ?? false }
    if (!stopped) return
    setGrowth(value => value + 10)
    setCoins(value => value + 5)
    setNotice(t('notice.taskComplete'))
  }, [current?.id, current?.pendingInteraction, current?.running, t])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const step = live.mode === 'running' ? 2 : 1
      setVitals(value => ({
        hunger: clamp(value.hunger - step),
        clean: clamp(value.clean - step),
        mood: clamp(value.mood - 1),
      }))
    }, 60_000)
    return () => { window.clearInterval(timer) }
  }, [live.mode])

  const care = (kind: CareKind): void => {
    setAction(kind)
    window.setTimeout(() => { setAction(undefined) }, 700)
    if (kind === 'feed') {
      setCoins(value => value - 4)
      setVitals(value => ({ ...value, hunger: clamp(value.hunger + 18), mood: clamp(value.mood + 2) }))
      setNotice(t('notice.feed'))
    } else if (kind === 'bath') {
      setCoins(value => value - 3)
      setVitals(value => ({ ...value, clean: clamp(value.clean + 18), mood: clamp(value.mood + 2) }))
      setNotice(t('notice.bath'))
    } else {
      setCoins(value => value - 2)
      setVitals(value => ({ ...value, mood: clamp(value.mood + 16) }))
      setNotice(t('notice.play'))
    }
    window.setTimeout(() => { setNotice(undefined) }, 2200)
  }

  const level = Math.floor(growth / 100) + 1
  const levelGrowth = growth % 100
  const layerId = 'dsh-qq-pet-layer'
  const modeClass = css[MODE_CLASS[live.mode]]
  const actionClass = action === undefined ? undefined : css[ACTION_CLASS[action]]

  return (
    <>
      <Tooltip label={t('entry')} delayMs={500} disabled={wide}>
        <button
          type="button"
          className={clsx(css.trigger, !wide && css.rail)}
          aria-expanded={visible}
          aria-controls={layerId}
          onClick={() => {
            setVisible(value => !value)
            setToolsOpen(false)
          }}
        >
          <img src={petMascotUrl} className={css.triggerPet} alt="" />
          {wide && <span>{t('entry')}</span>}
          {wide && <StateDot state={live.dot} size={8} className={css.triggerDot} />}
        </button>
      </Tooltip>

      {visible && (
        <div
          id={layerId}
          data-screen-label="QQ Desktop Pet"
          className={css.desktopLayer}
          style={{ top: box.top, right: box.right, bottom: box.bottom, left: box.left }}
        >
          <div className={clsx(css.petScene, modeClass, actionClass, toolsOpen && css.toolsOpen)}>
            <div className={css.speechBubble} role="status">
              <span className={css.liveStatus}><StateDot state={live.dot} size={8} />{live.label}</span>
              <strong>{notice ?? live.speech}</strong>
              <small>{live.title}</small>
            </div>

            {toolsOpen && (
              <section className={css.petCard} aria-label={t('profile')}>
                <header className={css.cardHeader}>
                  <div>
                    <strong>{t('name')} · {t('level')} {level}</strong>
                    <span>{coins} {t('coins')}</span>
                  </div>
                  <button type="button" aria-label={t('closeTools')} onClick={() => { setToolsOpen(false) }}>
                    <IconCloseOutline16 />
                  </button>
                </header>
                <div className={css.growthLine}>
                  <span>{t('growth')}</span>
                  <div><span style={{ width: `${levelGrowth}%` }} /></div>
                  <strong>{levelGrowth}/100</strong>
                </div>
                <div className={css.vitals}>
                  <VitalBar label={t('vitals.hunger')} value={vitals.hunger} />
                  <VitalBar label={t('vitals.clean')} value={vitals.clean} />
                  <VitalBar label={t('vitals.mood')} value={vitals.mood} />
                </div>
                <div className={css.careDock} role="toolbar" aria-label={t('care.title')}>
                  <button type="button" disabled={coins < 4} onClick={() => { care('feed') }}>
                    <strong>{t('care.feed')}</strong><span>{t('care.feedDetail')}</span>
                  </button>
                  <button type="button" disabled={coins < 3} onClick={() => { care('bath') }}>
                    <strong>{t('care.bath')}</strong><span>{t('care.bathDetail')}</span>
                  </button>
                  <button type="button" disabled={coins < 2} onClick={() => { care('play') }}>
                    <strong>{t('care.play')}</strong><span>{t('care.playDetail')}</span>
                  </button>
                </div>
                <p className={css.rewardCopy}>{t('reward.copy')}</p>
              </section>
            )}

            <div className={css.petMover}>
              <button
                type="button"
                className={css.petCharacter}
                aria-label={toolsOpen ? t('closeTools') : t('openTools')}
                onClick={() => { setToolsOpen(value => !value) }}
              >
                <img src={petMascotUrl} className={css.petImage} alt="" draggable={false} />
                <span>{t('name')} · Lv.{level}</span>
              </button>
              {toolsOpen && (
                <button type="button" className={css.hideButton} onClick={() => { setVisible(false) }}>
                  {t('hide')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
