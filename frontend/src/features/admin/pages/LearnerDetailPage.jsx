import { useState } from "react";
import { useParams } from "react-router-dom";
import { UserCheck, UserX, Plus, Trash2, BookOpen } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { userService } from "../../../services/userService.js";
import { courseService } from "../../../services/courseService.js";
import { authService } from "../../../services/authService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { formatDate, initials } from "../../../utils/format.js";
import s from "../shared/adminUi.module.css";

const ROLES = ["Learner", "Instructor", "Administrator"];

export default function LearnerDetailPage() {
  const { userId } = useParams();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(async () => {
    const [user, enrolments, courses] = await Promise.all([userService.get(userId), userService.enrolments(userId), courseService.adminList()]);
    if (!user) throw new Error("This account could not be found.");
    return { user, enrolments, courses };
  }, [userId]);
  const [confirm, setConfirm] = useState(null); // { kind, role? , enrolment? }
  const [courseToAdd, setCourseToAdd] = useState("");

  const back = { backTo: "/admin/users", backLabel: "All users" };
  if (loading) return <main className="page-content"><PageHeader {...back} title="Loading…" /><SkeletonRows rows={6} /></main>;
  if (error) return <main className="page-content"><PageHeader {...back} title="Account" /><ErrorState error={error} onRetry={reload} /></main>;

  const { user, enrolments, courses } = data;
  // An administrator must not be able to lock themselves out or remove their own admin role.
  const isSelf = authService.getUser()?.email?.toLowerCase() === user.email.toLowerCase();
  const available = courses.filter((c) => c.status === "published" && !enrolments.some((e) => e.courseId === c.id));
  const titleOf = (id) => courses.find((c) => c.id === id)?.title || "Removed course";

  async function run(action, success) {
    try { await action(); toast.success(success); await reload(); } catch (err) { toast.error(err.message); }
  }

  async function onConfirm() {
    const c = confirm; setConfirm(null);
    if (c.kind === "status") await run(() => userService.setStatus(user.id, c.status), c.status === "Active" ? "Account activated." : "Account deactivated.");
    if (c.kind === "role") await run(() => userService.setRole(user.id, c.role), `Role changed to ${c.role}.`);
    if (c.kind === "unenrol") await run(() => userService.unenrol(c.enrolment.id), "Enrolment removed.");
  }

  const overall = enrolments.length ? Math.round(enrolments.reduce((n, e) => n + e.progress, 0) / enrolments.length) : 0;
  const inactive = user.status === "Inactive";

  return (
    <main className="page-content">
      <PageHeader {...back} title={user.name} description={user.email}
        actions={<>
          <StatusBadge status={user.status} />
          <button type="button" className={`btn ${inactive || user.status === "Pending" ? "" : "btn-danger"} ${s.btnInline}`} disabled={isSelf}
            title={isSelf ? "You cannot deactivate your own account." : undefined}
            onClick={() => setConfirm({ kind: "status", status: inactive || user.status === "Pending" ? "Active" : "Inactive" })}>
            {inactive || user.status === "Pending" ? <><UserCheck size={16} />Activate account</> : <><UserX size={16} />Deactivate account</>}
          </button>
        </>} />

      <div className={`${s.twoCol} ${s.twoEven}`}>
        <section className={s.card}>
          <h2 className={s.cardTitle} style={{ marginBottom: 16 }}>Profile</h2>
          <div className={s.person} style={{ marginBottom: 16 }}><span className={s.avatar} style={{ width: 52, height: 52, flexBasis: 52, fontSize: 18 }}>{initials(user.name)}</span><div><strong>{user.name}</strong><div className={s.cellSub}>Joined {formatDate(user.joined)}</div></div></div>
          <dl className={s.kv}>
            <dt>Email</dt><dd>{user.email}</dd>
            <dt>Account status</dt><dd>{user.status}</dd>
            <dt>Courses enrolled</dt><dd>{enrolments.length}</dd>
            <dt>Average progress</dt><dd>{overall}%</dd>
          </dl>
        </section>
        <section className={s.card}>
          <h2 className={s.cardTitle} style={{ marginBottom: 6 }}>Role and access</h2>
          <p className={s.hint} style={{ marginBottom: 12 }}>The role controls what this person can do. Changes are recorded in the activity log.</p>
          <label className={s.label} htmlFor="role-select">Role</label>
          <select id="role-select" className="field" value={user.role} disabled={isSelf}
            onChange={(e) => setConfirm({ kind: "role", role: e.target.value })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          {isSelf && <p className={s.hint} style={{ marginTop: 8 }}>You cannot change your own role or access.</p>}
          {user.role === "Instructor" && <p className={s.hint} style={{ marginTop: 8 }}>Instructors can be assigned to courses from the course editor.</p>}
        </section>
      </div>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>Enrolments and progress</h2>
          {user.role === "Learner" && (
            <div className={s.actions}>
              <select className="field" aria-label="Course to enrol in" value={courseToAdd} onChange={(e) => setCourseToAdd(e.target.value)}>
                <option value="">Enrol in a course…</option>{available.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <button type="button" className={`btn ${s.btnInline}`} disabled={!courseToAdd}
                onClick={() => run(() => userService.enrol(user.id, courseToAdd), "Learner enrolled.").then(() => setCourseToAdd(""))}><Plus size={16} />Enrol</button>
            </div>
          )}
        </div>
        {enrolments.length === 0 ? <EmptyState icon={BookOpen} title="No enrolments" message={user.role === "Learner" ? "This learner is not enrolled in any course yet." : "Enrolments apply to learner accounts."} /> : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Course</th><th>Enrolled</th><th style={{ minWidth: 180 }}>Progress</th><th><span className={s.visuallyHidden}>Actions</span></th></tr></thead>
              <tbody>{enrolments.map((e) => (
                <tr key={e.id}>
                  <td>{titleOf(e.courseId)}</td><td>{formatDate(e.enrolledAt)}</td>
                  <td><div className={s.barLabel}><span>{e.progress >= 100 ? "Completed" : "In progress"}</span><strong>{e.progress}%</strong></div><div className={s.barTrack}><div className={s.barFill} style={{ width: `${e.progress}%` }} /></div></td>
                  <td><div className={s.rowActions}><button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Remove enrolment in ${titleOf(e.courseId)}`} onClick={() => setConfirm({ kind: "unenrol", enrolment: e })}><Trash2 size={16} /></button></div></td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog open={!!confirm} danger={confirm?.kind !== "role" && !(confirm?.kind === "status" && confirm.status === "Active")}
        title={confirm?.kind === "status" ? (confirm.status === "Active" ? "Activate this account?" : "Deactivate this account?") : confirm?.kind === "role" ? "Change this person’s role?" : "Remove this enrolment?"}
        confirmLabel={confirm?.kind === "status" ? (confirm.status === "Active" ? "Activate" : "Deactivate") : confirm?.kind === "role" ? "Change role" : "Remove"}
        message={confirm?.kind === "status"
          ? (confirm.status === "Active" ? `${user.name} will be able to sign in and learn.` : `${user.name} will no longer be able to sign in. Their progress is kept.`)
          : confirm?.kind === "role"
            ? `${user.name} will become ${confirm.role === "Administrator" ? "an" : "a"} ${confirm.role}.${confirm.role === "Administrator" ? " Administrators can change every setting on the platform." : ""}`
            : `${user.name} will lose access to “${confirm?.enrolment ? titleOf(confirm.enrolment.courseId) : ""}” and the recorded progress will be removed.`}
        onCancel={() => setConfirm(null)} onConfirm={onConfirm} />
    </main>
  );
}
