import { useState } from "react";
import Modal from "../shared/Modal.jsx";
import { totalMarks } from "./assessmentOps.js";
import s from "../shared/adminUi.module.css";

// Shows the assessment as a learner will meet it. Answers are not stored or graded;
// grading and submissions are part of the backend stage.
export default function AssessmentPreviewModal({ assessment, onClose }) {
  const [showKey, setShowKey] = useState(false);
  return (
    <Modal open wide title="Assessment preview" onClose={onClose} footer={<button type="button" className="btn" onClick={onClose}>Close preview</button>}>
      <div className={s.noticeBox}>Preview only. Answers are not saved or graded.</div>
      <h3 className={s.cardTitle} style={{ fontSize: 20 }}>{assessment.title || "Untitled assessment"}</h3>
      <p className={s.sub} style={{ margin: "4px 0 12px" }}>{totalMarks(assessment)} marks · Pass mark {assessment.passMark}%{assessment.timeLimit > 0 ? ` · ${assessment.timeLimit} minutes` : " · No time limit"}</p>
      <p style={{ marginBottom: 16 }}>{assessment.description}</p>
      <label className={s.checkItem} style={{ marginBottom: 16 }}><input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} />Show answer key (administrators only)</label>
      {assessment.questions.length === 0 && <p className={s.hint}>No questions added yet.</p>}
      <ol className={s.grid} style={{ paddingLeft: 20 }}>
        {assessment.questions.map((q) => (
          <li key={q.id}>
            <strong>{q.text || "Question text missing"}</strong> <span className={s.sub}>({q.marks} mark{Number(q.marks) === 1 ? "" : "s"})</span>
            {q.type === "mcq"
              ? <div style={{ display: "grid", gap: 6, marginTop: 8 }}>{q.options.filter((o) => o.text.trim()).map((o) => (
                  <label key={o.id} className={s.checkItem}><input type="radio" name={q.id} />{o.text}{showKey && o.id === q.correctId && <span className={`${s.badge} ${s.toneGreen}`}>Correct</span>}</label>))}</div>
              : <><textarea className="field" rows={3} style={{ marginTop: 8 }} aria-label="Written answer" placeholder="Learner types their answer here" />
                  {showKey && q.guidance && <p className={s.hint} style={{ marginTop: 6 }}>Marking guidance: {q.guidance}</p>}</>}
          </li>
        ))}
      </ol>
    </Modal>
  );
}
