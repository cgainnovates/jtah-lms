import { ExternalLink, Download, File } from "lucide-react";
import { safeUrl, toEmbedUrl } from "../../utils/files.js";
import { lessonType } from "./lessonTypes.js";
import s from "./LessonViewer.module.css";

// Renders one lesson by type. Shared by the learner learning interface and the
// administrator preview, so what an admin previews is exactly what learners get.
//   learner   : hides authoring hints and falls back to the lesson text when media is missing
//   hideTitle : the learning page already shows the lesson title in its own heading
export default function LessonViewer({ lesson, learner = false, hideTitle = false }) {
  const type = lessonType(lesson.type);
  const href = lesson.fileData || safeUrl(lesson.url);
  const embed = toEmbedUrl(lesson.url);
  const paragraphs = (lesson.body || "").split(/\n{2,}/).filter(Boolean);
  const text = paragraphs.map((para, i) => <p key={i} className={s.para}>{para}</p>);
  const missing = (adminHint) => (learner ? (text.length ? text : <p className={s.hint}>Content for this lesson is coming soon.</p>) : <p className={s.hint}>{adminHint}</p>);

  return (
    <article>
      {!hideTitle && <><div className={s.eyebrow}>{type.label}{lesson.duration ? ` · ${lesson.duration}` : ""}</div><h3 className={s.title}>{lesson.title || "Untitled lesson"}</h3></>}

      {lesson.type === "video" && (embed
        ? <iframe className={s.frame} title={lesson.title || "Video lesson"} src={embed} style={{ aspectRatio: "16/9", border: 0 }} allowFullScreen />
        : href ? <video controls src={href} style={{ width: "100%", borderRadius: 12 }} /> : missing("Add a video address to preview it."))}

      {lesson.type === "reading" && (text.length ? text : missing("Write the lesson content to preview it."))}

      {lesson.type === "pdf" && (href
        ? <>
            <iframe className={s.frame} title={lesson.title || "Document"} src={href} style={{ height: 420 }} />
            <p className={s.hint} style={{ marginTop: 8 }}>Some websites block embedded viewing. <a href={href} target="_blank" rel="noopener noreferrer">Open the document in a new tab</a>.</p>
          </>
        : missing("Upload or link a document to preview it."))}

      {(lesson.type === "link" || lesson.type === "download") && (
        <div className={s.card}>
          <div className={s.icon}>{lesson.type === "link" ? <ExternalLink size={20} /> : <File size={20} />}</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <strong>{lesson.fileName || lesson.title || "Resource"}</strong>
            <div className={s.sub}>{lesson.type === "link" ? safeUrl(lesson.url) || "No address yet" : "Downloadable file"}</div>
          </div>
          {href && (lesson.type === "link"
            ? <a className="btn" href={href} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />Open link</a>
            : <a className="btn" href={href} download={lesson.fileName || true} target="_blank" rel="noopener noreferrer"><Download size={16} />Download</a>)}
        </div>
      )}
      {learner && lesson.type !== "reading" && paragraphs.length > 0 && href && <div style={{ marginTop: 16 }}>{text}</div>}
    </article>
  );
}
