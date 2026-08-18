import { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconCheckOutline16,
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconCopyOutline16,
  IconEditOutline16,
  IconGoalOutline16,
  IconLightOutline16,
  IconLinkOutline14,
  IconPauseOutline16,
  IconPlayOutline16,
  IconPlusOutline16,
  IconSearchOutline16,
  IconSendOutline16,
  IconSparkle16,
  IconUserOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { FAMILY_ACTIVITY, SCHOOL_CONTEXT, STUDENTS } from './TeacherData.ts'
import { TeacherDashboard } from './TeacherDashboard.tsx'
import { TeacherDataView } from './TeacherDataViews.tsx'
import css from './TeacherWorkbench.module.css'

/** Available teacher workbench views. */
export type WorkbenchTab = 'dashboard' | 'schedule' | 'records' | 'lessons' | 'academics' | 'habits' | 'students' | 'classes' | 'family' | 'tools' | 'growth'

const COURSES = [
  { id: 'mechanics', day: '周一', date: '9月14日', time: '08:00–08:45', title: '匀变速直线运动', className: '高二（3）班', room: '明理楼 302', tone: 'blue', attendance: '41 / 42', record: '课堂记录已完成' },
  { id: 'lab', day: '周一', date: '9月14日', time: '14:00–15:30', title: '测量重力加速度', className: '高二（3）班', room: '物理实验室', tone: 'green', attendance: '42 / 42', record: '实验记录已完成' },
  { id: 'projectile', day: '周二', date: '9月15日', time: '09:00–09:45', title: '抛体运动', className: '高二（4）班', room: '明理楼 305', tone: 'amber', attendance: '待上课', record: '教案已就绪' },
  { id: 'review', day: '周三', date: '9月16日', time: '10:10–10:55', title: '运动学单元复习', className: '高二（3）班', room: '明理楼 302', tone: 'blue', attendance: '待上课', record: '已关联分层练习' },
  { id: 'meeting', day: '周三', date: '9月16日', time: '15:20–16:20', title: '物理组集体备课', className: '教研活动', room: '教师发展中心', tone: 'neutral', attendance: '12 位教师', record: '议题 3 项' },
  { id: 'force', day: '周四', date: '9月17日', time: '08:00–08:45', title: '相互作用与力', className: '高二（4）班', room: '明理楼 305', tone: 'green', attendance: '待上课', record: '器材已确认' },
  { id: 'quiz', day: '周五', date: '9月18日', time: '09:00–09:45', title: '运动学小测', className: '高二（3）班', room: '明理楼 302', tone: 'amber', attendance: '42 人应测', record: '试卷已印制' },
] as const

const DAYS = [
  { day: '周一', date: '9月14日' },
  { day: '周二', date: '9月15日' },
  { day: '周三', date: '9月16日' },
  { day: '周四', date: '9月17日' },
  { day: '周五', date: '9月18日' },
] as const

const LESSONS = [
  { id: 'projectile', title: '抛体运动：从现象到模型', meta: '高二（4）班 · 已就绪 · 09:18 编辑' },
  { id: 'gravity', title: '实验：测量重力加速度', meta: '高二（3）班 · 已授课 · 6 份资源' },
  { id: 'force', title: '牛顿第三定律', meta: '高二（4）班 · 草稿 · 3 份资源' },
  { id: 'review', title: '运动学单元复习与分层练习', meta: '高二（3）班 · 已就绪 · 42 份学情' },
  { id: 'quiz', title: '运动学小测与即时讲评', meta: '高二（3）班 · 待确认 · 09/18 使用' },
] as const

const MESSAGE_TEMPLATES = [
  { id: 'praise', category: '表扬反馈', title: '课堂表现突出', tag: '日常反馈', body: '您好，今天孩子在物理课堂的模型分析环节表现很突出，能够主动说明思路并帮助小组完成实验记录。期待他继续保持这份专注与主动。' },
  { id: 'homework', category: '学习提醒', title: '作业补交提醒', tag: '学习跟进', body: '您好，本周物理作业还有一项实验数据分析尚未提交。建议孩子今晚完成并核对单位与有效数字，如有困难可在班级答疑时间联系我。' },
  { id: 'notice', category: '班级通知', title: '实验课准备通知', tag: '课程通知', body: '各位家长好，本周四物理课将进行“测量重力加速度”分组实验，请提醒孩子携带直尺、计算器，并提前阅读实验安全须知。感谢配合。' },
  { id: 'progress', category: '表扬反馈', title: '阶段进步反馈', tag: '成长反馈', body: '您好，孩子近期在运动学图像题上的正确率有明显提升，课堂订正也更主动。建议继续保持每日 15 分钟的错题复盘习惯。' },
  { id: 'quiz', category: '学习提醒', title: '单元测学情反馈', tag: '成绩反馈', body: '您好，本次运动学单元测孩子取得了 82 分。图像判读表现稳定，误差与有效数字仍有提升空间。我已在系统中放入 6 道针对练习，建议本周完成。' },
  { id: 'attendance', category: '学习提醒', title: '迟到与课前准备提醒', tag: '习惯跟进', body: '您好，孩子本周出现两次课前准备不完整的情况。课堂内容可以跟上，但会影响实验记录效率。请协助提醒他今晚整理物理学习袋。' },
  { id: 'meeting', category: '班级通知', title: '家长开放日预约', tag: '活动通知', body: '各位家长好，学校将于 9 月 22 日举行家长开放日。请在周五 18:00 前确认到校时段；如无法到校，可选择线上沟通。' },
] as const

const SCORE_NAMES = ['林一然', '周子墨', '陈嘉禾'] as const
const INITIAL_SCORES = { '林一然': 28, '周子墨': 24, '陈嘉禾': 21 }
const PICK_NAMES = ['林一然', '周子墨', '陈嘉禾', '许念安', '高远'] as const

function IntegrationBadge({ name, status }: { name: string, status?: string }) {
  return (
    <span className={css.integration}>
      「{name}」{status !== undefined && <span>{status}</span>}
    </span>
  )
}

function SectionHeading({ title, description, action }: { title: string, description?: string, action?: ReactNode }) {
  return (
    <div className={css.sectionHeading}>
      <div>
        <strong>{title}</strong>
        {description !== undefined && <span>{description}</span>}
      </div>
      {action}
    </div>
  )
}

function ScheduleView() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<(typeof COURSES)[number]['id']>('mechanics')
  const [synced, setSynced] = useState(false)
  const selected = COURSES.find(course => course.id === selectedId) ?? COURSES[0]
  const weekLabel = weekOffset === 0 ? '本周 · 9月14日—18日' : weekOffset > 0 ? '下周 · 9月21日—25日' : '上周 · 9月7日—11日'

  return (
    <div className={css.view} data-screen-label="Teacher Schedule">
      <div className={css.viewTopbar}>
        <div>
          <h2>排课表</h2>
          <p>查看本周课程、实验安排与教研活动。</p>
        </div>
        <div className={css.toolbarGroup}>
          <IntegrationBadge name="飞书日历" status={synced ? '已同步' : '待同步'} />
          <button type="button" className={css.ghostButton} onClick={() => { setSynced(value => !value) }}>
            <IconCheckOutline16 size={14} />
            {synced ? '同步完成' : '同步课表'}
          </button>
        </div>
      </div>

      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>本周教学</span><strong>7</strong><small>物理课 6 · 教研 1</small></div>
        <div className={css.metricCard}><span>高二（3）班</span><strong>4</strong><small>已完成 2 · 待上课 2</small></div>
        <div className={css.metricCard}><span>实验课</span><strong>1</strong><small className={css.successText}>器材与安全单已齐</small></div>
        <div className={css.metricCard}><span>备课完成</span><strong>100%</strong><small>7 / 7 项已准备</small></div>
      </div>

      <div className={css.scheduleLayout}>
        <section className={clsx(css.card, css.calendarCard)}>
          <div className={css.weekToolbar}>
            <button type="button" className={css.iconButton} onClick={() => { setWeekOffset(value => value - 1) }} aria-label="上一周">
              <IconChevronLeftOutline14 size={15} />
            </button>
            <strong>{weekLabel}</strong>
            <button type="button" className={css.iconButton} onClick={() => { setWeekOffset(value => value + 1) }} aria-label="下一周">
              <IconChevronRightOutline14 size={15} />
            </button>
            {weekOffset !== 0 && <button type="button" className={css.textButton} onClick={() => { setWeekOffset(0) }}>回到本周</button>}
          </div>
          <div className={css.scheduleGrid}>
            {DAYS.map(day => (
              <div key={day.day} className={css.dayColumn}>
                <div className={css.dayHeader}>
                  <strong>{day.day}</strong>
                  <span>{day.date}</span>
                </div>
                <div className={css.dayCourses}>
                  {COURSES.filter(course => course.day === day.day).map(course => (
                    <button
                      key={course.id}
                      type="button"
                      className={clsx(css.courseCard, css[`course_${course.tone}`], selected.id === course.id && css.courseActive)}
                      onClick={() => { setSelectedId(course.id) }}
                    >
                      <span>{course.time}</span>
                      <strong>{course.title}</strong>
                      <small>{course.className}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className={clsx(css.card, css.todayCard)}>
          <SectionHeading title="课程详情" description={`${selected.day} · ${selected.date}`} />
          <div className={css.courseDetailTime}>{selected.time}</div>
          <h3>{selected.title}</h3>
          <dl className={css.detailList}>
            <div><dt>班级</dt><dd>{selected.className}</dd></div>
            <div><dt>地点</dt><dd>{selected.room}</dd></div>
            <div><dt>到课 / 参与</dt><dd>{selected.attendance}</dd></div>
            <div><dt>关联记录</dt><dd className={css.successText}>{selected.record}</dd></div>
          </dl>
          <div className={css.detailNote}>
            <strong>课前提醒</strong>
            <span>准备运动传感器与小球，下课前预留 5 分钟完成即时反馈。</span>
          </div>
          <button type="button" className={css.primaryButton}>打开教案</button>
        </aside>
      </div>
    </div>
  )
}

function LessonPlanView() {
  const [activeLessonId, setActiveLessonId] = useState<(typeof LESSONS)[number]['id']>('projectile')
  const [aiDraft, setAiDraft] = useState('请把探究问题改成更适合分组讨论的形式')
  const [aiReply, setAiReply] = useState('建议把“影响射程的因素有哪些？”改为两层任务：先预测变量，再设计只改变一个条件的验证方案。')
  const [applied, setApplied] = useState(false)
  const activeLesson = LESSONS.find(lesson => lesson.id === activeLessonId) ?? LESSONS[0]

  const askAi = (prompt: string): void => {
    setAiReply(prompt)
    setApplied(false)
  }

  return (
    <div className={css.view} data-screen-label="Lesson Plan Manager">
      <div className={css.viewTopbar}>
        <div>
          <h2>教案管理</h2>
          <p>像笔记一样组织课件内容，并用 AI 完善教学设计。</p>
        </div>
        <div className={css.toolbarGroup}>
          <IntegrationBadge name="WPS 云文档" status="自动保存" />
          <button type="button" className={css.primaryButton}><IconPlusOutline16 size={14} />新建教案</button>
        </div>
      </div>

      <div className={css.lessonLayout}>
        <aside className={clsx(css.card, css.lessonLibrary)}>
          <div className={css.searchField}>
            <IconSearchOutline16 size={15} />
            <input aria-label="搜索教案" placeholder="搜索教案" />
          </div>
          <span className={css.eyebrow}>最近编辑</span>
          <div className={css.lessonList}>
            {LESSONS.map(lesson => (
              <button
                key={lesson.id}
                type="button"
                className={clsx(css.lessonItem, activeLesson.id === lesson.id && css.lessonItemActive)}
                onClick={() => { setActiveLessonId(lesson.id) }}
              >
                <IconEditOutline16 size={15} />
                <span><strong>{lesson.title}</strong><small>{lesson.meta}</small></span>
              </button>
            ))}
          </div>
          <div className={css.libraryFooter}>
            <span>本学期教案</span>
            <strong>18 篇 · 15 已就绪</strong>
          </div>
        </aside>

        <article className={clsx(css.card, css.lessonEditor)}>
          <div className={css.editorToolbar}>
            <span>正文</span><span>B</span><span>I</span><span>H₂</span><span>公式</span><span>图片</span>
            <span className={css.savedState}>已保存</span>
          </div>
          <div className={css.editorBody}>
            <span className={css.eyebrow}>必修第二册 · 运动与相互作用</span>
            <h1>{activeLesson.title}</h1>
            <p className={css.lead}>从篮球投射的真实情境出发，引导学生完成运动分解、规律建模与证据解释。</p>

            <h3>一、核心模型</h3>
            <p>忽略空气阻力，将初速度分解到水平与竖直方向。水平方向做匀速直线运动，竖直方向做匀变速运动。</p>
            <div className={css.formulaBlock}>
              <div>y(x) = x tan θ − <span className={css.fraction}><span>g x<sup>2</sup></span><span>2v<sub>0</sub><sup>2</sup> cos<sup>2</sup>θ</span></span></div>
              <div>R = <span className={css.fraction}><span>v<sub>0</sub><sup>2</sup> sin 2θ</span><span>g</span></span>，　ΔE = ∫<sub>s₁</sub><sup>s₂</sup> F · ds</div>
            </div>

            <h3>二、案例观察</h3>
            <div className={css.caseImage} role="group" aria-label="篮球投射课堂证据摘要">
              <span className={css.caseImageBadge}>课堂证据 · 9月14日</span>
              <div className={css.caseImageMark}>6/6</div>
              <div><strong>分组实验数据已回收</strong><span>42 人参与 · 6 组完成变量控制</span><span>随堂检测均分 84 · 2 组需补充误差说明</span></div>
            </div>

            <h3>三、探究问题</h3>
            <ol className={css.questionList}>
              <li>初速度大小不变时，发射角如何影响水平射程？</li>
              <li>如何设计实验，只改变一个变量并保留可比较证据？</li>
            </ol>
          </div>
        </article>

        <aside className={clsx(css.card, css.aiPanel)}>
          <div className={css.aiHeader}>
            <span className={css.aiIcon}><IconSparkle16 size={16} /></span>
            <div><strong>AI 共备助手</strong><span>基于当前教案</span></div>
            <IntegrationBadge name="DeepSeek" />
          </div>
          <div className={css.aiConversation}>
            <div className={css.userBubble}>帮我检查这一节的探究问题是否有足够层次。</div>
            <div className={css.aiBubble}>{aiReply}</div>
            {applied && <div className={css.appliedNotice}><IconCheckOutline16 size={13} />建议已插入教案</div>}
          </div>
          <div className={css.promptChips}>
            <button type="button" onClick={() => { askAi('可以增加“预测—验证—解释”三步任务，并为每一步给出学生产出要求。') }}>强化探究层次</button>
            <button type="button" onClick={() => { askAi('已生成一份四段式板书：情境、分解、方程、证据解释。') }}>生成板书</button>
            <button type="button" onClick={() => { askAi('建议把第二问拆成基础任务与挑战任务，便于不同小组选择。') }}>调整难度</button>
          </div>
          <div className={css.aiComposer}>
            <textarea value={aiDraft} onChange={event => { setAiDraft(event.currentTarget.value) }} aria-label="给 AI 共备助手发消息" />
            <div>
              <button type="button" className={css.textButton} onClick={() => { setApplied(true) }}>插入教案</button>
              <button type="button" className={css.aiSendButton} onClick={() => { askAi(`已按你的要求优化：${aiDraft}`) }} aria-label="发送">
                <IconSendOutline16 size={15} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StudentsView() {
  const [statusFilter, setStatusFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<(typeof STUDENTS)[number]['id']>('lin')
  const selected = STUDENTS.find(student => student.id === selectedId) ?? STUDENTS[0]
  const visibleStudents = STUDENTS.filter(student => student.name.includes(search) && (statusFilter === '全部' || (statusFilter === '稳定' ? student.risk === '稳定' : student.risk !== '稳定')))

  return (
    <div className={css.view} data-screen-label="Student Manager">
      <div className={css.viewTopbar}>
        <div><h2>学生管理</h2><p>{SCHOOL_CONTEXT.className} · 集中查看出勤、作业、单元测和教师观察。</p></div>
        <div className={css.toolbarGroup}>
          <IntegrationBadge name="钉钉" status="42 人已同步" />
          <button type="button" className={css.ghostButton}>导出 Excel</button>
        </div>
      </div>

      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>班级人数</span><strong>42</strong><small>男生 21 · 女生 21</small></div>
        <div className={css.metricCard}><span>今日出勤</span><strong>41</strong><small className={css.successText}>出勤率 97.6%</small></div>
        <div className={css.metricCard}><span>作业按时率</span><strong>92.4%</strong><small>194 / 210 份按时</small></div>
        <div className={css.metricCard}><span>重点跟进</span><strong>4</strong><small>2 学业 · 2 习惯</small></div>
      </div>

      <div className={css.studentLayout}>
        <section className={clsx(css.card, css.studentTableCard)}>
          <div className={css.tableToolbar}>
            <div className={css.segmented}>
              {['全部', '稳定', '需跟进'].map(item => (
                <button key={item} type="button" className={statusFilter === item ? css.segmentActive : undefined} onClick={() => { setStatusFilter(item) }}>{item}</button>
              ))}
            </div>
            <div className={css.searchField}>
              <IconSearchOutline16 size={15} />
              <input value={search} onChange={event => { setSearch(event.currentTarget.value) }} aria-label="搜索学生" placeholder="搜索学生" />
            </div>
          </div>
          <div className={css.studentTableHeader}><span>学生</span><span>出勤</span><span>作业</span><span>单元测</span></div>
          <div className={css.studentRows}>
            {visibleStudents.map(student => (
              <button key={student.id} type="button" className={clsx(css.studentRow, selected.id === student.id && css.studentRowActive)} onClick={() => { setSelectedId(student.id) }}>
                <span className={css.studentIdentity}><span className={css.avatar}>{student.name.slice(0, 1)}</span><span><strong>{student.name}</strong><small>{SCHOOL_CONTEXT.className} · {student.number} 号 · {student.risk}</small></span></span>
                <span>{student.attendance}</span><span>{student.homework}</span><strong>{student.score}</strong>
              </button>
            ))}
          </div>
        </section>

        <aside className={clsx(css.card, css.studentDetail)}>
          <div className={css.studentProfile}>
            <span className={clsx(css.avatar, css.avatarLarge)}>{selected.name.slice(0, 1)}</span>
            <div><h3>{selected.name}</h3><span>{SCHOOL_CONTEXT.className} · {selected.number} 号 · {selected.score} 分（{selected.change >= 0 ? '+' : ''}{selected.change}）</span></div>
          </div>
          <div className={css.studentTags}>{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <SectionHeading title="教师观察" description="最近更新 · 今天" />
          <p className={css.observation}>{selected.note}</p>
          <SectionHeading title="本周任务" />
          <ul className={css.taskList}><li><IconCheckOutline16 size={13} />完成运动学错题复盘</li><li><IconGoalOutline16 size={13} />补充实验误差分析</li></ul>
          <button type="button" className={css.primaryButton}><IconPlusOutline16 size={14} />添加观察记录</button>
        </aside>
      </div>
    </div>
  )
}

function FamilyView() {
  const [category, setCategory] = useState('表扬反馈')
  const [selectedId, setSelectedId] = useState<(typeof MESSAGE_TEMPLATES)[number]['id']>('praise')
  const [copied, setCopied] = useState(false)
  const [queued, setQueued] = useState(false)
  const [recipientIndex, setRecipientIndex] = useState(0)
  const categories = ['表扬反馈', '学习提醒', '班级通知'] as const
  const visibleTemplates = MESSAGE_TEMPLATES.filter(template => template.category === category)
  const selected = MESSAGE_TEMPLATES.find(template => template.id === selectedId && template.category === category)
    ?? visibleTemplates[0]
    ?? MESSAGE_TEMPLATES[0]
  const recipient = STUDENTS[recipientIndex] ?? STUDENTS[0]

  return (
    <div className={css.view} data-screen-label="Family Communication Templates">
      <div className={css.viewTopbar}>
        <div><h2>家校沟通模板库</h2><p>快速完成反馈、表扬与班级通知。</p></div>
        <div className={css.toolbarGroup}><IntegrationBadge name="企业微信" status="可发送" /><IntegrationBadge name="钉钉" /></div>
      </div>

      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>本周已发送</span><strong>18</strong><small>个别反馈 13 · 班级通知 5</small></div>
        <div className={css.metricCard}><span>家长已读</span><strong>94.4%</strong><small>17 / 18 条已读</small></div>
        <div className={css.metricCard}><span>收到回复</span><strong>14</strong><small className={css.successText}>平均 38 分钟回复</small></div>
        <div className={css.metricCard}><span>待跟进</span><strong>4</strong><small>成绩 2 · 习惯 2</small></div>
      </div>

      <div className={css.templateLayout}>
        <aside className={clsx(css.card, css.categoryRail)}>
          <span className={css.eyebrow}>沟通场景</span>
          {categories.map(item => (
            <button key={item} type="button" className={category === item ? css.categoryActive : undefined} onClick={() => { setCategory(item); setCopied(false); setQueued(false) }}>{item}</button>
          ))}
        </aside>

        <section className={clsx(css.card, css.templateList)}>
          <SectionHeading title={`${category}模板`} description={`${visibleTemplates.length} 个常用话术`} action={<button type="button" className={css.iconButton}><IconPlusOutline16 size={15} /></button>} />
          {visibleTemplates.map(template => (
            <button key={template.id} type="button" className={clsx(css.templateItem, selected.id === template.id && css.templateItemActive)} onClick={() => { setSelectedId(template.id); setCopied(false); setQueued(false) }}>
              <span><strong>{template.title}</strong><small>{template.tag}</small></span>
              <IconChevronRightOutline14 size={14} />
            </button>
          ))}
        </section>

        <article className={clsx(css.card, css.templatePreview)}>
          <div className={css.previewHeader}>
            <div><span className={css.eyebrow}>模板预览</span><h3>{selected.title}</h3></div>
            <span className={css.messageChannel}>企业微信</span>
          </div>
          <div className={css.recipientRow}><IconUserOutline16 size={15} /><span>发送给：{recipient.name}家长（{recipient.guardian}）</span><button type="button" className={css.textButton} onClick={() => { setRecipientIndex(value => (value + 1) % STUDENTS.length); setQueued(false) }}>更换</button></div>
          <div className={css.messagePreview}>{selected.body}</div>
          <div className={css.templateVariables}><span>学生姓名</span><span>学科</span><span>时间</span></div>
          {queued && <div className={css.successBanner}><IconCheckOutline16 size={14} />已加入今天 18:30 的待发送列表</div>}
          <div className={css.previewActions}>
            <button type="button" className={css.ghostButton} onClick={() => { setCopied(true) }}><IconCopyOutline16 size={14} />{copied ? '已复制' : '复制话术'}</button>
            <button type="button" className={css.primaryButton} onClick={() => { setQueued(true) }}><IconSendOutline16 size={14} />一键发送</button>
          </div>
        </article>
      </div>

      <section className={clsx(css.card, css.familyHistory)}>
        <SectionHeading title="最近沟通记录" description="家长阅读与回复状态" action={<button type="button" className={css.textButton}>查看全部 18 条</button>} />
        <div className={css.familyHistoryHeader}><span>时间</span><span>学生</span><span>类型</span><span>内容摘要</span><span>结果</span></div>
        {FAMILY_ACTIVITY.map(item => <div key={`${item.time}-${item.student}`} className={css.familyHistoryRow}><span>{item.time}</span><strong>{item.student}</strong><span>{item.type}</span><span>{item.summary}</span><em>{item.result}</em></div>)}
      </section>
    </div>
  )
}

function ToolsView() {
  const [pickedIndex, setPickedIndex] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [scores, setScores] = useState(INITIAL_SCORES)
  const pickedName = PICK_NAMES[pickedIndex]

  return (
    <div className={css.view} data-screen-label="Classroom Toolbox">
      <div className={css.viewTopbar}>
        <div><h2>课堂互动工具箱</h2><p>点名、计时和积分榜，打开即可使用。</p></div>
        <div className={css.toolbarGroup}><IntegrationBadge name="ClassIn" status="投屏就绪" /><IntegrationBadge name="希沃白板" /></div>
      </div>

      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>近 7 天互动</span><strong>12</strong><small>投票 4 · 快测 5 · 反馈 3</small></div>
        <div className={css.metricCard}><span>学生回答</span><strong>326</strong><small>覆盖 42 名学生</small></div>
        <div className={css.metricCard}><span>平均参与率</span><strong>88%</strong><small className={css.successText}>较上周 +4%</small></div>
        <div className={css.metricCard}><span>平均正确率</span><strong>81%</strong><small>薄弱项：误差分析</small></div>
      </div>

      <div className={css.toolboxGrid}>
        <section className={css.toolCard}>
          <div className={css.toolTitle}><span className={css.toolIcon}><IconUserOutline16 size={17} /></span><div><strong>随机点名</strong><span>高二（3）班 · 42 人</span></div></div>
          <div className={css.pickedName}><span>本次同学</span><strong>{pickedName}</strong></div>
          <button type="button" className={css.primaryButton} onClick={() => { setPickedIndex(value => (value + 1) % PICK_NAMES.length) }}>开始点名</button>
        </section>

        <section className={css.toolCard}>
          <div className={css.toolTitle}><span className={css.toolIcon}><IconGoalOutline16 size={17} /></span><div><strong>课堂计时器</strong><span>小组讨论</span></div></div>
          <div className={clsx(css.timerValue, timerRunning && css.timerRunning)}>{timerRunning ? '04:32' : '05:00'}</div>
          <div className={css.timerActions}>
            <button type="button" className={css.primaryButton} onClick={() => { setTimerRunning(value => !value) }}>
              {timerRunning ? <IconPauseOutline16 size={15} /> : <IconPlayOutline16 size={15} />}
              {timerRunning ? '暂停' : '开始'}
            </button>
            <button type="button" className={css.ghostButton} onClick={() => { setTimerRunning(false) }}>重置</button>
          </div>
        </section>

        <section className={css.toolCard}>
          <div className={css.toolTitle}><span className={css.toolIcon}><IconGoalOutline16 size={17} /></span><div><strong>课堂积分榜</strong><span>本节课实时排行</span></div></div>
          <div className={css.scoreList}>
            {SCORE_NAMES.map((name, index) => (
              <div key={name} className={css.scoreRow}>
                <span className={css.rank}>{index + 1}</span><strong>{name}</strong><span>{scores[name]} 分</span>
                <button type="button" onClick={() => { setScores(value => ({ ...value, [name]: value[name] + 1 })) }}>+1</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={clsx(css.card, css.quickTools)}>
        <SectionHeading title="更多快捷工具" description="当前课堂可直接使用" />
        <div className={css.quickToolList}>
          <button type="button"><span>ABCD</span><strong>快速投票</strong><small>收集全班选择</small></button>
          <button type="button"><span>▦</span><strong>分组抽签</strong><small>自动生成 6 组</small></button>
          <button type="button"><span>✦</span><strong>课堂鼓励</strong><small>投屏正向反馈</small></button>
        </div>
      </section>

      <section className={clsx(css.card, css.interactionHistory)}>
        <SectionHeading title="近期互动结果" description="最近 3 次课堂活动" />
        <div><span>09/14 · 匀变速图像快速投票</span><strong>40 / 42 参与</strong><em>正确率 82%</em></div>
        <div><span>09/11 · 自由落体词汇快测</span><strong>42 / 42 参与</strong><em>平均 86 分</em></div>
        <div><span>09/10 · 速度—时间图像离堂反馈</span><strong>38 / 42 参与</strong><em>6 人待巩固</em></div>
      </section>
    </div>
  )
}

function GrowthView() {
  const [note, setNote] = useState('今天的抛体运动实验中，学生对“控制变量”的理解比预期更好。下次可以把数据记录表提前发给各组。')
  const [saved, setSaved] = useState(false)

  return (
    <div className={css.view} data-screen-label="Teacher Growth">
      <div className={css.viewTopbar}>
        <div><h2>教研成长与个人充电</h2><p>记录反思、整理听课意见并跟进前沿资讯。</p></div>
        <div className={css.toolbarGroup}><IntegrationBadge name="Zotero" status="文献已同步" /><IntegrationBadge name="国家智慧教育平台" /></div>
      </div>

      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>培训学时</span><strong>24 / 32</strong><small>本学期目标完成 75%</small></div>
        <div className={css.metricCard}><span>听评课</span><strong>6 / 8</strong><small>市级 2 · 校内 4</small></div>
        <div className={css.metricCard}><span>教研笔记</span><strong>4</strong><small className={css.successText}>本月新增 2 篇</small></div>
        <div className={css.metricCard}><span>待完成反馈</span><strong>2</strong><small>同课异构 · 公开课</small></div>
      </div>

      <div className={css.growthGrid}>
        <section className={clsx(css.card, css.journalCard)}>
          <SectionHeading title="教学日志与反思" description="2026 年 9 月 15 日" action={<span className={css.statusPill}>{saved ? '已保存' : '草稿'}</span>} />
          <textarea value={note} onChange={event => { setNote(event.currentTarget.value); setSaved(false) }} aria-label="教学日志" />
          <div className={css.journalFooter}><span>已关联：抛体运动 · 高二（4）班</span><button type="button" className={css.primaryButton} onClick={() => { setSaved(true) }}>保存日志</button></div>
        </section>

        <section className={clsx(css.card, css.observationCard)}>
          <SectionHeading title="公开课 / 听课记录" description="结构化整理评课要点" action={<button type="button" className={css.iconButton}><IconPlusOutline16 size={15} /></button>} />
          <div className={css.observationItem}><span className={css.dateTile}><strong>21</strong><small>九月</small></span><div><strong>核心素养导向的实验课堂</strong><span>市级公开课 · 李敏老师</span><small>待记录：教学目标、证据链、课堂反馈</small></div></div>
          <div className={css.observationItem}><span className={css.dateTile}><strong>28</strong><small>九月</small></span><div><strong>物理组同课异构</strong><span>校内教研 · 明理楼 501</span><small>已整理 6 条评课要点</small></div></div>
        </section>

        <section className={clsx(css.card, css.resourceCard)}>
          <SectionHeading title="前沿资讯导航" description="论文、政策与优质教研资源" />
          <a href="#teacher-resource-1" className={css.resourceItem}><span className={css.resourceType}>论文</span><span><strong>生成式 AI 支持高中物理探究学习的路径</strong><small>教育研究 · 12 分钟阅读</small></span><IconLinkOutline14 size={14} /></a>
          <a href="#teacher-resource-2" className={css.resourceItem}><span className={css.resourceType}>政策</span><span><strong>普通高中课程方案与学科课程标准更新</strong><small>教育部 · 2026-08</small></span><IconLinkOutline14 size={14} /></a>
          <a href="#teacher-resource-3" className={css.resourceItem}><span className={css.resourceType}>教研</span><span><strong>物理实验数字化工具案例库</strong><small>国家智慧教育平台</small></span><IconLinkOutline14 size={14} /></a>
        </section>

        <section className={clsx(css.card, css.learningCard)}>
          <div className={css.learningIcon}><IconLightOutline16 size={20} /></div>
          <div><span className={css.eyebrow}>个人充电</span><h3>AI 时代的项目式学习设计</h3><p>第 4 章 · 形成性评价与过程证据</p></div>
          <div className={css.progressTrack}><span></span></div>
          <div className={css.learningFooter}><span>完成 68%</span><button type="button" className={css.ghostButton}><IconPlayOutline16 size={14} />继续学习</button></div>
        </section>
      </div>
    </div>
  )
}

/**
 * Render one teacher workbench view.
 * @param props - Active tab selection.
 * @returns The selected local UI view.
 */
export function TeacherView({ tab, onNavigate }: { tab: WorkbenchTab, onNavigate: (tab: WorkbenchTab) => void }) {
  if (tab === 'dashboard') return <TeacherDashboard onNavigate={onNavigate} />
  if (tab === 'habits' || tab === 'records' || tab === 'academics' || tab === 'classes') return <TeacherDataView tab={tab} onNavigate={onNavigate} />
  if (tab === 'schedule') return <ScheduleView />
  if (tab === 'lessons') return <LessonPlanView />
  if (tab === 'students') return <StudentsView />
  if (tab === 'family') return <FamilyView />
  if (tab === 'tools') return <ToolsView />
  return <GrowthView />
}
