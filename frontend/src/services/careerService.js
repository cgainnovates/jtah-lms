import { repository } from "./mockRepository.js";
import { logActivity } from "./activityService.js";
import { isLive } from "../utils/status.js";
import { wait } from "./latency.js";

export const careerService = {
  getAll: async () => repository.list("careers"),
  getById: async (id) => repository.get("careers", id),
  getLive: async () => repository.list("careers").filter(isLive),
  save: async (data) => repository.save("careers", data),
  remove: async (id) => repository.remove("careers", id),

  async adminList() { await wait(); return repository.list("careers"); },
  async adminSave(pathway) {
    await wait();
    const isNew = !repository.get("careers", pathway.id);
    const saved = repository.save("careers", pathway);
    logActivity(`${isNew ? "Created" : "Updated"} career pathway “${saved.title}”`);
    return saved;
  },
  async setStatus(id, status) {
    await wait();
    const pathway = repository.update("careers", id, { status });
    logActivity(`${status === "published" ? "Published" : status === "archived" ? "Archived" : "Moved to draft"} career pathway “${pathway.title}”`);
    return pathway;
  },
  async delete(id) {
    await wait();
    const pathway = repository.get("careers", id);
    repository.remove("careers", id);
    if (pathway) logActivity(`Deleted career pathway “${pathway.title}”`);
  },
};
