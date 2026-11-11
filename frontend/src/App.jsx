import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LearnerLayout from "./layouts/LearnerLayout/LearnerLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import {
  SimplePage,
  CourseDetailPage,
  LearningPage,
  AdminOverviewPage,
  AdminCoursesPage,
  AdminUsersPage,
  AdminPathwaysPage,
} from "./pages/PortalPages.jsx";

export default function App() {
  return (
    <AuthProvider>
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
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/pathways" element={<AdminPathwaysPage />} />
              <Route path="/admin/materials" element={<SimplePage kind="adminMaterials" />} />
              <Route path="/admin/assessments" element={<SimplePage kind="adminAssessments" />} />
              <Route path="/admin/reports" element={<SimplePage kind="adminReports" />} />
              <Route path="/admin/settings" element={<SimplePage kind="adminSettings" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
