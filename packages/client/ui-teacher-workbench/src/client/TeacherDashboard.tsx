import { useState } from 'react'
import clsx from 'clsx'
import {
  IconChecklistOutline14,
  IconChevronRightOutline14,
  IconDataOutline16,
  IconGoalOutline16,
  IconUserOutline16,
  IconWarningOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import {
  ASSESSMENT_TREND,
  CLASS_OPTIONS,
  CLASS_SUMMARY,
  KNOWLEDGE_MASTERY,
  SCHOOL_CONTEXT,
  SEATS,
} from './TeacherData.ts'
import type { WorkbenchTab } from './TeacherViews.tsx'
import base from './TeacherWorkbench.module.css'
import css from './TeacherInsights.module.css'

const HAND_RAISERS = new Set(['秦书意', '夏栀'])
const LATE_STUDENTS = new Set(['邵雨眠', '韩清和'])

type SeatTone = 'present' | 'hand' | 'concern' | 'late' | 'absent'

function seatTone(name: string, status: string): SeatTone {
  if (status === '请假') return 'absent'
  if (HAND_RAISERS.has(name)) return 'hand'
  if (status === '关注') return 'concern'
  if (LATE_STUDENTS.has(name)) return 'late'
  return 'present'
}

function AttendanceRing({ count, total }: { count: number, total: number }) {
  const circumference = 339
  const dash = Math.round((count / total) * circumference)
  return (
    <div className={css.attendanceRing}>
      <svg viewBox="0 0 132 132" aria-label={`实到 ${count} 人，应到 ${total} 人`}>
        <circle cx="66" cy="66" r="54" className={css.ringTrack} />
        <circle cx="66" cy="66" r="54" className={css.ringPresent} strokeDasharray={`${dash} ${circumference}`} />
        <circle cx="66" cy="66" r="54" className={css.ringLate} strokeDasharray={`16 ${circumference}`} />
      </svg>
      <span><strong>{count}</strong><small>/ {total}</small></span>
    </div>
  )
}

function CompactTrend({ offset }: { offset: number }) {
  const points = ASSESSMENT_TREND.map((item, index) => ({
    x: 28 + index * 67,
    y: 91 - ((item.classAverage + offset) - 74) * 4.2,
    label: item.shortLabel,
  }))
  const lastPoint = points[points.length - 1]!
  return (
    <svg className={css.overviewTrendChart} viewBox="0 0 320 118" role="img" aria-label="近五次物理测评均分趋势">
      <g className={css.overviewTrendGrid}>
        <line x1="10" y1="20" x2="310" y2="20" />
        <line x1="10" y1="56" x2="310" y2="56" />
        <line x1="10" y1="92" x2="310" y2="92" />
      </g>
      <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className={css.overviewTrendLine} />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="6" className={css.overviewTrendPoint} />
      <g className={css.overviewTrendLabels}>
        {points.map(point => <text key={point.label} x={point.x} y="112" textAnchor="middle">{point.label}</text>)}
      </g>
      <text x="304" y={Math.max(18, lastPoint.y - 13)} textAnchor="end" className={css.overviewTrendValue}>{(CLASS_SUMMARY.averageScore + offset).toFixed(1)}</text>
    </svg>
  )
}

/** Render the teacher overview dashboard. */
export function TeacherDashboard({ onNavigate }: { onNavigate: (tab: WorkbenchTab) => void }) {
  const [activeClass, setActiveClass] = useState<(typeof CLASS_OPTIONS)[number]>('高二（3）班')
  const [period, setPeriod] = useState('近 5 次')
  const [selectedSeatId, setSelectedSeatId] = useState('seat-1')
  const classOffset = activeClass === '高二（3）班' ? 0 : -1.7
  const attendance = activeClass === '高二（3）班' ? { present: 41, total: 42, late: 2, absent: 1 } : { present: 39, total: 40, late: 1, absent: 1 }
  const selectedSeat = SEATS.find(seat => seat.id === selectedSeatId) ?? SEATS[0]

  return (
    <div className={clsx(base.view, css.overviewView)} data-screen-label="Teacher Dashboard">
      <div className={css.overviewLayout}>
        <aside className={css.weekRail} aria-label="教学周次">
          <span className={css.weekLabel}>周次</span>
          {[6, 5, 4, 3, 2, 1].map(week => (
            <button key={week} type="button" className={clsx(css.weekButton, week === 3 && css.weekActive, week === 2 && css.weekHasNote)} aria-current={week === 3 ? 'page' : undefined}>{week}</button>
          ))}
          <i className={css.weekLine}></i>
        </aside>

        <div className={css.overviewSummary}>
          <section className={css.overviewCard}>
            <div className={css.lessonHeading}>
              <div><strong>第 3 节 · 运动学单元复习</strong><span>09月16日 · 10:10 → 10:55</span></div>
              <div><b>31′</b><em>上课中</em></div>
            </div>
            <div className={css.teacherRow}>
              <span>周</span>
              <div><small>任课教师</small><strong>{SCHOOL_CONTEXT.teacher} · {SCHOOL_CONTEXT.subject}</strong></div>
              <em>明理楼 302</em>
            </div>
            <div className={css.lessonActions}>
              <button type="button" onClick={() => { onNavigate('lessons') }} aria-label="打开教案"><IconChecklistOutline14 size={17} /></button>
              <button type="button" onClick={() => { onNavigate('tools') }} aria-label="开始课堂工具"><IconGoalOutline16 size={17} /></button>
              <button type="button" onClick={() => { onNavigate('classes') }} aria-label="班级管理"><IconUserOutline16 size={17} /></button>
              <button type="button" onClick={() => { onNavigate('academics') }} aria-label="学业数据"><IconDataOutline16 size={17} /></button>
            </div>
          </section>

          <button type="button" className={clsx(css.overviewCard, css.attendanceCard)} onClick={() => { onNavigate('classes') }}>
            <div className={css.attendanceCopy}>
              <strong>今日出勤</strong>
              <span>{activeClass} · {attendance.total} 人</span>
              <div><span><i></i><b>{attendance.present - attendance.late}</b> 按时到校</span><span><i></i><b>{attendance.late}</b> 迟到</span><span><i></i><b>{attendance.absent}</b> 请假</span></div>
            </div>
            <AttendanceRing count={attendance.present} total={attendance.total} />
          </button>

          <section className={css.overviewCard}>
            <div className={css.trendHeading}>
              <div><button type="button" onClick={() => { onNavigate('academics') }}>课堂表现趋势</button><span>物理测评均分 · {period}</span></div>
              <select value={period} onChange={event => { setPeriod(event.currentTarget.value) }} aria-label="成绩趋势周期">
                <option>近 5 次</option>
                <option>本月</option>
                <option>本学期</option>
              </select>
            </div>
            <CompactTrend offset={classOffset} />
            <button type="button" className={css.trendAlert} onClick={() => { onNavigate('academics') }}><IconWarningOutline16 size={13} /><span>“误差与有效数字”67%，低于目标 8 个百分点</span></button>
          </section>
        </div>

        <div className={css.classroomColumn}>
          <section className={clsx(css.overviewCard, css.seatingCard)}>
            <div className={css.seatToolbar}>
              <div className={css.viewModes}>
                <button type="button" className={css.viewModeActive}><IconDataOutline16 size={14} />座位视图</button>
                <button type="button" onClick={() => { onNavigate('classes') }}><IconUserOutline16 size={14} />分组视图</button>
              </div>
              <div className={css.classPicker} aria-label="选择班级">
                {CLASS_OPTIONS.map(className => <button key={className} type="button" className={activeClass === className ? css.classPickerActive : undefined} onClick={() => { setActiveClass(className) }}>{className}</button>)}
              </div>
              <span className={css.selectedSeat}>{selectedSeat?.name} · {selectedSeat?.row}排{selectedSeat?.column}列</span>
            </div>
            <div className={css.overviewSeatGrid}>
              {SEATS.map(seat => {
                const tone = seatTone(seat.name, seat.status)
                return (
                  <button
                    key={seat.id}
                    type="button"
                    className={clsx(css.overviewSeat, css[`overviewSeat_${tone}`], selectedSeatId === seat.id && css.overviewSeatSelected)}
                    onClick={() => { setSelectedSeatId(seat.id) }}
                    aria-pressed={selectedSeatId === seat.id}
                  >
                    {tone !== 'present' && tone !== 'absent' && <i>{tone === 'late' ? '迟' : ''}</i>}
                    <span>{seat.name.slice(0, 1)}</span>
                    <strong>{seat.name}{tone === 'absent' ? ' · 假' : ''}</strong>
                  </button>
                )
              })}
            </div>
            <div className={css.seatStatusLegend}>
              <strong>座位状态</strong>
              <span><i></i>在班 35</span><span><i></i>举手 2</span><span><i></i>需关注 2</span><span><i></i>迟到 2</span><span><i></i>请假 1</span>
              <em>底色 = 出勤态 · 角标 = 课堂标记 · 应到 42 / 实到 41</em>
            </div>
          </section>

          <div className={css.classroomBottom}>
            <button type="button" className={clsx(css.overviewCard, css.slideCard)} onClick={() => { onNavigate('lessons') }}>
              <div><strong>当前幻灯片</strong><span>P12 / 24</span></div>
              <i>课件截图</i>
            </button>
            <button type="button" className={clsx(css.overviewCard, css.quizCard)} onClick={() => { onNavigate('academics') }}>
              <div><strong>课堂快测 · 实时正确率</strong><span>已交 38 / 41</span></div>
              <div className={css.quizBars}>{KNOWLEDGE_MASTERY.map(item => <span key={item.name}><b>{item.value}%</b><i style={{ height: `${Math.max(28, item.value - 24)}px` }}></i><small>{item.name.replace('运动', '').replace('匀变速', '').replace('实验', '').replace('误差与', '')}</small></span>)}</div>
            </button>
            <section className={css.nextCard}>
              <div><strong>下一步</strong><span>午间为高远、赵新程安排有效数字专项，12:40 明理楼 302。</span></div>
              <button type="button" onClick={() => { onNavigate('students') }}>生成辅导单<IconChevronRightOutline14 size={14} /></button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
