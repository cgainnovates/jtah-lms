import { repository } from "./mockRepository.js";
import { logActivity } from "./activityService.js";
import { makeId } from "../utils/id.js";
import { wait } from "./latency.js";

// NOTE: roles and status changes here are demonstration only. The backend must enforce
// who is allowed to change roles; the browser can never be trusted to do that.
export const userService = {
  async list() { await wait(); return repository.list("users"); },
  async get(id) { await wait(); return repository.get("users", id); },
  async enrolments(userId) {
    await wait(80);
    return repository.list("enrolments").filter((e) => e.userId === userId);
  },
  async allEnrolments() { await wait(80); return repository.list("enrolments"); },
  async setStatus(id, status) {
    await wait();
    const user = repository.update("users", id, { status });
    logActivity(`${status === "Active" ? "Activated" : "Deactivated"} account for ${user.name}`);
    return user;
  },
  async setRole(id, role) {
    await wait();
    const user = repository.update("users", id, { role });
    logActivity(`Changed role of ${user.name} to ${role}`);
    return user;
  },
  async enrol(userId, courseId) {
    await wait();
    const exists = repository.list("enrolments").some((e) => e.userId === userId && e.courseId === courseId);
    if (exists) throw new Error("This learner is already enrolled in that course.");
    const user = repository.get("users", userId);
    const course = repository.get("courses", courseId);
    const saved = repository.save("enrolments", { id: makeId("enr"), userId, courseId, enrolledAt: new Date().toISOString().slice(0, 10), progress: 0 });
    logActivity(`Enrolled ${user?.name} in “${course?.title}”`);
    return saved;
  },
  async unenrol(enrolmentId) {
    await wait();
    const enrolment = repository.get("enrolments", enrolmentId);
    repository.remove("enrolments", enrolmentId);
    if (enrolment) {
      const user = repository.get("users", enrolment.userId);
      const course = repository.get("courses", enrolment.courseId);
      logActivity(`Removed ${user?.name} from “${course?.title}”`);
    }
  },
};
