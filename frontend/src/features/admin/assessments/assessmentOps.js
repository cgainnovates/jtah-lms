import { makeId } from "../../../utils/id.js";

export const newOption = () => ({ id: makeId("opt"), text: "" });
export const newQuestion = (type = "mcq") => ({
  id: makeId("q"), type, text: "", marks: 1, guidance: "",
  options: type === "mcq" ? [newOption(), newOption()] : [], correctId: "",
});
export const blankAssessment = (defaultPassMark = 60) => ({
  id: makeId("asm"), title: "", description: "", courseId: "", moduleId: "", status: "draft",
  passMark: defaultPassMark, timeLimit: 0, questions: [], stats: { attempts: 0, avgScore: 0, passRate: 0 },
});

export const totalMarks = (assessment) => assessment.questions.reduce((n, q) => n + (Number(q.marks) || 0), 0);

// Returns { fields: {...}, questions: { [questionId]: message } }. Empty on both means valid.
// `forPublish` adds the stricter checks required before learners can see the assessment.
export function validateAssessment(a, forPublish) {
  const fields = {};
  const questions = {};
  if (!a.title.trim()) fields.title = "Enter an assessment title.";
  if (!(Number(a.passMark) >= 1 && Number(a.passMark) <= 100)) fields.passMark = "Pass mark must be between 1 and 100.";
  if (Number(a.timeLimit) < 0) fields.timeLimit = "Time limit cannot be negative.";
  if (forPublish) {
    if (!a.courseId) fields.courseId = "Choose the course this assessment belongs to.";
    if (!a.questions.length) fields.questions = "Add at least one question before publishing.";
  }
  a.questions.forEach((q, i) => {
    if (!q.text.trim()) questions[q.id] = `Question ${i + 1} needs its question text.`;
    else if (!(Number(q.marks) > 0)) questions[q.id] = `Question ${i + 1} needs marks greater than zero.`;
    else if (q.type === "mcq") {
      const filled = q.options.filter((o) => o.text.trim());
      if (filled.length < 2) questions[q.id] = `Question ${i + 1} needs at least two answer options.`;
      else if (!filled.some((o) => o.id === q.correctId)) questions[q.id] = `Question ${i + 1}: select the correct answer.`;
    }
  });
  return { fields, questions, ok: !Object.keys(fields).length && !Object.keys(questions).length };
}
