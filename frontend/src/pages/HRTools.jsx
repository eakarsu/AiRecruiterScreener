import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Brain,
  Heart,
  FileText,
  DollarSign,
  LogOut,
  Calendar,
  Network,
  Target,
  Sparkles,
  Users,
} from 'lucide-react';

const tools = [
  {
    id: 'bias-detector',
    name: 'AI Bias Detector',
    description: 'Detect and eliminate unconscious bias in job descriptions, reviews, and communications',
    icon: Shield,
    color: 'purple',
    path: '/hr/bias-detector',
  },
  {
    id: 'job-description-writer',
    name: 'AI Job Description Writer',
    description: 'Generate inclusive, compelling job descriptions that attract diverse talent',
    icon: FileText,
    color: 'blue',
    path: '/hr/job-description-writer',
  },
  {
    id: 'skills-assessor',
    name: 'AI Skills Assessor',
    description: 'Evaluate candidate skills objectively and identify skill gaps',
    icon: Target,
    color: 'green',
  path: '/hr/skills-assessor',
  },
  {
    id: 'sentiment-analyzer',
    name: 'AI Employee Sentiment Analyzer',
    description: 'Analyze employee feedback to understand workplace sentiment and satisfaction',
    icon: Brain,
    color: 'pink',
    path: '/hr/sentiment-analyzer',
  },
  {
    id: 'culture-fit',
    name: 'AI Culture Fit Scorer',
    description: 'Assess candidate cultural alignment while promoting diversity and inclusion',
    icon: Heart,
    color: 'red',
    path: '/hr/culture-fit',
  },
  {
    id: 'performance-review',
    name: 'AI Performance Review Writer',
    description: 'Generate balanced, constructive performance reviews with actionable feedback',
    icon: FileText,
    color: 'orange',
    path: '/hr/performance-reviews',
  },
  {
    id: 'salary-benchmarker',
    name: 'AI Salary Benchmarker',
    description: 'Benchmark salaries against market data to ensure competitive compensation',
    icon: DollarSign,
    color: 'emerald',
    path: '/hr/salary-benchmarker',
  },
  {
    id: 'exit-interview',
    name: 'AI Exit Interview Analyzer',
    description: 'Extract actionable insights from exit interviews to improve retention',
    icon: LogOut,
    color: 'slate',
    path: '/hr/exit-interviews',
  },
  {
    id: 'interview-scheduler',
    name: 'AI Interview Scheduler',
    description: 'Optimize interview scheduling with AI-powered recommendations',
    icon: Calendar,
    color: 'indigo',
    path: '/hr/interview-scheduler',
  },
  {
    id: 'org-chart',
    name: 'AI Org Chart Optimizer',
    description: 'Analyze and optimize organizational structure for efficiency',
    icon: Network,
    color: 'cyan',
    path: '/hr/org-chart',
  },
  {
    id: 'offer-letter',
    name: 'AI Offer Letter Generator',
    description: 'Draft professional offer letters from compensation, equity, and start details',
    icon: FileText,
    color: 'blue',
    path: '/hr/offer-letter',
  },
  {
    id: 'dei-metrics',
    name: 'AI DEI Metrics Aggregator',
    description: 'Aggregate workforce and hiring funnel data into privacy-aware DEI signals and actions',
    icon: Users,
    color: 'emerald',
    path: '/hr/dei-metrics',
  },
];

const colorClasses = {
  purple: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-50',
  blue: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-50',
  green: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-50',
  pink: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-50',
  red: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-50',
  orange: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-50',
  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-50',
  slate: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-50',
  indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-50',
  cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200 hover:bg-cyan-50',
};

const iconBgClasses = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  pink: 'bg-pink-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  slate: 'bg-slate-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
};

const ToolCard = ({ tool, onClick }) => {
  const Icon = tool.icon;

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${colorClasses[tool.color]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${iconBgClasses[tool.color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{tool.name}</h3>
          <p className="text-sm text-gray-600">{tool.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span className="text-sm font-medium flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          AI Powered
        </span>
      </div>
    </div>
  );
};

const HRTools = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            HR AI Tools
          </h1>
          <p className="text-gray-500 mt-1">
            Powerful AI-driven tools to streamline HR operations and make data-driven decisions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">10</p>
              <p className="text-sm text-gray-600">AI Tools Available</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">AI</p>
              <p className="text-sm text-gray-600">Powered by Claude</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-600">Objective Analysis</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Real-time</p>
              <p className="text-sm text-gray-600">Instant Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => navigate(tool.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default HRTools;
