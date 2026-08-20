/** `teacherWorkbench` namespace dictionaries. */

/** Simplified Chinese dictionary. */
export const zh = {
  entry: '教师工作台',
  title: '教师工作台',
  subtitle: '星海实验中学 · 高二（3）班 · 物理',
  close: '关闭工作台',
  'tab.dashboard': '班级总览',
  'tab.schedule': '排课表',
  'tab.records': '课程记录',
  'tab.lessons': '教案管理',
  'tab.academics': '学业情况',
  'tab.habits': '习惯表现',
  'tab.students': '学生管理',
  'tab.classes': '班级管理',
  'tab.family': '家校沟通',
  'tab.tools': '课堂工具',
  'tab.growth': '教研成长',
} satisfies Record<string, string>

/** Teacher workbench dictionary key union. */
export type TeacherWorkbenchKey = keyof typeof zh

/** English dictionary. */
export const en = {
  entry: 'Teacher Workbench',
  title: 'Teacher Workbench',
  subtitle: 'Xinghai Experimental High · Grade 11 Class 3 · Physics',
  close: 'Close workbench',
  'tab.dashboard': 'Dashboard',
  'tab.schedule': 'Schedule',
  'tab.records': 'Course Records',
  'tab.lessons': 'Lesson Plans',
  'tab.academics': 'Academics',
  'tab.habits': 'Habits',
  'tab.students': 'Students',
  'tab.classes': 'Class Management',
  'tab.family': 'Family Messages',
  'tab.tools': 'Classroom Tools',
  'tab.growth': 'Professional Growth',
} satisfies Record<TeacherWorkbenchKey, string>
