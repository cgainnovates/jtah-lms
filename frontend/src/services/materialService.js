import { repository } from "./mockRepository.js";
import { logActivity } from "./activityService.js";
import { wait } from "./latency.js";

export const materialService = {
  async list() { await wait(); return repository.list("materials"); },
  async save(material) {
    await wait();
    const isNew = !repository.get("materials", material.id);
    const saved = repository.save("materials", material);
    logActivity(`${isNew ? "Added" : "Updated"} learning material “${saved.title}”`);
    return saved;
  },
  async setStatus(id, status) {
    await wait();
    const material = repository.update("materials", id, { status });
    logActivity(`${status === "archived" ? "Archived" : "Restored"} learning material “${material.title}”`);
    return material;
  },
  async delete(id) {
    await wait();
    const material = repository.get("materials", id);
    repository.remove("materials", id);
    if (material) logActivity(`Removed learning material “${material.title}”`);
  },
};
