import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Eye, EyeOff, Archive, ArchiveRestore, Trash2, Milestone } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import SearchBox from "../shared/SearchBox.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { careerService } from "../../../services/careerService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import s from "../shared/adminUi.module.css";

export default function PathwaysPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => careerService.adminList());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [confirm, setConfirm] = useState(null);
  const rows = useMemo(() => (data || []).filter((c) => (status === "all" || (c.status || "published") === status) && `${c.title} ${c.field}`.toLowerCase().includes(query.toLowerCase())), [data, query, status]);

  async function run(action, success) { try { await action(); toast.success(success); await reload(); } catch (err) { toast.error(err.message); } }

  const header = <PageHeader title="Career pathways" description="Design the career routes learners can explore: roles, skills, milestones and the courses that lead there."
    actions={<button type="button" className={`btn ${s.btnInline}`} onClick={() => navigate("/admin/pathways/new")}><Plus size={17} />Create pathway</button>} />;
  if (loading) return <main className="page-content">{header}<SkeletonRows rows={5} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;

  return (
    <main className="page-content">
      {header}
      {data.length === 0 ? <EmptyState icon={Milestone} title="No career pathways yet" message="Create a pathway to show learners where their studies can lead." action={<Link className="btn" to="/admin/pathways/new">Create pathway</Link>} /> : (
        <div className={s.card}>
          <div className={s.toolbar}>
            <SearchBox value={query} onChange={setQuery} placeholder="Search pathways" />
            <select className={`field ${s.select}`} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
          </div>
          {rows.length === 0 ? <EmptyState icon={Milestone} title="No matching pathways" message="Try a different search or filter." /> : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Pathway</th><th>Roles</th><th>Milestones</th><th>Status</th><th><span className={s.visuallyHidden}>Actions</span></th></tr></thead>
                <tbody>{rows.map((c) => { const st = c.status || "published"; return (
                  <tr key={c.id}>
                    <td><Link className={s.cellTitle} to={`/admin/pathways/${c.id}/edit`}>{c.title}</Link><div className={s.cellSub}>{c.field}</div></td>
                    <td>{c.roles?.length || 0}</td><td>{c.stages?.length || 0}</td><td><StatusBadge status={st} /></td>
                    <td><div className={s.rowActions}>
                      <button type="button" className={s.iconBtn} aria-label={`Edit ${c.title}`} onClick={() => navigate(`/admin/pathways/${c.id}/edit`)}><Pencil size={16} /></button>
                      {st === "published"
                        ? <button type="button" className={s.iconBtn} aria-label={`Unpublish ${c.title}`} title="Unpublish" onClick={() => run(() => careerService.setStatus(c.id, "draft"), "Pathway unpublished.")}><EyeOff size={16} /></button>
                        : st === "draft" && <button type="button" className={s.iconBtn} aria-label={`Publish ${c.title}`} title="Publish" onClick={() => run(() => careerService.setStatus(c.id, "published"), "Pathway published.")}><Eye size={16} /></button>}
                      {st === "archived"
                        ? <button type="button" className={s.iconBtn} aria-label={`Restore ${c.title}`} title="Restore as draft" onClick={() => run(() => careerService.setStatus(c.id, "draft"), "Pathway restored as a draft.")}><ArchiveRestore size={16} /></button>
                        : <button type="button" className={s.iconBtn} aria-label={`Archive ${c.title}`} title="Archive" onClick={() => setConfirm({ kind: "archive", item: c })}><Archive size={16} /></button>}
                      <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Delete ${c.title}`} onClick={() => setConfirm({ kind: "delete", item: c })}><Trash2 size={16} /></button>
                    </div></td>
                  </tr>); })}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <ConfirmDialog open={!!confirm} title={confirm?.kind === "delete" ? "Delete this pathway?" : "Archive this pathway?"} confirmLabel={confirm?.kind === "delete" ? "Delete pathway" : "Archive pathway"}
        message={confirm?.kind === "delete" ? `“${confirm?.item.title}” will be removed permanently.` : `“${confirm?.item.title}” will be hidden from learners but kept so you can restore it.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => { const { kind, item } = confirm; setConfirm(null); if (kind === "delete") await run(() => careerService.delete(item.id), "Pathway deleted."); else await run(() => careerService.setStatus(item.id, "archived"), "Pathway archived."); }} />
    </main>
  );
}
