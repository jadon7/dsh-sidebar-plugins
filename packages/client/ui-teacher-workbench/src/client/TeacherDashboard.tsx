import { useState } from 'react'
import {
  IconChevronRightOutline14,
  IconChecklistOutline14,
  IconDataOutline16,
  IconGoalOutline16,
  IconUserOutline16,
  IconWarningOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import {
  ASSESSMENT_TREND,
  CLASS_OPTIONS,
  CLASS_SUMMARY,
  DASHBOARD_TASKS,
  KNOWLEDGE_MASTERY,
  SCHOOL_CONTEXT,
  STUDENTS,
} from './TeacherData.ts'
import type { WorkbenchTab } from './TeacherViews.tsx'
import base from './TeacherWorkbench.module.css'
import css from './TeacherInsights.module.css'

interface DashboardSnapshot {
  attendance: string
  attendanceNote: string
  homework: string
  homeworkNote: string
  average: string
  averageNote: string
  pending: string
  pendingNote: string
}

const CLASS_SNAPSHOTS: Record<(typeof CLASS_OPTIONS)[number], DashboardSnapshot> = {
  '高二（3）班': {
    attendance: `${CLASS_SUMMARY.attendanceRate}%`,
    attendanceNote: `${CLASS_SUMMARY.attendanceCount} / ${CLASS_SUMMARY.studentCount} 人到校`,
    homework: `${CLASS_SUMMARY.homeworkRate}%`,
    homeworkNote: '194 / 210 份按时提交',
    average: `${CLASS_SUMMARY.averageScore}`,
    averageNote: `较上次 +${CLASS_SUMMARY.scoreChange}`,
    pending: `${CLASS_SUMMARY.pendingStudents}`,
    pendingNote: '2 学业 · 2 习惯',
  },
  '高二（4）班': {
    attendance: '96.8%',
    attendanceNote: '39 / 40 人到校',
    homework: '89.7%',
    homeworkNote: '179 / 200 份按时提交',
    average: '80.9',
    averageNote: '较上次 +1.6',
    pending: '6',
    pendingNote: '4 学业 · 2 习惯',
  },
}

const RISK_STUDENTS = STUDENTS.filter(student => student.risk !== '稳定').slice(0, 4)

function TrendChart({ className }: { className: (typeof CLASS_OPTIONS)[number] }) {
  const offset = className === '高二（3）班' ? 0 : -1.7
  const points = ASSESSMENT_TREND.map((item, index) => ({
    x: 54 + index * 118,
    y: 156 - ((item.classAverage + offset) - 70) * 5.4,
    baselineY: 156 - (item.gradeAverage - 70) * 5.4,
    value: item.classAverage + offset,
    label: item.shortLabel,
  }))

  return (
    <div className={css.lineChart}>
      <svg viewBox="0 0 570 196" role="img" aria-label={`${className}近五次物理测评平均分趋势`}>
        {[70, 75, 80, 85, 90].map((value, index) => {
          const y = 156 - index * 27
          return (
            <g key={value}>
              <line x1="48" y1={y} x2="540" y2={y} className={css.chartGridLine} />
              <text x="10" y={y + 4} className={css.chartAxisText}>{value}</text>
            </g>
          )
        })}
        <polyline points={points.map(point => `${point.x},${point.baselineY}`).join(' ')} className={css.baselineLine} />
        <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className={css.primaryLine} />
        {points.map(point => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" className={css.primaryPoint} />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className={css.pointValue}>{point.value.toFixed(1)}</text>
            <text x={point.x} y="184" textAnchor="middle" className={css.chartAxisText}>{point.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/** Render the teacher overview dashboard. */
export function TeacherDashboard({ onNavigate }: { onNavigate: (tab: WorkbenchTab) => void }) {
  const [activeClass, setActiveClass] = useState<(typeof CLASS_OPTIONS)[number]>('高二（3）班')
  const [period, setPeriod] = useState('本周')
  const snapshot = CLASS_SNAPSHOTS[activeClass]
  const metrics = [
    { label: '今日出勤', value: snapshot.attendance, note: snapshot.attendanceNote, tab: 'classes' as const, icon: <IconUserOutline16 size={16} /> },
    { label: '作业按时率', value: snapshot.homework, note: snapshot.homeworkNote, tab: 'habits' as const, icon: <IconChecklistOutline14 size={16} /> },
    { label: '运动学单元均分', value: snapshot.average, note: snapshot.averageNote, tab: 'academics' as const, icon: <IconDataOutline16 size={16} /> },
    { label: '重点跟进', value: snapshot.pending, note: snapshot.pendingNote, tab: 'students' as const, icon: <IconWarningOutline16 size={16} /> },
  ]

  return (
    <div className={base.view} data-screen-label="Teacher Dashboard">
      <div className={base.viewTopbar}>
        <div>
          <h2>班级 Dashboard</h2>
          <p>{SCHOOL_CONTEXT.school} · {SCHOOL_CONTEXT.className} · 数据更新于今天 09:32</p>
        </div>
        <div className={base.toolbarGroup}>
          <div className={base.segmented} aria-label="选择班级">
            {CLASS_OPTIONS.map(className => (
              <button key={className} type="button" className={activeClass === className ? base.segmentActive : undefined} onClick={() => { setActiveClass(className) }}>{className}</button>
            ))}
          </div>
          <select className={css.selectControl} value={period} onChange={event => { setPeriod(event.currentTarget.value) }} aria-label="统计周期">
            <option>本周</option>
            <option>近 30 天</option>
            <option>本学期</option>
          </select>
        </div>
      </div>

      <div className={css.metricGrid}>
        {metrics.map(metric => (
          <button key={metric.label} type="button" className={css.metricButton} onClick={() => { onNavigate(metric.tab) }}>
            <span className={css.metricIcon}>{metric.icon}</span>
            <span className={css.metricCopy}><small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.note}</span></span>
            <IconChevronRightOutline14 size={14} />
          </button>
        ))}
      </div>

      <div className={css.dashboardGrid}>
        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>物理成绩趋势</strong><span>{period}视图 · 满分 100 · n={activeClass === '高二（3）班' ? 42 : 40}</span></div>
            <div className={css.legend}><span><i className={css.legendPrimary}></i>{activeClass}</span><span><i className={css.legendBaseline}></i>年级同层</span></div>
          </div>
          <TrendChart className={activeClass} />
          <div className={css.insightNote}><IconDataOutline16 size={14} /><span>运动学单元均分连续 4 次上升，目前高于年级同层 1.2 分。</span></div>
        </section>

        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>今天的教学与班务</strong><span>4 项安排 · 1 项进行中</span></div>
            <button type="button" className={css.linkButton} onClick={() => { onNavigate('schedule') }}>查看课表</button>
          </div>
          <div className={css.taskTimeline}>
            {DASHBOARD_TASKS.map(task => (
              <div key={`${task.time}-${task.title}`} className={css.taskItem}>
                <span className={css.taskTime}>{task.time}</span>
                <span className={css.taskDot}></span>
                <div><strong>{task.title}</strong><span>{task.meta}</span></div>
                <em>{task.status}</em>
              </div>
            ))}
          </div>
        </section>

        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>知识点掌握</strong><span>运动学单元测 · 班级正确率</span></div>
            <button type="button" className={css.linkButton} onClick={() => { onNavigate('academics') }}>学业详情</button>
          </div>
          <div className={css.masteryList}>
            {KNOWLEDGE_MASTERY.map(item => (
              <div key={item.name} className={css.masteryRow}>
                <span>{item.name}</span>
                <div><i style={{ width: `${item.value}%` }}></i></div>
                <strong>{item.value}%</strong>
                <small className={item.change >= 0 ? css.positive : css.negative}>{item.change >= 0 ? '+' : ''}{item.change}</small>
              </div>
            ))}
          </div>
          <div className={css.insightNote}><IconGoalOutline16 size={14} /><span>“误差与有效数字”低于班级目标 8 个百分点，周三午间已安排专项辅导。</span></div>
        </section>

        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>重点学生</strong><span>按最近 7 天证据自动汇总</span></div>
            <button type="button" className={css.linkButton} onClick={() => { onNavigate('students') }}>全部学生</button>
          </div>
          <div className={css.compactTable}>
            <div className={css.compactTableHeader}><span>学生</span><span>当前证据</span><span>单元分</span><span>下一步</span></div>
            {RISK_STUDENTS.map(student => (
              <button key={student.id} type="button" className={css.compactTableRow} onClick={() => { onNavigate('students') }}>
                <span><i className={css.studentAvatar}>{student.name.slice(0, 1)}</i><strong>{student.name}</strong></span>
                <span>{student.risk === '重点' ? '订正连续缺交' : student.risk === '观察' ? '课堂状态波动' : '近期记录待闭环'}</span>
                <strong>{student.score}</strong>
                <em>{student.risk === '重点' ? '午间辅导' : '本周观察'}</em>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
