import { useState } from "react";
import Modal from "../shared/Modal.jsx";
import LessonViewer from "../../lessons/LessonViewer.jsx";
import { lessonType } from "../../lessons/lessonTypes.js";
import s from "../shared/adminUi.module.css";
import b from "./builder.module.css";

// "Preview the learner experience": shows the unsaved course the way learners will navigate it.
export default function CoursePreviewModal({ course, thumbnail, onClose }) {
  const firstLesson = course.modules.flatMap((m) => m.lessons)[0];
  const [activeId, setActiveId] = useState(firstLesson?.id);
  const active = course.modules.flatMap((m) => m.lessons).find((l) => l.id === activeId);

  return (
    <Modal open wide title="Learner preview" onClose={onClose} footer={<button type="button" className="btn" onClick={onClose}>Close preview</button>}>
      <div className={s.noticeBox}>This is how learners will see the course. Progress and completion are not recorded in preview.</div>
      <div className={s.grid} style={{ gridTemplateColumns: "minmax(0, 1fr)", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {thumbnail && <img className={b.thumbPreview} src={thumbnail} alt="" />}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 className={s.cardTitle} style={{ fontSize: 20 }}>{course.title || "Untitled course"}</h3>
            <p className={s.sub}>{[course.category, course.level, course.duration, course.instructor].filter(Boolean).join(" · ")}</p>
            <p style={{ margin: "8px 0", fontSize: 14 }}>{course.description}</p>
            {course.objectives.length > 0 && <ul style={{ paddingLeft: 18, fontSize: 14 }}>{course.objectives.map((o) => <li key={o}>{o}</li>)}</ul>}
          </div>
        </div>
      </div>
      {!firstLesson ? <p className={s.hint}>Add at least one lesson to preview the learning interface.</p> : (
        <div className={b.preview}>
          <nav className={b.previewNav} aria-label="Course contents">
            {course.modules.map((m) => (
              <div key={m.id}>
                <div className={b.previewModule}>{m.title}</div>
                {m.lessons.map((l) => {
                  const Icon = lessonType(l.type).icon;
                  return <button key={l.id} type="button" className={`${b.previewItem} ${l.id === activeId ? b.previewActive : ""}`} onClick={() => setActiveId(l.id)}><Icon size={14} />{l.title}</button>;
                })}
              </div>
            ))}
          </nav>
          <div>{active && <LessonViewer lesson={active} />}</div>
        </div>
      )}
    </Modal>
  );
}
