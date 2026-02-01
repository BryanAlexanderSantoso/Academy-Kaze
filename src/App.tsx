import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Landing
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import Onboarding from './pages/Onboarding';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import Courses from './pages/dashboard/Courses';
import CourseDetail from './pages/dashboard/CourseDetail';
import Assignments from './pages/dashboard/Assignments';
import Questionnaires from './pages/dashboard/Questionnaires';
import TakeQuestionnaire from './pages/dashboard/TakeQuestionnaire';
import PremiumPayment from './pages/dashboard/PremiumPayment';
import Profile from './pages/dashboard/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import CreateCourse from './pages/admin/CreateCourse';
import EditCourse from './pages/admin/EditCourse';
import ManageChapters from './pages/admin/ManageChapters';
import AdminAssignments from './pages/admin/AdminAssignments';
import CreateAssignment from './pages/admin/CreateAssignment';
import AdminQuestionnaires from './pages/admin/AdminQuestionnaires';
import QuestionnaireResponses from './pages/admin/QuestionnaireResponses';
import AdminPremiumPayments from './pages/admin/AdminPremiumPayments';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireMember?: boolean;
}> = ({ children, requireAdmin, requireMember }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (requireMember && user.role !== 'member') {
    return <Navigate to="/admin/dashboard" />;
  }

  // Check if member needs to complete onboarding
  if (user.role === 'member' && !user.learning_path && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

// Public Route (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
    if (!user.learning_path) {
      return <Navigate to="/onboarding" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* Onboarding (Protected - Member only) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireMember>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Member Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireMember>
            <MemberDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="questionnaires" element={<Questionnaires />} />
        <Route path="questionnaires/:id/take" element={<TakeQuestionnaire />} />
        <Route path="premium" element={<PremiumPayment />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute requireAdmin>
            <AdminCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/new"
        element={
          <ProtectedRoute requireAdmin>
            <CreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id/chapters"
        element={
          <ProtectedRoute requireAdmin>
            <ManageChapters />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments/create"
        element={
          <ProtectedRoute requireAdmin>
            <CreateAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questionnaires"
        element={
          <ProtectedRoute requireAdmin>
            <AdminQuestionnaires />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questionnaires/:id/responses"
        element={
          <ProtectedRoute requireAdmin>
            <QuestionnaireResponses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/premium"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPremiumPayments />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
