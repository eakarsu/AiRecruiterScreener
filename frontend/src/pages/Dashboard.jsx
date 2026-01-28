import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
  Target,
  UserPlus,
  Award,
} from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div
      onClick={onClick}
      className="card-hover flex items-start justify-between"
    >
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

const ActivityItem = ({ activity, onClick }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'candidate':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'interview':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'communication':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      new: 'badge-blue',
      screening: 'badge-yellow',
      interviewed: 'badge-purple',
      hired: 'badge-green',
      rejected: 'badge-red',
      scheduled: 'badge-blue',
      completed: 'badge-green',
      sent: 'badge-green',
      delivered: 'badge-green',
      read: 'badge-purple',
    };
    return statusColors[activity.status] || 'badge-gray';
  };

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="p-2 bg-gray-100 rounded-lg">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
      </div>
      <span className={getStatusBadge()}>{activity.status}</span>
    </div>
  );
};

const PipelineStage = ({ stage, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
  >
    <span className="text-sm font-medium text-gray-700 capitalize">{stage.status}</span>
    <span className="text-lg font-bold text-gray-900">{stage.count}</span>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pipelineRes, activityRes] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getPipelineOverview(),
        analyticsApi.getRecentActivity({ limit: 10 }),
      ]);
      setStats(statsRes.data);
      setPipeline(pipelineRes.data.pipeline);
      setActivities(activityRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'candidate':
        navigate(`/candidates/${activity.id}`);
        break;
      case 'interview':
        navigate(`/interviews/${activity.id}`);
        break;
      case 'communication':
        navigate('/communications');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your hiring pipeline.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Jobs"
          value={stats?.jobs?.active || 0}
          subtitle={`${stats?.jobs?.total || 0} total postings`}
          icon={Briefcase}
          color="blue"
          onClick={() => navigate('/jobs')}
        />
        <StatCard
          title="Total Candidates"
          value={stats?.candidates?.total || 0}
          subtitle={`${stats?.candidates?.new || 0} new this week`}
          icon={Users}
          color="green"
          onClick={() => navigate('/candidates')}
        />
        <StatCard
          title="Interviews Scheduled"
          value={stats?.interviews?.scheduled || 0}
          subtitle={`${stats?.interviews?.completed || 0} completed`}
          icon={Calendar}
          color="purple"
          onClick={() => navigate('/interviews')}
        />
        <StatCard
          title="Candidates Hired"
          value={stats?.candidates?.hired || 0}
          subtitle={`Avg score: ${stats?.candidates?.avgScore || 0}`}
          icon={Award}
          color="orange"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pipeline Overview</h2>
              <button
                onClick={() => navigate('/pipeline')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {pipeline.map((stage, index) => (
                <PipelineStage
                  key={index}
                  stage={stage}
                  onClick={() => navigate(`/candidates?status=${stage.status}`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => navigate('/analytics')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    activity={activity}
                    onClick={() => handleActivityClick(activity)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/jobs?action=new')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors text-left"
          >
            <Briefcase className="w-6 h-6 text-primary-600 mb-2" />
            <p className="font-medium text-gray-900">Post New Job</p>
            <p className="text-sm text-gray-500">Create a new job posting</p>
          </button>
          <button
            onClick={() => navigate('/candidates?action=new')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors text-left"
          >
            <UserPlus className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Add Candidate</p>
            <p className="text-sm text-gray-500">Manually add a candidate</p>
          </button>
          <button
            onClick={() => navigate('/interviews?action=new')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors text-left"
          >
            <Calendar className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Schedule Interview</p>
            <p className="text-sm text-gray-500">Book an interview slot</p>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors text-left"
          >
            <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">View Analytics</p>
            <p className="text-sm text-gray-500">Check hiring metrics</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
