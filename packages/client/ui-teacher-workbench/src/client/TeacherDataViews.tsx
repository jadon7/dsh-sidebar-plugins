import { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconCheckOutline16,
  IconChevronRightOutline14,
  IconDataOutline16,
  IconGoalOutline16,
  IconPlusOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import {
  ASSESSMENT_TREND,
  ATTENDANCE_RECORDS,
  CLASS_EVENTS,
  CLASS_GROUPS,
  CLASS_OPTIONS,
  CLASS_ROLES,
  CLASS_SUMMARY,
  COURSE_RECORDS,
  HABIT_METRICS,
  HABIT_RECORDS,
  HABIT_TREND,
  KNOWLEDGE_MASTERY,
  SCHOOL_CONTEXT,
  SCORE_DISTRIBUTION,
  SEATS,
  STUDENTS,
} from './TeacherData.ts'
import type { WorkbenchTab } from './TeacherViews.tsx'
import base from './TeacherWorkbench.module.css'
import css from './TeacherInsights.module.css'

function ViewHeader({ title, description, actions }: { title: string, description: string, actions: ReactNode }) {
  return (
    <div className={base.viewTopbar}>
      <div><h2>{title}</h2><p>{description}</p></div>
      <div className={base.toolbarGroup}>{actions}</div>
    </div>
  )
}

function StatusTag({ children, tone = 'neutral' }: { children: ReactNode, tone?: 'success' | 'warn' | 'danger' | 'neutral' }) {
  return <span className={clsx(css.statusTag, css[`status_${tone}`])}>{children}</span>
}

function HabitView() {
  const [dimension, setDimension] = useState('全部')
  const [selectedId, setSelectedId] = useState('gao')
  const [followed, setFollowed] = useState(false)
  const selected = HABIT_RECORDS.find(record => record.studentId === selectedId) ?? HABIT_RECORDS[0]
  const visibleRecords = dimension === '全部' ? HABIT_RECORDS : HABIT_RECORDS.filter(record => record.category === dimension)
  const barKeys = ['prepare', 'focus', 'correct', 'exercise'] as const
  const barLabels = ['课前准备', '课堂专注', '作业订正', '运动打卡'] as const

  return (
    <div className={base.view} data-screen-label="Teacher Habit Performance">
      <ViewHeader
        title="习惯表现"
        description={`${SCHOOL_CONTEXT.className} · 本周 73 条正向记录，9 条提醒记录`}
        actions={(
          <>
            <div className={base.segmented}>
              {['本周', '近 4 周', '本学期'].map(item => <button key={item} type="button" className={item === '本周' ? base.segmentActive : undefined}>{item}</button>)}
            </div>
            <button type="button" className={base.primaryButton}><IconPlusOutline16 size={14} />新增表现记录</button>
          </>
        )}
      />

      <div className={css.metricGrid}>
        {HABIT_METRICS.map(metric => (
          <button key={metric.id} type="button" className={clsx(css.metricButton, dimension === metric.label && css.metricSelected)} onClick={() => { setDimension(metric.label); setFollowed(false) }}>
            <span className={css.metricIcon}><IconCheckOutline16 size={15} /></span>
            <span className={css.metricCopy}><small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.note}</span></span>
            <em className={metric.change >= 0 ? css.positive : css.negative}>{metric.change >= 0 ? '+' : ''}{metric.change}</em>
          </button>
        ))}
      </div>

      <div className={css.habitLayout}>
        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>本周达标率趋势</strong><span>每日记录完成率 · 纵轴从 0 开始 · n=42</span></div>
            <div className={css.legend}>
              {barLabels.map((label, index) => <span key={label}><i className={css[`barTone${index + 1}`]}></i>{label}</span>)}
            </div>
          </div>
          <div className={css.groupedBarChart}>
            {HABIT_TREND.map(day => (
              <div key={day.day} className={css.barGroup}>
                <div className={css.barPlot}>
                  {barKeys.map((key, index) => <i key={key} className={css[`barTone${index + 1}`]} style={{ height: `${day[key]}%` }} title={`${barLabels[index]} ${day[key]}%`}></i>)}
                </div>
                <strong>{day.day}</strong><span>{day.date}</span>
              </div>
            ))}
          </div>
          <div className={css.insightNote}><IconGoalOutline16 size={14} /><span>作业订正达标率连续 4 天上升；课堂专注周三出现低点，已关联当天第 4 节课堂记录。</span></div>
        </section>

        <aside className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>学生记录详情</strong><span>{selected.lastUpdate} 更新</span></div><StatusTag tone={selected.status === '表现突出' ? 'success' : selected.status === '需跟进' ? 'danger' : 'warn'}>{selected.status}</StatusTag></div>
          <div className={css.detailPerson}><span>{selected.student.slice(0, 1)}</span><div><strong>{selected.student}</strong><small>{SCHOOL_CONTEXT.className} · {selected.category}</small></div></div>
          <div className={css.detailStats}><div><span>本周达标</span><strong>{selected.rate}%</strong></div><div><span>连续记录</span><strong>{selected.streak} 天</strong></div></div>
          <p className={css.detailText}>{selected.detail}</p>
          <div className={css.actionPlan}><strong>下一步</strong><span>{selected.status === '表现突出' ? '在周五班会中进行具体表扬，并保留成长记录。' : '连续观察 3 天；若仍未达标，加入家校沟通待办。'}</span></div>
          <button type="button" className={base.primaryButton} onClick={() => { setFollowed(true) }}>{followed ? <IconCheckOutline16 size={14} /> : <IconPlusOutline16 size={14} />}{followed ? '已加入跟进' : '加入跟进清单'}</button>
        </aside>
      </div>

      <section className={clsx(css.dataCard, css.tableCard)}>
        <div className={css.cardHeading}>
          <div><strong>学生习惯明细</strong><span>{dimension === '全部' ? '全部维度' : dimension} · 显示近期有变化的记录</span></div>
          <div className={base.segmented}>
            {['全部', '课前准备', '课堂专注', '作业订正'].map(item => <button key={item} type="button" className={dimension === item ? base.segmentActive : undefined} onClick={() => { setDimension(item) }}>{item}</button>)}
          </div>
        </div>
        <div className={css.dataTable}>
          <div className={css.habitTableHeader}><span>学生</span><span>维度</span><span>本周达标</span><span>连续记录</span><span>最近证据</span><span>状态</span></div>
          {visibleRecords.map(record => (
            <button key={`${record.studentId}-${record.category}`} type="button" className={clsx(css.habitTableRow, selected.studentId === record.studentId && css.tableRowSelected)} onClick={() => { setSelectedId(record.studentId); setFollowed(false) }}>
              <span><i className={css.studentAvatar}>{record.student.slice(0, 1)}</i><strong>{record.student}</strong></span><span>{record.category}</span><strong>{record.rate}%</strong><span>{record.streak} 天</span><span>{record.detail}</span><StatusTag tone={record.status === '表现突出' ? 'success' : record.status === '需跟进' ? 'danger' : 'warn'}>{record.status}</StatusTag>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function CourseRecordsView() {
  const [activeClass, setActiveClass] = useState<(typeof CLASS_OPTIONS)[number]>('高二（3）班')
  const [status, setStatus] = useState('全部')
  const [selectedId, setSelectedId] = useState('kinematics-1')
  const [recordClosed, setRecordClosed] = useState(false)
  const filtered = COURSE_RECORDS.filter(record => record.className === activeClass && (status === '全部' || record.status === status))
  const selected = COURSE_RECORDS.find(record => record.id === selectedId && record.className === activeClass) ?? filtered[0] ?? COURSE_RECORDS[0]

  return (
    <div className={base.view} data-screen-label="Teacher Course Records">
      <ViewHeader
        title="课程记录"
        description="把课前计划、到课、课堂参与、随堂检测和课后反思放在同一条记录中。"
        actions={(
          <>
            <div className={base.segmented}>{CLASS_OPTIONS.map(className => <button key={className} type="button" className={activeClass === className ? base.segmentActive : undefined} onClick={() => { setActiveClass(className); setRecordClosed(false) }}>{className}</button>)}</div>
            <button type="button" className={base.primaryButton}><IconPlusOutline16 size={14} />补充课程记录</button>
          </>
        )}
      />

      <div className={base.metricGrid}>
        <div className={base.metricCard}><span>本学期已授课</span><strong>18 / 40</strong><small>当前进度 45%</small></div>
        <div className={base.metricCard}><span>记录完整度</span><strong>94.4%</strong><small className={base.successText}>17 / 18 节已闭环</small></div>
        <div className={base.metricCard}><span>平均到课率</span><strong>97.4%</strong><small>应到 756 人次</small></div>
        <div className={base.metricCard}><span>随堂检测均分</span><strong>80.4</strong><small>近 5 节 +3.1</small></div>
      </div>

      <div className={css.recordsLayout}>
        <section className={clsx(css.dataCard, css.tableCard)}>
          <div className={css.cardHeading}>
            <div><strong>课程日志</strong><span>{activeClass} · 第一章“运动的描述”</span></div>
            <div className={base.segmented}>{['全部', '已完成', '已复盘', '待上课'].map(item => <button key={item} type="button" className={status === item ? base.segmentActive : undefined} onClick={() => { setStatus(item) }}>{item}</button>)}</div>
          </div>
          <div className={css.dataTable}>
            <div className={css.recordTableHeader}><span>日期 / 节次</span><span>课程主题</span><span>到课</span><span>参与度</span><span>作业</span><span>随测</span><span>状态</span></div>
            {filtered.map(record => (
              <button key={record.id} type="button" className={clsx(css.recordTableRow, selected.id === record.id && css.tableRowSelected)} onClick={() => { setSelectedId(record.id); setRecordClosed(false) }}>
                <span><strong>{record.date}</strong><small>{record.weekday} · {record.period}</small></span>
                <span><strong>{record.topic}</strong><small>{record.unit}</small></span>
                <span>{record.attendance}</span><strong>{record.participation}%</strong><span>{record.homework}%</span><strong>{record.quickCheck}</strong>
                <StatusTag tone={record.status === '已完成' || record.status === '已复盘' ? 'success' : 'warn'}>{recordClosed && record.id === selected.id ? '已闭环' : record.status}</StatusTag>
              </button>
            ))}
          </div>
        </section>

        <aside className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>课堂记录详情</strong><span>{selected.date} · {selected.period}</span></div><StatusTag tone="success">{recordClosed ? '已闭环' : selected.status}</StatusTag></div>
          <h3 className={css.detailTitle}>{selected.topic}</h3>
          <p className={css.detailSub}>{selected.className} · {selected.unit}</p>
          <div className={css.detailStats}><div><span>课堂参与</span><strong>{selected.participation}%</strong></div><div><span>随堂检测</span><strong>{selected.quickCheck}</strong></div><div><span>作业提交</span><strong>{selected.homework}%</strong></div></div>
          <div className={css.progressList}>
            <div><span>教学目标完成</span><strong>3 / 4</strong><i><b style={{ width: '75%' }}></b></i></div>
            <div><span>分组活动完成</span><strong>6 / 6</strong><i><b style={{ width: '100%' }}></b></i></div>
            <div><span>课堂反馈提交</span><strong>39 / 42</strong><i><b style={{ width: '93%' }}></b></i></div>
          </div>
          <div className={css.actionPlan}><strong>课后反思</strong><span>{selected.reflection}</span></div>
          <button type="button" className={base.primaryButton} onClick={() => { setRecordClosed(true) }}>{recordClosed ? <IconCheckOutline16 size={14} /> : <IconGoalOutline16 size={14} />}{recordClosed ? '记录已闭环' : '标记完成复盘'}</button>
        </aside>
      </div>
    </div>
  )
}

function AcademicTrendChart() {
  const points = ASSESSMENT_TREND.map((item, index) => ({
    x: 52 + index * 104,
    y: 148 - (item.classAverage - 70) * 5.1,
    baselineY: 148 - (item.gradeAverage - 70) * 5.1,
    label: item.shortLabel,
    value: item.classAverage,
  }))
  return (
    <div className={css.lineChart}>
      <svg viewBox="0 0 510 185" role="img" aria-label="近五次物理测评班级与年级均分趋势">
        {[70, 75, 80, 85, 90].map((value, index) => {
          const y = 148 - index * 25.5
          return <g key={value}><line x1="46" y1={y} x2="480" y2={y} className={css.chartGridLine} /><text x="8" y={y + 4} className={css.chartAxisText}>{value}</text></g>
        })}
        <polyline points={points.map(point => `${point.x},${point.baselineY}`).join(' ')} className={css.baselineLine} />
        <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} className={css.primaryLine} />
        {points.map(point => <g key={point.label}><circle cx={point.x} cy={point.y} r="4" className={css.primaryPoint} /><text x={point.x} y={point.y - 9} textAnchor="middle" className={css.pointValue}>{point.value}</text><text x={point.x} y="174" textAnchor="middle" className={css.chartAxisText}>{point.label}</text></g>)}
      </svg>
    </div>
  )
}

function AcademicView({ onNavigate }: { onNavigate: (tab: WorkbenchTab) => void }) {
  const [assessment, setAssessment] = useState('运动学单元测')
  const [sortMode, setSortMode] = useState<'change' | 'score'>('change')
  const [selectedId, setSelectedId] = useState('gao')
  const selected = STUDENTS.find(student => student.id === selectedId) ?? STUDENTS[0]
  const rankedStudents = [...STUDENTS].sort((a, b) => sortMode === 'change' ? b.change - a.change : b.score - a.score)
  const maxDistribution = Math.max(...SCORE_DISTRIBUTION.map(item => item.count))

  return (
    <div className={base.view} data-screen-label="Teacher Academic Performance">
      <ViewHeader
        title="学业情况"
        description={`${SCHOOL_CONTEXT.className} · 物理学科阶段表现与知识点掌握`}
        actions={(
          <>
            <select className={css.selectControl} value={assessment} onChange={event => { setAssessment(event.currentTarget.value) }} aria-label="选择测评"><option>运动学单元测</option><option>实验测评</option><option>周测一</option></select>
            <button type="button" className={base.ghostButton}>导出学情简报</button>
          </>
        )}
      />

      <div className={base.metricGrid}>
        <div className={base.metricCard}><span>{assessment}均分</span><strong>{CLASS_SUMMARY.averageScore}</strong><small className={base.successText}>高于年级 1.2 分</small></div>
        <div className={base.metricCard}><span>及格率</span><strong>{CLASS_SUMMARY.passRate}%</strong><small>38 / 42 人达标</small></div>
        <div className={base.metricCard}><span>优秀率</span><strong>{CLASS_SUMMARY.excellentRate}%</strong><small>12 人达到 A 档</small></div>
        <div className={base.metricCard}><span>较上次进步</span><strong>26 人</strong><small>中位提升 3.4 分</small></div>
      </div>

      <div className={css.academicGrid}>
        <section className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>阶段成绩趋势</strong><span>满分 100 · n=42</span></div><div className={css.legend}><span><i className={css.legendPrimary}></i>班级均分</span><span><i className={css.legendBaseline}></i>年级同层</span></div></div>
          <AcademicTrendChart />
        </section>

        <section className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>分数段分布</strong><span>{assessment} · 42 人</span></div></div>
          <div className={css.distributionChart}>
            {SCORE_DISTRIBUTION.map(item => (
              <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${(item.count / maxDistribution) * 100}%` }}></b></i><strong>{item.count} 人</strong></div>
            ))}
          </div>
          <div className={css.insightNote}><IconDataOutline16 size={14} /><span>80 分以上共 24 人；60 分以下 4 人已进入本周分层辅导。</span></div>
        </section>

        <section className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>知识点掌握</strong><span>正确率与上次测评变化</span></div></div>
          <div className={css.masteryList}>
            {KNOWLEDGE_MASTERY.map(item => <div key={item.name} className={css.masteryRow}><span>{item.name}</span><div><i style={{ width: `${item.value}%` }}></i></div><strong>{item.value}%</strong><small className={item.change >= 0 ? css.positive : css.negative}>{item.change >= 0 ? '+' : ''}{item.change}</small></div>)}
          </div>
          <div className={css.actionPlan}><strong>教学建议</strong><span>下周把“误差与有效数字”加入实验报告评分量规，并为 8 名学生推送分层练习。</span></div>
        </section>

        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>学生变化</strong><span>点击查看证据 · 当前：{selected.name}</span></div>
            <div className={base.segmented}><button type="button" className={sortMode === 'change' ? base.segmentActive : undefined} onClick={() => { setSortMode('change') }}>按变化</button><button type="button" className={sortMode === 'score' ? base.segmentActive : undefined} onClick={() => { setSortMode('score') }}>按成绩</button></div>
          </div>
          <div className={css.studentChangeSummary}><span className={css.studentAvatar}>{selected.name.slice(0, 1)}</span><div><strong>{selected.name} · {selected.score} 分</strong><small>{selected.note}</small></div><StatusTag tone={selected.change >= 3 ? 'success' : selected.change < 0 ? 'danger' : 'neutral'}>{selected.change >= 0 ? '+' : ''}{selected.change} 分</StatusTag></div>
          <div className={css.changeList}>
            {rankedStudents.slice(0, 6).map(student => <button key={student.id} type="button" className={selected.id === student.id ? css.tableRowSelected : undefined} onClick={() => { setSelectedId(student.id) }}><span><i className={css.studentAvatar}>{student.name.slice(0, 1)}</i>{student.name}</span><strong>{student.score}</strong><em className={student.change >= 0 ? css.positive : css.negative}>{student.change >= 0 ? '+' : ''}{student.change}</em><IconChevronRightOutline14 size={14} /></button>)}
          </div>
          <button type="button" className={css.linkButton} onClick={() => { onNavigate('students') }}>打开完整学生档案</button>
        </section>
      </div>
    </div>
  )
}

type ManagementMode = 'seats' | 'groups' | 'attendance'

function ClassManagementView() {
  const [mode, setMode] = useState<ManagementMode>('seats')
  const [selectedSeatId, setSelectedSeatId] = useState('seat-1')
  const [doneTasks, setDoneTasks] = useState<string[]>(['materials'])
  const selectedSeat = SEATS.find(seat => seat.id === selectedSeatId) ?? SEATS[0]!
  const selectedStudent = STUDENTS.find(student => student.name === selectedSeat.name)
  const tasks = [
    { id: 'materials', title: '收齐安全主题班会材料', owner: '沈知序', due: '今天 12:00' },
    { id: 'parents', title: '跟进 3 位未确认开放日的家长', owner: '家委会', due: '今天 18:30' },
    { id: 'seats', title: '确认下周座位微调名单', owner: '周清禾', due: '周五前' },
  ]
  const toggleTask = (id: string): void => { setDoneTasks(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]) }

  return (
    <div className={base.view} data-screen-label="Teacher Class Management">
      <ViewHeader
        title="班级管理"
        description={`${SCHOOL_CONTEXT.className} · 学生、分组、座位、出勤与班务集中管理`}
        actions={<><span className={base.integration}>「钉钉」<span>42 人已同步</span></span><button type="button" className={base.primaryButton}><IconPlusOutline16 size={14} />新增班务</button></>}
      />

      <div className={base.metricGrid}>
        <div className={base.metricCard}><span>班级人数</span><strong>42</strong><small>男生 21 · 女生 21</small></div>
        <div className={base.metricCard}><span>今日到校</span><strong>41</strong><small className={base.successText}>出勤率 97.6%</small></div>
        <div className={base.metricCard}><span>学习小组</span><strong>6</strong><small>每组 7 人 · 组长已确认</small></div>
        <div className={base.metricCard}><span>待处理班务</span><strong>3</strong><small>家校 1 · 座位 1 · 活动 1</small></div>
      </div>

      <div className={css.managementLayout}>
        <section className={css.dataCard}>
          <div className={css.cardHeading}>
            <div><strong>班级视图</strong><span>讲台朝上 · 点击座位查看学生状态</span></div>
            <div className={base.segmented}><button type="button" className={mode === 'seats' ? base.segmentActive : undefined} onClick={() => { setMode('seats') }}>座位表</button><button type="button" className={mode === 'groups' ? base.segmentActive : undefined} onClick={() => { setMode('groups') }}>学习小组</button><button type="button" className={mode === 'attendance' ? base.segmentActive : undefined} onClick={() => { setMode('attendance') }}>考勤记录</button></div>
          </div>

          {mode === 'seats' && (
            <div className={css.seatingArea}>
              <div className={css.podium}>讲台 · 多媒体</div>
              <div className={css.seatGrid}>
                {SEATS.map(seat => <button key={seat.id} type="button" className={clsx(selectedSeat.id === seat.id && css.seatSelected, seat.status === '关注' && css.seatConcern, seat.status === '请假' && css.seatAbsent)} onClick={() => { setSelectedSeatId(seat.id) }}><strong>{seat.name}</strong><span>{seat.row}排{seat.column}列</span></button>)}
              </div>
              <div className={css.seatLegend}><span><i></i>在班</span><span><i className={css.legendConcern}></i>需关注</span><span><i className={css.legendAbsent}></i>请假</span></div>
            </div>
          )}

          {mode === 'groups' && (
            <div className={css.groupTable}>
              <div><span>小组</span><span>组长</span><span>成员</span><span>本周积分</span><span>变化</span></div>
              {CLASS_GROUPS.map((group, index) => <button key={group.name} type="button"><span><i>{index + 1}</i><strong>{group.name}</strong></span><span>{group.leader}</span><span>{group.members} 人</span><strong>{group.points}</strong><em>+{group.change}</em></button>)}
            </div>
          )}

          {mode === 'attendance' && (
            <div className={css.attendanceTable}>
              <div><span>学生</span><span>类型</span><span>时间</span><span>原因</span><span>处理状态</span></div>
              {ATTENDANCE_RECORDS.map(record => <button key={`${record.name}-${record.time}`} type="button"><strong>{record.name}</strong><StatusTag tone={record.type === '迟到' ? 'danger' : 'warn'}>{record.type}</StatusTag><span>{record.time}</span><span>{record.reason}</span><em>{record.status}</em></button>)}
            </div>
          )}
        </section>

        <aside className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>{selectedSeat.name}</strong><span>{selectedSeat.row} 排 {selectedSeat.column} 列 · {selectedSeat.status}</span></div><StatusTag tone={selectedSeat.status === '在班' ? 'success' : selectedSeat.status === '关注' ? 'danger' : 'warn'}>{selectedSeat.status}</StatusTag></div>
          <div className={css.detailPerson}><span>{selectedSeat.name.slice(0, 1)}</span><div><strong>{selectedStudent?.grade ?? '班级成员'}</strong><small>{selectedStudent?.tags.join(' · ') ?? '暂无重点记录'}</small></div></div>
          <div className={css.detailStats}><div><span>习惯分</span><strong>{selectedStudent?.habit ?? 89}</strong></div><div><span>课堂参与</span><strong>{selectedStudent?.engagement ?? 86}%</strong></div></div>
          <p className={css.detailText}>{selectedStudent?.note ?? '本周出勤和班务记录正常，没有待跟进事项。'}</p>
          <button type="button" className={base.ghostButton}>查看学生档案</button>
        </aside>
      </div>

      <div className={css.classBottomGrid}>
        <section className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>班委与职责</strong><span>4 个主要岗位 · 本月轮值</span></div></div>
          <div className={css.roleList}>{CLASS_ROLES.map(role => <div key={role.role}><span className={css.studentAvatar}>{role.name.slice(0, 1)}</span><div><strong>{role.role} · {role.name}</strong><span>{role.focus}</span></div><IconChevronRightOutline14 size={14} /></div>)}</div>
        </section>
        <section className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>班级日程</strong><span>未来 14 天</span></div></div>
          <div className={css.eventList}>{CLASS_EVENTS.map(event => <div key={`${event.date}-${event.title}`}><time>{event.date}</time><div><strong>{event.title}</strong><span>{event.owner}</span></div><em>{event.status}</em></div>)}</div>
        </section>
        <section className={css.dataCard}>
          <div className={css.cardHeading}><div><strong>班务待办</strong><span>{tasks.length - doneTasks.length} 项未完成</span></div></div>
          <div className={css.classTaskList}>{tasks.map(task => <button key={task.id} type="button" className={doneTasks.includes(task.id) ? css.taskDone : undefined} onClick={() => { toggleTask(task.id) }}><i>{doneTasks.includes(task.id) && <IconCheckOutline16 size={12} />}</i><span><strong>{task.title}</strong><small>{task.owner} · {task.due}</small></span></button>)}</div>
        </section>
      </div>
    </div>
  )
}

/** Render one of the data-heavy teacher views. */
export function TeacherDataView({ tab, onNavigate }: { tab: 'habits' | 'records' | 'academics' | 'classes', onNavigate: (tab: WorkbenchTab) => void }) {
  if (tab === 'habits') return <HabitView />
  if (tab === 'records') return <CourseRecordsView />
  if (tab === 'academics') return <AcademicView onNavigate={onNavigate} />
  return <ClassManagementView />
}
