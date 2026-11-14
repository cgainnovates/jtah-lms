import { repository } from "./mockRepository.js";
import { authService } from "./authService.js";
import { makeId } from "../utils/id.js";
import { wait } from "./latency.js";

// Every administrative change is recorded so admins can see who did what.
export function logActivity(message) {
  const actor = authService.getUser()?.name || "Administrator";
  try {
    repository.save("activity", { id: makeId("act"), at: new Date().toISOString(), actor, message });
  } catch { /* the audit trail must never block the action itself */ }
}

export const activityService = {
  async recent(limit = 8) {
    await wait();
    return [...repository.list("activity")].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
  },
};
