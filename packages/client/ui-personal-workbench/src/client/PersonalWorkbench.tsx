import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconCheckOutline16,
  IconChecklistOutline14,
  IconCloseOutline16,
  IconDataOutline16,
  IconLightOutline16,
  IconListPenOutline16,
  IconPlusOutline16,
  IconSendOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PersonalWorkbenchKey } from './locales.ts'
import css from './PersonalWorkbench.module.css'

type PersonalTab = 'today' | 'inbox' | 'projects' | 'learning' | 'ideas' | 'review'
type Scene = 'morning' | 'work' | 'study' | 'evening'

interface CenterColumnBox {
  left: number
  top: number
  right: number
  bottom: number
}

const TABS: readonly { id: PersonalTab, key: PersonalWorkbenchKey }[] = [
  { id: 'today', key: 'tab.today' },
  { id: 'inbox', key: 'tab.inbox' },
  { id: 'projects', key: 'tab.projects' },
  { id: 'learning', key: 'tab.learning' },
  { id: 'ideas', key: 'tab.ideas' },
  { id: 'review', key: 'tab.review' },
]

const SCENES: readonly { id: Scene, label: string }[] = [
  { id: 'morning', label: '早晨' },
  { id: 'work', label: '工作' },
  { id: 'study', label: '学习' },
  { id: 'evening', label: '晚上' },
]

const PLAN_ITEMS = [
  { id: 'p1', time: '09:00', title: '整理产品改版反馈', meta: '工作 · 预计 45 分钟', done: true },
  { id: 'p2', time: '11:00', title: '项目周会与里程碑确认', meta: '澄明计划 · 会议', done: false },
  { id: 'p3', time: '15:30', title: '完成工作台原型第二轮', meta: '个人项目 · 深度工作', done: false },
  { id: 'p4', time: '20:30', title: '阅读英文文章并整理生词', meta: '英语学习 · 30 分钟', done: false },
] as const

const PROJECTS = [
  { name: '澄明计划', note: '个人知识与行动系统', progress: 68, tasks: '12 / 18', color: 'blue' },
  { name: 'DSH 演示片', note: '职业工作台系列内容', progress: 42, tasks: '8 / 19', color: 'violet' },
  { name: '英语表达升级', note: '阅读、词汇与输出练习', progress: 76, tasks: '19 / 25', color: 'green' },
] as const

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
  return { left: rect.left, top: rect.top, right: 0, bottom: window.innerHeight - rect.bottom }
}

function useCenterColumnBox(): CenterColumnBox {
  const [box, setBox] = useState<CenterColumnBox>(() => readCenterColumnBox() ?? { left: 0, top: 0, right: 0, bottom: 0 })
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

function TabIcon({ tab }: { tab: PersonalTab }) {
  if (tab === 'today') return <IconChecklistOutline14 size={15} />
  if (tab === 'inbox') return <IconSendOutline16 size={15} />
  if (tab === 'projects') return <IconDataOutline16 size={15} />
  if (tab === 'learning') return <IconListPenOutline16 size={15} />
  if (tab === 'ideas') return <IconLightOutline16 size={15} />
  return <IconDataOutline16 size={15} />
}

function SectionTitle({ title, note, action }: { title: string, note?: string, action?: ReactNode }) {
  return <div className={css.sectionTitle}><div><strong>{title}</strong>{note !== undefined && <span>{note}</span>}</div>{action}</div>
}

function FlowStrip({ active }: { active: number }) {
  return (
    <div className={css.flowStrip}>
      {['收集', '整理', '执行', '学习', '复盘'].map((item, index) => (
        <div className={clsx(index <= active && css.flowDone)} key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 4 && <i>→</i>}</div>
      ))}
    </div>
  )
}

function TodayView({ scene, completed, togglePlan, goInbox, goProjects }: {
  scene: Scene
  completed: readonly string[]
  togglePlan: (id: string) => void
  goInbox: () => void
  goProjects: () => void
}) {
  const sceneCopy: Record<Scene, { eyebrow: string, title: string, note: string }> = {
    morning: { eyebrow: '早晨场景', title: '早上好，先看清今天最重要的三件事。', note: '4 项计划 · 1 项已完成 · 2 小时 35 分钟专注时间' },
    work: { eyebrow: '工作场景', title: '保持节奏，下一段专注时间从 15:30 开始。', note: '当前项目：DSH 演示片 · 里程碑还剩 3 天' },
    study: { eyebrow: '学习场景', title: '今晚继续英语阅读，复习 12 个待掌握生词。', note: '连续学习 18 天 · 本周已完成 3 次阅读' },
    evening: { eyebrow: '晚上场景', title: '今天完成得不错，留 10 分钟做一个小复盘。', note: '已完成 3 项 · 新收集 4 条 · 待整理 2 条' },
  }
  const copy = sceneCopy[scene]
  return (
    <div className={css.view}>
      <section className={css.hero}>
        <div><span>{copy.eyebrow}</span><h2>{copy.title}</h2><p>{copy.note}</p></div>
        <div className={css.heroDate}><strong>17</strong><span>八月 · 周一</span></div>
      </section>
      <FlowStrip active={2} />
      <div className={css.todayGrid}>
        <section className={css.cardWide}>
          <SectionTitle title="每日计划" note={`${completed.length + 1} / ${PLAN_ITEMS.length} 已完成`} action={<button type="button" className={css.textButton}>查看本周</button>} />
          <div className={css.planList}>
            {PLAN_ITEMS.map(item => {
              const done = item.done || completed.includes(item.id)
              return (
                <button type="button" className={clsx(done && css.planDone)} key={item.id} onClick={() => { if (!item.done) togglePlan(item.id) }}>
                  <span className={css.planCheck}>{done && <IconCheckOutline16 size={13} />}</span>
                  <time>{item.time}</time><div><strong>{item.title}</strong><small>{item.meta}</small></div>
                </button>
              )
            })}
          </div>
        </section>
        <section className={css.card}>
          <SectionTitle title="快速备忘" note="随手记下，不打断当前节奏" />
          <div className={css.memoPaper}><p>下次视频开头直接对比“固定软件”和“可以生长的软件”。</p><span>今天 08:42 · 灵感</span></div>
          <button type="button" className={css.ghostButton}>+ 写一条备忘</button>
        </section>
        <section className={css.card}>
          <SectionTitle title="万能收件箱" note="2 条待整理" action={<button type="button" className={css.textButton} onClick={goInbox}>打开</button>} />
          <button type="button" className={css.inboxPreview} onClick={goInbox}><span>英文文章</span><strong>How great teams build learning systems</strong><small>等待整理 · 6 分钟前</small></button>
          <button type="button" className={css.inboxPreview} onClick={goInbox}><span>语音备忘</span><strong>个人工作台演示顺序</strong><small>已转成文字 · 28 分钟前</small></button>
        </section>
        <section className={css.cardWide}>
          <SectionTitle title="正在推进的项目" note="3 个活跃项目" action={<button type="button" className={css.textButton} onClick={goProjects}>进入项目空间</button>} />
          <div className={css.projectPreviewGrid}>
            {PROJECTS.map(project => <button type="button" key={project.name} onClick={goProjects}><span className={css[project.color]} /><strong>{project.name}</strong><small>{project.note}</small><div><i style={{ width: `${project.progress}%` }} /></div><em>{project.progress}% · {project.tasks} 项</em></button>)}
          </div>
        </section>
        <section className={css.card}>
          <SectionTitle title="英语学习" note="连续 18 天" />
          <div className={css.studySummary}><strong>12</strong><span>个待复习生词</span><div><i style={{ width: '72%' }} /></div><small>本周目标完成 72%</small></div>
        </section>
        <section className={css.card}>
          <SectionTitle title="今日灵感" note="3 条新想法" />
          <div className={css.ideaChips}><span>软件基座</span><span>职业工作台</span><span>信息闭环</span><p>“真正个性化的软件，不是换颜色，而是改变信息流。”</p></div>
        </section>
      </div>
    </div>
  )
}

function InboxView({ captured, setCaptured, processed, setProcessed, navigate }: {
  captured: boolean
  setCaptured: (value: boolean) => void
  processed: boolean
  setProcessed: (value: boolean) => void
  navigate: (tab: PersonalTab) => void
}) {
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>万能收件箱</h2><p>先收集，再把内容放到它真正属于的位置。</p></div><span className={css.demoBadge}>模拟整理 · 不调用 AI</span></div>
      <FlowStrip active={processed ? 4 : captured ? 1 : 0} />
      <section className={css.captureBox}>
        <div><span>链接、文字或临时想法</span><strong>https://example.com/how-great-teams-build-learning-systems</strong></div>
        <button type="button" onClick={() => { setCaptured(true) }}>{captured ? <><IconCheckOutline16 size={14} />已放入收件箱</> : <><IconPlusOutline16 size={14} />放入收件箱</>}</button>
      </section>
      {captured && (
        <div className={css.inboxLayout}>
          <section className={css.cardWide}>
            <SectionTitle title="待整理内容" note="刚刚收集" />
            <article className={css.articleCard}>
              <div className={css.articleCover}>EN</div>
              <div><span>英文文章 · 8 分钟阅读</span><h3>How great teams build learning systems</h3><p>文章讨论团队如何把零散信息转成可复用知识，并在实际项目中持续复盘。</p><div><em>learning loop</em><em>compound knowledge</em><em>reflection</em></div></div>
              <button type="button" onClick={() => { setProcessed(true) }}>{processed ? '已完成整理' : '整理这篇文章'}</button>
            </article>
          </section>
          <aside className={css.card}>
            <SectionTitle title="整理规则" note="本地演示" />
            <div className={css.rules}><div><span>英文词汇</span><strong>放入英语学习</strong></div><div><span>关键观点</span><strong>放入灵感收集</strong></div><div><span>后续行动</span><strong>加入晚间计划</strong></div></div>
          </aside>
        </div>
      )}
      {processed && (
        <section className={css.processResult}>
          <header><IconCheckOutline16 size={16} /><div><strong>内容已完成模拟整理</strong><span>一份输入，进入三个需要它的模块</span></div></header>
          <div>
            <button type="button" onClick={() => { navigate('learning') }}><span>英语学习</span><strong>新增 3 个生词</strong><small>compound · reflection · retention</small></button>
            <button type="button" onClick={() => { navigate('ideas') }}><span>灵感收集</span><strong>新增 1 条观点</strong><small>知识只有进入行动与复盘，才会产生复利。</small></button>
            <button type="button" onClick={() => { navigate('today') }}><span>每日计划</span><strong>今晚 20:30 阅读复盘</strong><small>30 分钟 · 英语学习</small></button>
          </div>
        </section>
      )}
    </div>
  )
}

function ProjectsView() {
  const [selected, setSelected] = useState('DSH 演示片')
  const project = PROJECTS.find(item => item.name === selected) ?? PROJECTS[1]
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>项目空间</h2><p>把任务、资料、笔记和阶段进度放在同一个上下文里。</p></div><button type="button" className={css.primaryButton}>+ 新建项目</button></div>
      <div className={css.projectLayout}>
        <section className={css.projectList}>
          {PROJECTS.map(item => <button type="button" className={item.name === project.name ? css.selectedProject : undefined} key={item.name} onClick={() => { setSelected(item.name) }}><span className={css[item.color]} /><div><strong>{item.name}</strong><small>{item.note}</small><div><i style={{ width: `${item.progress}%` }} /></div></div><em>{item.progress}%</em></button>)}
          <button type="button" className={css.archivedProject}><span />归档项目 · 4</button>
        </section>
        <div className={css.projectDetail}>
          <section className={css.projectHero}>
            <div><span>内容项目 · 8 月 14 日更新</span><h2>{project.name}</h2><p>{project.note}。用教师、销售和个人工作台展示同一个软件基座如何长成不同产品。</p></div>
            <div className={css.projectProgress}><strong>{project.progress}%</strong><span>总进度</span><div><i style={{ width: `${project.progress}%` }} /></div></div>
          </section>
          <div className={css.projectDetailGrid}>
            <section className={css.cardWide}>
              <SectionTitle title="本周任务" note="8 / 19 已完成" />
              <div className={css.projectTasks}>
                <div className={css.taskDone}><IconCheckOutline16 size={14} /><div><strong>确定三类工作台叙事顺序</strong><small>已完成 · 周六</small></div><span>内容</span></div>
                <div><span className={css.emptyCheck} /><div><strong>完成销售工作台录屏脚本</strong><small>今天 · 高优先级</small></div><span>脚本</span></div>
                <div><span className={css.emptyCheck} /><div><strong>录制个人工作台信息闭环</strong><small>明天 · 预计 40 分钟</small></div><span>录制</span></div>
                <div><span className={css.emptyCheck} /><div><strong>整理三套界面对比镜头</strong><small>周三 · 等待素材</small></div><span>剪辑</span></div>
              </div>
            </section>
            <section className={css.card}>
              <SectionTitle title="项目资料" note="7 项" />
              <div className={css.resourceList}><button><span>文档</span><strong>工作台叙事结构.md</strong><small>今天 09:16</small></button><button><span>图片</span><strong>教师工作台 Dashboard</strong><small>昨天 18:22</small></button><button><span>链接</span><strong>软件基座选题资料</strong><small>8 月 15 日</small></button></div>
            </section>
          </div>
          <section className={css.milestones}><div className={css.completeMilestone}><span /><strong>选题确认</strong><small>8 月 14 日</small></div><i /><div className={css.currentMilestone}><span /><strong>界面完成</strong><small>8 月 17 日</small></div><i /><div><span /><strong>录屏完成</strong><small>8 月 20 日</small></div><i /><div><span /><strong>发布</strong><small>8 月 23 日</small></div></section>
        </div>
      </div>
    </div>
  )
}

function LearningView({ processed }: { processed: boolean }) {
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>英语学习</h2><p>阅读、词汇和表达练习放在一个连续节奏中。</p></div><span className={css.streakBadge}>连续学习 18 天</span></div>
      <div className={css.learningMetrics}><div><strong>{processed ? 15 : 12}</strong><span>待复习生词</span></div><div><strong>3</strong><span>本周阅读</span></div><div><strong>42 分钟</strong><span>本周学习</span></div><div><strong>72%</strong><span>周目标</span></div></div>
      <div className={css.learningGrid}>
        <section className={css.cardWide}>
          <SectionTitle title="今日词汇" note={processed ? '刚从收件箱新增 3 个' : '12 个待掌握'} action={<button type="button" className={css.textButton}>开始复习</button>} />
          <div className={css.wordTable}>
            <div><span>单词</span><span>释义</span><span>来源</span><span>掌握度</span></div>
            {[
              ['compound', '积累并产生复利', 'Learning systems', '新词'],
              ['reflection', '反思；回顾', 'Learning systems', '新词'],
              ['retention', '保留；记忆保持', 'Learning systems', '新词'],
              ['deliberate', '有意识的；审慎的', 'Design practice', '复习中'],
              ['coherent', '连贯一致的', 'Product thinking', '已掌握'],
            ].slice(0, processed ? 5 : 2).map(row => <button type="button" key={row[0]}>{row.map(cell => <span key={cell}>{cell}</span>)}</button>)}
          </div>
        </section>
        <section className={css.card}>
          <SectionTitle title="本周节奏" note="目标 5 天" />
          <div className={css.weekRhythm}>{['一', '二', '三', '四', '五', '六', '日'].map((day, index) => <div key={day}><span style={{ height: `${[72, 48, 88, 60, 82, 35, 18][index]}%` }} /><small>{day}</small></div>)}</div>
          <p className={css.rhythmNote}>已完成 3 次阅读和 2 次词汇复习，周末安排一次英文输出。</p>
        </section>
      </div>
      <section className={css.cardWide}>
        <SectionTitle title="正在阅读" note="万能收件箱 · 今天加入" />
        <div className={css.readingCard}><div className={css.articleCover}>EN</div><div><strong>How great teams build learning systems</strong><p>阅读进度 46% · 已标记 3 个生词与 1 条关键观点</p><div><i style={{ width: '46%' }} /></div></div><button type="button" className={css.primaryButton}>继续阅读</button></div>
      </section>
    </div>
  )
}

function IdeasView({ processed }: { processed: boolean }) {
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>灵感收集</h2><p>把零散想法积累成可以继续发展的主题。</p></div><button type="button" className={css.primaryButton}>+ 记录灵感</button></div>
      <div className={css.ideaFilters}><button className={css.selectedFilter}>全部 38</button><button>产品 12</button><button>内容 9</button><button>学习 7</button><button>生活 10</button></div>
      <div className={css.ideaBoard}>
        {processed && <article className={clsx(css.ideaCard, css.newIdea)}><span>刚从收件箱整理</span><blockquote>知识只有进入行动与复盘，才会产生复利。</blockquote><p>可以把收集、行动、复盘做成一条可见的信息流。</p><footer><em>学习系统</em><time>刚刚</time></footer></article>}
        <article className={css.ideaCard}><span>内容表达</span><blockquote>真正个性化的软件，不是换颜色，而是改变信息流。</blockquote><p>教师、销售、个人工作台都应该有自己的核心动作。</p><footer><em>软件基座</em><time>今天 08:42</time></footer></article>
        <article className={css.ideaCard}><span>产品</span><blockquote>先让用户看见一个完整闭环，再解释底层能力。</blockquote><p>录屏从“今天要做什么”开始，比从设置页开始更容易理解。</p><footer><em>演示设计</em><time>昨天</time></footer></article>
        <article className={css.ideaCard}><span>学习</span><blockquote>阅读后的第一步不是收藏，而是决定它会改变什么。</blockquote><p>每篇文章至少沉淀一个词汇、一条观点或一个行动。</p><footer><em>阅读方法</em><time>8 月 15 日</time></footer></article>
        <article className={css.ideaCard}><span>生活</span><blockquote>晚上只安排低阻力的收尾动作。</blockquote><p>10 分钟复盘、整理明天第一项任务，然后结束工作。</p><footer><em>日常节奏</em><time>8 月 14 日</time></footer></article>
      </div>
    </div>
  )
}

function ReviewView({ processed, completedCount }: { processed: boolean, completedCount: number }) {
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>每周复盘</h2><p>第 33 周 · 8 月 11 日—17 日</p></div><button type="button" className={css.primaryButton}>生成本周复盘</button></div>
      <FlowStrip active={4} />
      <div className={css.reviewMetrics}><div><span>完成事项</span><strong>{18 + completedCount}</strong><small>计划完成率 86%</small></div><div><span>专注时间</span><strong>12.6h</strong><small>较上周 +1.8h</small></div><div><span>学习内容</span><strong>{processed ? 7 : 6}</strong><small>3 篇文章 · {processed ? 15 : 12} 个词</small></div><div><span>新灵感</span><strong>{processed ? 9 : 8}</strong><small>4 条进入项目</small></div></div>
      <div className={css.reviewGrid}>
        <section className={css.cardWide}>
          <SectionTitle title="本周完成趋势" note="每天完成事项" />
          <div className={css.reviewChart}>{[3, 4, 2, 5, 4, 2, 1].map((value, index) => <div key={index}><strong>{value}</strong><span style={{ height: `${value * 16}%` }} /><small>{['一', '二', '三', '四', '五', '六', '日'][index]}</small></div>)}</div>
        </section>
        <section className={css.card}>
          <SectionTitle title="本周关键词" note="来自项目、学习与灵感" />
          <div className={css.keywordCloud}><strong>软件基座</strong><span>信息闭环</span><em>职业工作台</em><span>学习系统</span><small>个人节奏</small><em>模拟交互</em></div>
        </section>
      </div>
      <div className={css.reviewGrid}>
        <section className={css.cardWide}><SectionTitle title="值得保留" /><div className={css.reviewNotes}><p>先完成可见界面，再讨论抽象能力，沟通效率更高。</p><p>上午安排内容结构，下午做界面，晚上只做轻量复盘。</p><p>英文文章进入收件箱后立即整理，比单纯收藏更有价值。</p></div></section>
        <section className={css.card}><SectionTitle title="下周调整" /><div className={css.reviewNotes}><p>减少同时推进的内容项目，只保留两个主线。</p><p>给英语输出留一个固定的周末时间。</p></div></section>
      </div>
    </div>
  )
}

function ModulePicker({ added, toggle, close }: { added: readonly string[], toggle: (name: string) => void, close: () => void }) {
  const modules = [
    ['专注空间', '计时、当前任务与免打扰状态'],
    ['稍后阅读', '文章队列与阅读进度'],
    ['个人知识库', '主题、笔记与双向关联'],
    ['习惯状态', '睡眠、运动与连续记录'],
    ['生活管理', '采购、账单与家庭事项'],
  ] as const
  return (
    <div className={css.pickerBackdrop}>
      <section className={css.modulePicker} aria-label="添加模块">
        <header><div><strong>添加工作台模块</strong><span>选择一个模块加入当前布局 · 仅视觉演示</span></div><button type="button" aria-label="关闭添加模块" onClick={close}><IconCloseOutline16 /></button></header>
        <div>{modules.map(([name, note]) => {
          const active = added.includes(name)
          return <button type="button" className={active ? css.addedModule : undefined} key={name} onClick={() => { toggle(name) }}><span><IconLightOutline16 size={17} /></span><div><strong>{name}</strong><small>{note}</small></div><em>{active ? '已添加' : '添加'}</em></button>
        })}</div>
      </section>
    </div>
  )
}

export type PersonalWorkbenchEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'personalWorkbench'>

export function PersonalWorkbenchEntry({ wide, t }: PersonalWorkbenchEntryProps) {
  const [open, setOpen] = useState(false)
  const panelId = 'dsh-personal-workbench-panel'
  return (
    <>
      <Tooltip label={t('entry')} delayMs={500} disabled={wide}>
        <button type="button" className={clsx(css.trigger, !wide && css.rail)} aria-expanded={open} aria-controls={panelId} onClick={() => { setOpen(value => !value) }}>
          <IconLightOutline16 size={wide ? 16 : 18} />
          {wide && <span>{t('entry')}</span>}
        </button>
      </Tooltip>
      {open && <PersonalWorkbenchPanel panelId={panelId} t={t} onClose={() => { setOpen(false) }} />}
    </>
  )
}

function PersonalWorkbenchPanel({ panelId, t, onClose }: { panelId: string, t: (key: PersonalWorkbenchKey) => string, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<PersonalTab>('today')
  const [scene, setScene] = useState<Scene>('work')
  const [completedPlan, setCompletedPlan] = useState<readonly string[]>([])
  const [captured, setCaptured] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [addedModules, setAddedModules] = useState<readonly string[]>([])
  const box = useCenterColumnBox()

  const togglePlan = (id: string): void => {
    setCompletedPlan(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id])
  }
  const toggleModule = (name: string): void => {
    setAddedModules(value => value.includes(name) ? value.filter(item => item !== name) : [...value, name])
  }

  return (
    <aside id={panelId} className={css.panel} style={{ left: box.left, top: box.top, right: box.right, bottom: box.bottom }} aria-label={t('title')} data-screen-label="Personal Workbench">
      <header className={css.header}>
        <div className={css.brand}><span><IconLightOutline16 size={18} /></span><div><strong>{t('title')}</strong><small>{t('subtitle')}</small></div></div>
        <div className={css.headerTools}>
          <div className={css.sceneSwitch}>{SCENES.map(item => <button type="button" className={scene === item.id ? css.activeScene : undefined} key={item.id} onClick={() => { setScene(item.id) }}>{item.label}</button>)}</div>
          <button type="button" className={css.addModuleButton} onClick={() => { setPickerOpen(true) }}><IconPlusOutline16 size={14} />添加模块{addedModules.length > 0 && <span>{addedModules.length}</span>}</button>
          <button type="button" className={css.closeButton} aria-label={t('close')} onClick={onClose}><IconCloseOutline16 /></button>
        </div>
      </header>
      <nav className={css.tabs} aria-label="个人工作台功能">
        {TABS.map(tab => <button type="button" className={activeTab === tab.id ? css.activeTab : undefined} key={tab.id} onClick={() => { setActiveTab(tab.id) }}><TabIcon tab={tab.id} /><span>{t(tab.key)}</span>{tab.id === 'inbox' && <em>{processed ? 1 : 2}</em>}</button>)}
      </nav>
      <main className={css.content}>
        {activeTab === 'today' && <TodayView scene={scene} completed={completedPlan} togglePlan={togglePlan} goInbox={() => { setActiveTab('inbox') }} goProjects={() => { setActiveTab('projects') }} />}
        {activeTab === 'inbox' && <InboxView captured={captured} setCaptured={setCaptured} processed={processed} setProcessed={setProcessed} navigate={setActiveTab} />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'learning' && <LearningView processed={processed} />}
        {activeTab === 'ideas' && <IdeasView processed={processed} />}
        {activeTab === 'review' && <ReviewView processed={processed} completedCount={completedPlan.length} />}
      </main>
      {pickerOpen && <ModulePicker added={addedModules} toggle={toggleModule} close={() => { setPickerOpen(false) }} />}
    </aside>
  )
}
