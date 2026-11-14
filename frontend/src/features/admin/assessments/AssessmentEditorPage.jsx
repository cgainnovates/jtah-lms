import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Send, Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import Field from "../shared/Field.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import AssessmentPreviewModal from "./AssessmentPreviewModal.jsx";
import { blankAssessment, newQuestion, newOption, totalMarks, validateAssessment } from "./assessmentOps.js";
import { moveItem } from "../course/curriculumOps.js";
import { assessmentService } from "../../../services/assessmentService.js";
import { courseService } from "../../../services/courseService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges.js";
import s from "../shared/adminUi.module.css";

export default function AssessmentEditorPage() {
  const { assessmentId } = useParams();
  const isNew = !assessmentId;
  const { data, loading, error, reload } = useAsync(async () => {
    const [assessment, courses] = await Promise.all([isNew ? blankAssessment(settingsService.read().learning.defaultPassMark) : assessmentService.get(assessmentId), courseService.adminList()]);
    if (!assessment) throw new Error("This assessment could not be found.");
    return { assessment, courses };
  }, [assessmentId]);
  if (loading || !data) return <main className="page-content">{error ? <ErrorState error={error} onRetry={reload} /> : <SkeletonRows rows={8} />}</main>;
  return <AssessmentEditor key={data.assessment.id} data={data} isNew={isNew} />;
}

function AssessmentEditor({ data, isNew }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(data.assessment);
  const [saved, setSaved] = useState(JSON.stringify(data.assessment));
  const [result, setResult] = useState({ fields: {}, questions: {} });
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [removeQ, setRemoveQ] = useState(null);

  const dirty = JSON.stringify(form) !== saved;
  useUnsavedChanges(!!dirty);

  const modules = useMemo(() => data.courses.find((c) => c.id === form.courseId)?.modules || [], [data, form.courseId]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setQ = (id, patch) => set({ questions: form.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  const setOption = (q, optionId, text) => setQ(q.id, { options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)) });

  async function save(status) {
    const target = status || form.status;
    const check = validateAssessment(form, target === "published");
    setResult(check);
    if (!check.ok) { toast.error("Please fix the highlighted items first."); return; }
    setBusy(true);
    try {
      const next = { ...form, title: form.title.trim(), status: target, passMark: Number(form.passMark), timeLimit: Number(form.timeLimit) || 0 };
      await assessmentService.save(next);
      setForm(next); setSaved(JSON.stringify(next));
      toast.success(target === "published" ? "Assessment published." : "Assessment saved.");
      if (isNew) navigate(`/admin/assessments/${next.id}/edit`, { replace: true });
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  }

  const published = form.status === "published";
  return (
    <main className="page-content">
      <PageHeader backTo="/admin/assessments" backLabel="All assessments" title={form.title || "New assessment"}
        description="Write the questions, set the marks and pass requirement, then save as a draft or publish."
        actions={<><StatusBadge status={form.status} /><button type="button" className={`btn btn-ghost ${s.btnInline}`} onClick={() => setPreview(true)}><Eye size={16} />Preview</button></>} />

      <section className={s.card} style={{ marginBottom: 16 }}>
        <div className={`${s.formGrid} ${s.cols2}`}>
          <Field label="Title" required error={result.fields.title} className={s.span2}>{(p) => <input {...p} value={form.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} />}</Field>
          <Field label="Description" className={s.span2} hint="Instructions or context shown before learners begin.">{(p) => <textarea {...p} rows={3} value={form.description} onChange={(e) => set({ description: e.target.value })} />}</Field>
          <Field label="Course" error={result.fields.courseId}>{(p) => <select {...p} value={form.courseId} onChange={(e) => set({ courseId: e.target.value, moduleId: "" })}><option value="">Select a course</option>{data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>}</Field>
          <Field label="Module (optional)">{(p) => <select {...p} value={form.moduleId} disabled={!modules.length} onChange={(e) => set({ moduleId: e.target.value })}><option value="">Whole course</option>{modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>}</Field>
          <Field label="Pass mark (%)" required error={result.fields.passMark} hint={`Learners need ${Math.ceil(totalMarks(form) * (Number(form.passMark) || 0) / 100)} of ${totalMarks(form)} marks to pass.`}>{(p) => <input {...p} type="number" min="1" max="100" value={form.passMark} onChange={(e) => set({ passMark: e.target.value })} />}</Field>
          <Field label="Time limit (minutes)" error={result.fields.timeLimit} hint="Use 0 for no time limit.">{(p) => <input {...p} type="number" min="0" max="600" value={form.timeLimit} onChange={(e) => set({ timeLimit: e.target.value })} />}</Field>
        </div>
      </section>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>Questions · {form.questions.length} · {totalMarks(form)} marks</h2>
          <div className={s.actions}>
            <button type="button" className={`btn btn-secondary ${s.btnInline}`} onClick={() => set({ questions: [...form.questions, newQuestion("mcq")] })}><Plus size={16} />Multiple choice</button>
            <button type="button" className={`btn btn-secondary ${s.btnInline}`} onClick={() => set({ questions: [...form.questions, newQuestion("written")] })}><Plus size={16} />Written response</button>
          </div>
        </div>
        {result.fields.questions && <p className={s.error} role="alert" style={{ marginBottom: 12 }}>{result.fields.questions}</p>}
        {form.questions.length === 0 && <EmptyState title="No questions yet" message="Add a multiple-choice or written-response question to get started." />}
        <div className={s.grid}>
          {form.questions.map((q, i) => (
            <div key={q.id} className={s.card} style={{ boxShadow: "none", background: "var(--surface-hover)" }}>
              <div className={s.cardHead} style={{ marginBottom: 12 }}>
                <strong>Question {i + 1} · {q.type === "mcq" ? "Multiple choice" : "Written response"}</strong>
                <div className={s.actions}>
                  <button type="button" className={s.iconBtn} aria-label="Move question up" disabled={i === 0} onClick={() => set({ questions: moveItem(form.questions, i, i - 1) })}><ChevronUp size={16} /></button>
                  <button type="button" className={s.iconBtn} aria-label="Move question down" disabled={i === form.questions.length - 1} onClick={() => set({ questions: moveItem(form.questions, i, i + 1) })}><ChevronDown size={16} /></button>
                  <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label="Delete question" onClick={() => setRemoveQ(q)}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className={s.grid}>
                <Field label="Question" required>{(p) => <textarea {...p} rows={2} value={q.text} onChange={(e) => setQ(q.id, { text: e.target.value })} />}</Field>
                <Field label="Marks" className="" >{(p) => <input {...p} type="number" min="1" max="100" value={q.marks} style={{ maxWidth: 120 }} onChange={(e) => setQ(q.id, { marks: e.target.value })} />}</Field>
                {q.type === "mcq" ? (
                  <fieldset style={{ border: 0 }}>
                    <legend className={s.label}>Answer options — select the correct one</legend>
                    <div className={s.grid} style={{ marginTop: 8 }}>
                      {q.options.map((o, oi) => (
                        <div key={o.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="radio" name={`correct-${q.id}`} checked={q.correctId === o.id} aria-label={`Mark option ${oi + 1} as correct`} onChange={() => setQ(q.id, { correctId: o.id })} style={{ accentColor: "var(--purple)", width: 18, height: 18 }} />
                          <input className="field" value={o.text} aria-label={`Option ${oi + 1}`} placeholder={`Option ${oi + 1}`} onChange={(e) => setOption(q, o.id, e.target.value)} />
                          <button type="button" className={s.iconBtn} aria-label={`Remove option ${oi + 1}`} disabled={q.options.length <= 2}
                            onClick={() => setQ(q.id, { options: q.options.filter((x) => x.id !== o.id), correctId: q.correctId === o.id ? "" : q.correctId })}><X size={16} /></button>
                        </div>
                      ))}
                      {q.options.length < 6 && <button type="button" className="btn btn-ghost" style={{ justifySelf: "start" }} onClick={() => setQ(q.id, { options: [...q.options, newOption()] })}>Add option</button>}
                    </div>
                  </fieldset>
                ) : (
                  <Field label="Marking guidance (optional)" hint="Shown to markers only. Written answers are marked by a person.">{(p) => <textarea {...p} rows={2} value={q.guidance} onChange={(e) => setQ(q.id, { guidance: e.target.value })} />}</Field>
                )}
                {result.questions[q.id] && <p className={s.error} role="alert">{result.questions[q.id]}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={s.sticky}>
        <span className={s.sub}>{dirty ? "You have unsaved changes." : "All changes saved."}</span>
        <div className={s.actions}>
          <button type="button" className={`btn btn-ghost ${s.btnInline}`} disabled={busy || (!dirty && !isNew)} onClick={() => save(published ? undefined : "draft")}><Save size={16} />{published ? "Save changes" : "Save draft"}</button>
          {published
            ? <button type="button" className={`btn btn-secondary ${s.btnInline}`} disabled={busy} onClick={() => save("draft")}><EyeOff size={16} />Unpublish</button>
            : <button type="button" className={`btn ${s.btnInline}`} disabled={busy} onClick={() => save("published")}><Send size={16} />Publish</button>}
        </div>
      </div>

      {preview && <AssessmentPreviewModal assessment={form} onClose={() => setPreview(false)} />}
      <ConfirmDialog open={!!removeQ} title="Delete this question?" confirmLabel="Delete question" message="The question and its answer options will be removed once you save."
        onCancel={() => setRemoveQ(null)} onConfirm={() => { set({ questions: form.questions.filter((q) => q.id !== removeQ.id) }); setRemoveQ(null); }} />
    </main>
  );
}
