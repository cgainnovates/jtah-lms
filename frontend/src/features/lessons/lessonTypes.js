import { CirclePlay, FileText, File, ExternalLink, Download } from "lucide-react";

// Lesson types supported by the curriculum builder. "reading" is the id Stage 01 already used for text lessons.
export const LESSON_TYPES = [
  { id: "video", label: "Video lesson", icon: CirclePlay, hint: "Link to a YouTube, Vimeo or direct video address." },
  { id: "reading", label: "Text lesson", icon: FileText, hint: "Write the lesson content directly." },
  { id: "pdf", label: "PDF / document", icon: File, hint: "Upload a PDF or link to one." },
  { id: "link", label: "External learning link", icon: ExternalLink, hint: "Send learners to an outside website or tool." },
  { id: "download", label: "Downloadable resource", icon: Download, hint: "Provide a file learners can save." },
];

export const lessonType = (id) => LESSON_TYPES.find((t) => t.id === id) || LESSON_TYPES[1];
