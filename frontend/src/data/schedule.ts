import { mockBatches, mockTrainers } from "./mock";

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

const sessionTypes: ScheduleSession["type"][] = ["Lecture", "Lab", "Assessment", "Workshop", "Review"];

const trainerById = new Map(mockTrainers.map((t) => [t.id, t]));

let s = 7919;
function rand() {
  s = (s * 9301 + 49297) % 233280;
  return s / 233280;
}
function ri(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function rc<T>(arr: T[]): T {
  return arr[ri(0, arr.length - 1)];
}

const activeBatches = mockBatches.filter((b) => b.status === "In Progress").slice(0, 18);

export const mockSessions: ScheduleSession[] = [];

activeBatches.forEach((batch, idx) => {
  const trainer = trainerById.get(batch.trainerId);
  const days = idx % 2 === 0 ? [1, 2, 3, 4] : [1, 3, 5];
  const baseStart = 9 + (idx % 3) * 2;
  days.forEach((day) => {
    const startHour = baseStart + ri(-1, 1);
    mockSessions.push({
      id: `s-${batch.id}-${day}`,
      batchId: batch.id,
      batchName: batch.name,
      technology: batch.technology,
      trainerId: batch.trainerId,
      trainerName: trainer?.name ?? "Unassigned",
      location: batch.location,
      day,
      startHour: Math.max(8, Math.min(17, startHour)),
      durationHours: rc([1, 1, 2, 2, 3]),
      type: rc(sessionTypes),
    });
  });
});
