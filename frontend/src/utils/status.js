// Content without a status (older Stage 1 records) is treated as live so nothing disappears.
export const isLive = (item) => !item.status || item.status === "published";
export const isArchived = (item) => item.status === "archived";
