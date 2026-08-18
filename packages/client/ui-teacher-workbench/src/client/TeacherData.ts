export const SCHOOL_CONTEXT = {
  school: '星海实验中学',
  className: '高二（3）班',
  subject: '物理',
  teacher: '周清禾',
  term: '2026—2027 学年第一学期',
  week: '第 3 周',
  weekRange: '9月14日—18日',
} as const

export const CLASS_SUMMARY = {
  studentCount: 42,
  maleCount: 21,
  femaleCount: 21,
  attendanceCount: 41,
  attendanceRate: 97.6,
  homeworkRate: 92.4,
  averageScore: 82.6,
  scoreChange: 2.8,
  passRate: 90.5,
  excellentRate: 28.6,
  habitScore: 91,
  pendingStudents: 4,
} as const

export const CLASS_OPTIONS = ['高二（3）班', '高二（4）班'] as const

export const STUDENTS = [
  { id: 'lin', name: '林一然', number: '03', attendance: '全勤', homework: '10 / 10', homeworkRate: 100, score: 92, grade: 'A', change: 6, habit: 96, engagement: 94, guardian: '林女士', risk: '稳定', note: '建模思路清晰，实验报告的误差分析已从定性描述提升为数据解释。', tags: ['运动学 A', '实验能力 A-', '课堂参与 高'] },
  { id: 'zhou', name: '周子墨', number: '08', attendance: '全勤', homework: '10 / 10', homeworkRate: 100, score: 95, grade: 'A+', change: 2, habit: 93, engagement: 97, guardian: '周先生', risk: '稳定', note: '课堂表达主动，能帮助小组梳理变量关系，已加入物理竞赛兴趣小组。', tags: ['综合表现 A+', '表达能力 强', '拓展任务 已开启'] },
  { id: 'chen', name: '陈嘉禾', number: '12', attendance: '全勤', homework: '9 / 10', homeworkRate: 90, score: 78, grade: 'B', change: 5, habit: 88, engagement: 82, guardian: '陈女士', risk: '跟进', note: '公式理解准确，图像题的坐标与斜率判断仍需巩固，本周正确率提升 12%。', tags: ['概念理解 B+', '图像分析 B-', '进步明显'] },
  { id: 'xu', name: '许念安', number: '19', attendance: '请假 1 次', homework: '10 / 10', homeworkRate: 100, score: 88, grade: 'A', change: 4, habit: 95, engagement: 88, guardian: '许先生', risk: '稳定', note: '实验操作稳定，记录规范，适合担任下一次分组实验的安全与数据组长。', tags: ['实验能力 A', '作业质量 A', '协作意识 强'] },
  { id: 'gao', name: '高远', number: '26', attendance: '迟到 2 次', homework: '7 / 10', homeworkRate: 70, score: 69, grade: 'C+', change: -3, habit: 72, engagement: 68, guardian: '高女士', risk: '重点', note: '基础概念掌握不稳，连续两次订正未完成，已安排周三午间运动学专题辅导。', tags: ['基础概念 C', '作业订正 待改善', '已安排辅导'] },
  { id: 'shen', name: '沈知序', number: '29', attendance: '全勤', homework: '9 / 10', homeworkRate: 90, score: 84, grade: 'B+', change: 7, habit: 90, engagement: 86, guardian: '沈先生', risk: '稳定', note: '近期进步明显，能够主动使用图像检查计算结果，建议继续保持错题复盘。', tags: ['图像分析 A-', '进步 +7', '复盘习惯 良好'] },
  { id: 'jiang', name: '江晚晴', number: '31', attendance: '全勤', homework: '10 / 10', homeworkRate: 100, score: 90, grade: 'A', change: 3, habit: 94, engagement: 91, guardian: '江女士', risk: '稳定', note: '学习节奏稳定，课堂提问有深度，可增加开放性实验设计任务。', tags: ['综合表现 A', '问题意识 强', '拓展任务 建议'] },
  { id: 'zhao', name: '赵新程', number: '34', attendance: '早退 1 次', homework: '8 / 10', homeworkRate: 80, score: 72, grade: 'B-', change: 1, habit: 79, engagement: 76, guardian: '赵先生', risk: '跟进', note: '计算过程较完整，但单位书写和有效数字不稳定，需要一周专项检查。', tags: ['计算过程 B', '规范书写 待改善', '本周跟进'] },
  { id: 'tang', name: '唐可昕', number: '37', attendance: '全勤', homework: '9 / 10', homeworkRate: 90, score: 81, grade: 'B+', change: -1, habit: 87, engagement: 89, guardian: '唐女士', risk: '观察', note: '课堂参与稳定，最近一次小测出现审题失误，建议放慢读题并标记条件。', tags: ['课堂参与 高', '审题规范 待改善', '状态观察'] },
  { id: 'gu', name: '顾南星', number: '41', attendance: '病假 1 次', homework: '8 / 10', homeworkRate: 80, score: 86, grade: 'A-', change: 4, habit: 91, engagement: 84, guardian: '顾女士', risk: '跟进', note: '病假课程已补看，实验数据处理完成，仍需补交纸质实验结论。', tags: ['自学能力 A', '补课进度 90%', '材料待补交'] },
] as const

export const ASSESSMENT_TREND = [
  { label: '开学摸底', shortLabel: '摸底', classAverage: 75.8, gradeAverage: 76.9 },
  { label: '运动学练习', shortLabel: '练习一', classAverage: 78.4, gradeAverage: 77.6 },
  { label: '周测一', shortLabel: '周测一', classAverage: 79.6, gradeAverage: 79.1 },
  { label: '实验测评', shortLabel: '实验', classAverage: 81.2, gradeAverage: 80.0 },
  { label: '运动学单元测', shortLabel: '单元测', classAverage: 82.6, gradeAverage: 81.4 },
] as const

export const SCORE_DISTRIBUTION = [
  { label: '90–100', count: 6 },
  { label: '80–89', count: 18 },
  { label: '70–79', count: 10 },
  { label: '60–69', count: 4 },
  { label: '60 以下', count: 4 },
] as const

export const KNOWLEDGE_MASTERY = [
  { name: '运动图像判读', value: 86, change: 5 },
  { name: '匀变速公式应用', value: 82, change: 3 },
  { name: '实验数据处理', value: 78, change: 6 },
  { name: '运动过程建模', value: 74, change: 2 },
  { name: '误差与有效数字', value: 67, change: -1 },
] as const

export const HABIT_METRICS = [
  { id: 'prepare', label: '课前准备', value: 94, change: 3, note: '39 人连续达标' },
  { id: 'focus', label: '课堂专注', value: 88, change: -1, note: '3 人需要提醒' },
  { id: 'correct', label: '作业订正', value: 91, change: 5, note: '较上周多 4 人' },
  { id: 'exercise', label: '运动打卡', value: 86, change: 2, note: '本周累计 176 次' },
] as const

export const HABIT_TREND = [
  { day: '周一', date: '09/14', prepare: 93, focus: 89, correct: 88, exercise: 84 },
  { day: '周二', date: '09/15', prepare: 95, focus: 91, correct: 90, exercise: 88 },
  { day: '周三', date: '09/16', prepare: 92, focus: 86, correct: 89, exercise: 85 },
  { day: '周四', date: '09/17', prepare: 96, focus: 87, correct: 93, exercise: 86 },
  { day: '周五', date: '09/18', prepare: 94, focus: 88, correct: 94, exercise: 87 },
] as const

export const HABIT_RECORDS = [
  { studentId: 'gao', student: '高远', category: '作业订正', streak: 1, rate: 70, status: '需跟进', detail: '两次订正未按时完成', lastUpdate: '今天 08:12' },
  { studentId: 'zhao', student: '赵新程', category: '课前准备', streak: 2, rate: 79, status: '观察', detail: '连续两天忘带实验记录册', lastUpdate: '昨天 16:35' },
  { studentId: 'tang', student: '唐可昕', category: '课堂专注', streak: 4, rate: 87, status: '观察', detail: '小组讨论参与度下降', lastUpdate: '昨天 11:08' },
  { studentId: 'lin', student: '林一然', category: '作业订正', streak: 12, rate: 96, status: '表现突出', detail: '连续三周订正全达标', lastUpdate: '今天 07:55' },
  { studentId: 'xu', student: '许念安', category: '课前准备', streak: 15, rate: 95, status: '表现突出', detail: '实验材料准备完整', lastUpdate: '今天 07:48' },
] as const

export const COURSE_RECORDS = [
  { id: 'kinematics-1', date: '09-14', weekday: '周一', period: '第 1 节', className: '高二（3）班', unit: '第一章 运动的描述', topic: '匀变速直线运动', attendance: '41 / 42', participation: 92, homework: 95, quickCheck: 84, status: '已完成', reflection: '速度—时间图像判读优于预期，下一课增加反向运动案例。' },
  { id: 'gravity-lab', date: '09-14', weekday: '周一', period: '第 7–8 节', className: '高二（3）班', unit: '第一章 运动的描述', topic: '实验：测量重力加速度', attendance: '42 / 42', participation: 96, homework: 90, quickCheck: 82, status: '已完成', reflection: '6 个小组完成采样，2 组需要补充误差来源说明。' },
  { id: 'free-fall', date: '09-11', weekday: '周五', period: '第 2 节', className: '高二（3）班', unit: '第一章 运动的描述', topic: '自由落体运动', attendance: '42 / 42', participation: 89, homework: 93, quickCheck: 81, status: '已复盘', reflection: '生活情境导入有效，需减少公式推导时间，增加分层练习。' },
  { id: 'chart-reading', date: '09-10', weekday: '周四', period: '第 3 节', className: '高二（3）班', unit: '第一章 运动的描述', topic: '速度—时间图像', attendance: '40 / 42', participation: 85, homework: 88, quickCheck: 76, status: '已复盘', reflection: '斜率与面积含义混淆，已生成 6 题专项训练。' },
  { id: 'acceleration', date: '09-09', weekday: '周三', period: '第 4 节', className: '高二（3）班', unit: '第一章 运动的描述', topic: '加速度', attendance: '41 / 42', participation: 87, homework: 91, quickCheck: 79, status: '已完成', reflection: '单位换算错误集中在 4 人，已纳入个别跟进。' },
  { id: 'projectile-4', date: '09-15', weekday: '周二', period: '第 2 节', className: '高二（4）班', unit: '第二章 抛体运动', topic: '抛体运动', attendance: '39 / 40', participation: 90, homework: 89, quickCheck: 80, status: '待上课', reflection: '教案与演示实验已准备，等待课堂记录。' },
] as const

export const DASHBOARD_TASKS = [
  { time: '10:10', title: '高二（3）班 · 运动学单元复习', meta: '明理楼 302 · 教案已就绪', status: '进行中' },
  { time: '12:40', title: '高远、赵新程 · 午间答疑', meta: '图像判读与有效数字', status: '待处理' },
  { time: '15:20', title: '物理组集体备课', meta: '教师发展中心 2 号室', status: '未开始' },
  { time: '18:30', title: '发送本周家校反馈', meta: '4 条个别反馈 · 1 条班级通知', status: '未开始' },
] as const

export const CLASS_EVENTS = [
  { date: '09/16', title: '班级安全主题班会', owner: '沈知序、江晚晴', status: '材料已齐' },
  { date: '09/18', title: '运动学阶段学习反馈', owner: '周清禾', status: '待发布' },
  { date: '09/22', title: '家长开放日预约', owner: '家委会', status: '31 / 42 已确认' },
  { date: '09/25', title: '秋季运动会报名截止', owner: '体育委员', status: '6 项待补位' },
] as const

export const CLASS_GROUPS = [
  { name: '启航组', leader: '周子墨', members: 7, points: 286, change: 12 },
  { name: '星轨组', leader: '林一然', members: 7, points: 279, change: 18 },
  { name: '引力组', leader: '许念安', members: 7, points: 268, change: 9 },
  { name: '光锥组', leader: '江晚晴', members: 7, points: 262, change: 15 },
  { name: '量子组', leader: '沈知序', members: 7, points: 251, change: 8 },
  { name: '远望组', leader: '陈嘉禾', members: 7, points: 244, change: 6 },
] as const

export const CLASS_ROLES = [
  { role: '班长', name: '周子墨', focus: '班会与日常协调' },
  { role: '学习委员', name: '林一然', focus: '作业收发与答疑统计' },
  { role: '纪律委员', name: '许念安', focus: '课前准备与课堂记录' },
  { role: '体育委员', name: '沈知序', focus: '运动打卡与运动会报名' },
] as const

export const ATTENDANCE_RECORDS = [
  { name: '许念安', type: '事假', time: '09/15 第 3–4 节', reason: '校外竞赛集训', status: '已销假' },
  { name: '顾南星', type: '病假', time: '09/14 全天', reason: '发热居家休息', status: '已补课' },
  { name: '赵新程', type: '早退', time: '09/11 15:40', reason: '口腔复诊', status: '家长已确认' },
  { name: '高远', type: '迟到', time: '09/15 07:47', reason: '通勤延误', status: '已提醒' },
] as const

const SEAT_NAMES = [
  '林一然', '周子墨', '陈嘉禾', '许念安', '高远', '沈知序', '江晚晴',
  '赵新程', '唐可昕', '顾南星', '苏景行', '陆时予', '梁嘉树', '秦书意',
  '宋闻溪', '叶星回', '程屿', '白知遥', '谢云帆', '夏栀', '方聿明',
  '何嘉言', '邵雨眠', '孟砚舟', '韩清和', '彭予安', '施南乔', '袁知行',
  '董书宁', '蒋亦辰', '罗清欢', '魏明川', '杜若宁', '傅今安', '范星野',
  '贺初阳', '姜念', '陶以宁', '尹川', '乔安然', '任知许', '温言',
] as const

export const SEATS = SEAT_NAMES.map((name, index) => ({
  id: `seat-${index + 1}`,
  name,
  row: Math.floor(index / 7) + 1,
  column: (index % 7) + 1,
  status: name === '顾南星' ? '请假' : name === '高远' || name === '赵新程' ? '关注' : '在班',
}))

export const FAMILY_ACTIVITY = [
  { time: '今天 09:20', student: '林一然', type: '表扬反馈', result: '家长已读', summary: '实验报告误差分析进步明显' },
  { time: '昨天 18:34', student: '高远', type: '学习跟进', result: '家长已回复', summary: '确认周三午间辅导安排' },
  { time: '09/14 18:30', student: '顾南星', type: '补课说明', result: '家长已读', summary: '已发送病假课程与补交清单' },
] as const

export type StudentProfile = (typeof STUDENTS)[number]
export type CourseRecord = (typeof COURSE_RECORDS)[number]
