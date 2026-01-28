import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const FunnelChart = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((stage, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 capitalize">{stage.status}</span>
            <span className="text-sm text-gray-500">{stage.count}</span>
          </div>
          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg transition-all duration-500"
              style={{ width: `${(stage.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const SourceChart = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="space-y-4">
      {data.map((source, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-24 text-sm text-gray-600 capitalize">{source.source}</div>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
              style={{ width: `${(source.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-20 text-right">
            <span className="text-sm font-medium">{source.count}</span>
            <span className="text-xs text-gray-500 ml-1">({source.avgScore})</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [sources, setSources] = useState([]);
  const [timeToHire, setTimeToHire] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, funnelRes, sourcesRes, timeRes, activityRes] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getHiringFunnel(),
        analyticsApi.getSourceAnalytics(),
        analyticsApi.getTimeToHire(),
        analyticsApi.getRecentActivity({ limit: 10 }),
      ]);
      setStats(statsRes.data);
      setFunnel(funnelRes.data);
      setSources(sourcesRes.data);
      setTimeToHire(timeRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your hiring performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={stats?.candidates?.total || 0}
          change={12}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Jobs"
          value={stats?.jobs?.active || 0}
          change={5}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Interviews This Month"
          value={(stats?.interviews?.scheduled || 0) + (stats?.interviews?.completed || 0)}
          change={-3}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Avg Time to Hire"
          value={`${timeToHire?.avgDaysToHire || 0} days`}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiring Funnel</h2>
          <FunnelChart data={funnel} />
        </div>

        {/* Source Analytics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Sources</h2>
          {sources.length > 0 ? (
            <SourceChart data={sources} />
          ) : (
            <p className="text-gray-500 text-center py-8">No source data available</p>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Rates */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Application → Screening</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-3/4 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Screening → Interview</span>
                <span className="text-sm font-medium">60%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-3/5 bg-green-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Interview → Offer</span>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-2/5 bg-purple-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Offer → Hired</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full w-[85%] bg-orange-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Applications</span>
              <span className="font-semibold">{stats?.candidates?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Hires</span>
              <span className="font-semibold">{stats?.candidates?.hired || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg AI Score</span>
              <span className="font-semibold">{stats?.candidates?.avgScore || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Interviews Completed</span>
              <span className="font-semibold">{stats?.interviews?.completed || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.slice(0, 8).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'candidate' ? 'bg-green-500' :
                  activity.type === 'interview' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
