import { Download } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import EmptyState from "../shared/EmptyState.jsx";
import { SkeletonCards, SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { BarList, ColumnChart, LineChart } from "../charts/Charts.jsx";
import { analyticsService } from "../../../services/analyticsService.js";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { downloadCsv } from "../../../utils/csv.js";
import s from "../shared/adminUi.module.css";

export default function ReportsPage() {
  const { data, loading, error, reload } = useAsync(() => analyticsService.get());
  const showSample = settingsService.read().admin.showSampleAnalytics;

  const actions = data && <button type="button" className={`btn btn-ghost ${s.btnInline}`} onClick={() => downloadCsv("jtah-course-performance.csv", [
    ["Course", "Status", "Enrolled", "Completed", "Completion %", "Average progress %", "Assessment average %"],
    ...data.perCourse.map((c) => [c.title, c.status, c.enrolled, c.completed, c.completionRate, c.avgProgress, c.avgScore ?? ""]),
  ])}><Download size={16} />Export CSV</button>;
  const header = <PageHeader title="Reports and analytics" description="Enrolment, completion and performance across courses. Figures are calculated from the records stored in this demo." actions={actions} />;

  if (loading) return <main className="page-content">{header}<SkeletonCards count={4} /><SkeletonRows rows={6} /></main>;
  if (error) return <main className="page-content">{header}<ErrorState error={error} onRetry={reload} /></main>;

  const { totals: t, perCourse, enrolmentsByMonth, assessmentPerformance, engagement } = data;
  if (!perCourse.length) return <main className="page-content">{header}<EmptyState title="No data to report on" message="Create courses and enrol learners to see reports." /></main>;

  return (
    <main className="page-content">
      {header}
      <div className={`${s.twoCol} ${s.twoEven}`}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Learner enrolment</h2><span className={s.sub}>{t.enrolments} enrolments · {t.learners} learners</span></div>
          {enrolmentsByMonth.length ? <ColumnChart data={enrolmentsByMonth} valueKey="enrolments" ariaLabel="Enrolments per month" /> : <p className={s.hint}>No enrolments yet.</p>}
        </section>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Course popularity</h2><span className={s.sub}>Enrolments per course</span></div>
          <BarList items={[...perCourse].sort((x, y) => y.enrolled - x.enrolled).map((c) => ({ label: c.title, value: c.enrolled }))} />
        </section>
      </div>
      <div className={`${s.twoCol} ${s.twoEven}`}>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Course completion</h2><span className={s.sub}>{t.completionRate}% overall</span></div>
          <BarList max={100} format={(v) => `${v}%`} items={perCourse.map((c) => ({ label: c.title, value: c.completionRate, color: "#2E9E6B" }))} />
        </section>
        <section className={s.card}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Assessment performance</h2><span className={s.sub}>Average score</span></div>
          {assessmentPerformance.length ? <BarList max={100} format={(v) => `${v}%`} items={assessmentPerformance.map((x) => ({ label: x.title, value: x.avgScore, color: "#E8A93B" }))} /> : <p className={s.hint}>No assessment attempts recorded yet.</p>}
        </section>
      </div>
      {showSample && (
        <section className={s.card} style={{ marginBottom: 16 }}>
          <div className={s.cardHead}><h2 className={s.cardTitle}>Learner engagement</h2><span className={`${s.badge} ${s.toneGold}`}>Sample data</span></div>
          <LineChart data={engagement} ariaLabel="Weekly active learners and lessons completed (sample data)" series={[{ key: "activeLearners", label: "Active learners", color: "#5B3FA8" }, { key: "lessonsCompleted", label: "Lessons completed", color: "#E8A93B" }]} />
          <p className={s.hint} style={{ marginTop: 8 }}>Engagement tracking needs the backend. These weekly figures are sample data for layout purposes.</p>
        </section>
      )}
      <section className={s.card}>
        <div className={s.cardHead}><h2 className={s.cardTitle}>Course-level comparison</h2></div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Course</th><th>Lessons</th><th>Enrolled</th><th>Completed</th><th>Completion</th><th>Avg progress</th><th>Assessment avg</th></tr></thead>
            <tbody>{perCourse.map((c) => <tr key={c.id}><td><strong>{c.title}</strong><div className={s.cellSub}>{c.status}</div></td><td>{c.lessons}</td><td>{c.enrolled}</td><td>{c.completed}</td><td>{c.completionRate}%</td><td>{c.avgProgress}%</td><td>{c.avgScore == null ? "—" : `${c.avgScore}%`}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
