import { repository } from "./mockRepository.js";
import { logActivity } from "./activityService.js";
import { makeId } from "../utils/id.js";
import { wait } from "./latency.js";

export const announcementService = {
  async list() { await wait(80); return [...repository.list("announcements")].sort((a, b) => b.date.localeCompare(a.date)); },
  async create({ title, body, audience }) {
    await wait();
    const saved = repository.save("announcements", { id: makeId("ann"), title, body, audience, date: new Date().toISOString().slice(0, 10) });
    logActivity(`Posted announcement “${title}”`);
    return saved;
  },
  async delete(id) {
    await wait();
    const item = repository.get("announcements", id);
    repository.remove("announcements", id);
    if (item) logActivity(`Removed announcement “${item.title}”`);
  },
};
