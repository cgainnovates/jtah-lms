// Browser-side file helpers used by the upload workflows.
// Until the backend stores files, small files are kept as data URLs in local storage,
// so the cap is deliberately low. Larger files keep their metadata only.
export const INLINE_LIMIT_BYTES = 600 * 1024;

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

// Maps a file to the kind of preview the interface supports.
export function detectKind(name = "", mime = "") {
  const ext = name.split(".").pop().toLowerCase();
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("video/") || ["mp4", "webm", "mov"].includes(ext)) return "video";
  if (mime.startsWith("text/") || ["txt", "md", "csv"].includes(ext)) return "text";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) return "office";
  return "other";
}

// Returns { fileName, size, kind, dataUrl } where dataUrl is empty when the file is too large to keep locally.
export async function prepareFile(file) {
  const kind = detectKind(file.name, file.type);
  const dataUrl = file.size <= INLINE_LIMIT_BYTES ? await readFileAsDataUrl(file) : "";
  return { fileName: file.name, size: file.size, kind, dataUrl };
}

// Only plain http(s) links are ever rendered as hrefs or embeds (blocks javascript: URLs).
export function safeUrl(value = "") {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch { return ""; }
}

// Converts a YouTube/Vimeo page link into its embeddable address; returns "" if not recognised.
export function toEmbedUrl(value = "") {
  const href = safeUrl(value);
  if (!href) return "";
  const url = new URL(href);
  if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
  if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
  if (url.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).pop()}`;
  return "";
}
