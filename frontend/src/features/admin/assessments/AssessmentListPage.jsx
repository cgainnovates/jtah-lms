import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import SearchBox from "../shared/SearchBox.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { assessmentService } from "../../../services/assessmentService.js";
import { courseService } from "../../../services/courseService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { totalMarks } from "./assessmentOps.js";
import s from "../shared/adminUi.module.css";

export default function AssessmentListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(async () => {
    const [assessments, courses] = await Promise.all([assessmentService.list(), courseService.adminList()]);
    return { assessments, courses };
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [confirm, setConfirm] = useState(null);
  const rows = useMemo(() => (data?.assessments || []).filter((a) => (status === "all" || a.status === status) && a.title.toLowerCase().includes(query.toLowerCase())), [data, query, status]);

  const header = <PageHeader title="Assessment management" description="Create assessments with multiple-choice and written questions. Grading of learner submissions arrives with the backend."
    actions={<button type="button" className={`btn ${s.btnInline}`} onClick={() => navigate("/admin/assessments/new")}><Plus size={17} />Create assessment</button>} />;
  if (loading) return <main className="page-content">{header}<SkeletonRows rows={5} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;
  const courseTitle = (id) => data.courses.find((c) => c.id === id)?.title || "Not attached";

  return (
    <main className="page-content">
      {header}
      {data.assessments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assessments yet" message="Create an assessment to check what learners have understood." action={<Link className="btn" to="/admin/assessments/new">Create assessment</Link>} />
      ) : (
        <div className={s.card}>
          <div className={s.toolbar}>
            <SearchBox value={query} onChange={setQuery} placeholder="Search assessments" />
            <select className={`field ${s.select}`} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select>
          </div>
          {rows.length === 0 ? <EmptyState icon={ClipboardList} title="No matching assessments" message="Try a different search or filter." /> : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Assessment</th><th>Course</th><th>Questions</th><th>Pass mark</th><th>Status</th><th><span className={s.visuallyHidden}>Actions</span></th></tr></thead>
                <tbody>{rows.map((a) => (
                  <tr key={a.id}>
                    <td><Link className={s.cellTitle} to={`/admin/assessments/${a.id}/edit`}>{a.title}</Link></td>
                    <td>{courseTitle(a.courseId)}</td>
                    <td>{a.questions.length} · {totalMarks(a)} marks</td>
                    <td>{a.passMark}%</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td><div className={s.rowActions}>
                      <button type="button" className={s.iconBtn} aria-label={`Edit ${a.title}`} onClick={() => navigate(`/admin/assessments/${a.id}/edit`)}><Pencil size={16} /></button>
                      <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Delete ${a.title}`} onClick={() => setConfirm(a)}><Trash2 size={16} /></button>
                    </div></td>
                  </tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog open={!!confirm} title="Delete this assessment?" confirmLabel="Delete assessment" message={`“${confirm?.title}” and its ${confirm?.questions.length} question(s) will be removed permanently.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => { const a = confirm; setConfirm(null); try { await assessmentService.delete(a.id); toast.success("Assessment deleted."); await reload(); } catch (err) { toast.error(err.message); } }} />
    </main>
  );
}
