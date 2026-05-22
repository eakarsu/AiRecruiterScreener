import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Users, Calendar, Mail, ClipboardCheck,
  BarChart3, FileText, GitBranch, LogOut, Menu, X, User, ChevronDown,
  Bot, Sparkles, Settings, PieChart, Zap,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Job Postings', icon: Briefcase },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/interviews', label: 'Interviews', icon: Calendar },
  { path: '/communications', label: 'Communications', icon: Mail },
  { path: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { path: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/templates', label: 'Email Templates', icon: FileText },
  { path: '/hr', label: 'HR AI Tools', icon: Sparkles },
  { path: '/hr/slate-balance', label: 'Slate Balance', icon: PieChart },
  { path: '/custom-views', label: 'Hiring Analytics', icon: PieChart },
];

const gapNavItems = [
  { path: '/gap-no-resumescreening-parse-and-score', label: 'Resume Screener', icon: Zap },
  { path: '/gap-no-interviewanalysis-transcribe-sentiment-re', label: 'Interview Analysis', icon: Zap },
  { path: '/gap-no-culturefitassessment', label: 'Culture Fit', icon: Zap },
  { path: '/gap-no-biasdetection-in-hiring-funnel', label: 'Bias Detection', icon: Zap },
  { path: '/gap-no-salarybenchmark-route', label: 'Salary Benchmark', icon: Zap },
  { path: '/gap-no-skillsgapanalysis-for-hires', label: 'Skills Gap Analysis', icon: Zap },
  { path: '/gap-no-resume-parserfile-ingestion-route', label: 'Resume Parser', icon: Zap },
  { path: '/gap-no-calendar-integration-for-interview-schedu', label: 'Calendar Integration', icon: Zap },
  { path: '/gap-no-offer-letter-generator', label: 'Offer Letter Gen', icon: Zap },
  { path: '/gap-no-onboarding-checklist-workflow', label: 'Onboarding Workflow', icon: Zap },
  { path: '/gap-no-performance-review-module', label: 'Performance Review', icon: Zap },
  { path: '/gap-no-dei-metrics-dashboard', label: 'DEI Metrics', icon: Zap },
  { path: '/gap-no-external-jobboard-posting-linkedin-indeed', label: 'Job Board Posting', icon: Zap },
  { path: '/gap-no-notificationsemail-automation-routes', label: 'Email Automation', icon: Zap },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-gray-900">AI Recruiter</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
          {sidebarOpen && (
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Gap Features</p>
            </div>
          )}
          {gapNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fadeIn z-50">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4" />
                  Profile & Settings
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
