import { Batch, Candidate, Trainer } from "./types";
import { getAvatar } from "@/lib/avatar";

// Seeded random for deterministic output
let seed = 12345;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

const technologies = [
  "Java Full Stack", "Cloud Native (AWS)", "Salesforce Admin & Dev", 
  "ServiceNow ITSM", "Data Engineering (Databricks)", "Cybersecurity Fundamentals", 
  "Mainframe Modernization", "GenAI Foundations", "React + TypeScript", 
  "DevOps & Kubernetes", "SAP S/4HANA", "Microsoft Power Platform"
];

const locations = [
  "Mumbai", "Chennai", "Pune", "Bengaluru", "Noida", 
  "Hyderabad", "Krakow", "Mexico City", "Atlanta", "London"
];

const firstNames = ["Aarav", "Priya", "Rahul", "Ananya", "Sofia", "James", "Diego", "Neha", "Vikram", "Sneha", "Rohan", "Maya", "Amit", "Kavya", "Arjun", "Aditi", "John", "Emma", "Michael", "Sarah", "David", "Laura", "Carlos", "Maria", "Kenji", "Yuki", "Wei", "Mei"];
const lastNames = ["Sharma", "Iyer", "Menon", "Reddy", "Müller", "O'Brien", "Hernández", "Patel", "Singh", "Gupta", "Kumar", "Das", "Bose", "Nair", "Gowda", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Martinez", "Rodriguez", "Lopez", "Lee", "Wang", "Chen", "Liu"];

function generateName() {
  return `${randChoice(firstNames)} ${randChoice(lastNames)}`;
}

export const mockTrainers: Trainer[] = Array.from({ length: 20 }).map((_, i) => {
  const name = generateName();
  return {
    id: `tr-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@hexaware.com`,
    avatar: getAvatar(name),
    title: randChoice(["Senior Technical Trainer", "Principal Trainer", "Lead Instructor", "SME / Trainer"]),
    utilization: randInt(60, 100),
    rating: Number((random() * 1 + 4).toFixed(1)), // 4.0 to 5.0
    skills: Array.from({ length: randInt(2, 5) }).map(() => randChoice(technologies)).filter((v, i, a) => a.indexOf(v) === i),
    location: randChoice(locations),
    currentBatches: randInt(1, 3)
  };
});

export const mockBatches: Batch[] = Array.from({ length: 35 }).map((_, i) => {
  const id = `b-${i + 1}`;
  const tech = randChoice(technologies);
  const loc = randChoice(locations);
  const status = randChoice(["Planned", "In Progress", "In Progress", "In Progress", "On Hold", "Completed", "Archived"]) as Batch['status'];
  
  return {
    id,
    name: `HX-${tech.split(' ')[0].toUpperCase()}-${loc.substring(0, 3).toUpperCase()}-${100 + i}`,
    technology: tech,
    status,
    startDate: `2024-${randInt(1, 12).toString().padStart(2, '0')}-01`,
    endDate: `2024-${randInt(1, 12).toString().padStart(2, '0')}-28`,
    trainerId: randChoice(mockTrainers).id,
    location: loc,
    candidateCount: randInt(15, 35),
    attendancePercent: randInt(85, 100),
    passRate: randInt(75, 100)
  };
});

export const mockCandidates: Candidate[] = Array.from({ length: 250 }).map((_, i) => {
  const name = generateName();
  const batch = randChoice(mockBatches);
  let status = "Active";
  const p = random();
  if (p > 0.95) status = "Dropped";
  else if (p > 0.85) status = "At Risk";
  else if (batch.status === "Completed") status = "Graduated";

  return {
    id: `c-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@hexaware.com`,
    avatar: getAvatar(`${name}-${i}`),
    batchId: batch.id,
    performance: randInt(60, 100),
    attendancePercent: randInt(70, 100),
    status: status as Candidate['status']
  };
});

export const mockActivity = [
  { id: "1", user: "Admin", action: "created batch", target: "HX-JAVA-MUM-124", timestamp: "10 mins ago" },
  { id: "2", user: "System", action: "generated report", target: "Weekly Attendance", timestamp: "1 hour ago" },
  { id: "3", user: "Priya Iyer", action: "published grades for", target: "AWS Cloud Practitioner", timestamp: "2 hours ago" },
  { id: "4", user: "Admin", action: "updated trainer mapping", target: "Rahul Menon", timestamp: "3 hours ago" },
];

import type { Notification } from "./types";

export const mockNotifications: Notification[] = [
  { id: "1", title: "Low Attendance Alert", description: "Batch HX-JAVA-MUM-105 has dropped below 85% attendance.", timestamp: "1 hour ago", read: false, type: "alert" },
  { id: "2", title: "Assessment Due", description: "React Fundamentals assessment is due for 3 batches tomorrow.", timestamp: "3 hours ago", read: false, type: "warning" },
  { id: "3", title: "Batch Completed", description: "Batch HX-DATA-CHE-112 has successfully completed training.", timestamp: "1 day ago", read: true, type: "success" },
  { id: "4", title: "New Trainer Onboarded", description: "Anjali Verma has joined as a Cloud Native trainer.", timestamp: "2 days ago", read: true, type: "info" },
  { id: "5", title: "Feedback Window Open", description: "Mid-batch feedback collection started for 4 active batches.", timestamp: "2 days ago", read: true, type: "info" },
];
