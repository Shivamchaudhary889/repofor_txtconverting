import { Router, type IRouter } from "express";
import { candidates, trainers } from "../lib/data";

const router: IRouter = Router();

const FIXED_PASSWORD = "Password@123";

// Admin accounts: all trainers + a master admin
const adminUsers = [
  { id: "admin-0", name: "Platform Admin", email: "admin@hexaware.com", role: "admin" as const },
  ...trainers.map((t) => ({ id: t.id, name: t.name, email: t.email, role: "admin" as const })),
];

// Candidate accounts: every candidate in the system
const candidateUsers = candidates.map((c) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  role: "candidate" as const,
}));

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (password !== FIXED_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const normalised = email.trim().toLowerCase();

  const admin = adminUsers.find((u) => u.email.toLowerCase() === normalised);
  if (admin) {
    return res.json({ id: admin.id, name: admin.name, email: admin.email, role: "admin" });
  }

  const candidate = candidateUsers.find((u) => u.email.toLowerCase() === normalised);
  if (candidate) {
    return res.json({ id: candidate.id, name: candidate.name, email: candidate.email, role: "candidate" });
  }

  return res.status(401).json({ error: "Invalid credentials." });
});

router.get("/auth/me", (req, res) => {
  // Stateless — the frontend stores the session in localStorage.
  // This endpoint just validates that an email still exists in the system.
  const emailHeader = req.headers["x-user-email"] as string | undefined;
  if (!emailHeader) return res.status(401).json({ error: "Not authenticated." });

  const normalised = emailHeader.trim().toLowerCase();
  const admin = adminUsers.find((u) => u.email.toLowerCase() === normalised);
  if (admin) return res.json({ id: admin.id, name: admin.name, email: admin.email, role: "admin" });

  const candidate = candidateUsers.find((u) => u.email.toLowerCase() === normalised);
  if (candidate) return res.json({ id: candidate.id, name: candidate.name, email: candidate.email, role: "candidate" });

  return res.status(401).json({ error: "Not authenticated." });
});

export default router;
