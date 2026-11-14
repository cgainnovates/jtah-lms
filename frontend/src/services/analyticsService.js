import { repository } from "./mockRepository.js";
import { sampleEngagement } from "../mocks/adminData.js";
import { isLive } from "../utils/status.js";
import { percent } from "../utils/format.js";
import { wait } from "./latency.js";

// Derives every statistic from the stored records so charts always match the data.
// The one exception is `engagement`, which is labelled sample data until the backend tracks activity.
export function buildAnalytics() {
  const users = repository.list("users");
  const courses = repository.list("courses");
  const enrolments = repository.list("enrolments");
  const assessments = repository.list("assessments");
  const learners = users.filter((u) => u.role === "Learner");

  const perCourse = courses.map((course) => {
    const rows = enrolments.filter((e) => e.courseId === course.id);
    const completed = rows.filter((e) => e.progress >= 100).length;
    const lessons = (course.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0);
    const related = assessments.filter((a) => a.courseId === course.id && a.stats?.attempts);
    return {
      id: course.id, title: course.title, status: course.status || "published", lessons,
      enrolled: rows.length, completed,
      completionRate: percent(completed, rows.length),
      avgProgress: rows.length ? Math.round(rows.reduce((s, e) => s + e.progress, 0) / rows.length) : 0,
      avgScore: related.length ? Math.round(related.reduce((s, a) => s + a.stats.avgScore, 0) / related.length) : null,
    };
  });

  // Enrolments grouped by calendar month (YYYY-MM), oldest first.
  const byMonth = {};
  enrolments.forEach((e) => { const key = String(e.enrolledAt).slice(0, 7); byMonth[key] = (byMonth[key] || 0) + 1; });
  const enrolmentsByMonth = Object.keys(byMonth).sort().map((key) => ({
    key, label: new Date(`${key}-01`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), enrolments: byMonth[key],
  }));

  const completedEnrolments = enrolments.filter((e) => e.progress >= 100).length;
  return {
    totals: {
      learners: learners.length,
      activeLearners: learners.filter((u) => u.status === "Active").length,
      courses: courses.length,
      published: courses.filter(isLive).length,
      drafts: courses.filter((c) => c.status === "draft").length,
      archived: courses.filter((c) => c.status === "archived").length,
      enrolments: enrolments.length,
      completedEnrolments,
      completionRate: percent(completedEnrolments, enrolments.length),
    },
    perCourse,
    enrolmentsByMonth,
    assessmentPerformance: assessments.filter((a) => a.stats?.attempts).map((a) => ({ id: a.id, title: a.title, ...a.stats })),
    recentRegistrations: [...users].sort((a, b) => b.joined.localeCompare(a.joined)).slice(0, 5),
    engagement: sampleEngagement,
  };
}

export const analyticsService = {
  async get() { await wait(); return buildAnalytics(); },
};
