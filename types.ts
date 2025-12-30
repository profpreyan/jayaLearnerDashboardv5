export enum TaskStatus {
  LIVE = 'Live',
  SUBMITTED = 'Submitted',
  RESUBMITTED = 'Resubmitted',
  REDO = 'Redo',
  CHECKED = 'Checked',
  LOCKED = 'Locked'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  referenceLinks: string[];
  learningMaterials: string[];
  status: TaskStatus;
  weekId: number;
}

export interface Student {
  name: string;
  cohort: string;
}

export interface CourseProgress {
  week: number;
  month: number;
  totalWeeks: number; // e.g. 12
  totalMonths: number; // e.g. 3
  weeklyTasksCompleted: number;
  totalWeeklyTasks: number; // 7
}

export interface SheetData {
  tasks: Task[];
  student: Student;
  progress: CourseProgress;
  currentTopic: string;
}