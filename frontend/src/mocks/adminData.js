// Seed data for the administrator control centre (Stage 02).
// Everything here is demonstration data stored in the browser; a backend replaces it later.
import { initialUsers } from "./data.js";

const addDays = (iso, days) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const extraUsers = [
  { id: "user-004", name: "Chinedu Eze", email: "chinedu@example.com", role: "Learner", status: "Active", joined: "2026-08-21" },
  { id: "user-005", name: "Ngozi Umeh", email: "ngozi@example.com", role: "Learner", status: "Active", joined: "2026-09-03" },
  { id: "user-006", name: "Tunde Balogun", email: "tunde@example.com", role: "Learner", status: "Inactive", joined: "2026-09-09" },
  { id: "user-007", name: "Fatima Yusuf", email: "fatima@example.com", role: "Learner", status: "Active", joined: "2026-09-27" },
  { id: "user-008", name: "Ibrahim Musa", email: "ibrahim@example.com", role: "Instructor", status: "Active", joined: "2026-08-14" },
  { id: "user-009", name: "Blessing Okon", email: "blessing@example.com", role: "Learner", status: "Active", joined: "2026-10-05" },
  { id: "user-010", name: "Emeka Nwosu", email: "emeka@example.com", role: "Learner", status: "Active", joined: "2026-10-26" },
  { id: "user-011", name: "Halima Sani", email: "halima@example.com", role: "Instructor", status: "Active", joined: "2026-09-15" },
  { id: "user-012", name: "Grace Adeyemi", email: "grace@example.com", role: "Learner", status: "Pending", joined: "2026-11-10" },
];

const allUsers = [...initialUsers, ...extraUsers];
const progressCycle = [100, 64, 12, 100, 38, 87, 0, 55];

// Each learner is enrolled in two of the three seeded courses, with deterministic progress.
export const initialEnrolments = allUsers
  .filter((user) => user.role === "Learner")
  .flatMap((user, i) =>
    ["course-001", "course-002", "course-003"]
      .filter((_, c) => (i + c) % 3 !== 2)
      .map((courseId, c) => ({
        id: `enr-${user.id}-${courseId}`,
        userId: user.id,
        courseId,
        enrolledAt: addDays(user.joined, c + 1),
        progress: progressCycle[(i + c * 3) % progressCycle.length],
      }))
  );

export const initialMaterials = [
  { id: "mat-1", title: "CV writing checklist", description: "A one-page checklist for preparing a professional CV.", category: "Career guides", kind: "link", url: "https://example.com/cv-checklist", fileName: "", size: 0, dataUrl: "", visibility: "enrolled", courseId: "course-002", moduleId: "mod-3", status: "active", addedAt: "2026-10-20T09:30:00" },
  { id: "mat-2", title: "Digital safety quick guide", description: "Short guide on passwords, phishing and safe sharing.", category: "Study guides", kind: "link", url: "https://example.com/digital-safety", fileName: "", size: 0, dataUrl: "", visibility: "everyone", courseId: "course-001", moduleId: "", status: "active", addedAt: "2026-10-24T14:10:00" },
  { id: "mat-3", title: "Business model canvas template", description: "Printable canvas for planning a business idea.", category: "Templates", kind: "link", url: "https://example.com/canvas", fileName: "", size: 0, dataUrl: "", visibility: "hidden", courseId: "course-003", moduleId: "", status: "active", addedAt: "2026-11-01T11:00:00" },
];

export const initialAssessments = [
  {
    id: "asm-1", title: "Digital foundations check", description: "Confirm understanding of core digital workplace skills.",
    courseId: "course-001", moduleId: "mod-1", status: "published", passMark: 60, timeLimit: 20,
    stats: { attempts: 41, avgScore: 72, passRate: 83 },
    questions: [
      { id: "q-1", type: "mcq", text: "Which is the strongest password practice?", marks: 2, guidance: "", options: [{ id: "o-1", text: "Reuse one memorable password" }, { id: "o-2", text: "Use a unique passphrase for each account" }, { id: "o-3", text: "Share passwords with teammates" }], correctId: "o-2" },
      { id: "q-2", type: "written", text: "Describe one way to keep your work files organised.", marks: 4, guidance: "Look for a clear folder or naming approach.", options: [], correctId: "" },
    ],
  },
  {
    id: "asm-2", title: "Career readiness quiz", description: "A short quiz on CV and interview preparation.",
    courseId: "course-002", moduleId: "", status: "draft", passMark: 50, timeLimit: 15,
    stats: { attempts: 0, avgScore: 0, passRate: 0 },
    questions: [],
  },
];

export const initialActivity = [
  { id: "act-1", at: "2026-11-12T16:40:00", actor: "Administrator", message: "Published course “Digital Skills for the Modern Workplace”" },
  { id: "act-2", at: "2026-11-11T10:05:00", actor: "Administrator", message: "Added learning material “Digital safety quick guide”" },
  { id: "act-3", at: "2026-11-09T13:20:00", actor: "Administrator", message: "Activated learner account for Fatima Yusuf" },
  { id: "act-4", at: "2026-11-06T08:55:00", actor: "Administrator", message: "Created assessment “Career readiness quiz” as a draft" },
];

// SAMPLE engagement series. Real engagement tracking needs the backend (Stage 03+),
// so the interface labels these figures as sample data.
export const sampleEngagement = [
  { label: "Wk 1", activeLearners: 18, lessonsCompleted: 42 },
  { label: "Wk 2", activeLearners: 24, lessonsCompleted: 61 },
  { label: "Wk 3", activeLearners: 22, lessonsCompleted: 55 },
  { label: "Wk 4", activeLearners: 31, lessonsCompleted: 83 },
  { label: "Wk 5", activeLearners: 35, lessonsCompleted: 97 },
  { label: "Wk 6", activeLearners: 33, lessonsCompleted: 90 },
  { label: "Wk 7", activeLearners: 40, lessonsCompleted: 118 },
  { label: "Wk 8", activeLearners: 44, lessonsCompleted: 131 },
];

export const initialSettings = {
  identity: { platformName: "JTAH Learning", tagline: "Learning that builds careers", supportEmail: "support@jtah.example", website: "" },
  branding: { logoData: "", footerText: "© JTAH Foundation" },
  admin: { defaultPageSize: 8, showSampleAnalytics: true },
  notifications: { newRegistration: true, courseCompleted: true, weeklyDigest: false, assessmentSubmitted: true },
  learning: { selfEnrolment: true, defaultPassMark: 60, certificatesEnabled: true, categories: ["Digital Skills", "Career Development", "Entrepreneurship", "General"], materialCategories: ["Study guides", "Career guides", "Templates", "Reference"] },
  account: { timezone: "Africa/Lagos", language: "English", dateFormat: "DD MMM YYYY" },
};
