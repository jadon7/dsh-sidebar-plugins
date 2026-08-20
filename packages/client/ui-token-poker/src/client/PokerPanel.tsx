import { useEffect, useId, useState } from 'react'
import type { CSSProperties } from 'react'
import clsx from 'clsx'
import {
  IconRefreshOutline16, Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TokenPokerKey } from './locales.ts'
import css from './PokerPanel.module.css'

const CALL_AMOUNT = 561
const STARTING_POT = 1700
const QUICK_BETS = [25, 33, 75, 133] as const

type Suit = '♠' | '♥' | '♦' | '♣'
type Action = 'idle' | 'fold' | 'call' | 'bet'

const SUIT_PATH: Record<Suit, string> = {
  '♠': 'M50 8 C50 8 14 40 14 60 C14 73 23 81 34 81 C41 81 46 78 49 74 C48 84 44 91 36 95 L64 95 C56 91 52 84 51 74 C54 78 59 81 66 81 C77 81 86 73 86 60 C86 40 50 8 50 8 Z',
  '♥': 'M50 92 C22 70 8 52 8 34 C8 19 19 8 32 8 C40 8 46 12 50 18 C54 12 60 8 68 8 C81 8 92 19 92 34 C92 52 78 70 50 92 Z',
  '♦': 'M50 5 L91 50 L50 95 L9 50 Z',
  '♣': 'M30 29 a20 20 0 1 1 40 0 a20 20 0 1 1 -40 0 M6 59 a20 20 0 1 1 40 0 a20 20 0 1 1 -40 0 M54 59 a20 20 0 1 1 40 0 a20 20 0 1 1 -40 0 M39 95 C48 82 49 70 49 50 L57 50 C57 70 58 82 67 95 Z',
}

const SUIT_CLASS: Record<Suit, keyof typeof css> = {
  '♠': 'suitSpade',
  '♥': 'suitHeart',
  '♦': 'suitDiamond',
  '♣': 'suitClub',
}

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
  { name: 'Mina', initials: 'MI', stack: 106, position: 'seatTop', tone: 'business', bet: 561 },
  { name: 'Emil', initials: 'EK', stack: 35.8, position: 'seatLeftTop', tone: 'success' },
  { name: 'Noah', initials: 'NO', stack: 24.2, position: 'seatRightTop', tone: 'warning', bet: 561 },
  { name: 'Rae', initials: 'RA', stack: 11.2, position: 'seatLeftBottom', tone: 'error', dealer: true },
  { name: 'Kai', initials: 'KA', stack: 56.4, position: 'seatRightBottom', tone: 'neutral' },
]

const AVATAR_TONE_CLASS = {
  business: 'avatarBusiness',
  success: 'avatarSuccess',
  warning: 'avatarWarning',
  neutral: 'avatarNeutral',
  error: 'avatarError',
} as const

function formatAmount(amount: number): string {
  if (amount < 1000) {
    const value = amount >= 100 ? Math.round(amount) : Math.round(amount * 10) / 10
    return `${value}K`
  }
  const value = Math.round(amount / 10) / 100
  return `${value.toFixed(2).replace(/\.?0+$/, '')}M`
}

function Card({ rank, suit, hidden = false }: { rank?: string, suit?: Suit, hidden?: boolean }) {
  const rawId = useId()
  if (hidden) {
    return (
      <div className={clsx(css.card, css.cardBack)} aria-label="Hidden card">
        <span className={css.cardBackFabric}></span>
        <span className={css.cardBackVignette}></span>
        <span className={css.cardBackBorder}></span>
        <span className={css.cardBackDiamondOuter}></span>
        <span className={css.cardBackDiamondLine}></span>
        <span className={css.cardBackDiamondCore}></span>
      </div>
    )
  }
  if (rank === undefined || suit === undefined) return null
  const clipId = `token-poker-${rawId.replace(/:/g, '')}`
  const filled = rank === 'A' || rank === 'J' || rank === 'Q' || rank === 'K'
  const suitPath = SUIT_PATH[suit]
  return (
    <div className={clsx(css.card, css[SUIT_CLASS[suit]], filled && css.filledCard)} aria-label={`${rank}${suit}`}>
      <span className={css.cardWash}></span>
      <svg className={css.cardFacet} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <clipPath id={clipId}><path d={suitPath}></path></clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x="-5" y="-5" width="110" height="110" fill="currentColor"></rect>
          <path d="M50 -5 L105 -5 L105 105 L50 105 Z" fill="#000" fillOpacity=".16"></path>
          <path d="M50 105 L105 42 L105 105 Z" fill="#000" fillOpacity=".13"></path>
          <path d="M-5 -5 L44 -5 L14 58 L-5 32 Z" fill="#fff" fillOpacity=".17"></path>
        </g>
      </svg>
      <span className={css.cardRank}>{rank}</span>
      <svg className={css.cardSuit} viewBox="0 0 100 100" aria-hidden="true">
        <path d={suitPath} fill="currentColor"></path>
      </svg>
    </div>
  )
}

function MiniCards() {
  return (
    <span className={css.miniCards} aria-hidden="true">
      <span className={css.miniCardBack}><span></span><i></i></span>
      <span className={css.miniCardBack}><span></span><i></i></span>
    </span>
  )
}

function PlayerSeat({ player, dealerLabel, active }: { player: Player, dealerLabel: string, active: boolean }) {
  return (
    <div className={clsx(css.seat, css[player.position])}>
      <div className={clsx(css.playerBubble, active && css.playerBubbleActive)}>
        <span className={clsx(css.avatar, css[AVATAR_TONE_CLASS[player.tone]])}>
          {player.initials}
        </span>
        <span className={css.playerCopy}>
          <span className={css.playerName}>{player.name}</span>
          <span className={css.playerStack}>{formatAmount(player.stack)} tokens</span>
        </span>
        {!player.dealer && <span className={css.onlineDot} aria-label="online"></span>}
        {player.dealer && <span className={css.dealer}>{dealerLabel}</span>}
        <MiniCards />
      </div>
      {player.bet !== undefined && (
        <span className={css.seatBet}><span aria-hidden="true"></span>{formatAmount(player.bet)}</span>
      )}
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
          className={clsx(css.trigger, !wide && css.rail, open && css.triggerActive)}
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
  const actionLocked = action !== 'idle'
  const sliderPercent = Math.max(0, Math.min(100, (bet - CALL_AMOUNT) / (2400 - CALL_AMOUNT) * 100))
  const sliderStyle = { '--token-poker-range': `${sliderPercent}%` } as CSSProperties

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
          <span className={css.brandMark} aria-hidden="true">♠</span>
          <span className={css.headingCopy}>
            <span className={css.title}>{t('title')}</span>
            <span className={css.subtitle}>{t('subtitle')}</span>
          </span>
        </div>
        <div className={css.headerActions}>
          <span className={css.hand}>{t('hand')} #{hand}</span>
          <button
            type="button"
            className={clsx(css.headerButton, invited && css.headerButtonActive)}
            onClick={() => { setInvited(value => !value) }}
          >
            <span className={css.inviteIcon} aria-hidden="true"></span>
            <span>{invited ? t('invited') : t('invite')}</span>
          </button>
          <Tooltip label={t('newHand')} delayMs={400}>
            <button type="button" className={css.iconButton} onClick={dealAgain} aria-label={t('newHand')}>
              <IconRefreshOutline16 size={15} />
            </button>
          </Tooltip>
          <button type="button" className={css.leaveButton} onClick={onClose}>
            <span>{t('leave')}</span><kbd>ESC</kbd>
          </button>
        </div>
      </header>

      <div className={css.game}>
        <div className={css.gameStatus}>
          <span className={css.friends}><span className={css.liveDot}></span>{t('friends')}</span>
          <span className={clsx(css.status, actionLocked && css.statusWaiting)}>
            <span className={css.statusDot}></span>{status}
          </span>
        </div>

        <section key={hand} className={css.stage} aria-label={t('title')}>
          <div className={css.table}></div>

          <div className={css.pot}>
            <span>{t('pot')}</span>
            <strong key={pot}>{formatAmount(pot)}</strong>
            <span>tokens</span>
          </div>

          <div className={css.board} aria-label="Community cards">
            <Card rank="2" suit="♠" />
            <Card rank="6" suit="♠" />
            <Card rank="2" suit="♣" />
            <Card hidden />
            <Card hidden />
          </div>

          {PLAYERS.map(player => (
            <PlayerSeat
              key={player.name}
              player={player}
              dealerLabel={t('dealer')}
              active={!actionLocked && player.name === 'Noah'}
            />
          ))}

          <div className={css.heroSeat}>
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

        <footer className={clsx(css.controls, actionLocked && css.controlsDisabled)}>
          <div className={css.betBar}>
            <div className={css.quickRow}>
              <div className={css.quickBets}>
                <span className={css.quickLabel}>{t('quickBet')}</span>
                {QUICK_BETS.map(percent => (
                  <button
                    key={percent}
                    type="button"
                    className={clsx(css.quickBet, quickBet === percent && css.quickBetActive)}
                    disabled={actionLocked}
                    onClick={() => { chooseQuickBet(percent) }}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <span className={css.sliderHint}>{t('sliderRange')}</span>
            </div>
            <div className={css.sliderRow}>
              <input
                className={css.betSlider}
                style={sliderStyle}
                type="range"
                min={CALL_AMOUNT}
                max={2400}
                step={1}
                value={bet}
                disabled={actionLocked}
                aria-label={t('betLabel')}
                onChange={(event) => {
                  setBet(Number(event.currentTarget.value))
                  setQuickBet(undefined)
                }}
              />
              <span className={css.betAmount}><strong>{formatAmount(bet)}</strong><span>tokens</span></span>
            </div>
          </div>
          <div className={css.actionBar}>
            <button type="button" className={clsx(css.secondaryAction, css.foldAction)} disabled={actionLocked} onClick={() => { act('fold') }}>{t('fold')}</button>
            <button type="button" className={clsx(css.secondaryAction, css.callAction)} disabled={actionLocked} onClick={() => { act('call') }}>
              {t('call')} {formatAmount(CALL_AMOUNT)}
            </button>
            <button type="button" className={css.primaryAction} disabled={actionLocked} onClick={() => { act('bet') }}>
              {actionLocked ? t('waiting') : `${t('bet')} ${formatAmount(bet)}`}
            </button>
          </div>
        </footer>
      </div>
    </aside>
  )
}
