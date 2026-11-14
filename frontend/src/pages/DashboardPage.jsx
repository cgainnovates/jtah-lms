import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, BookOpen, CircleCheck, Clock3, Target, Compass } from "lucide-react";
import CourseCard from "../features/courses/CourseCard/CourseCard.jsx";
import ProgressRing from "../components/ProgressRing/ProgressRing.jsx";
import ProgressBar from "../components/ProgressBar/ProgressBar.jsx";
import { courseService } from "../services/courseService.js";
import { careerService } from "../services/careerService.js";
import { repository } from "../services/mockRepository.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [careers, setCareers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    Promise.all([courseService.getLive(), careerService.getLive()])
      .then(([courseRows, careerRows]) => {
        if (!active) return;
        setCourses(courseRows);
        setCareers(careerRows);
        setAnnouncements(repository.list("announcements"));
      })
      .catch(() => active && setLoadError("Your learning overview could not be loaded. Please refresh the page."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const metrics = useMemo(() => {
    const lessons = courses.flatMap(course => (course.modules || []).flatMap(module => module.lessons || []));
    const completed = lessons.filter(lesson => lesson.completed).length;
    const total = lessons.length;
    const progress = courses.length
      ? Math.round(courses.reduce((sum, course) => sum + (Number(course.progress) || 0), 0) / courses.length)
      : 0;
    return { completed, total, progress };
  }, [courses]);

  const activeCourses = courses.filter(course => (Number(course.progress) || 0) > 0 && (Number(course.progress) || 0) < 100);
  const nextLesson = courses.flatMap(course => (course.modules || []).flatMap(module =>
    (module.lessons || []).filter(lesson => !lesson.completed).map(lesson => ({ ...lesson, course }))
  ))[0];

  if (loading) return <main className="page-content" aria-busy="true"><div className="page-heading"><div><div className="eyebrow">Your learning space</div><h1>Preparing your dashboard</h1><p className="muted">Loading your courses and learning activity…</p></div></div><div className="grid grid-4"><div className="skeleton skeleton-stat"/><div className="skeleton skeleton-stat"/><div className="skeleton skeleton-stat"/><div className="skeleton skeleton-stat"/></div><div className="grid grid-2" style={{ marginTop: 18 }}><div className="skeleton skeleton-panel"/><div className="skeleton skeleton-panel"/></div></main>;

  return <main className="page-content">
    <div className="page-heading">
      <div><div className="eyebrow">Your learning space</div><h1>Welcome back, {user?.name?.split(" ")[0] || "Learner"}</h1><p className="muted">Keep building your skills. Every lesson moves you forward.</p></div>
      <Link className="btn" to="/courses">Explore courses <ArrowRight size={16}/></Link>
    </div>
    {loadError && <div className="notice" role="alert">{loadError}</div>}
    <div className="grid grid-4 dashboard-metrics">
      {[{label:"Enrolled courses",value:courses.length,Icon:BookOpen},{label:"In progress",value:activeCourses.length,Icon:Clock3},{label:"Completed lessons",value:metrics.completed,Icon:CircleCheck},{label:"Learning progress",value:`${metrics.progress}%`,Icon:Target}].map(item=><div className="panel metric-card" key={item.label}><div className="spread"><span className="muted metric-label">{item.label}</span><item.Icon size={18} color="var(--purple)"/></div><div className="metric-value">{item.value}</div></div>)}
    </div>
    <div className="grid grid-2 dashboard-columns">
      <section className="stack">
        <div className="spread"><h2 className="section-heading">Continue learning</h2><Link to="/courses" className="text-link">All courses <ArrowRight size={14}/></Link></div>
        {activeCourses.length ? activeCourses.slice(0, 2).map(course => <CourseCard key={course.id} course={course}/>) : <div className="empty-state">You have not started a course yet. Explore the catalogue to get started.</div>}
        <div className="panel career-prompt"><div className="row"><span className="icon-tile"><Compass size={19}/></span><div><h2 className="section-heading">Plan your next move</h2><p className="muted small-copy">Explore career pathways, discover relevant skills and connect them to your learning.</p></div></div><Link to="/pathways" className="btn btn-secondary">Explore career pathways <ArrowRight size={15}/></Link></div>
      </section>
      <section className="stack">
        <div className="panel"><div className="spread"><h2 className="section-heading">Learning snapshot</h2><ProgressRing value={metrics.progress}/></div><p className="muted small-copy" style={{marginTop:10}}>Average progress across your enrolled courses.</p><div style={{marginTop:14}}><ProgressBar value={metrics.progress} label="Course progress"/></div><p className="muted small-copy" style={{marginTop:10}}>{metrics.completed} of {metrics.total} course lessons completed.</p></div>
        <div className="panel"><h2 className="section-heading" style={{marginBottom:14}}>Next learning activity</h2>{nextLesson ? <div className="row"><span className="icon-tile"><BookOpen size={18}/></span><div className="activity-copy"><strong>{nextLesson.title}</strong><p className="muted small-copy">{nextLesson.course.title} · {nextLesson.duration || "Lesson"}</p><Link to={`/learn/${nextLesson.course.id}`} className="text-link">Resume learning <ArrowRight size={14}/></Link></div></div> : <div className="empty-state">No outstanding lessons. You are up to date.</div>}</div>
        <div className="panel"><h2 className="section-heading" style={{marginBottom:10}}>Announcements</h2>{announcements.length ? announcements.slice(0,3).map(item=><div className="announcement-item" key={item.id}><strong>{item.title}</strong><p className="muted small-copy">{item.body}</p><span className="muted date-copy">{item.date}</span></div>) : <p className="muted small-copy">There are no announcements at the moment.</p>}</div>
      </section>
    </div>
  </main>;
}
