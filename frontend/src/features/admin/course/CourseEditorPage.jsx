import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Send, Eye, EyeOff, ClipboardList, Layers } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import Tabs from "../shared/Tabs.jsx";
import Field from "../shared/Field.jsx";
import FileDrop from "../shared/FileDrop.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import CurriculumBuilder from "./CurriculumBuilder.jsx";
import CoursePreviewModal from "./CoursePreviewModal.jsx";
import { publishProblems, countLessons } from "./curriculumOps.js";
import { courseService } from "../../../services/courseService.js";
import { userService } from "../../../services/userService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges.js";
import { makeId } from "../../../utils/id.js";
import { readFileAsDataUrl, INLINE_LIMIT_BYTES } from "../../../utils/files.js";
import fallbackThumb from "../../../assets/images/learners-640.webp";
import s from "../shared/adminUi.module.css";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const UNITS = ["hours", "days", "weeks", "months"];
const NEW_CATEGORY = "__new__";

const blankCourse = () => ({ id: makeId("course"), title: "", description: "", category: "", level: "Beginner", duration: "4 weeks", instructor: "JTAH Learning Team", status: "draft", progress: 0, thumbnail: "", objectives: [], modules: [] });

// "6 weeks" -> { value: "6", unit: "weeks" }
function parseDuration(text = "") {
  const [value, unit] = text.split(" ");
  return { value: value || "", unit: UNITS.includes(unit) ? unit : "weeks" };
}

export default function CourseEditorPage() {
  const { courseId } = useParams();
  const isNew = !courseId;
  const { data, loading, error, reload } = useAsync(async () => {
    const [course, users] = await Promise.all([isNew ? blankCourse() : courseService.adminGet(courseId), userService.list()]);
    if (!course) throw new Error("This course could not be found. It may have been deleted.");
    return { course, instructors: users.filter((u) => u.role === "Instructor" && u.status !== "Inactive") };
  }, [courseId]);
  if (loading || !data) return <main className="page-content">{error ? <ErrorState error={error} onRetry={reload} /> : <SkeletonRows rows={8} />}</main>;
  // The inner editor mounts only once data exists, so its form state starts fully populated.
  return <CourseEditor key={data.course.id} data={data} isNew={isNew} />;
}

function CourseEditor({ data, isNew }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(data.course);
  const [saved, setSaved] = useState(JSON.stringify(data.course)); // snapshot used for dirty detection
  const [tab, setTab] = useState("details");
  const [errors, setErrors] = useState({});
  const [problems, setProblems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [duration, setDuration] = useState(() => parseDuration(data.course.duration));
  const [newCategory, setNewCategory] = useState("");
  const categories = useMemo(() => settingsService.read().learning.categories, []);
  const [categoryChoice, setCategoryChoice] = useState(data.course.category || "");


  const dirty = JSON.stringify(form) !== saved;
  useUnsavedChanges(!!dirty);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setDurationPart = (patch) => { const next = { ...duration, ...patch }; setDuration(next); set({ duration: next.value ? `${next.value} ${next.unit}` : "" }); };
  const instructorOptions = Array.from(new Set(["JTAH Learning Team", ...data.instructors.map((i) => i.name), form.instructor].filter(Boolean)));
  const thumbnail = form.thumbnail || fallbackThumb;

  async function handleThumbnail(file) {
    if (!file.type.startsWith("image/")) return setErrors((e) => ({ ...e, thumbnail: "Please choose an image file (PNG, JPG or WebP)." }));
    if (file.size > INLINE_LIMIT_BYTES) return setErrors((e) => ({ ...e, thumbnail: "Image is too large for this demo. Use one under 600 KB." }));
    set({ thumbnail: await readFileAsDataUrl(file) });
    setErrors((e) => ({ ...e, thumbnail: undefined }));
  }

  function validate(forPublish) {
    const found = {};
    if (!form.title.trim()) found.title = "Enter a course title.";
    if (forPublish && !form.description.trim()) found.description = "Add a description before publishing.";
    if (forPublish && !form.category.trim()) found.category = "Choose a category before publishing.";
    if (forPublish && !(Number(duration.value) > 0)) found.duration = "Enter how long the course takes.";
    setErrors(found);
    const list = forPublish ? publishProblems(form) : [];
    setProblems(list);
    if (Object.keys(found).length || list.length) { setTab(Object.keys(found).length ? "details" : "curriculum"); return false; }
    return true;
  }

  // status: the status to store. Pass nothing to keep the current one.
  async function save(status) {
    const target = status || form.status;
    if (!validate(target === "published")) { toast.error("Please fix the highlighted items first."); return; }
    setBusy(true);
    try {
      // New categories typed by the admin become part of the shared category list.
      const category = form.category.trim();
      const settings = settingsService.read();
      if (category && !settings.learning.categories.includes(category)) {
        await settingsService.save({ ...settings, learning: { ...settings.learning, categories: [...settings.learning.categories, category] } });
      }
      const next = { ...form, title: form.title.trim(), status: target };
      await courseService.save(next);
      setForm(next);
      setSaved(JSON.stringify(next));
      toast.success(target === "published" ? "Course published." : status === "draft" ? "Draft saved." : "Course saved.");
      if (isNew) navigate(`/admin/courses/${next.id}/edit`, { replace: true });
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  }

  const isPublished = form.status === "published";

  return (
    <main className="page-content">
      <PageHeader backTo="/admin/courses" backLabel="All courses" title={isNew && !dirty && !form.title ? "Create course" : form.title || "Untitled course"}
        description="Fill in the details, build the curriculum, then save as a draft or publish when it is ready for learners."
        actions={<>
          <StatusBadge status={form.status} />
          <button type="button" className={`btn btn-ghost ${s.btnInline}`} onClick={() => setPreview(true)}><Eye size={16} />Preview as learner</button>
        </>} />

      <Tabs active={tab} onChange={setTab} tabs={[{ id: "details", label: "Course details", icon: ClipboardList }, { id: "curriculum", label: `Curriculum (${form.modules.length} modules · ${countLessons(form.modules)} lessons)`, icon: Layers }]} />

      {problems.length > 0 && (
        <div className={s.errorBox} role="alert" style={{ marginBottom: 16, alignItems: "flex-start" }}>
          <div><strong>This course cannot be published yet:</strong><ul style={{ paddingLeft: 18, marginTop: 6 }}>{problems.map((p) => <li key={p}>{p}</li>)}</ul></div>
        </div>
      )}

      {tab === "details" && (
        <div className={s.card}>
          <div className={`${s.formGrid} ${s.cols2}`}>
            <Field label="Course title" required error={errors.title} className={s.span2}>
              {(p) => <input {...p} value={form.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Digital Skills for the Modern Workplace" />}
            </Field>
            <Field label="Description" required={isPublished} error={errors.description} className={s.span2} hint="A short summary learners see in the catalogue.">
              {(p) => <textarea {...p} rows={4} value={form.description} maxLength={600} onChange={(e) => set({ description: e.target.value })} />}
            </Field>
            <Field label="Learning objectives" className={s.span2} hint="One objective per line. Learners see these on the course page.">
              {(p) => <textarea {...p} rows={4} value={form.objectives.join("\n")} onChange={(e) => set({ objectives: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} placeholder={"Use essential digital tools\nCommunicate professionally online"} />}
            </Field>
            <Field label="Category" error={errors.category}>
              {(p) => <select {...p} value={categoryChoice} onChange={(e) => { setCategoryChoice(e.target.value); if (e.target.value !== NEW_CATEGORY) { set({ category: e.target.value }); setNewCategory(""); } else set({ category: newCategory }); }}>
                <option value="">Select a category</option>
                {Array.from(new Set([...categories, form.category].filter(Boolean))).map((c) => <option key={c} value={c}>{c}</option>)}
                <option value={NEW_CATEGORY}>+ Add a new category…</option>
              </select>}
            </Field>
            {categoryChoice === NEW_CATEGORY && (
              <Field label="New category name">
                {(p) => <input {...p} value={newCategory} maxLength={40} onChange={(e) => { setNewCategory(e.target.value); set({ category: e.target.value }); }} />}
              </Field>
            )}
            <Field label="Difficulty level">
              {(p) => <select {...p} value={form.level} onChange={(e) => set({ level: e.target.value })}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>}
            </Field>
            <Field label="Duration" error={errors.duration}>
              {(p) => <div style={{ display: "flex", gap: 8 }}>
                <input {...p} type="number" min="1" max="999" value={duration.value} onChange={(e) => setDurationPart({ value: e.target.value })} style={{ maxWidth: 110 }} />
                <select className="field" aria-label="Duration unit" value={duration.unit} onChange={(e) => setDurationPart({ unit: e.target.value })}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
              </div>}
            </Field>
            <Field label="Instructor" hint="Instructors are managed under Users.">
              {(p) => <select {...p} value={form.instructor} onChange={(e) => set({ instructor: e.target.value })}>{instructorOptions.map((i) => <option key={i}>{i}</option>)}</select>}
            </Field>
            <div className={s.span2}>
              <span className={s.label}>Thumbnail</span>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                <img className={s.thumb} src={thumbnail} alt="Course thumbnail preview" />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <FileDrop accept="image/*" label="Choose image" hint="PNG, JPG or WebP, under 600 KB. Landscape (16:9) works best." file={form.thumbnail ? { fileName: "Custom thumbnail" } : null} onFile={handleThumbnail} onClear={() => set({ thumbnail: "" })} />
                  {errors.thumbnail && <span className={s.error} role="alert">{errors.thumbnail}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "curriculum" && <div className={s.card}><CurriculumBuilder modules={form.modules} onChange={(modules) => set({ modules })} /></div>}

      <div className={s.sticky}>
        <span className={s.sub}>{dirty ? "You have unsaved changes." : "All changes saved."}</span>
        <div className={s.actions}>
          {!isPublished && <button type="button" className={`btn btn-ghost ${s.btnInline}`} disabled={busy} onClick={() => save("draft")}><Save size={16} />Save draft</button>}
          {isPublished && <button type="button" className={`btn btn-ghost ${s.btnInline}`} disabled={busy || !dirty} onClick={() => save()}><Save size={16} />Save changes</button>}
          {isPublished
            ? <button type="button" className={`btn btn-secondary ${s.btnInline}`} disabled={busy} onClick={() => setConfirmUnpublish(true)}><EyeOff size={16} />Unpublish</button>
            : <button type="button" className={`btn ${s.btnInline}`} disabled={busy} onClick={() => save("published")}><Send size={16} />{busy ? "Saving…" : "Publish"}</button>}
        </div>
      </div>

      {preview && <CoursePreviewModal course={form} thumbnail={thumbnail} onClose={() => setPreview(false)} />}
      <ConfirmDialog open={confirmUnpublish} danger={false} title="Unpublish this course?" confirmLabel="Unpublish"
        message="Learners will no longer see this course in the catalogue. Existing enrolments are kept and you can publish it again at any time."
        onCancel={() => setConfirmUnpublish(false)} onConfirm={async () => { setConfirmUnpublish(false); await save("draft"); }} />
    </main>
  );
}
