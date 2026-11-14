import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Send, EyeOff, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import Field from "../shared/Field.jsx";
import TagInput from "../shared/TagInput.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { careerService } from "../../../services/careerService.js";
import { courseService } from "../../../services/courseService.js";
import { materialService } from "../../../services/materialService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges.js";
import { moveItem } from "../course/curriculumOps.js";
import { makeId } from "../../../utils/id.js";
import s from "../shared/adminUi.module.css";

const blankPathway = () => ({ id: makeId("career"), title: "", field: "", summary: "", roles: [], skills: [], stages: [], status: "draft" });
const blankStage = () => ({ id: makeId("stage"), title: "", description: "", skills: [], courseIds: [], materialIds: [] });
const toggle = (list = [], id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export default function PathwayEditorPage() {
  const { pathwayId } = useParams();
  const isNew = !pathwayId;
  const { data, loading, error, reload } = useAsync(async () => {
    const [pathways, courses, materials] = await Promise.all([careerService.adminList(), courseService.adminList(), materialService.list()]);
    const pathway = isNew ? blankPathway() : pathways.find((p) => p.id === pathwayId);
    if (!pathway) throw new Error("This pathway could not be found.");
    return { pathway, courses, materials: materials.filter((m) => m.status !== "archived") };
  }, [pathwayId]);
  if (loading || !data) return <main className="page-content">{error ? <ErrorState error={error} onRetry={reload} /> : <SkeletonRows rows={8} />}</main>;
  return <PathwayEditor key={data.pathway.id} data={data} isNew={isNew} />;
}

function PathwayEditor({ data, isNew }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(() => ({ skills: [], ...data.pathway }));
  const [saved, setSaved] = useState(() => JSON.stringify({ skills: [], ...data.pathway }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [removeStage, setRemoveStage] = useState(null);

  const dirty = JSON.stringify(form) !== saved;
  useUnsavedChanges(!!dirty);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setStage = (id, patch) => set({ stages: form.stages.map((st) => (st.id === id ? { ...st, ...patch } : st)) });

  async function save(status) {
    const target = status || form.status;
    const found = {};
    if (!form.title.trim()) found.title = "Enter a pathway title.";
    if (target === "published") {
      if (!form.summary.trim()) found.summary = "Add a career description before publishing.";
      if (!form.roles.length) found.roles = "Add at least one professional role.";
      if (!form.stages.length) found.stages = "Add at least one learning milestone.";
      else if (form.stages.some((st) => !st.title.trim())) found.stages = "Every milestone needs a title.";
    }
    setErrors(found);
    if (Object.keys(found).length) { toast.error("Please fix the highlighted items first."); return; }
    setBusy(true);
    try {
      const next = { ...form, title: form.title.trim(), status: target };
      await careerService.adminSave(next);
      setForm(next); setSaved(JSON.stringify(next));
      toast.success(target === "published" ? "Pathway published." : "Pathway saved.");
      if (isNew) navigate(`/admin/pathways/${next.id}/edit`, { replace: true });
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  }

  const published = form.status === "published";
  return (
    <main className="page-content">
      <PageHeader backTo="/admin/pathways" backLabel="All pathways" title={form.title || "New career pathway"}
        description="Describe the career, the skills it needs, and the milestones that lead there."
        actions={<StatusBadge status={form.status} />} />

      <section className={s.card} style={{ marginBottom: 16 }}>
        <div className={`${s.formGrid} ${s.cols2}`}>
          <Field label="Pathway title" required error={errors.title}>{(p) => <input {...p} value={form.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} />}</Field>
          <Field label="Career field" hint="For example Business or Digital & Creative.">{(p) => <input {...p} value={form.field} maxLength={50} onChange={(e) => set({ field: e.target.value })} />}</Field>
          <Field label="Career description" error={errors.summary} className={s.span2}>{(p) => <textarea {...p} rows={3} maxLength={400} value={form.summary} onChange={(e) => set({ summary: e.target.value })} />}</Field>
          <div className={s.span2}><span className={s.label}>Professional roles</span><TagInput label="Professional roles" value={form.roles} onChange={(roles) => set({ roles })} placeholder="Type a role and press Enter" />{errors.roles && <span className={s.error} role="alert">{errors.roles}</span>}</div>
          <div className={s.span2}><span className={s.label}>Required skills</span><TagInput label="Required skills" value={form.skills} onChange={(skills) => set({ skills })} placeholder="Type a skill and press Enter" /></div>
        </div>
      </section>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>Learning milestones · {form.stages.length}</h2>
          <button type="button" className={`btn btn-secondary ${s.btnInline}`} onClick={() => set({ stages: [...form.stages, blankStage()] })}><Plus size={16} />Add milestone</button>
        </div>
        {errors.stages && <p className={s.error} role="alert" style={{ marginBottom: 12 }}>{errors.stages}</p>}
        {form.stages.length === 0 && <EmptyState title="No milestones yet" message="Milestones are the steps learners complete on the way to this career." />}
        <div className={s.grid}>
          {form.stages.map((st, i) => (
            <div key={st.id} className={s.card} style={{ boxShadow: "none", background: "var(--surface-hover)" }}>
              <div className={s.cardHead} style={{ marginBottom: 12 }}>
                <strong>Milestone {i + 1}</strong>
                <div className={s.actions}>
                  <button type="button" className={s.iconBtn} aria-label="Move milestone up" disabled={i === 0} onClick={() => set({ stages: moveItem(form.stages, i, i - 1) })}><ChevronUp size={16} /></button>
                  <button type="button" className={s.iconBtn} aria-label="Move milestone down" disabled={i === form.stages.length - 1} onClick={() => set({ stages: moveItem(form.stages, i, i + 1) })}><ChevronDown size={16} /></button>
                  <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label="Delete milestone" onClick={() => setRemoveStage(st)}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className={s.grid}>
                <Field label="Milestone title" required>{(p) => <input {...p} value={st.title} maxLength={80} onChange={(e) => setStage(st.id, { title: e.target.value })} />}</Field>
                <Field label="Description">{(p) => <textarea {...p} rows={2} value={st.description || ""} onChange={(e) => setStage(st.id, { description: e.target.value })} />}</Field>
                <div><span className={s.label}>Skills gained</span><TagInput label="Skills gained" value={st.skills} onChange={(skills) => setStage(st.id, { skills })} placeholder="Type a skill and press Enter" /></div>
                <div className={`${s.formGrid} ${s.cols2}`}>
                  <div><span className={s.label}>Courses</span><div className={s.checkList}>{data.courses.length === 0 && <span className={s.hint}>No courses available.</span>}{data.courses.map((c) => <label key={c.id} className={s.checkItem}><input type="checkbox" checked={st.courseIds.includes(c.id)} onChange={() => setStage(st.id, { courseIds: toggle(st.courseIds, c.id) })} />{c.title}{c.status === "draft" ? " (draft)" : ""}</label>)}</div></div>
                  <div><span className={s.label}>Supporting resources</span><div className={s.checkList}>{data.materials.length === 0 && <span className={s.hint}>Add materials under Learning materials first.</span>}{data.materials.map((m) => <label key={m.id} className={s.checkItem}><input type="checkbox" checked={(st.materialIds || []).includes(m.id)} onChange={() => setStage(st.id, { materialIds: toggle(st.materialIds, m.id) })} />{m.title}</label>)}</div></div>
                </div>
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
      <ConfirmDialog open={!!removeStage} title="Delete this milestone?" confirmLabel="Delete milestone" message="The milestone and its course links will be removed once you save."
        onCancel={() => setRemoveStage(null)} onConfirm={() => { set({ stages: form.stages.filter((x) => x.id !== removeStage.id) }); setRemoveStage(null); }} />
    </main>
  );
}
