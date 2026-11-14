// Pure functions that transform the modules array. Keeping them free of React makes the
// curriculum logic easy to test and reuse when the backend takes over persistence.
import { makeId } from "../../../utils/id.js";
import { safeUrl } from "../../../utils/files.js";

export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const newModule = (title = "New module") => ({ id: makeId("mod"), title, lessons: [] });
export const newLesson = (type = "video") => ({ id: makeId("les"), title: "", type, duration: "10 min", url: "", body: "", fileName: "", fileData: "", completed: false });

export const addModule = (modules, title) => [...modules, newModule(title)];
export const renameModule = (modules, id, title) => modules.map((m) => (m.id === id ? { ...m, title } : m));
export const deleteModule = (modules, id) => modules.filter((m) => m.id !== id);
export const moveModule = (modules, id, delta) => { const i = modules.findIndex((m) => m.id === id); return moveItem(modules, i, i + delta); };

// Adds a lesson, or replaces it when a lesson with the same id already exists in the module.
export const saveLesson = (modules, moduleId, lesson) => modules.map((m) => {
  if (m.id !== moduleId) return m;
  const exists = m.lessons.some((l) => l.id === lesson.id);
  return { ...m, lessons: exists ? m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) : [...m.lessons, lesson] };
});
export const deleteLesson = (modules, moduleId, lessonId) => modules.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m));
export const moveLesson = (modules, moduleId, lessonId, delta) => modules.map((m) => {
  if (m.id !== moduleId) return m;
  const i = m.lessons.findIndex((l) => l.id === lessonId);
  return { ...m, lessons: moveItem(m.lessons, i, i + delta) };
});

export const countLessons = (modules = []) => modules.reduce((n, m) => n + m.lessons.length, 0);

// Returns an object of field -> message; empty object means the lesson is valid.
export function validateLesson(lesson) {
  const errors = {};
  if (!lesson.title.trim()) errors.title = "Give the lesson a title.";
  if (lesson.type === "video" || lesson.type === "link") {
    if (!lesson.url.trim()) errors.url = "Enter a web address.";
    else if (!safeUrl(lesson.url)) errors.url = "Enter a full address starting with https://";
  }
  if (lesson.type === "reading" && !lesson.body.trim()) errors.body = "Write the lesson content.";
  if (lesson.type === "pdf" || lesson.type === "download") {
    if (!lesson.fileName && !lesson.url.trim()) errors.file = "Upload a file or enter a web address.";
    if (lesson.url.trim() && !safeUrl(lesson.url)) errors.url = "Enter a full address starting with https://";
  }
  return errors;
}

// Everything that must be true before a course can be published.
export function publishProblems(course) {
  const problems = [];
  if (!course.title.trim()) problems.push("Add a course title.");
  if (!course.description.trim()) problems.push("Add a course description.");
  if (!course.objectives.length) problems.push("Add at least one learning objective.");
  if (!course.modules.length) problems.push("Add at least one module.");
  course.modules.forEach((m) => { if (!m.lessons.length) problems.push(`Module “${m.title}” has no lessons.`); });
  return problems;
}
