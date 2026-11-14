import { useMemo, useState } from "react";
import { Plus, Pencil, Eye, Archive, ArchiveRestore, Trash2, Library, File, Image as ImageIcon, FileText, Film, ExternalLink } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import SearchBox from "../shared/SearchBox.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import Modal from "../shared/Modal.jsx";
import Field from "../shared/Field.jsx";
import FileDrop from "../shared/FileDrop.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { materialService } from "../../../services/materialService.js";
import { courseService } from "../../../services/courseService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { prepareFile, safeUrl, INLINE_LIMIT_BYTES } from "../../../utils/files.js";
import { formatBytes, formatDate } from "../../../utils/format.js";
import { makeId } from "../../../utils/id.js";
import s from "../shared/adminUi.module.css";

const VISIBILITY = { everyone: "Everyone", enrolled: "Enrolled learners only", hidden: "Hidden from learners" };
const kindIcon = { image: ImageIcon, pdf: FileText, text: FileText, video: Film, link: ExternalLink };
const blank = () => ({ id: makeId("mat"), title: "", description: "", category: "", kind: "link", url: "", fileName: "", size: 0, dataUrl: "", visibility: "enrolled", courseId: "", moduleId: "", status: "active", addedAt: new Date().toISOString() });

export default function MaterialsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(async () => {
    const [materials, courses] = await Promise.all([materialService.list(), courseService.adminList()]);
    return { materials, courses };
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null);   // material draft
  const [previewing, setPreviewing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const categories = settingsService.read().learning.materialCategories;

  const rows = useMemo(() => (data?.materials || []).filter((m) =>
    (showArchived ? m.status === "archived" : m.status !== "archived") &&
    (category === "all" || m.category === category) &&
    `${m.title} ${m.description}`.toLowerCase().includes(query.toLowerCase())), [data, query, category, showArchived]);

  async function run(action, success) {
    try { await action(); toast.success(success); await reload(); } catch (err) { toast.error(err.message); }
  }

  const header = <PageHeader title="Learning materials" description="Upload and organise documents, links and files, then attach them to courses and modules."
    actions={<button type="button" className={`btn ${s.btnInline}`} onClick={() => setEditing(blank())}><Plus size={17} />Add material</button>} />;
  if (loading) return <main className="page-content">{header}<SkeletonRows rows={6} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;

  const courseTitle = (id) => data.courses.find((c) => c.id === id)?.title;
  const moduleTitle = (cid, mid) => data.courses.find((c) => c.id === cid)?.modules?.find((m) => m.id === mid)?.title;

  return (
    <main className="page-content">
      {header}
      <div className={s.toolbar}>
        <SearchBox value={query} onChange={setQuery} placeholder="Search materials" />
        <select className={`field ${s.select}`} aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className={s.checkItem}><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />Show archived</label>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Library} title={data.materials.length ? "No matching materials" : "No materials yet"}
          message={data.materials.length ? "Try another search, category, or switch the archived filter." : "Add your first guide, template or document so learners can use it."}
          action={!data.materials.length && <button type="button" className="btn" onClick={() => setEditing(blank())}>Add material</button>} />
      ) : (
        <div className={s.cardGrid}>
          {rows.map((m, i) => {
            const Icon = kindIcon[m.kind] || File;
            return (
              <article key={m.id} className={`${s.card} ${s.matCard}`} style={{ animationDelay: `${i * 40}ms` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div className={s.matIcon}><Icon size={20} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}><strong style={{ overflowWrap: "anywhere" }}>{m.title}</strong><div className={s.cellSub}>{m.category || "Uncategorised"} · {formatDate(m.addedAt)}</div></div>
                  {m.status === "archived" && <StatusBadge status="archived" />}
                </div>
                <p style={{ fontSize: 14, color: "var(--grey)" }}>{m.description || "No description."}</p>
                <div className={s.cellSub}>
                  {VISIBILITY[m.visibility]}{m.courseId ? ` · ${courseTitle(m.courseId) || "Removed course"}` : ""}{m.moduleId ? ` › ${moduleTitle(m.courseId, m.moduleId) || "Removed module"}` : ""}{m.size ? ` · ${formatBytes(m.size)}` : ""}
                </div>
                <div className={s.rowActions} style={{ marginTop: "auto", justifyContent: "flex-start" }}>
                  <button type="button" className={s.iconBtn} aria-label={`Preview ${m.title}`} title="Preview" onClick={() => setPreviewing(m)}><Eye size={16} /></button>
                  <button type="button" className={s.iconBtn} aria-label={`Edit ${m.title}`} title="Edit" onClick={() => setEditing(m)}><Pencil size={16} /></button>
                  {m.status === "archived"
                    ? <button type="button" className={s.iconBtn} aria-label={`Restore ${m.title}`} title="Restore" onClick={() => run(() => materialService.setStatus(m.id, "active"), "Material restored.")}><ArchiveRestore size={16} /></button>
                    : <button type="button" className={s.iconBtn} aria-label={`Archive ${m.title}`} title="Archive" onClick={() => run(() => materialService.setStatus(m.id, "archived"), "Material archived.")}><Archive size={16} /></button>}
                  <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Delete ${m.title}`} title="Delete" onClick={() => setConfirm(m)}><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && <MaterialForm key={editing.id} material={editing} isNew={!data.materials.some((m) => m.id === editing.id)} courses={data.courses} categories={categories}
        onClose={() => setEditing(null)}
        onSave={async (material) => { try { await materialService.save(material); toast.success("Material saved."); setEditing(null); await reload(); } catch (err) { toast.error(err.message); } }} />}

      {previewing && <MaterialPreview material={previewing} onClose={() => setPreviewing(null)} />}

      <ConfirmDialog open={!!confirm} title="Delete this material?" confirmLabel="Delete material"
        message={`“${confirm?.title}” will be removed permanently. Archive it instead if you may need it again.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => { const m = confirm; setConfirm(null); await run(() => materialService.delete(m.id), "Material deleted."); }} />
    </main>
  );
}

function MaterialForm({ material, isNew, courses, categories, onSave, onClose }) {
  const [draft, setDraft] = useState(material);
  const [errors, setErrors] = useState({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const modules = courses.find((c) => c.id === draft.courseId)?.modules || [];

  async function pick(file) {
    try {
      const prepared = await prepareFile(file);
      set({ ...prepared, kind: prepared.kind, title: draft.title || file.name.replace(/\.[^.]+$/, "") });
      setNote(prepared.dataUrl ? "" : `This file is over ${formatBytes(INLINE_LIMIT_BYTES)}, so this demo keeps only its name. The backend will store full-size files.`);
      setErrors((e) => ({ ...e, file: undefined }));
    } catch (err) { setErrors((e) => ({ ...e, file: err.message })); }
  }

  async function submit() {
    const found = {};
    if (!draft.title.trim()) found.title = "Enter a title.";
    if (!draft.fileName && !draft.url.trim()) found.file = "Choose a file or enter a web address.";
    if (draft.url.trim() && !safeUrl(draft.url)) found.url = "Enter a full address starting with https://";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    await onSave({ ...draft, title: draft.title.trim(), kind: draft.fileName ? draft.kind : "link" });
    setBusy(false);
  }

  return (
    <Modal open title={isNew ? "Add learning material" : "Edit material"} onClose={onClose}
      footer={<><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button type="button" className="btn" disabled={busy} onClick={submit}>{busy ? "Saving…" : "Save material"}</button></>}>
      <div className={s.grid}>
        <div>
          <span className={s.label}>File</span>
          <FileDrop file={draft.fileName ? { fileName: draft.fileName, size: draft.size } : null} onFile={pick} onClear={() => set({ fileName: "", size: 0, dataUrl: "", kind: "link" })} />
          {errors.file && <span className={s.error} role="alert">{errors.file}</span>}
          {note && <p className={s.hint}>{note}</p>}
        </div>
        <Field label="…or link to it online" error={errors.url}>{(p) => <input {...p} type="url" placeholder="https://" value={draft.url} onChange={(e) => set({ url: e.target.value })} />}</Field>
        <Field label="Title" required error={errors.title}>{(p) => <input {...p} value={draft.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} />}</Field>
        <Field label="Description">{(p) => <textarea {...p} rows={3} maxLength={400} value={draft.description} onChange={(e) => set({ description: e.target.value })} />}</Field>
        <div className={`${s.formGrid} ${s.cols2}`}>
          <Field label="Category">{(p) => <select {...p} value={draft.category} onChange={(e) => set({ category: e.target.value })}><option value="">Uncategorised</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>}</Field>
          <Field label="Who can see it">{(p) => <select {...p} value={draft.visibility} onChange={(e) => set({ visibility: e.target.value })}>{Object.entries(VISIBILITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}</Field>
          <Field label="Attach to course">{(p) => <select {...p} value={draft.courseId} onChange={(e) => set({ courseId: e.target.value, moduleId: "" })}><option value="">Not attached to a course</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>}</Field>
          <Field label="Attach to module">{(p) => <select {...p} value={draft.moduleId} disabled={!modules.length} onChange={(e) => set({ moduleId: e.target.value })}><option value="">Whole course</option>{modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>}</Field>
        </div>
      </div>
    </Modal>
  );
}

// Previews every kind the browser can show natively; other files show details and a clear message.
function MaterialPreview({ material: m, onClose }) {
  const href = m.dataUrl || safeUrl(m.url);
  return (
    <Modal open wide title={m.title} onClose={onClose} footer={<>{href && <a className="btn btn-ghost" href={href} target="_blank" rel="noopener noreferrer">Open in new tab</a>}<button type="button" className="btn" onClick={onClose}>Close</button></>}>
      {m.kind === "image" && href && <img src={href} alt={m.title} style={{ maxWidth: "100%", margin: "0 auto", borderRadius: 12 }} />}
      {m.kind === "pdf" && href && <iframe title={m.title} src={href} style={{ width: "100%", height: 460, border: "1px solid var(--line)", borderRadius: 12 }} />}
      {m.kind === "video" && href && <video controls src={href} style={{ width: "100%", borderRadius: 12 }} />}
      {m.kind === "text" && href && <iframe title={m.title} src={href} style={{ width: "100%", height: 320, border: "1px solid var(--line)", borderRadius: 12 }} />}
      {(!href || !["image", "pdf", "video", "text"].includes(m.kind)) && (
        <div className={s.noticeBox}>{m.kind === "link" ? "This is an external link; it opens on its own website." : href ? "A preview is not available for this file type. Use “Open in new tab” to view it." : "This file was too large to keep in the browser demo, so no preview is available."}</div>
      )}
      <p style={{ marginTop: 12 }}>{m.description}</p>
    </Modal>
  );
}
