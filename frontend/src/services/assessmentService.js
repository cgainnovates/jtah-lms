import { repository } from "./mockRepository.js";
import { logActivity } from "./activityService.js";
import { wait } from "./latency.js";

// Authoring only. Submission and grading arrive with the backend.
export const assessmentService = {
  async list() { await wait(); return repository.list("assessments"); },
  async get(id) { await wait(); return repository.get("assessments", id); },
  async save(assessment) {
    await wait();
    const isNew = !repository.get("assessments", assessment.id);
    const saved = repository.save("assessments", assessment);
    logActivity(`${isNew ? "Created" : "Updated"} assessment “${saved.title}” (${saved.status})`);
    return saved;
  },
  async delete(id) {
    await wait();
    const assessment = repository.get("assessments", id);
    repository.remove("assessments", id);
    if (assessment) logActivity(`Deleted assessment “${assessment.title}”`);
  },
};
