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
import SkillsGapAnalysis from './pages/SkillsGapAnalysis';
import InterviewAnalysis from './pages/InterviewAnalysis';
import RetentionRisk from './pages/RetentionRisk';
import OfferLetter from './pages/OfferLetter';
import DEIMetrics from './pages/DEIMetrics';
import CustomViewsPage from './pages/CustomViewsPage';

// === Batch 07 Gaps & Frontend Mounts ===
import CfUnbiasedResumeRanking from './pages/CfUnbiasedResumeRanking';
import CfInterviewIntelligence from './pages/CfInterviewIntelligence';
import CfPeerFeedbackAggregator from './pages/CfPeerFeedbackAggregator';
import CfDeiMetricsDashboard from './pages/CfDeiMetricsDashboard';
import CfRetentionRiskPrediction from './pages/CfRetentionRiskPrediction';
import CfSkillstoroleMatcher from './pages/CfSkillstoroleMatcher';
import GapNoResumescreeningParseAndScore from './pages/GapNoResumescreeningParseAndScore';
import GapNoInterviewanalysisTranscribeSentimentRe from './pages/GapNoInterviewanalysisTranscribeSentimentRe';
import GapNoCulturefitassessment from './pages/GapNoCulturefitassessment';
import GapNoBiasdetectionInHiringFunnel from './pages/GapNoBiasdetectionInHiringFunnel';
import GapNoSalarybenchmarkRoute from './pages/GapNoSalarybenchmarkRoute';
import GapNoSkillsgapanalysisForHires from './pages/GapNoSkillsgapanalysisForHires';
import GapNoResumeParserfileIngestionRoute from './pages/GapNoResumeParserfileIngestionRoute';
import GapNoCalendarIntegrationForInterviewSchedu from './pages/GapNoCalendarIntegrationForInterviewSchedu';
import GapNoOfferLetterGenerator from './pages/GapNoOfferLetterGenerator';
import GapNoOnboardingChecklistWorkflow from './pages/GapNoOnboardingChecklistWorkflow';
import GapNoPerformanceReviewModule from './pages/GapNoPerformanceReviewModule';
import GapNoDeiMetricsDashboard from './pages/GapNoDeiMetricsDashboard';
import GapNoExternalJobboardPostingLinkedinIndeed from './pages/GapNoExternalJobboardPostingLinkedinIndeed';
import GapNoNotificationsemailAutomationRoutes from './pages/GapNoNotificationsemailAutomationRoutes';
// === End Batch 07 ===


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
        <Route path="hr/skills-gap-analysis" element={<SkillsGapAnalysis />} />
        <Route path="hr/interview-analysis" element={<InterviewAnalysis />} />
        <Route path="hr/retention-risk" element={<RetentionRisk />} />
        <Route path="hr/offer-letter" element={<OfferLetter />} />
        <Route path="hr/dei-metrics" element={<DEIMetrics />} />

        {/* Custom Hiring Analytics views */}
        <Route path="custom-views" element={<CustomViewsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-unbiased-resume-ranking' element={<CfUnbiasedResumeRanking />} />
          <Route path='/cf-interview-intelligence' element={<CfInterviewIntelligence />} />
          <Route path='/cf-peer-feedback-aggregator' element={<CfPeerFeedbackAggregator />} />
          <Route path='/cf-dei-metrics-dashboard' element={<CfDeiMetricsDashboard />} />
          <Route path='/cf-retention-risk-prediction' element={<CfRetentionRiskPrediction />} />
          <Route path='/cf-skillstorole-matcher' element={<CfSkillstoroleMatcher />} />
          <Route path='/gap-no-resumescreening-parse-and-score' element={<GapNoResumescreeningParseAndScore />} />
          <Route path='/gap-no-interviewanalysis-transcribe-sentiment-re' element={<GapNoInterviewanalysisTranscribeSentimentRe />} />
          <Route path='/gap-no-culturefitassessment' element={<GapNoCulturefitassessment />} />
          <Route path='/gap-no-biasdetection-in-hiring-funnel' element={<GapNoBiasdetectionInHiringFunnel />} />
          <Route path='/gap-no-salarybenchmark-route' element={<GapNoSalarybenchmarkRoute />} />
          <Route path='/gap-no-skillsgapanalysis-for-hires' element={<GapNoSkillsgapanalysisForHires />} />
          <Route path='/gap-no-resume-parserfile-ingestion-route' element={<GapNoResumeParserfileIngestionRoute />} />
          <Route path='/gap-no-calendar-integration-for-interview-schedu' element={<GapNoCalendarIntegrationForInterviewSchedu />} />
          <Route path='/gap-no-offer-letter-generator' element={<GapNoOfferLetterGenerator />} />
          <Route path='/gap-no-onboarding-checklist-workflow' element={<GapNoOnboardingChecklistWorkflow />} />
          <Route path='/gap-no-performance-review-module' element={<GapNoPerformanceReviewModule />} />
          <Route path='/gap-no-dei-metrics-dashboard' element={<GapNoDeiMetricsDashboard />} />
          <Route path='/gap-no-external-jobboard-posting-linkedin-indeed' element={<GapNoExternalJobboardPostingLinkedinIndeed />} />
          <Route path='/gap-no-notificationsemail-automation-routes' element={<GapNoNotificationsemailAutomationRoutes />} />
          // === End Batch 07 ===
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
