export type BatchStatus = "Planned" | "In Progress" | "On Hold" | "Completed" | "Archived";
export type AttendanceStatus = "Present" | "Absent" | "Late";
export type CandidateStatus = "Active" | "At Risk" | "Dropped" | "Graduated";

export interface Batch {
  id: string;
  name: string;
  technology: string;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  trainerId: string;
  location: string;
  candidateCount: number;
  attendancePercent: number;
  passRate: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar: string;
  batchId: string;
  performance: number;
  attendancePercent: number;
  status: CandidateStatus;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  utilization: number;
  rating: number;
  skills: string[];
  location: string;
  currentBatches: number;
}

export interface AttendanceRecord {
  id: string;
  candidateId: string;
  batchId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Assessment {
  id: string;
  batchId: string;
  name: string;
  date: string;
  passRate: number;
  status: "Pending" | "Graded" | "Published";
}

export interface Feedback {
  id: string;
  batchId: string;
  candidateId: string;
  date: string;
  rating: number;
  comment: string;
  nps: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "alert" | "info" | "success" | "warning";
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ScheduleSession {
  id: string;
  batchId: string;
  batchName: string;
  technology: string;
  trainerId: string;
  trainerName: string;
  location: string;
  day: number;
  startHour: number;
  durationHours: number;
  type: "Lecture" | "Lab" | "Assessment" | "Workshop" | "Review";
}
