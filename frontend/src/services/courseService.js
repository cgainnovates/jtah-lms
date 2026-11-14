import { repository } from "./mockRepository.js";
import { logActivity } from "./activityService.js";
import { isLive } from "../utils/status.js";
import { wait } from "./latency.js";

// Learner screens use getAll/getById/getLive; the administrator screens use the rest.
export const courseService = {
  getAll: async () => repository.list("courses"),
  getById: async (id) => repository.get("courses", id),
  getLive: async () => repository.list("courses").filter(isLive),
  create: async (data) => repository.save("courses", data),
  update: async (id, data) => repository.save("courses", { ...data, id }),
  remove: async (id) => repository.remove("courses", id),

  async adminList() { await wait(); return repository.list("courses"); },
  async adminGet(id) { await wait(); return repository.get("courses", id); },
  async save(course) {
    await wait();
    const isNew = !repository.get("courses", course.id);
    const saved = repository.save("courses", course);
    logActivity(`${isNew ? "Created" : "Updated"} course “${saved.title}”`);
    return saved;
  },
  async setStatus(id, status) {
    await wait();
    const course = repository.update("courses", id, { status });
    const verb = { published: "Published", draft: "Moved to draft", archived: "Archived" }[status];
    logActivity(`${verb} course “${course.title}”`);
    return course;
  },
  async delete(id) {
    await wait();
    const course = repository.get("courses", id);
    repository.remove("courses", id);
    // Remove enrolments of the deleted course so reports stay consistent.
    repository.list("enrolments").filter((e) => e.courseId === id).forEach((e) => repository.remove("enrolments", e.id));
    if (course) logActivity(`Deleted course “${course.title}”`);
  },
};
