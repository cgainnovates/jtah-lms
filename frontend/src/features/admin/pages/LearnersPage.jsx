import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import SearchBox from "../shared/SearchBox.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import Pager from "../shared/Pager.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { userService } from "../../../services/userService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { formatDate, initials } from "../../../utils/format.js";
import s from "../shared/adminUi.module.css";

export default function LearnersPage() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [users, enrolments] = await Promise.all([userService.list(), userService.allEnrolments()]);
    return { users, enrolments };
  });
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = settingsService.read().admin.defaultPageSize || 8;

  const rows = useMemo(() => (data?.users || []).filter((u) =>
    (role === "all" || u.role === role) && (status === "all" || u.status === status) &&
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())), [data, query, role, status]);

  const header = <PageHeader title="Users" description="View registered learners and instructors, check their progress, and manage account access." />;
  if (loading) return <main className="page-content">{header}<SkeletonRows rows={7} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;

  const reset = (setter) => (value) => { setter(value); setPage(1); };
  return (
    <main className="page-content">
      {header}
      <div className={s.card}>
        <div className={s.toolbar}>
          <SearchBox value={query} onChange={reset(setQuery)} placeholder="Search by name or email" />
          <select className={`field ${s.select}`} aria-label="Filter by role" value={role} onChange={(e) => reset(setRole)(e.target.value)}>
            <option value="all">All roles</option><option>Learner</option><option>Instructor</option><option>Administrator</option>
          </select>
          <select className={`field ${s.select}`} aria-label="Filter by status" value={status} onChange={(e) => reset(setStatus)(e.target.value)}>
            <option value="all">All statuses</option><option>Active</option><option>Pending</option><option>Inactive</option>
          </select>
        </div>
        {rows.length === 0 ? <EmptyState icon={Users} title="No users found" message="No accounts match your search or filters." /> : (
          <>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Courses</th><th>Joined</th></tr></thead>
                <tbody>
                  {rows.slice((page - 1) * pageSize, page * pageSize).map((u) => (
                    <tr key={u.id}>
                      <td><div className={s.person}><span className={s.avatar}>{initials(u.name)}</span>
                        <div style={{ minWidth: 0 }}><Link className={s.cellTitle} to={`/admin/users/${u.id}`}>{u.name}</Link><div className={s.cellSub}>{u.email}</div></div></div></td>
                      <td>{u.role}</td>
                      <td><StatusBadge status={u.status} /></td>
                      <td>{data.enrolments.filter((e) => e.userId === u.id).length}</td>
                      <td>{formatDate(u.joined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} pageSize={pageSize} total={rows.length} onPage={setPage} />
          </>
        )}
      </div>
    </main>
  );
}
