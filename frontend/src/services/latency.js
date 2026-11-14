// Mock network delay so loading states are real and visible during development.
export const wait = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));
