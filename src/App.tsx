import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import TitleUpdater from './components/TitleUpdater';

// Loading Component
const PageLoading = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initializing Interface...</p>
  </div>
);

// Landing
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Member Pages
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const Courses = lazy(() => import('./pages/dashboard/Courses'));
const CourseDetail = lazy(() => import('./pages/dashboard/CourseDetail'));
const Assignments = lazy(() => import('./pages/dashboard/Assignments'));
const Questionnaires = lazy(() => import('./pages/dashboard/Questionnaires'));
const TakeQuestionnaire = lazy(() => import('./pages/dashboard/TakeQuestionnaire'));
const PremiumPayment = lazy(() => import('./pages/dashboard/PremiumPayment'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Certificate = lazy(() => import('./pages/dashboard/Certificate'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const CreateCourse = lazy(() => import('./pages/admin/CreateCourse'));
const EditCourse = lazy(() => import('./pages/admin/EditCourse'));
const ManageChapters = lazy(() => import('./pages/admin/ManageChapters'));
const AdminAssignments = lazy(() => import('./pages/admin/AdminAssignments'));
const CreateAssignment = lazy(() => import('./pages/admin/CreateAssignment'));
const AdminQuestionnaires = lazy(() => import('./pages/admin/AdminQuestionnaires'));
const QuestionnaireResponses = lazy(() => import('./pages/admin/QuestionnaireResponses'));
const AdminPremiumPayments = lazy(() => import('./pages/admin/AdminPremiumPayments'));
const AdminPromos = lazy(() => import('./pages/admin/AdminPromos'));

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireMember?: boolean;
}> = ({ children, requireAdmin, requireMember }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
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
    return <PageLoading />;
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
    <Suspense fallback={<PageLoading />}>
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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ResetPassword />
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
          <Route path="certificate/:courseId" element={<Certificate />} />
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
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute requireAdmin>
              <AdminSupport />
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
        <Route
          path="/admin/promos"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPromos />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <AuthProvider>
        <AlertProvider>
          <AppRoutes />
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;