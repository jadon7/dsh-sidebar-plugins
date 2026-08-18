import { useEffect, useState } from 'react'
import clsx from 'clsx'
import {
  IconRefreshOutline16, IconUserOutline16, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TokenPokerKey } from './locales.ts'
import css from './PokerPanel.module.css'

const CALL_AMOUNT = 561
const STARTING_POT = 1700
const QUICK_BETS = [25, 33, 75, 133] as const

type Suit = '♠' | '♥' | '♦' | '♣'
type Action = 'idle' | 'fold' | 'call' | 'bet'

interface Player {
  name: string
  initials: string
  stack: number
  position: 'seatTop' | 'seatLeftTop' | 'seatRightTop' | 'seatLeftBottom' | 'seatRightBottom'
  tone: 'business' | 'success' | 'warning' | 'neutral' | 'error'
  bet?: number
  dealer?: boolean
}

const PLAYERS: readonly Player[] = [
  { name: 'Mina', initials: 'MI', stack: 106000, position: 'seatTop', tone: 'business', bet: 561 },
  { name: 'Emil', initials: 'EK', stack: 35800, position: 'seatLeftTop', tone: 'success' },
  { name: 'Noah', initials: 'NO', stack: 24200, position: 'seatRightTop', tone: 'warning', bet: 561 },
  { name: 'Rae', initials: 'RA', stack: 11200, position: 'seatLeftBottom', tone: 'error', dealer: true },
  { name: 'Kai', initials: 'KA', stack: 56400, position: 'seatRightBottom', tone: 'neutral' },
]

const AVATAR_TONE_CLASS = {
  business: 'avatarBusiness',
  success: 'avatarSuccess',
  warning: 'avatarWarning',
  neutral: 'avatarNeutral',
  error: 'avatarError',
} as const

function formatAmount(amount: number): string {
  if (amount < 1000) return `${Math.round(amount)}K`
  const value = Math.round(amount / 10) / 100
  return `${value.toFixed(2).replace(/\.?0+$/, '')}M`
}

function Card({ rank, suit, hidden = false }: { rank?: string, suit?: Suit, hidden?: boolean }) {
  if (hidden) return <div className={clsx(css.card, css.cardBack)} aria-label="Hidden card">♠</div>
  const red = suit === '♥' || suit === '♦'
  return (
    <div className={clsx(css.card, red && css.redCard)} aria-label={`${rank}${suit}`}>
      <span className={css.cardRank}>{rank}</span>
      <span className={css.cardSuit}>{suit}</span>
    </div>
  )
}

function PlayerSeat({ player, dealerLabel }: { player: Player, dealerLabel: string }) {
  return (
    <div className={clsx(css.seat, css[player.position])}>
      <div className={css.miniCards} aria-hidden="true">
        <span>♠</span>
        <span>♠</span>
      </div>
      <div className={css.playerBubble}>
        <span className={clsx(css.avatar, css[AVATAR_TONE_CLASS[player.tone]])}>
          {player.initials}
        </span>
        <span className={css.playerCopy}>
          <span className={css.playerName}>{player.name}</span>
          <span className={css.playerStack}>{formatAmount(player.stack)} tokens</span>
        </span>
        <span className={css.onlineDot} aria-label="online"></span>
        {player.dealer && <span className={css.dealer}>{dealerLabel}</span>}
      </div>
      {player.bet !== undefined && <span className={css.seatBet}>{formatAmount(player.bet)}</span>}
    </div>
  )
}

interface CenterColumnBox {
  left: number
  top: number
  right: number
  bottom: number
}

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

/** Props for the sidebar Token poker entry. */
export type PokerEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'tokenPoker'>

/**
 * Render the sidebar entry and toggle its table panel.
 * @param props - Sidebar column state and locale dictionary.
 * @returns The entry button and optional table panel.
 */
export function PokerEntry({ wide, t }: PokerEntryProps) {
  const [open, setOpen] = useState(false)
  const panelId = 'dsh-token-poker-panel'
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
          <span className={css.triggerSuit} aria-hidden="true">♠</span>
          {wide && <span className={css.triggerLabel}>{t('entry')}</span>}
        </button>
      </Tooltip>
      {open && <PokerPanel panelId={panelId} t={t} onClose={() => { setOpen(false) }} />}
    </>
  )
}

function PokerPanel({
  panelId,
  t,
  onClose,
}: {
  panelId: string
  t: (key: TokenPokerKey) => string
  onClose: () => void
}) {
  const box = useCenterColumnBox()
  const [hand, setHand] = useState(821)
  const [pot, setPot] = useState(STARTING_POT)
  const [bet, setBet] = useState(1275)
  const [quickBet, setQuickBet] = useState<number | undefined>(75)
  const [action, setAction] = useState<Action>('idle')
  const [invited, setInvited] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('keydown', closeOnEscape) }
  }, [onClose])

  const chooseQuickBet = (percent: number): void => {
    setQuickBet(percent)
    setBet(Math.round(STARTING_POT * percent / 100))
  }

  const dealAgain = (): void => {
    setHand(value => value + 1)
    setPot(STARTING_POT)
    setBet(1275)
    setQuickBet(75)
    setAction('idle')
  }

  const act = (next: Action): void => {
    setAction(next)
    if (next === 'call') setPot(value => value + CALL_AMOUNT)
    if (next === 'bet') setPot(value => value + bet)
  }

  const status = action === 'fold'
    ? t('status.fold')
    : action === 'call'
      ? `${t('status.call')} · ${formatAmount(CALL_AMOUNT)}`
      : action === 'bet'
        ? `${t('status.bet')} · ${formatAmount(bet)}`
        : t('status.default')

  return (
    <aside
      id={panelId}
      data-screen-label="Token Poker"
      className={css.panel}
      style={{ left: box.left, top: box.top, right: box.right, bottom: box.bottom }}
      aria-label={t('title')}
    >
      <header className={css.header}>
        <div className={css.heading}>
          <span className={css.title}>{t('title')}</span>
          <span className={css.subtitle}>{t('subtitle')}</span>
        </div>
        <div className={css.headerActions}>
          <span className={css.hand}>{t('hand')} #{hand}</span>
          <button
            type="button"
            className={clsx(css.headerButton, invited && css.headerButtonActive)}
            onClick={() => { setInvited(value => !value) }}
          >
            <IconUserOutline16 size={15} />
            <span>{invited ? t('invited') : t('invite')}</span>
          </button>
          <Tooltip label={t('newHand')} delayMs={400}>
            <button type="button" className={css.iconButton} onClick={dealAgain} aria-label={t('newHand')}>
              <IconRefreshOutline16 size={15} />
            </button>
          </Tooltip>
          <button type="button" className={css.leaveButton} onClick={onClose}>{t('leave')}</button>
        </div>
      </header>

      <div className={css.game}>
        <div className={css.gameStatus}>
          <span className={css.friends}><span className={css.liveDot}></span>{t('friends')}</span>
          <span className={css.status}>{status}</span>
        </div>

        <section className={css.stage} aria-label={t('title')}>
          <div className={css.table}>
            <div className={css.pot}>{t('pot')} <strong>{formatAmount(pot)} tokens</strong></div>
            <div className={css.board} aria-label="Community cards">
              <Card rank="2" suit="♠" />
              <Card rank="6" suit="♠" />
              <Card rank="2" suit="♣" />
              <Card hidden />
              <Card hidden />
            </div>
          </div>

          {PLAYERS.map(player => <PlayerSeat key={player.name} player={player} dealerLabel={t('dealer')} />)}

          <div className={clsx(css.seat, css.heroSeat)}>
            <div className={css.holeCards} aria-label="Your cards">
              <Card rank="A" suit="♦" />
              <Card rank="2" suit="♦" />
            </div>
            <div className={clsx(css.playerBubble, css.heroBubble)}>
              <span className={clsx(css.avatar, css.avatarHero)}>YOU</span>
              <span className={css.playerCopy}>
                <span className={css.playerName}>{t('you')}</span>
                <span className={css.playerStack}>2.13M tokens</span>
              </span>
              <span className={css.onlineDot} aria-label="online"></span>
            </div>
          </div>
        </section>

        <footer className={css.controls}>
          <div className={css.betBar}>
            <div className={css.quickBets}>
              {QUICK_BETS.map(percent => (
                <button
                  key={percent}
                  type="button"
                  className={clsx(css.quickBet, quickBet === percent && css.quickBetActive)}
                  onClick={() => { chooseQuickBet(percent) }}
                >
                  {percent}%
                </button>
              ))}
            </div>
            <input
              className={css.betSlider}
              type="range"
              min={CALL_AMOUNT}
              max={2400}
              step={1}
              value={bet}
              aria-label={t('betLabel')}
              onChange={(event) => {
                setBet(Number(event.currentTarget.value))
                setQuickBet(undefined)
              }}
            />
            <strong className={css.betAmount}>{formatAmount(bet)} tokens</strong>
          </div>
          <div className={css.actionBar}>
            <button type="button" className={css.secondaryAction} onClick={() => { act('fold') }}>{t('fold')}</button>
            <button type="button" className={css.secondaryAction} onClick={() => { act('call') }}>
              {t('call')} {formatAmount(CALL_AMOUNT)}
            </button>
            <button type="button" className={css.primaryAction} onClick={() => { act('bet') }}>
              {t('bet')} {formatAmount(bet)}
            </button>
          </div>
        </footer>
      </div>
    </aside>
  )
}
