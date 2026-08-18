import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconCheckOutline16,
  IconChecklistOutline14,
  IconCloseOutline16,
  IconDataOutline16,
  IconListPenOutline16,
  IconSendOutline16,
  IconUserOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SalesWorkbenchKey } from './locales.ts'
import css from './SalesWorkbench.module.css'

type SalesTab = 'dashboard' | 'customers' | 'pipeline' | 'followups' | 'contracts' | 'team'

interface CenterColumnBox {
  left: number
  top: number
  right: number
  bottom: number
}

const TABS: readonly { id: SalesTab, key: SalesWorkbenchKey }[] = [
  { id: 'dashboard', key: 'tab.dashboard' },
  { id: 'customers', key: 'tab.customers' },
  { id: 'pipeline', key: 'tab.pipeline' },
  { id: 'followups', key: 'tab.followups' },
  { id: 'contracts', key: 'tab.contracts' },
  { id: 'team', key: 'tab.team' },
]

const CUSTOMERS = [
  { id: 'cloud', name: '云极科技', industry: '企业软件', owner: '林澈', level: 'A', amount: '¥128 万', stage: '方案沟通', last: '今天 10:20', risk: '缺少财务决策人' },
  { id: 'ocean', name: '海岳物流', industry: '智慧物流', owner: '周妍', level: 'A', amount: '¥96 万', stage: '商务谈判', last: '昨天 16:40', risk: '报价后 8 天未反馈' },
  { id: 'star', name: '星图医药', industry: '医药零售', owner: '顾言', level: 'B', amount: '¥72 万', stage: '需求确认', last: '8 月 15 日', risk: '采购预算待确认' },
  { id: 'forest', name: '森川制造', industry: '先进制造', owner: '林澈', level: 'B', amount: '¥54 万', stage: '初步接触', last: '8 月 14 日', risk: '首次会议待安排' },
] as const

const FUNNEL = [
  { label: '线索', count: 126, value: '¥1,860 万', width: 100 },
  { label: '需求确认', count: 48, value: '¥1,120 万', width: 78 },
  { label: '方案沟通', count: 23, value: '¥720 万', width: 60 },
  { label: '商务谈判', count: 11, value: '¥438 万', width: 43 },
  { label: '成交', count: 7, value: '¥286 万', width: 30 },
] as const

const DEALS = [
  { id: 'forest', company: '森川制造', owner: '林澈', amount: 54, stage: '初步接触', probability: 20 },
  { id: 'star', company: '星图医药', owner: '顾言', amount: 72, stage: '需求确认', probability: 35 },
  { id: 'cloud', company: '云极科技', owner: '林澈', amount: 128, stage: '方案沟通', probability: 55 },
  { id: 'ocean', company: '海岳物流', owner: '周妍', amount: 96, stage: '商务谈判', probability: 75 },
  { id: 'newenergy', company: '清源能源', owner: '谢宁', amount: 62, stage: '商务谈判', probability: 80 },
  { id: 'pine', company: '松岚零售', owner: '顾言', amount: 88, stage: '成交', probability: 100 },
] as const

const FOLLOWUPS = [
  { id: 'f1', time: '09:30', type: '电话', customer: '森川制造', detail: '确认技术负责人及首次演示时间', owner: '林澈' },
  { id: 'f2', time: '11:00', type: '会议', customer: '云极科技', detail: '方案评审 · 采购与信息化负责人参加', owner: '林澈' },
  { id: 'f3', time: '14:20', type: '消息', customer: '海岳物流', detail: '跟进报价反馈和法务条款', owner: '周妍' },
  { id: 'f4', time: '16:00', type: '会议', customer: '星图医药', detail: '门店试点范围确认', owner: '顾言' },
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

function TabIcon({ tab }: { tab: SalesTab }) {
  if (tab === 'dashboard' || tab === 'pipeline') return <IconDataOutline16 size={15} />
  if (tab === 'customers' || tab === 'team') return <IconUserOutline16 size={15} />
  if (tab === 'followups') return <IconChecklistOutline14 size={15} />
  return <IconListPenOutline16 size={15} />
}

function SectionTitle({ title, note, action }: { title: string, note?: string, action?: ReactNode }) {
  return (
    <div className={css.sectionTitle}>
      <div><strong>{title}</strong>{note !== undefined && <span>{note}</span>}</div>
      {action}
    </div>
  )
}

function DashboardView({
  gapOpen, setGapOpen, openCustomer, openPipeline, doneFollowups, toggleFollowup,
}: {
  gapOpen: boolean
  setGapOpen: (value: boolean) => void
  openCustomer: (id: string) => void
  openPipeline: () => void
  doneFollowups: readonly string[]
  toggleFollowup: (id: string) => void
}) {
  return (
    <div className={css.view}>
      <div className={css.viewHeading}>
        <div><h2>销售驾驶舱</h2><p>从线索到回款的团队经营视图 · 数据更新于今天 10:42</p></div>
        <span className={css.demoBadge}>演示数据 · 本地 UI</span>
      </div>

      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>本月已成交</span><strong>¥504 万</strong><small>目标 ¥700 万 · 同比 +18%</small></div>
        <div className={css.metricCard}><span>目标完成率</span><strong>72%</strong><div className={css.progress}><span style={{ width: '72%' }} /></div></div>
        <div className={css.metricCard}><span>加权销售预测</span><strong>¥632 万</strong><small>较昨日增加 ¥24 万</small></div>
        <button type="button" className={clsx(css.metricCard, css.riskMetric, gapOpen && css.activeMetric)} onClick={() => { setGapOpen(!gapOpen) }}>
          <span>目标缺口</span><strong>¥196 万</strong><small>3 笔高风险商机 · 点击展开</small>
        </button>
      </div>

      {gapOpen && (
        <section className={css.riskStrip}>
          <SectionTitle title="影响目标的高风险商机" note="按预计成交时间与风险等级排序" action={<button type="button" className={css.textButton} onClick={openPipeline}>查看完整漏斗</button>} />
          <div className={css.riskDeals}>
            {[
              ['云极科技', '¥128 万', '缺少财务决策人', '今天约见采购负责人'],
              ['海岳物流', '¥96 万', '报价后 8 天未反馈', '下午跟进法务条款'],
              ['星图医药', '¥72 万', '预算范围尚未确认', '周三补充试点方案'],
            ].map(([name, amount, risk, next]) => (
              <button key={name} type="button" onClick={() => { if (name === '云极科技') openCustomer('cloud') }}>
                <span><strong>{name}</strong><em>{amount}</em></span><small>{risk}</small><small>下一步：{next}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className={css.dashboardGrid}>
        <section className={css.card}>
          <SectionTitle title="销售漏斗" note="本月新增 36 条线索 · 金额单位：万元" action={<button type="button" className={css.textButton} onClick={openPipeline}>进入漏斗</button>} />
          <div className={css.funnel}>
            {FUNNEL.map(row => (
              <div className={css.funnelRow} key={row.label}>
                <span>{row.label}</span>
                <div><span style={{ width: `${row.width}%` }} /></div>
                <strong>{row.count}</strong>
                <small>{row.value}</small>
              </div>
            ))}
          </div>
          <div className={css.funnelFooter}><span>线索 → 成交转化率</span><strong>5.6%</strong><em>较上月 +1.2%</em></div>
        </section>

        <section className={css.card}>
          <SectionTitle title="今日跟进" note={`${FOLLOWUPS.length - doneFollowups.length} 项待处理`} />
          <div className={css.followupList}>
            {FOLLOWUPS.slice(0, 3).map(item => {
              const done = doneFollowups.includes(item.id)
              return (
                <div className={clsx(css.followupRow, done && css.doneRow)} key={item.id}>
                  <time>{item.time}</time><span className={css.typePill}>{item.type}</span>
                  <div><strong>{item.customer}</strong><small>{item.detail}</small></div>
                  <button type="button" onClick={() => { toggleFollowup(item.id) }}>{done ? <IconCheckOutline16 size={14} /> : '完成'}</button>
                </div>
              )
            })}
          </div>
        </section>

        <section className={css.card}>
          <SectionTitle title="重点商机" note="预计本月成交" />
          <div className={css.dealTable}>
            <div className={css.tableHead}><span>客户</span><span>阶段</span><span>金额</span><span>负责人</span></div>
            {CUSTOMERS.slice(0, 3).map(customer => (
              <button type="button" key={customer.id} onClick={() => { openCustomer(customer.id) }}>
                <strong>{customer.name}</strong><span>{customer.stage}</span><span>{customer.amount}</span><span>{customer.owner}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={css.card}>
          <SectionTitle title="团队排行" note="按本月回款" />
          <div className={css.ranking}>
            {[
              ['1', '林澈', '¥168 万', '84%', 84],
              ['2', '周妍', '¥142 万', '78%', 78],
              ['3', '顾言', '¥116 万', '69%', 69],
              ['4', '谢宁', '¥78 万', '56%', 56],
            ].map(([rank, name, value, rate, width]) => (
              <div key={name}><b>{rank}</b><span>{name}</span><div><i style={{ width: `${width}%` }} /></div><strong>{value}</strong><small>{rate}</small></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function CustomersView({
  selectedId, setSelectedId, warCard, setWarCard, meetingDone, setMeetingDone,
}: {
  selectedId: string
  setSelectedId: (id: string) => void
  warCard: boolean
  setWarCard: (value: boolean) => void
  meetingDone: boolean
  setMeetingDone: (value: boolean) => void
}) {
  const customer = CUSTOMERS.find(item => item.id === selectedId) ?? CUSTOMERS[0]
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>线索与客户</h2><p>客户全景、关键关系与沟通时间线</p></div><button type="button" className={css.primaryButton}>+ 新建线索</button></div>
      <div className={css.customerLayout}>
        <section className={css.customerListCard}>
          <div className={css.searchBox}>搜索客户、联系人或负责人</div>
          <div className={css.customerFilters}><button className={css.selectedFilter}>全部 126</button><button>A 级 18</button><button>待跟进 12</button></div>
          <div className={css.customerRows}>
            {CUSTOMERS.map(item => (
              <button type="button" className={clsx(item.id === customer.id && css.selectedCustomer)} key={item.id} onClick={() => { setSelectedId(item.id); setWarCard(false); setMeetingDone(false) }}>
                <span className={css.customerAvatar}>{item.name.slice(0, 1)}</span>
                <div><strong>{item.name}</strong><span>{item.industry} · {item.owner}</span><small>{item.last} · {item.stage}</small></div>
                <div className={css.customerAmount}><em>{item.level}</em><strong>{item.amount}</strong></div>
              </button>
            ))}
          </div>
        </section>

        <div className={css.customerDetail}>
          <section className={css.card}>
            <div className={css.companyHeader}>
              <span className={css.companyLogo}>{customer.name.slice(0, 1)}</span>
              <div><h3>{customer.name}</h3><p>{customer.industry} · 上海 · 620 人</p></div>
              <span className={css.levelBadge}>{customer.level} 级客户</span>
              <button type="button" className={css.primaryButton} onClick={() => { setWarCard(true) }}>{warCard ? '作战卡已生成' : '生成会前作战卡'}</button>
            </div>
            <div className={css.companyStats}>
              <div><span>在谈商机</span><strong>{customer.amount}</strong></div><div><span>预计成交</span><strong>8 月 28 日</strong></div><div><span>负责人</span><strong>{customer.owner}</strong></div><div><span>风险</span><strong>{customer.risk}</strong></div>
            </div>
          </section>

          <div className={css.detailGrid}>
            <section className={css.card}>
              <SectionTitle title="客户关系图" note="4 位关键角色" />
              <div className={css.relationMap}>
                <div className={css.relationCenter}>云极科技</div>
                <div className={css.personNode}><b>陈</b><span>陈思远</span><small>业务决策人 · 支持</small></div>
                <div className={css.personNode}><b>许</b><span>许棠</span><small>采购负责人 · 中立</small></div>
                <div className={css.personNode}><b>宋</b><span>宋简</span><small>技术负责人 · 强支持</small></div>
                <div className={css.personNode}><b>顾</b><span>顾遥</span><small>财务负责人 · 未建立</small></div>
              </div>
            </section>
            <section className={css.card}>
              <SectionTitle title="沟通时间线" note="最近 30 天" />
              <div className={css.timeline}>
                <div><time>今天 10:20</time><span>客户确认方案评审会参会人，采购负责人将加入。</span></div>
                <div><time>8 月 15 日</time><span>完成技术验证，接口与单点登录方案通过。</span></div>
                <div><time>8 月 11 日</time><span>首次方案演示，客户关注部署周期与培训成本。</span></div>
                {meetingDone && <div className={css.newTimeline}><time>刚刚</time><span>会议复盘已生成：确认 9 月试点，下一步提交商务报价。</span></div>}
              </div>
            </section>
          </div>

          {warCard && (
            <section className={css.warCard}>
              <div className={css.warCardHeader}><div><strong>云极科技 · 会前作战卡</strong><span>方案评审会 · 今天 11:00</span></div><span>模拟生成</span></div>
              <div className={css.warGrid}>
                <div><span>会议目标</span><strong>确认试点范围、预算与决策流程</strong></div>
                <div><span>已知异议</span><strong>部署周期偏长，担心一线使用成本</strong></div>
                <div><span>关键缺口</span><strong>尚未接触财务负责人顾遥</strong></div>
                <div><span>推荐话术</span><strong>先用 3 个部门的 6 周试点降低切换风险</strong></div>
              </div>
              <button type="button" className={css.primaryButton} onClick={() => { setMeetingDone(true) }}>{meetingDone ? '会议摘要已生成' : '模拟会议结束并生成复盘'}</button>
              {meetingDone && <div className={css.summaryBanner}><IconCheckOutline16 size={15} /><span>已提取 3 项需求、1 个异议，并生成“8 月 19 日提交商务报价”下一步任务。</span></div>}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function PipelineView({ promoted, setPromoted }: { promoted: boolean, setPromoted: (value: boolean) => void }) {
  const stages = ['初步接触', '需求确认', '方案沟通', '商务谈判', '成交'] as const
  return (
    <div className={css.view}>
      <div className={css.viewHeading}>
        <div><h2>商机漏斗</h2><p>23 笔进行中商机 · 总金额 ¥720 万</p></div>
        <div className={css.forecastPill}><span>加权预测</span><strong>{promoted ? '¥658 万' : '¥632 万'}</strong><em>{promoted ? '+¥26 万' : '本月'}</em></div>
      </div>
      <div className={css.pipelineBoard}>
        {stages.map(stage => {
          const deals = DEALS.filter(deal => (deal.id === 'cloud' ? (promoted ? '商务谈判' : '方案沟通') : deal.stage) === stage)
          return (
            <section className={css.pipelineColumn} key={stage}>
              <header><strong>{stage}</strong><span>{deals.length} 笔</span></header>
              <div className={css.columnTotal}>¥{deals.reduce((sum, item) => sum + item.amount, 0)} 万</div>
              {deals.map(deal => (
                <article className={clsx(css.dealCard, deal.id === 'cloud' && css.focusDeal)} key={deal.id}>
                  <div><strong>{deal.company}</strong><span>{deal.probability}%</span></div>
                  <b>¥{deal.amount} 万</b>
                  <small>{deal.owner} · 预计 8 月成交</small>
                  <div className={css.dealProgress}><span style={{ width: `${deal.probability}%` }} /></div>
                  {deal.id === 'cloud' && !promoted && <button type="button" onClick={() => { setPromoted(true) }}>推进到商务谈判 →</button>}
                  {deal.id === 'cloud' && promoted && <em className={css.movedBadge}><IconCheckOutline16 size={12} />阶段已更新</em>}
                </article>
              ))}
              <button type="button" className={css.addDeal}>+ 添加商机</button>
            </section>
          )
        })}
      </div>
      {promoted && <div className={css.pipelineNotice}><IconCheckOutline16 size={15} />云极科技已从“方案沟通”推进至“商务谈判”，加权预测增加 ¥26 万。</div>}
    </div>
  )
}

function FollowupsView({ doneIds, toggle }: { doneIds: readonly string[], toggle: (id: string) => void }) {
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>跟进中心</h2><p>统一查看电话、会议、消息和逾期事项</p></div><button type="button" className={css.primaryButton}>+ 新建跟进</button></div>
      <div className={css.followupSummary}>
        <div><strong>4</strong><span>今天待办</span></div><div><strong>2</strong><span>会议</span></div><div><strong>1</strong><span>逾期</span></div><div><strong>{doneIds.length}</strong><span>今日已完成</span></div>
      </div>
      <div className={css.followupLayout}>
        <section className={css.card}>
          <SectionTitle title="今天 · 8 月 17 日" note="按时间排序" />
          <div className={css.fullFollowupList}>
            {FOLLOWUPS.map(item => {
              const done = doneIds.includes(item.id)
              return (
                <div className={clsx(done && css.doneRow)} key={item.id}>
                  <time>{item.time}</time><span className={css.typePill}>{item.type}</span>
                  <div><strong>{item.customer}</strong><p>{item.detail}</p><small>负责人：{item.owner}</small></div>
                  <button type="button" onClick={() => { toggle(item.id) }}>{done ? <><IconCheckOutline16 size={14} />已完成</> : '完成跟进'}</button>
                </div>
              )
            })}
          </div>
        </section>
        <aside className={css.card}>
          <SectionTitle title="下一步任务" note="由模拟跟进结果整理" />
          <div className={css.nextSteps}>
            <div><span>今天 17:30</span><strong>向海岳物流补发法务条款说明</strong><small>周妍 · 商务谈判</small></div>
            <div><span>8 月 19 日</span><strong>提交云极科技正式商务报价</strong><small>林澈 · 方案沟通</small></div>
            {doneIds.includes('f1') && <div className={css.newStep}><span>8 月 20 日</span><strong>森川制造产品演示</strong><small>由刚完成的跟进自动生成 · 模拟</small></div>}
          </div>
        </aside>
      </div>
    </div>
  )
}

function ContractsView() {
  const rows = [
    ['云极科技', '企业协作套件 V3', '¥128 万', '报价中', '0%', '8 月 28 日'],
    ['海岳物流', '物流运营平台', '¥96 万', '合同审阅', '30%', '8 月 25 日'],
    ['松岚零售', '门店数据平台', '¥88 万', '回款中', '70%', '9 月 1 日'],
    ['远帆咨询', '知识协作方案', '¥54 万', '已回款', '100%', '已完成'],
  ]
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>报价、回款与续约</h2><p>方案版本、合同状态和现金回收进度</p></div><button type="button" className={css.primaryButton}>+ 新建报价</button></div>
      <div className={css.metricGrid}>
        <div className={css.metricCard}><span>待确认报价</span><strong>¥224 万</strong><small>2 份 · 平均折扣 8.5%</small></div>
        <div className={css.metricCard}><span>本月应回款</span><strong>¥186 万</strong><small>已回 ¥132 万</small></div>
        <div className={css.metricCard}><span>回款完成率</span><strong>71%</strong><div className={css.progress}><span style={{ width: '71%' }} /></div></div>
        <div className={css.metricCard}><span>90 天内续约</span><strong>12 家</strong><small>合同金额 ¥386 万</small></div>
      </div>
      <section className={css.card}>
        <SectionTitle title="报价与合同台账" note="演示状态，不连接审批或财务系统" />
        <div className={css.contractTable}>
          <div><span>客户</span><span>方案</span><span>金额</span><span>状态</span><span>回款</span><span>下一节点</span></div>
          {rows.map(row => <button type="button" key={row[0]}>{row.map((cell, index) => <span key={index}>{cell}</span>)}</button>)}
        </div>
      </section>
      <div className={css.twoColumns}>
        <section className={css.card}><SectionTitle title="回款计划" note="未来 30 天" /><div className={css.paymentBars}><div><span>本周</span><i><b style={{ width: '72%' }} /></i><strong>¥54 万</strong></div><div><span>下周</span><i><b style={{ width: '92%' }} /></i><strong>¥69 万</strong></div><div><span>第 3 周</span><i><b style={{ width: '44%' }} /></i><strong>¥33 万</strong></div><div><span>第 4 周</span><i><b style={{ width: '40%' }} /></i><strong>¥30 万</strong></div></div></section>
        <section className={css.card}><SectionTitle title="续约提醒" note="12 家客户" /><div className={css.renewals}><div><strong>启明数据</strong><span>9 月 12 日 · ¥46 万</span><em>健康度 92</em></div><div><strong>辰光教育</strong><span>9 月 26 日 · ¥38 万</span><em>健康度 76</em></div><div><strong>朗域设计</strong><span>10 月 4 日 · ¥29 万</span><em>需提前跟进</em></div></div></section>
      </div>
    </div>
  )
}

function TeamView() {
  const [objection, setObjection] = useState('预算有限')
  const scripts: Record<string, string> = {
    '预算有限': '先把预算拆成“首期试点”和“规模推广”两部分，用 6 周试点验证可量化收益。',
    '已有竞品': '不要求立即替换，先选择现有方案覆盖较弱的部门做并行验证，再比较真实使用数据。',
    '上线周期': '把上线拆成数据准备、核心流程和团队推广三段，每一段都有独立验收点。',
  }
  return (
    <div className={css.view}>
      <div className={css.viewHeading}><div><h2>团队管理与销售知识库</h2><p>业绩、转化、跟进质量和一线话术集中查看</p></div><span className={css.demoBadge}>4 人销售团队</span></div>
      <div className={css.teamGrid}>
        <section className={css.card}>
          <SectionTitle title="个人表现" note="本月数据" />
          <div className={css.teamTable}>
            <div><span>销售</span><span>业绩</span><span>完成率</span><span>转化率</span><span>有效跟进</span></div>
            {[
              ['林澈', '¥168 万', '84%', '31%', '46'], ['周妍', '¥142 万', '78%', '28%', '39'], ['顾言', '¥116 万', '69%', '24%', '42'], ['谢宁', '¥78 万', '56%', '21%', '35'],
            ].map(row => <button type="button" key={row[0]}>{row.map(cell => <span key={cell}>{cell}</span>)}</button>)}
          </div>
        </section>
        <section className={css.card}>
          <SectionTitle title="异议话术推荐" note="仅本地演示" />
          <div className={css.objectionTabs}>{Object.keys(scripts).map(key => <button type="button" className={key === objection ? css.selectedFilter : undefined} key={key} onClick={() => { setObjection(key) }}>{key}</button>)}</div>
          <div className={css.scriptCard}><span>推荐回应</span><p>{scripts[objection]}</p><button type="button"><IconSendOutline16 size={14} />加入会前作战卡</button></div>
        </section>
      </div>
      <section className={css.card}>
        <SectionTitle title="销售知识库" note="产品资料、客户案例、竞品信息与常见异议" />
        <div className={css.knowledgeGrid}>
          {[
            ['产品资料', '企业协作套件 V3', '12 份资料 · 8 月 12 日更新'],
            ['客户案例', '零售行业数字化案例集', '8 个案例 · 含 ROI 数据'],
            ['竞品信息', '协同平台功能对比', '5 家竞品 · 销售版'],
            ['常见异议', '价格与上线周期应对', '18 条话术 · 团队共创'],
          ].map(([type, title, note]) => <button type="button" key={title}><span>{type}</span><strong>{title}</strong><small>{note}</small></button>)}
        </div>
      </section>
    </div>
  )
}

export type SalesWorkbenchEntryProps = PropsRuntime<'sidebar.footer.action'> & PropsLocale<'salesWorkbench'>

export function SalesWorkbenchEntry({ wide, t }: SalesWorkbenchEntryProps) {
  const [open, setOpen] = useState(false)
  const panelId = 'dsh-sales-workbench-panel'
  return (
    <>
      <Tooltip label={t('entry')} delayMs={500} disabled={wide}>
        <button type="button" className={clsx(css.trigger, !wide && css.rail)} aria-expanded={open} aria-controls={panelId} onClick={() => { setOpen(value => !value) }}>
          <IconDataOutline16 size={wide ? 16 : 18} />
          {wide && <span>{t('entry')}</span>}
        </button>
      </Tooltip>
      {open && <SalesWorkbenchPanel panelId={panelId} t={t} onClose={() => { setOpen(false) }} />}
    </>
  )
}

function SalesWorkbenchPanel({ panelId, t, onClose }: { panelId: string, t: (key: SalesWorkbenchKey) => string, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<SalesTab>('dashboard')
  const [gapOpen, setGapOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState('cloud')
  const [warCard, setWarCard] = useState(false)
  const [meetingDone, setMeetingDone] = useState(false)
  const [promoted, setPromoted] = useState(false)
  const [doneFollowups, setDoneFollowups] = useState<readonly string[]>([])
  const box = useCenterColumnBox()

  const toggleFollowup = (id: string): void => {
    setDoneFollowups(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id])
  }
  const openCustomer = (id: string): void => {
    setSelectedCustomer(id)
    setActiveTab('customers')
  }

  return (
    <aside id={panelId} className={css.panel} style={{ left: box.left, top: box.top, right: box.right, bottom: box.bottom }} aria-label={t('title')} data-screen-label="Sales Workbench">
      <header className={css.header}>
        <div className={css.brand}><span><IconDataOutline16 size={18} /></span><div><strong>{t('title')}</strong><small>{t('subtitle')}</small></div></div>
        <div className={css.headerActions}><span>销售流程：线索 → 客户 → 商机 → 成交 → 回款</span><button type="button" aria-label={t('close')} onClick={onClose}><IconCloseOutline16 /></button></div>
      </header>
      <nav className={css.tabs} aria-label="销售工作台功能">
        {TABS.map(tab => <button type="button" className={activeTab === tab.id ? css.activeTab : undefined} key={tab.id} onClick={() => { setActiveTab(tab.id) }}><TabIcon tab={tab.id} /><span>{t(tab.key)}</span></button>)}
      </nav>
      <main className={css.content}>
        {activeTab === 'dashboard' && <DashboardView gapOpen={gapOpen} setGapOpen={setGapOpen} openCustomer={openCustomer} openPipeline={() => { setActiveTab('pipeline') }} doneFollowups={doneFollowups} toggleFollowup={toggleFollowup} />}
        {activeTab === 'customers' && <CustomersView selectedId={selectedCustomer} setSelectedId={setSelectedCustomer} warCard={warCard} setWarCard={setWarCard} meetingDone={meetingDone} setMeetingDone={setMeetingDone} />}
        {activeTab === 'pipeline' && <PipelineView promoted={promoted} setPromoted={setPromoted} />}
        {activeTab === 'followups' && <FollowupsView doneIds={doneFollowups} toggle={toggleFollowup} />}
        {activeTab === 'contracts' && <ContractsView />}
        {activeTab === 'team' && <TeamView />}
      </main>
    </aside>
  )
}
