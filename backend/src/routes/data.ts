import { Router, type IRouter } from "express";
import {
  activities,
  assessments,
  attendanceRecords,
  batches,
  candidates,
  dashboardSummary,
  dashboardCharts,
  feedback,
  notifications,
  recomputeCandidateAttendance,
  sessions,
  trainers,
} from "../lib/data";
import type { AttendanceStatus, Batch } from "../lib/types";

const router: IRouter = Router();

// ---------- Dashboard ----------
router.get("/dashboard/summary", (_req, res) => {
  res.json(dashboardSummary());
});

router.get("/dashboard/charts", (_req, res) => {
  res.json(dashboardCharts());
});

router.get("/activities", (_req, res) => {
  res.json(activities);
});

// ---------- Batches ----------
router.get("/batches", (_req, res) => {
  res.json(batches);
});

router.post("/batches", (req, res) => {
  const body = req.body as Partial<Batch> & { candidateIds?: string[] };

  if (!body.name || !body.technology || !body.location) {
    return res.status(400).json({ error: "name, technology, and location are required." });
  }

  const newBatch: Batch = {
    id: `b-${batches.length + 1}-${Date.now()}`,
    name: body.name,
    technology: body.technology,
    location: body.location,
    status: "Planned",
    startDate: body.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: body.endDate ?? new Date(Date.now() + 56 * 86400000).toISOString().slice(0, 10),
    trainerId: body.trainerId ?? "",
    candidateCount: body.candidateIds?.length ?? body.candidateCount ?? 0,
    attendancePercent: 0,
    passRate: 0,
  };

  batches.push(newBatch);

  // Add an activity entry
  activities.unshift({
    id: `act-${Date.now()}`,
    user: "Admin",
    action: "created batch",
    target: newBatch.name,
    timestamp: "just now",
  });

  return res.status(201).json(newBatch);
});

router.get("/batches/:id", (req, res) => {
  const b = batches.find((b) => b.id === req.params["id"]);
  if (!b) return res.status(404).json({ error: "Batch not found" });
  return res.json(b);
});

// ---------- Candidates ----------
router.get("/candidates", (_req, res) => {
  res.json(candidates);
});

router.get("/candidates/:id", (req, res) => {
  const c = candidates.find((c) => c.id === req.params["id"]);
  if (!c) return res.status(404).json({ error: "Candidate not found" });
  return res.json(c);
});

// ---------- Trainers ----------
router.get("/trainers", (_req, res) => {
  res.json(trainers);
});

router.get("/trainers/:id", (req, res) => {
  const t = trainers.find((t) => t.id === req.params["id"]);
  if (!t) return res.status(404).json({ error: "Trainer not found" });
  return res.json(t);
});

// ---------- Sessions / Schedule ----------
router.get("/sessions", (_req, res) => {
  res.json(sessions);
});

// ---------- Assessments ----------
router.get("/assessments", (_req, res) => {
  res.json(assessments);
});

router.get("/batches/:id/assessments", (req, res) => {
  res.json(assessments.filter((a) => a.batchId === req.params["id"]));
});

// ---------- Feedback ----------
router.get("/feedback", (_req, res) => {
  res.json(feedback);
});

router.get("/batches/:id/feedback", (req, res) => {
  res.json(feedback.filter((f) => f.batchId === req.params["id"]));
});

// ---------- Notifications ----------
router.get("/notifications", (_req, res) => {
  res.json(notifications);
});

// ---------- Attendance ----------
router.get("/attendance", (req, res) => {
  const { batchId } = req.query as { batchId?: string };
  const records = batchId
    ? attendanceRecords.filter((r) => r.batchId === batchId)
    : attendanceRecords;
  res.json(records);
});

router.post("/attendance/bulk", (req, res) => {
  const { records } = req.body as {
    records: Array<{ candidateId: string; batchId: string; date: string; status: AttendanceStatus }>;
  };

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "records array is required and must not be empty." });
  }

  const affectedCandidates = new Set<string>();

  for (const incoming of records) {
    const idx = attendanceRecords.findIndex(
      (r) => r.candidateId === incoming.candidateId && r.date === incoming.date,
    );
    if (idx >= 0) {
      attendanceRecords[idx]!.status = incoming.status;
    } else {
      attendanceRecords.push({
        id: `ar-${incoming.candidateId}-${incoming.date}`,
        candidateId: incoming.candidateId,
        batchId: incoming.batchId,
        date: incoming.date,
        status: incoming.status,
      });
    }
    affectedCandidates.add(incoming.candidateId);
  }

  for (const cid of affectedCandidates) {
    recomputeCandidateAttendance(cid);
  }

  // Return updated candidate objects so the client can reflect the new percentages.
  const updatedCandidates = [...affectedCandidates].map(
    (cid) => candidates.find((c) => c.id === cid) ?? null,
  ).filter(Boolean);

  return res.json({ updated: affectedCandidates.size, candidates: updatedCandidates });
});

export default router;
