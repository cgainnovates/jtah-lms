import { useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Layers } from "lucide-react";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import LessonEditorModal from "./LessonEditorModal.jsx";
import { lessonType } from "../../lessons/lessonTypes.js";
import { addModule, renameModule, deleteModule, moveModule, saveLesson, deleteLesson, moveLesson, newLesson, countLessons } from "./curriculumOps.js";
import s from "../shared/adminUi.module.css";
import b from "./builder.module.css";

// Course > Module > Lesson, shown as a nested structure so the hierarchy is obvious.
// All changes go through `onChange(modules)`; saving happens in the parent course editor.
export default function CurriculumBuilder({ modules, onChange }) {
  const [lessonDialog, setLessonDialog] = useState(null); // { moduleId, lesson, isNew }
  const [confirm, setConfirm] = useState(null);           // { type, moduleId, lessonId, label }
  const [newTitle, setNewTitle] = useState("");

  function handleAddModule(event) {
    event.preventDefault();
    onChange(addModule(modules, newTitle.trim() || `Module ${modules.length + 1}`));
    setNewTitle("");
  }

  function runConfirm() {
    if (confirm.type === "module") onChange(deleteModule(modules, confirm.moduleId));
    else onChange(deleteLesson(modules, confirm.moduleId, confirm.lessonId));
    setConfirm(null);
  }

  return (
    <div>
      <p className={s.noticeBox}><Layers size={18} />A course contains modules, and each module contains lessons. Learners work through them in the order shown here. Remember to save the course after making changes.</p>
      <p className={s.sub} style={{ marginBottom: 12 }}>{modules.length} module{modules.length === 1 ? "" : "s"} · {countLessons(modules)} lesson{countLessons(modules) === 1 ? "" : "s"}</p>

      {!modules.length && (
        <EmptyState icon={Layers} title="No modules yet" message="Start by adding your first module, then add lessons inside it." />
      )}

      <ol className={b.moduleList}>
        {modules.map((module, mi) => (
          <li key={module.id} className={b.module}>
            <div className={b.moduleHead}>
              <span className={b.index}>{mi + 1}</span>
              <input className={`field ${b.moduleTitle}`} value={module.title} aria-label={`Title of module ${mi + 1}`} maxLength={100}
                onChange={(e) => onChange(renameModule(modules, module.id, e.target.value))} />
              <div className={s.actions}>
                <button type="button" className={s.iconBtn} aria-label="Move module up" disabled={mi === 0} onClick={() => onChange(moveModule(modules, module.id, -1))}><ChevronUp size={16} /></button>
                <button type="button" className={s.iconBtn} aria-label="Move module down" disabled={mi === modules.length - 1} onClick={() => onChange(moveModule(modules, module.id, 1))}><ChevronDown size={16} /></button>
                <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label="Delete module" onClick={() => setConfirm({ type: "module", moduleId: module.id, label: module.title })}><Trash2 size={16} /></button>
              </div>
            </div>

            <ul className={b.lessonList}>
              {module.lessons.map((lesson, li) => {
                const Icon = lessonType(lesson.type).icon;
                return (
                  <li key={lesson.id} className={b.lesson}>
                    <span className={b.lessonIcon}><Icon size={16} /></span>
                    <div className={b.lessonText}>
                      <strong>{lesson.title}</strong>
                      <span className={s.cellSub}>{lessonType(lesson.type).label}{lesson.duration ? ` · ${lesson.duration}` : ""}</span>
                    </div>
                    <div className={s.actions}>
                      <button type="button" className={s.iconBtn} aria-label={`Move ${lesson.title} up`} disabled={li === 0} onClick={() => onChange(moveLesson(modules, module.id, lesson.id, -1))}><ChevronUp size={16} /></button>
                      <button type="button" className={s.iconBtn} aria-label={`Move ${lesson.title} down`} disabled={li === module.lessons.length - 1} onClick={() => onChange(moveLesson(modules, module.id, lesson.id, 1))}><ChevronDown size={16} /></button>
                      <button type="button" className={s.iconBtn} aria-label={`Edit ${lesson.title}`} onClick={() => setLessonDialog({ moduleId: module.id, lesson, isNew: false })}><Pencil size={16} /></button>
                      <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Delete ${lesson.title}`} onClick={() => setConfirm({ type: "lesson", moduleId: module.id, lessonId: lesson.id, label: lesson.title })}><Trash2 size={16} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button type="button" className={`btn btn-secondary ${s.btnInline}`} onClick={() => setLessonDialog({ moduleId: module.id, lesson: newLesson(), isNew: true })}><Plus size={16} />Add lesson</button>
          </li>
        ))}
      </ol>

      <form className={b.addModule} onSubmit={handleAddModule}>
        <input className="field" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New module title (optional)" aria-label="New module title" maxLength={100} />
        <button type="submit" className={`btn ${s.btnInline}`}><Plus size={16} />Add module</button>
      </form>

      {lessonDialog && (
        <LessonEditorModal key={lessonDialog.lesson.id} lesson={lessonDialog.lesson} isNew={lessonDialog.isNew}
          onClose={() => setLessonDialog(null)}
          onSave={(lesson) => { onChange(saveLesson(modules, lessonDialog.moduleId, lesson)); setLessonDialog(null); }} />
      )}
      <ConfirmDialog open={!!confirm} title={confirm?.type === "module" ? "Delete this module?" : "Delete this lesson?"}
        message={confirm?.type === "module" ? `“${confirm?.label}” and every lesson inside it will be removed from this course once you save.` : `“${confirm?.label}” will be removed from this module once you save.`}
        confirmLabel="Delete" onCancel={() => setConfirm(null)} onConfirm={runConfirm} />
    </div>
  );
}
