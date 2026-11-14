import { useState } from "react";
import Modal from "../shared/Modal.jsx";
import Field from "../shared/Field.jsx";
import FileDrop from "../shared/FileDrop.jsx";
import LessonViewer from "../../lessons/LessonViewer.jsx";
import { LESSON_TYPES, lessonType } from "../../lessons/lessonTypes.js";
import { validateLesson } from "./curriculumOps.js";
import { prepareFile, INLINE_LIMIT_BYTES } from "../../../utils/files.js";
import { formatBytes } from "../../../utils/format.js";
import s from "../shared/adminUi.module.css";

// Create or edit one lesson. Fields shown depend on the chosen lesson type.
export default function LessonEditorModal({ lesson, isNew, onSave, onClose }) {
  const [draft, setDraft] = useState(lesson);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [fileNote, setFileNote] = useState("");
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const type = lessonType(draft.type);

  async function handleFile(file) {
    try {
      const prepared = await prepareFile(file);
      set({ fileName: prepared.fileName, fileData: prepared.dataUrl, size: prepared.size });
      setFileNote(prepared.dataUrl ? "" : `This file is larger than ${formatBytes(INLINE_LIMIT_BYTES)}, so only its name is kept in this demo. The backend will store full-size files.`);
      setErrors((e) => ({ ...e, file: undefined }));
    } catch (error) { setErrors((e) => ({ ...e, file: error.message })); }
  }

  function submit() {
    const found = validateLesson(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    onSave({ ...draft, title: draft.title.trim() });
  }

  return (
    <Modal open wide={showPreview} title={isNew ? "Add lesson" : "Edit lesson"} onClose={onClose}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={() => setShowPreview((v) => !v)}>{showPreview ? "Hide preview" : "Preview lesson"}</button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn" onClick={submit}>{isNew ? "Add lesson" : "Save lesson"}</button>
      </>}>
      <div className={s.grid}>
        <Field label="Lesson type">
          {(p) => <select {...p} value={draft.type} onChange={(e) => { set({ type: e.target.value }); setErrors({}); }}>{LESSON_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>}
        </Field>
        <p className={s.hint}>{type.hint}</p>
        <Field label="Lesson title" required error={errors.title}>
          {(p) => <input {...p} value={draft.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Getting started with digital work" />}
        </Field>
        <Field label="Estimated time" hint="Shown to learners, for example “12 min”.">
          {(p) => <input {...p} value={draft.duration} maxLength={20} onChange={(e) => set({ duration: e.target.value })} />}
        </Field>

        {(draft.type === "video" || draft.type === "link") && (
          <Field label={draft.type === "video" ? "Video address" : "Web address"} required error={errors.url}>
            {(p) => <input {...p} type="url" value={draft.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://" />}
          </Field>
        )}
        {draft.type === "reading" && (
          <Field label="Lesson content" required error={errors.body} hint="Leave a blank line between paragraphs.">
            {(p) => <textarea {...p} rows={8} value={draft.body} onChange={(e) => set({ body: e.target.value })} />}
          </Field>
        )}
        {(draft.type === "pdf" || draft.type === "download") && (
          <>
            <div>
              <span className={s.label}>File</span>
              <FileDrop accept={draft.type === "pdf" ? "application/pdf" : undefined} file={draft.fileName ? { fileName: draft.fileName, size: draft.size } : null}
                onFile={handleFile} onClear={() => set({ fileName: "", fileData: "", size: 0 })} />
              {errors.file && <span className={s.error} role="alert">{errors.file}</span>}
              {fileNote && <p className={s.hint}>{fileNote}</p>}
            </div>
            <Field label="…or link to the file" error={errors.url}>
              {(p) => <input {...p} type="url" value={draft.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://" />}
            </Field>
          </>
        )}
      </div>
      {showPreview && <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}><LessonViewer lesson={draft} /></div>}
    </Modal>
  );
}
