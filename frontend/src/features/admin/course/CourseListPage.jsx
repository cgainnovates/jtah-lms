import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Eye, EyeOff, Archive, ArchiveRestore, Trash2, BookOpen } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import SearchBox from "../shared/SearchBox.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import Pager from "../shared/Pager.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { courseService } from "../../../services/courseService.js";
import { userService } from "../../../services/userService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { countLessons } from "./curriculumOps.js";
import fallbackThumb from "../../../assets/images/learners-640.webp";
import s from "../shared/adminUi.module.css";

export default function CourseListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(async () => {
    const [courses, enrolments] = await Promise.all([courseService.adminList(), userService.allEnrolments()]);
    return { courses, enrolments };
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null); // { kind: "archive" | "delete", course }
  const pageSize = settingsService.read().admin.defaultPageSize || 8;

  const rows = useMemo(() => (data?.courses || []).filter((c) =>
    (status === "all" || (c.status || "published") === status) &&
    (category === "all" || c.category === category) &&
    `${c.title} ${c.instructor} ${c.category}`.toLowerCase().includes(query.toLowerCase())), [data, query, status, category]);
  const categories = useMemo(() => Array.from(new Set((data?.courses || []).map((c) => c.category).filter(Boolean))), [data]);
  const enrolledCount = (id) => data.enrolments.filter((e) => e.courseId === id).length;
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  async function run(action, success) {
    try { await action(); toast.success(success); await reload(); }
    catch (err) { toast.error(err.message); }
  }

  const header = <PageHeader title="Course management" description="Create, edit, publish and archive courses. Only published courses are visible to learners."
    actions={<button type="button" className={`btn ${s.btnInline}`} onClick={() => navigate("/admin/courses/new")}><Plus size={17} />Create course</button>} />;

  if (loading) return <main className="page-content">{header}<SkeletonRows rows={6} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;

  return (
    <main className="page-content">
      {header}
      {data.courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" message="Create your first course to start building the learning catalogue."
          action={<Link className="btn" to="/admin/courses/new">Create course</Link>} />
      ) : (
        <div className={s.card}>
          <div className={s.toolbar}>
            <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search by title, category or instructor" />
            <select className={`field ${s.select}`} aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
            <select className={`field ${s.select}`} aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {rows.length === 0 ? <EmptyState icon={BookOpen} title="No matching courses" message="Try a different search or clear the filters." /> : (
            <>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Course</th><th>Category</th><th>Content</th><th>Enrolled</th><th>Status</th><th><span className={s.visuallyHidden}>Actions</span></th></tr></thead>
                  <tbody>
                    {visible.map((c) => {
                      const st = c.status || "published";
                      return (
                        <tr key={c.id}>
                          <td><div className={s.person}><img src={c.thumbnail || fallbackThumb} alt="" width="56" height="36" style={{ objectFit: "cover", borderRadius: 8, flex: "0 0 56px" }} />
                            <div style={{ minWidth: 0 }}><Link className={s.cellTitle} to={`/admin/courses/${c.id}/edit`}>{c.title}</Link><div className={s.cellSub}>{c.instructor} · {c.level} · {c.duration}</div></div></div></td>
                          <td>{c.category || "—"}</td>
                          <td>{c.modules?.length || 0} modules · {countLessons(c.modules || [])} lessons</td>
                          <td>{enrolledCount(c.id)}</td>
                          <td><StatusBadge status={st} /></td>
                          <td><div className={s.rowActions}>
                            <button type="button" className={s.iconBtn} aria-label={`Edit ${c.title}`} title="Edit" onClick={() => navigate(`/admin/courses/${c.id}/edit`)}><Pencil size={16} /></button>
                            {st === "published" && <button type="button" className={s.iconBtn} aria-label={`Unpublish ${c.title}`} title="Unpublish" onClick={() => run(() => courseService.setStatus(c.id, "draft"), "Course unpublished.")}><EyeOff size={16} /></button>}
                            {st === "draft" && <button type="button" className={s.iconBtn} aria-label={`Publish ${c.title}`} title="Publish" onClick={() => {
                              if (!c.modules?.length || c.modules.some((m) => !m.lessons.length) || !c.description) { toast.error("Open the course and complete its description, objectives and lessons before publishing."); return; }
                              run(() => courseService.setStatus(c.id, "published"), "Course published.");
                            }}><Eye size={16} /></button>}
                            {st === "archived"
                              ? <button type="button" className={s.iconBtn} aria-label={`Restore ${c.title}`} title="Restore as draft" onClick={() => run(() => courseService.setStatus(c.id, "draft"), "Course restored as a draft.")}><ArchiveRestore size={16} /></button>
                              : <button type="button" className={s.iconBtn} aria-label={`Archive ${c.title}`} title="Archive" onClick={() => setConfirm({ kind: "archive", course: c })}><Archive size={16} /></button>}
                            <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Delete ${c.title}`} title="Delete" onClick={() => setConfirm({ kind: "delete", course: c })}><Trash2 size={16} /></button>
                          </div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pager page={page} pageSize={pageSize} total={rows.length} onPage={setPage} />
            </>
          )}
        </div>
      )}

      <ConfirmDialog open={!!confirm} danger title={confirm?.kind === "delete" ? "Delete this course permanently?" : "Archive this course?"}
        confirmLabel={confirm?.kind === "delete" ? "Delete course" : "Archive course"}
        message={confirm?.kind === "delete"
          ? `“${confirm?.course.title}” and its ${enrolledCount(confirm?.course.id)} enrolment(s) will be removed. This cannot be undone. Archive it instead if you may need it later.`
          : `“${confirm?.course.title}” will be hidden from learners but kept here so you can restore it later.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const { kind, course } = confirm;
          setConfirm(null);
          if (kind === "delete") await run(() => courseService.delete(course.id), "Course deleted.");
          else await run(() => courseService.setStatus(course.id, "archived"), "Course archived.");
        }} />
    </main>
  );
}
