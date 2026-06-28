import {
  Activity,
  Assessment,
  AttendanceRecord,
  AttendanceStatus,
  Batch,
  Candidate,
  Feedback,
  Notification,
  ScheduleSession,
  Trainer,
} from "./types";

// Deterministic seeded RNG so the same data is generated every restart.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = makeRng(12345);
const ri = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const rc = <T,>(arr: T[]): T => arr[ri(0, arr.length - 1)]!;

const technologies = [
  "Java Full Stack",
  "Cloud Native (AWS)",
  "Salesforce Admin & Dev",
  "ServiceNow ITSM",
  "Data Engineering (Databricks)",
  "Cybersecurity Fundamentals",
  "Mainframe Modernization",
  "GenAI Foundations",
  "React + TypeScript",
  "DevOps & Kubernetes",
  "SAP S/4HANA",
  "Microsoft Power Platform",
];

const locations = [
  "Mumbai",
  "Chennai",
  "Pune",
  "Bengaluru",
  "Noida",
  "Hyderabad",
  "Kolkata",
  "Mexico City",
  "Atlanta",
  "London",
];

const firstNames = [
  "Aarav", "Priya", "Rahul", "Ananya", "Sofia", "James", "Diego", "Neha",
  "Vikram", "Sneha", "Rohan", "Maya", "Amit", "Kavya", "Arjun", "Aditi",
  "John", "Emma", "Michael", "Sarah", "David", "Laura", "Carlos", "Maria",
  "Kenji", "Yuki", "Wei", "Mei",
];
const lastNames = [
  "Sharma", "Iyer", "Menon", "Reddy", "Müller", "O'Brien", "Hernández", "Patel",
  "Singh", "Gupta", "Kumar", "Das", "Bose", "Nair", "Gowda", "Smith",
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Martinez", "Rodriguez",
  "Lopez", "Lee", "Wang", "Chen", "Liu",
];

const generateName = () => `${rc(firstNames)} ${rc(lastNames)}`;

// Avatar via DiceBear (matches frontend implementation).
const getAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(seed)}&radius=50`;

// ---------- Trainers ----------
export const trainers: Trainer[] = Array.from({ length: 20 }).map((_, i) => {
  const name = generateName();
  return {
    id: `tr-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, ".")}@hexaware.com`,
    avatar: getAvatar(name),
    title: rc([
      "Senior Technical Trainer",
      "Principal Trainer",
      "Lead Instructor",
      "SME / Trainer",
    ]),
    utilization: ri(60, 100),
    rating: Number((rand() * 1 + 4).toFixed(1)),
    skills: Array.from({ length: ri(2, 5) })
      .map(() => rc(technologies))
      .filter((v, i, a) => a.indexOf(v) === i),
    location: rc(locations),
    currentBatches: ri(1, 3),
  };
});

// ---------- Batches ----------
// Dates spread across the past 14 months + next 2 months (relative to 2025-06)
const batchMonthOffsets = [
  -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 0, 1, 1, 2,
];
function batchDateRange(monthOffset: number): { startDate: string; endDate: string } {
  const base = new Date("2025-06-01");
  base.setMonth(base.getMonth() + monthOffset);
  const startDate = base.toISOString().slice(0, 10);
  const end = new Date(base);
  end.setDate(end.getDate() + ri(42, 84));
  const endDate = end.toISOString().slice(0, 10);
  return { startDate, endDate };
}

export const batches: Batch[] = Array.from({ length: 35 }).map((_, i) => {
  const id = `b-${i + 1}`;
  const tech = rc(technologies);
  const loc = rc(locations);
  const monthOffset = batchMonthOffsets[i % batchMonthOffsets.length]!;
  const { startDate, endDate } = batchDateRange(monthOffset);

  // Derive status from dates
  const now = new Date("2025-06-23");
  const start = new Date(startDate);
  const end = new Date(endDate);
  let status: Batch["status"];
  if (start > now) {
    status = "Planned";
  } else if (end < now) {
    const archived = i % 7 === 0;
    status = archived ? "Archived" : "Completed";
  } else {
    status = i % 15 === 0 ? "On Hold" : "In Progress";
  }

  return {
    id,
    name: `HX-${tech.split(" ")[0]!.toUpperCase()}-${loc.substring(0, 3).toUpperCase()}-${100 + i}`,
    technology: tech,
    status,
    startDate,
    endDate,
    trainerId: rc(trainers).id,
    location: loc,
    candidateCount: ri(15, 35),
    attendancePercent: ri(78, 99),
    passRate: ri(72, 100),
  };
});

// ---------- Candidates ----------
// Status is derived from performance + attendance metrics — not random.
// Graduated  → batch is Completed
// Dropped    → attendance < 60% OR performance < 50%
// At Risk    → attendance < 75% OR performance < 65%
// Active     → otherwise
function deriveStatus(
  attendancePercent: number,
  performance: number,
  batchStatus: Batch["status"],
): Candidate["status"] {
  if (batchStatus === "Completed" || batchStatus === "Archived") return "Graduated";
  if (attendancePercent < 60 || performance < 50) return "Dropped";
  if (attendancePercent < 75 || performance < 65) return "At Risk";
  return "Active";
}

export const candidates: Candidate[] = Array.from({ length: 250 }).map((_, i) => {
  const name = generateName();
  const batch = rc(batches);
  // Wider ranges so ~8–12% of active candidates naturally fall into Dropped
  const performance = ri(42, 100);
  const attendancePercent = ri(52, 100);
  const status = deriveStatus(attendancePercent, performance, batch.status);

  return {
    id: `c-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, ".")}@hexaware.com`,
    avatar: getAvatar(`${name}-${i}`),
    batchId: batch.id,
    performance,
    attendancePercent,
    status,
  };
});

// c-1 is the demo candidate used for the candidate portal login.
// Ensure it always has a valid active batch and healthy metrics.
const demoBatch = batches.find((b) => b.status === "In Progress") ?? batches[0]!;
candidates[0] = {
  id: "c-1",
  name: "Kishlay Kumar",
  email: "kishlay.kumar@hexaware.com",
  avatar: getAvatar("Kishlay Kumar"),
  batchId: demoBatch.id,
  performance: 87,
  attendancePercent: 94,
  status: "Active",
};

// ---------- Attendance Records ----------
// Generates the last N weekdays (Mon-Fri) from a reference date as YYYY-MM-DD strings.
function getLastNWeekdays(n: number, from: Date): string[] {
  const days: string[] = [];
  const d = new Date(from);
  while (days.length < n) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.unshift(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() - 1);
  }
  return days;
}

function statusForDay(
  candidateId: string,
  dayIndex: number,
  attendancePercent: number,
): AttendanceStatus {
  const idNum = parseInt(candidateId.replace(/\D/g, ""), 10) || 0;
  // How many of 10 days should be absent based on the attendance %
  const absentCount = Math.round((100 - attendancePercent) / 10);
  const isAbsent = ((idNum + dayIndex * 3) % 10) < absentCount;
  const isLate = !isAbsent && ((idNum * 7 + dayIndex) % 17 === 0);
  return isAbsent ? "Absent" : isLate ? "Late" : "Present";
}

export const attendanceSeedDays = getLastNWeekdays(10, new Date("2025-06-23"));
export const attendanceRecords: AttendanceRecord[] = [];

for (const c of candidates) {
  const batch = batches.find((b) => b.id === c.batchId);
  if (!batch || (batch.status !== "In Progress" && batch.status !== "Planned")) continue;
  attendanceSeedDays.forEach((date, i) => {
    attendanceRecords.push({
      id: `ar-${c.id}-${date}`,
      candidateId: c.id,
      batchId: c.batchId,
      date,
      status: statusForDay(c.id, i, c.attendancePercent),
    });
  });
  // Sync the stored attendancePercent to match the seeded records exactly.
  const mine = attendanceRecords.filter((r) => r.candidateId === c.id);
  const attended = mine.filter((r) => r.status !== "Absent").length;
  c.attendancePercent = mine.length > 0 ? Math.round((attended / mine.length) * 100) : c.attendancePercent;
  c.status = deriveStatus(c.attendancePercent, c.performance, batch.status);
}

// Re-pin Kishlay Kumar's records so his overall % stays at 94.
const kishlayRecords = attendanceRecords.filter((r) => r.candidateId === "c-1");
const kishlayTarget = Math.round(0.94 * kishlayRecords.length);
kishlayRecords.forEach((r, i) => {
  r.status = i < kishlayTarget ? "Present" : "Absent";
});
const kishlay = candidates.find((c) => c.id === "c-1");
if (kishlay) {
  kishlay.attendancePercent = 94;
  const kb = batches.find((b) => b.id === kishlay.batchId);
  if (kb) kishlay.status = deriveStatus(94, kishlay.performance, kb.status);
}

// Recompute a single candidate's attendancePercent from stored records and persist it.
export function recomputeCandidateAttendance(candidateId: string): void {
  const c = candidates.find((cand) => cand.id === candidateId);
  if (!c) return;
  const mine = attendanceRecords.filter((r) => r.candidateId === candidateId);
  if (mine.length === 0) return;
  const attended = mine.filter((r) => r.status !== "Absent").length;
  c.attendancePercent = Math.round((attended / mine.length) * 100);
  const batch = batches.find((b) => b.id === c.batchId);
  if (batch) {
    c.status = deriveStatus(c.attendancePercent, c.performance, batch.status);
    // Update the batch's own average attendance
    const batchCands = candidates.filter((x) => x.batchId === c.batchId);
    batch.attendancePercent = batchCands.length
      ? Math.round(batchCands.reduce((s, x) => s + x.attendancePercent, 0) / batchCands.length)
      : batch.attendancePercent;
  }
}

// ---------- Assessments ----------
const assessmentNames = [
  "Module 1 — Foundations",
  "Module 2 — Core Concepts",
  "Module 3 — Hands-on Lab",
  "Mid-batch Assessment",
  "Capstone Project",
  "Final Certification",
];
export const assessments: Assessment[] = batches.flatMap((b) =>
  Array.from({ length: ri(2, 4) }).map((_, j) => ({
    id: `a-${b.id}-${j + 1}`,
    batchId: b.id,
    name: rc(assessmentNames),
    date: `2025-${ri(1, 6).toString().padStart(2, "0")}-${ri(1, 28).toString().padStart(2, "0")}`,
    passRate: ri(60, 100),
    status: rc(["Pending", "Graded", "Published"]) as Assessment["status"],
  })),
);

// ---------- Feedback ----------
const feedbackComments = [
  "Trainer was excellent — explanations were crystal clear and pacing was just right.",
  "Loved the hands-on labs, but would prefer more real-world examples.",
  "Pace felt a bit fast in the second week. Would benefit from a quick recap session.",
  "Excellent course content. The capstone project tied everything together nicely.",
  "Great cohort energy. Trainer was very supportive of slower learners.",
  "More time on debugging would help. We rushed through the integration module.",
  "Best training I've attended at Hexaware. Highly recommend the trainer.",
  "Course material is dense — splitting it into smaller modules would help.",
  "Lab environments were unstable on day 2 — please check infra before the next batch.",
  "Trainer's industry experience really shone in the architecture sessions.",
  "Assessment difficulty did not match the depth of teaching. Mismatch needs review.",
  "Mid-batch feedback was acted on quickly — that was great.",
  "Loved the optional after-hours coding clinics. Please continue them.",
  "Communication about schedule changes was inconsistent.",
  "More peer collaboration exercises would lift the experience further.",
];
export const feedback: Feedback[] = batches.flatMap((b) =>
  Array.from({ length: ri(3, 7) }).map((_, j) => ({
    id: `f-${b.id}-${j + 1}`,
    batchId: b.id,
    candidateId: candidates.filter((c) => c.batchId === b.id)[0]?.id ?? "c-1",
    date: `2025-${ri(1, 6).toString().padStart(2, "0")}-${ri(1, 28).toString().padStart(2, "0")}`,
    rating: ri(3, 5),
    comment: rc(feedbackComments),
    nps: ri(-20, 80),
  })),
);

// ---------- Notifications ----------
export const notifications: Notification[] = [
  {
    id: "1",
    title: "Low Attendance Alert",
    description: "Batch HX-JAVA-MUM-105 has dropped below 75% attendance.",
    timestamp: "1 hour ago",
    read: false,
    type: "alert",
  },
  {
    id: "2",
    title: "Candidate At Risk",
    description: "12 candidates flagged as At Risk — performance below threshold.",
    timestamp: "2 hours ago",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    title: "Assessment Due",
    description: "React Fundamentals assessment is due for 3 batches tomorrow.",
    timestamp: "3 hours ago",
    read: false,
    type: "warning",
  },
  {
    id: "4",
    title: "Batch Completed",
    description: "Batch HX-DATA-CHE-112 has successfully completed training.",
    timestamp: "1 day ago",
    read: true,
    type: "success",
  },
  {
    id: "5",
    title: "New Trainer Onboarded",
    description: "Anjali Verma has joined as a Cloud Native trainer.",
    timestamp: "2 days ago",
    read: true,
    type: "info",
  },
  {
    id: "6",
    title: "Feedback Window Open",
    description: "Mid-batch feedback collection started for 4 active batches.",
    timestamp: "2 days ago",
    read: true,
    type: "info",
  },
];

// ---------- Activity feed ----------
export const activities: Activity[] = [
  { id: "1", user: "Admin", action: "created batch", target: "HX-JAVA-MUM-124", timestamp: "10 mins ago" },
  { id: "2", user: "System", action: "generated report", target: "Weekly Attendance", timestamp: "1 hour ago" },
  { id: "3", user: "Priya Iyer", action: "published grades for", target: "AWS Cloud Practitioner", timestamp: "2 hours ago" },
  { id: "4", user: "Admin", action: "updated trainer mapping", target: "Rahul Menon", timestamp: "3 hours ago" },
  { id: "5", user: "System", action: "flagged candidate at risk in", target: "HX-CLOUD-BLR-108", timestamp: "4 hours ago" },
  { id: "6", user: "Neha Singh", action: "submitted feedback for", target: "DevOps & Kubernetes", timestamp: "5 hours ago" },
];

// ---------- Schedule sessions ----------
const sessionTypes: ScheduleSession["type"][] = ["Lecture", "Lab", "Assessment", "Workshop", "Review"];
const sessRng = makeRng(7919);
const sri = (min: number, max: number) => Math.floor(sessRng() * (max - min + 1)) + min;
const src = <T,>(arr: T[]): T => arr[sri(0, arr.length - 1)]!;

const trainerById = new Map(trainers.map((t) => [t.id, t]));
const activeBatches = batches.filter((b) => b.status === "In Progress").slice(0, 18);

export const sessions: ScheduleSession[] = [];
activeBatches.forEach((batch, idx) => {
  const trainer = trainerById.get(batch.trainerId);
  const days = idx % 2 === 0 ? [1, 2, 3, 4] : [1, 3, 5];
  const baseStart = 9 + (idx % 3) * 2;
  days.forEach((day) => {
    const startHour = baseStart + sri(-1, 1);
    sessions.push({
      id: `s-${batch.id}-${day}`,
      batchId: batch.id,
      batchName: batch.name,
      technology: batch.technology,
      trainerId: batch.trainerId,
      trainerName: trainer?.name ?? "Unassigned",
      location: batch.location,
      day,
      startHour: Math.max(8, Math.min(17, startHour)),
      durationHours: src([1, 1, 2, 2, 3]),
      type: src(sessionTypes),
    });
  });
});

// ---------- Aggregated dashboard helpers ----------
export function dashboardSummary() {
  const active = batches.filter((b) => b.status === "In Progress");
  const inTraining = candidates.filter((c) => c.status === "Active").length;
  const avgAttendance = active.length
    ? Math.round(active.reduce((a, b) => a + b.attendancePercent, 0) / active.length)
    : 0;
  const avgPassRate = active.length
    ? Math.round(active.reduce((a, b) => a + b.passRate, 0) / active.length)
    : 0;
  const avgUtilization = trainers.length
    ? Math.round(trainers.reduce((a, t) => a + t.utilization, 0) / trainers.length)
    : 0;
  const atRiskCount = candidates.filter((c) => c.status === "At Risk").length;

  return {
    activeBatches: active.length,
    inTraining,
    avgAttendance,
    avgPassRate,
    avgUtilization,
    atRiskCount,
    totalBatches: batches.length,
    totalCandidates: candidates.length,
    totalTrainers: trainers.length,
  };
}

// ---------- Dashboard chart data ----------
export function dashboardCharts() {
  // Enrollment trend: batches starting per calendar month (last 12 months)
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date("2025-06-23");
  const enrollmentMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${monthLabels[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
    enrollmentMap.set(key, 0);
  }
  batches.forEach((b) => {
    const start = new Date(b.startDate);
    const monthsAgo = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (monthsAgo >= 0 && monthsAgo <= 11) {
      const key = `${monthLabels[start.getMonth()]} '${String(start.getFullYear()).slice(2)}`;
      enrollmentMap.set(key, (enrollmentMap.get(key) ?? 0) + (b.candidateCount ?? 0));
    }
  });
  const enrollmentTrends = Array.from(enrollmentMap.entries()).map(([name, value]) => ({ name, value }));

  // Location distribution: candidate count by location
  const locMap = new Map<string, number>();
  batches.forEach((b) => {
    const candidatesInBatch = candidates.filter((c) => c.batchId === b.id).length;
    locMap.set(b.location, (locMap.get(b.location) ?? 0) + candidatesInBatch);
  });
  const locationData = [...locMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Technology mix: batch count by technology (top 6)
  const techMap = new Map<string, number>();
  batches.forEach((b) => {
    techMap.set(b.technology, (techMap.get(b.technology) ?? 0) + 1);
  });
  const techMix = [...techMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return { enrollmentTrends, locationData, techMix };
}

// Brief structured snapshot for AI prompts (keeps token cost low).
export function dataSnapshotForAI() {
  const s = dashboardSummary();
  const top5BatchesByLowAttendance = [...batches]
    .filter((b) => b.status === "In Progress")
    .sort((a, b) => a.attendancePercent - b.attendancePercent)
    .slice(0, 5)
    .map((b) => ({ name: b.name, attendance: b.attendancePercent, passRate: b.passRate, location: b.location, tech: b.technology }));
  const techMix: Record<string, number> = {};
  batches.forEach((b) => (techMix[b.technology] = (techMix[b.technology] ?? 0) + 1));
  const locationMix: Record<string, number> = {};
  batches.forEach((b) => (locationMix[b.location] = (locationMix[b.location] ?? 0) + 1));
  return {
    summary: s,
    topAtRiskBatches: top5BatchesByLowAttendance,
    techMix,
    locationMix,
    sampleAlerts: notifications.slice(0, 3).map((n) => `${n.title}: ${n.description}`),
  };
}
