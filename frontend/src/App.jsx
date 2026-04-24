import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ModalProvider } from './components/Modal';
import { ConfirmProvider } from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Interviews from './pages/Interviews';
import InterviewDetail from './pages/InterviewDetail';
import Communications from './pages/Communications';
import Assessments from './pages/Assessments';
import Analytics from './pages/Analytics';
import EmailTemplates from './pages/EmailTemplates';
import Pipeline from './pages/Pipeline';
import Profile from './pages/Profile';

// HR Tools Pages
import HRTools from './pages/HRTools';
import BiasDetector from './pages/BiasDetector';
import SentimentAnalyzer from './pages/SentimentAnalyzer';
import CultureFit from './pages/CultureFit';
import PerformanceReviews from './pages/PerformanceReviews';
import SalaryBenchmarker from './pages/SalaryBenchmarker';
import ExitInterviews from './pages/ExitInterviews';
import InterviewScheduler from './pages/InterviewScheduler';
import OrgChart from './pages/OrgChart';
import SkillsAssessor from './pages/SkillsAssessor';
import JobDescriptionWriter from './pages/JobDescriptionWriter';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="candidates/:id" element={<CandidateDetail />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="interviews/:id" element={<InterviewDetail />} />
        <Route path="communications" element={<Communications />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="templates" element={<EmailTemplates />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="profile" element={<Profile />} />

        {/* HR Tools Routes */}
        <Route path="hr" element={<HRTools />} />
        <Route path="hr/bias-detector" element={<BiasDetector />} />
        <Route path="hr/sentiment-analyzer" element={<SentimentAnalyzer />} />
        <Route path="hr/culture-fit" element={<CultureFit />} />
        <Route path="hr/performance-reviews" element={<PerformanceReviews />} />
        <Route path="hr/salary-benchmarker" element={<SalaryBenchmarker />} />
        <Route path="hr/exit-interviews" element={<ExitInterviews />} />
        <Route path="hr/interview-scheduler" element={<InterviewScheduler />} />
        <Route path="hr/org-chart" element={<OrgChart />} />
        <Route path="hr/skills-assessor" element={<SkillsAssessor />} />
        <Route path="hr/job-description-writer" element={<JobDescriptionWriter />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              <ConfirmProvider>
                <AppRoutes />
              </ConfirmProvider>
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
