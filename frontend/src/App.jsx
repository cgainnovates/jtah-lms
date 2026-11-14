import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LearnerLayout from "./layouts/LearnerLayout/LearnerLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { SimplePage, CourseDetailPage, LearningPage } from "./pages/PortalPages.jsx";
import { ToastProvider } from "./features/admin/shared/ToastProvider.jsx";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage.jsx";
import CourseListPage from "./features/admin/course/CourseListPage.jsx";
import CourseEditorPage from "./features/admin/course/CourseEditorPage.jsx";
import LearnersPage from "./features/admin/pages/LearnersPage.jsx";
import LearnerDetailPage from "./features/admin/pages/LearnerDetailPage.jsx";
import PathwaysPage from "./features/admin/pages/PathwaysPage.jsx";
import PathwayEditorPage from "./features/admin/pages/PathwayEditorPage.jsx";
import MaterialsPage from "./features/admin/pages/MaterialsPage.jsx";
import AssessmentListPage from "./features/admin/assessments/AssessmentListPage.jsx";
import AssessmentEditorPage from "./features/admin/assessments/AssessmentEditorPage.jsx";
import ReportsPage from "./features/admin/pages/ReportsPage.jsx";
import SettingsPage from "./features/admin/pages/SettingsPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<LearnerLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<SimplePage kind="courses" />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/learn/:courseId" element={<LearningPage />} />
            <Route path="/pathways" element={<SimplePage kind="pathways" />} />
            <Route path="/assignments" element={<SimplePage kind="assignments" />} />
            <Route path="/certificates" element={<SimplePage kind="certificates" />} />
            <Route path="/resources" element={<SimplePage kind="resources" />} />
            <Route path="/community" element={<SimplePage kind="community" />} />
            <Route path="/help" element={<SimplePage kind="help" />} />
            <Route path="/profile" element={<SimplePage kind="profile" />} />
            <Route path="/notifications" element={<SimplePage kind="notifications" />} />
          </Route>

          <Route element={<ProtectedRoute roles={["Administrator"]} />}>
            <Route element={<LearnerLayout admin />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/courses" element={<CourseListPage />} />
              <Route path="/admin/courses/new" element={<CourseEditorPage />} />
              <Route path="/admin/courses/:courseId/edit" element={<CourseEditorPage />} />
              <Route path="/admin/users" element={<LearnersPage />} />
              <Route path="/admin/users/:userId" element={<LearnerDetailPage />} />
              <Route path="/admin/pathways" element={<PathwaysPage />} />
              <Route path="/admin/pathways/new" element={<PathwayEditorPage />} />
              <Route path="/admin/pathways/:pathwayId/edit" element={<PathwayEditorPage />} />
              <Route path="/admin/materials" element={<MaterialsPage />} />
              <Route path="/admin/assessments" element={<AssessmentListPage />} />
              <Route path="/admin/assessments/new" element={<AssessmentEditorPage />} />
              <Route path="/admin/assessments/:assessmentId/edit" element={<AssessmentEditorPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
