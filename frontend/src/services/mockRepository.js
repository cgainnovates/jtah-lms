// Browser-local stand-in for the future database. Pages never import this directly;
// they go through the service layer so a real API can replace it without UI changes.
import { initialCourses, initialCareers, initialAnnouncements, initialUsers } from "../mocks/data.js";
import { extraUsers, initialEnrolments, initialMaterials, initialAssessments, initialActivity } from "../mocks/adminData.js";
import { readStore, writeStore } from "./storage.js";

const collection = {
  courses: "courses", careers: "careers", users: "users", announcements: "announcements",
  enrolments: "enrolments", materials: "materials", assessments: "assessments", activity: "activity",
};
const defaults = {
  courses: initialCourses, careers: initialCareers, users: [...initialUsers, ...extraUsers],
  announcements: initialAnnouncements, enrolments: initialEnrolments, materials: initialMaterials,
  assessments: initialAssessments, activity: initialActivity,
};

// Writes can fail when browser storage is full (large uploads). Surface that instead of losing data silently.
function persist(name, rows) {
  if (!writeStore(collection[name], rows)) {
    throw new Error("Browser storage is full. Remove large files or reset demo data in Settings, then try again.");
  }
}

export const repository = {
  // Always return a copy: with nothing stored yet readStore hands back the shared seed array,
  // and callers (save/update) modify the rows they receive.
  list(name) { return structuredClone(readStore(collection[name], defaults[name] || [])); },
  get(name, id) { return this.list(name).find((item) => item.id === id) || null; },
  save(name, item) {
    const rows = this.list(name);
    const index = rows.findIndex((row) => row.id === item.id);
    const saved = { ...item, id: item.id || `${name.slice(0, -1)}-${Date.now()}` };
    if (index >= 0) rows[index] = { ...rows[index], ...saved };
    else rows.unshift(saved);
    persist(name, rows);
    return index >= 0 ? rows[index] : saved;
  },
  remove(name, id) {
    const rows = this.list(name).filter((row) => row.id !== id);
    persist(name, rows);
    return rows;
  },
  update(name, id, patch) {
    const rows = this.list(name).map((row) => (row.id === id ? { ...row, ...patch } : row));
    persist(name, rows);
    return rows.find((row) => row.id === id);
  },
};
