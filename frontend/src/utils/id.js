// Generates readable, collision-resistant ids for mock records.
// A real backend will assign ids itself; the frontend only needs them until then.
export function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
