import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, BookOpen, Eye, FileText, GraduationCap, Megaphone, Trash2, Plus, Activity } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import StatCard from "../shared/StatCard.jsx";
import StatusBadge from "../shared/StatusBadge.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import Modal from "../shared/Modal.jsx";
import Field from "../shared/Field.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import { SkeletonCards, SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { BarList, ColumnChart, DonutChart, LineChart } from "../charts/Charts.jsx";
import { analyticsService } from "../../../services/analyticsService.js";
import { activityService } from "../../../services/activityService.js";
import { announcementService } from "../../../services/announcementService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { formatDate, formatDateTime, initials } from "../../../utils/format.js";
import s from "../shared/adminUi.module.css";

export default function AdminDashboardPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(async () => {
    const [analytics, activity, announcements] = await Promise.all([analyticsService.get(), activityService.recent(6), announcementService.list()]);
    return { analytics, activity, announcements };
  });
  const [composer, setComposer] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", audience: "All learners" });
  const [errors, setErrors] = useState({});
  const [remove, setRemove] = useState(null);
  const showSample = settingsService.read().admin.showSampleAnalytics;

  const header = <PageHeader title="Administrator overview" description="A snapshot of learners, courses and learning activity across JTAH." />;
  if (loading) return <main className="page-content">{header}<SkeletonCards count={8} /><SkeletonRows rows={6} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;

  const { analytics: a, activity, announcements } = data;
  const t = a.totals;

  async function postAnnouncement() {
    const found = {};
    if (!draft.title.trim()) found.title = "Enter a headline.";
    if (!draft.body.trim()) found.body = "Write the announcement.";
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await announcementService.create({ ...draft, title: draft.title.trim(), body: draft.body.trim() });
      toast.success("Announcement posted.");
      setComposer(false); setDraft({ title: "", body: "", audience: "All learners" });
      await reload();
    } catch (err) { toast.error(err.message); }
  }

  return (
    <main className="page-content">
      {header}
      <div className={s.statGrid}>
        <StatCard icon={Users} label="Registered learners" value={t.learners} />
        <StatCard icon={UserCheck} label="Active learners" value={t.activeLearners} delay={40} />
        <StatCard icon={BookOpen} label="Total courses" value={t.courses} delay={80} />
        <StatCard icon={Eye} label="Published courses" value={t.published} delay={120} />
        <StatCard icon={FileText} label="Draft courses" value={t.drafts} delay={160} />
        <StatCard icon={GraduationCap} label="Course completion rate" value={`${t.completionRate}%`} delay={200} />
      </div>

      <div className={s.twoCol}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Enrolments by month</h2><span className={s.sub}>{t.enrolments} total enrolments</span></div>
          {a.enrolmentsByMonth.length ? <ColumnChart data={a.enrolmentsByMonth} valueKey="enrolments" ariaLabel={`Enrolments by month: ${a.enrolmentsByMonth.map((m) => `${m.label} ${m.enrolments}`).join(", ")}`} /> : <EmptyState title="No enrolments yet" message="Enrolments will appear here as learners join courses." />}
        </section>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Course status</h2></div>
          <DonutChart centreLabel={t.courses} ariaLabel={`${t.published} published, ${t.drafts} draft, ${t.archived} archived courses`}
            segments={[{ label: "Published", value: t.published, color: "#2E9E6B" }, { label: "Draft", value: t.drafts, color: "#E8A93B" }, { label: "Archived", value: t.archived, color: "#9691A7" }]} />
        </section>
      </div>

      <div className={s.twoCol}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Completion by course</h2><Link className="text-link" to="/admin/reports">Full reports</Link></div>
          {a.perCourse.length ? <BarList max={100} format={(v) => `${v}%`} items={a.perCourse.map((c) => ({ label: c.title, value: c.completionRate }))} /> : <EmptyState title="No courses" message="Create a course to see completion statistics." />}
        </section>
        {showSample && (
          <section className={s.card}>
            <div className={s.cardHead}><h2 className={s.cardTitle}>Learning engagement</h2><span className={`${s.badge} ${s.toneGold}`}>Sample data</span></div>
            <LineChart data={a.engagement} ariaLabel="Weekly active learners and lessons completed (sample data)"
              series={[{ key: "activeLearners", label: "Active learners", color: "#5B3FA8" }, { key: "lessonsCompleted", label: "Lessons completed", color: "#E8A93B" }]} />
          </section>
        )}
      </div>

      <div className={`${s.twoCol} ${s.twoEven}`}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Recent registrations</h2><Link className="text-link" to="/admin/users">All users</Link></div>
          <div className={s.feed}>{a.recentRegistrations.map((u) => (
            <div key={u.id} className={s.feedItem} style={{ alignItems: "center" }}>
              <span className={s.avatar}>{initials(u.name)}</span>
              <div style={{ flex: 1, minWidth: 0 }}><Link className={s.cellTitle} to={`/admin/users/${u.id}`}>{u.name}</Link><div className={s.cellSub}>{u.role} · joined {formatDate(u.joined)}</div></div>
              <StatusBadge status={u.status} />
            </div>))}</div>
        </section>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Recent administrative activity</h2><Activity size={18} color="var(--purple)" /></div>
          {activity.length === 0 ? <EmptyState title="No activity yet" message="Changes made by administrators will be listed here." /> :
            <div className={s.feed}>{activity.map((x) => <div key={x.id} className={s.feedItem}><span className={s.dot} /><div><div>{x.message}</div><div className={s.cellSub}>{x.actor} · {formatDateTime(x.at)}</div></div></div>)}</div>}
        </section>
      </div>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>Platform announcements</h2>
          <button type="button" className={`btn btn-secondary ${s.btnInline}`} onClick={() => setComposer(true)}><Plus size={16} />New announcement</button>
        </div>
        {announcements.length === 0 ? <EmptyState icon={Megaphone} title="No announcements" message="Post an announcement to share news with learners." /> : (
          <div className={s.feed}>{announcements.map((n) => (
            <div key={n.id} className={s.feedItem} style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}><strong>{n.title}</strong><p style={{ fontSize: 14, margin: "2px 0" }}>{n.body}</p><div className={s.cellSub}>{n.audience} · {formatDate(n.date)}</div></div>
              <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} aria-label={`Delete announcement ${n.title}`} onClick={() => setRemove(n)}><Trash2 size={16} /></button>
            </div>))}</div>
        )}
      </section>

      <Modal open={composer} title="New announcement" onClose={() => setComposer(false)}
        footer={<><button type="button" className="btn btn-ghost" onClick={() => setComposer(false)}>Cancel</button><button type="button" className="btn" onClick={postAnnouncement}>Post announcement</button></>}>
        <div className={s.grid}>
          <Field label="Headline" required error={errors.title}>{(p) => <input {...p} maxLength={100} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}</Field>
          <Field label="Message" required error={errors.body}>{(p) => <textarea {...p} rows={4} maxLength={500} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />}</Field>
          <Field label="Audience">{(p) => <select {...p} value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })}><option>All learners</option><option>Instructors</option><option>Everyone</option></select>}</Field>
        </div>
      </Modal>
      <ConfirmDialog open={!!remove} title="Delete this announcement?" confirmLabel="Delete" message={`“${remove?.title}” will no longer be shown to learners.`}
        onCancel={() => setRemove(null)} onConfirm={async () => { const n = remove; setRemove(null); try { await announcementService.delete(n.id); toast.success("Announcement deleted."); await reload(); } catch (err) { toast.error(err.message); } }} />
    </main>
  );
}
