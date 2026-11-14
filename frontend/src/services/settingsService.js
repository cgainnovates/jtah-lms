import { initialSettings } from "../mocks/adminData.js";
import { readStore, writeStore, resetStore } from "./storage.js";
import { logActivity } from "./activityService.js";
import { wait } from "./latency.js";

// Only non-sensitive, display-level configuration lives here. Secrets (API keys, database
// credentials, email passwords) must never be stored in or edited from the frontend.
const merge = (stored) => Object.fromEntries(Object.keys(initialSettings).map((key) => [key, { ...initialSettings[key], ...(stored?.[key] || {}) }]));

export const settingsService = {
  read() { return merge(readStore("settings", null)); },
  async get() { await wait(80); return this.read(); },
  async save(settings) {
    await wait();
    if (!writeStore("settings", settings)) throw new Error("Browser storage is full. Remove the uploaded logo or reset demo data, then try again.");
    logActivity("Updated platform settings");
    return settings;
  },
  async resetDemoData() {
    await wait();
    resetStore();
  },
};
