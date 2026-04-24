import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orgChartApi, employeesApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  Network,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  Loader,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

const OrgChart = () => {
  const navigate = useNavigate();
  const [charts, setCharts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chartsRes, employeesRes] = await Promise.all([
        orgChartApi.getAll(),
        employeesApi.getAll(),
      ]);
      setCharts(chartsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await orgChartApi.create(formData);
      const data = res.data;
      const chart = data.chart || data;
      setCharts([chart, ...charts]);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      // Show AI results if analysis was returned
      if (data.analysis) {
        setSelectedChart(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to create:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleOptimize = async (chart) => {
    setOptimizing(true);
    try {
      const res = await orgChartApi.optimize(chart.id);
      const updatedCharts = charts.map((c) =>
        c.id === chart.id ? res.data.chart : c
      );
      setCharts(updatedCharts);
      setSelectedChart(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to optimize:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Org Chart', 'Are you sure you want to delete this org chart?');
    if (!confirmed) return;
    try {
      await orgChartApi.delete(id);
      setCharts(charts.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const parseData = (chart, field) => {
    try {
      return JSON.parse(chart[field]);
    } catch {
      return null;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/hr')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Network className="w-8 h-8 text-cyan-600" />
              AI Org Chart Optimizer
            </h1>
            <p className="text-gray-500 mt-1">Analyze and optimize organizational structure</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Org Chart
        </button>
      </div>

      {/* Employee Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-cyan-50">
          <Users className="w-6 h-6 text-cyan-600 mb-2" />
          <p className="text-2xl font-bold">{employees.length}</p>
          <p className="text-sm text-gray-600">Total Employees</p>
        </div>
        <div className="card bg-blue-50">
          <Network className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{new Set(employees.map(e => e.department)).size}</p>
          <p className="text-sm text-gray-600">Departments</p>
        </div>
        <div className="card bg-purple-50">
          <Users className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{employees.filter(e => e.directReports?.length > 0).length}</p>
          <p className="text-sm text-gray-600">Managers</p>
        </div>
        <div className="card bg-green-50">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold">{charts.length}</p>
          <p className="text-sm text-gray-600">Org Charts</p>
        </div>
      </div>

      {/* Charts List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Organization Charts</h2>
        {charts.length === 0 ? (
          <div className="text-center py-12">
            <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No org charts yet. Create one from your employee data!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {charts.map((chart) => {
              const metrics = parseData(chart, 'metrics');
              return (
                <div
                  key={chart.id}
                  onClick={() => {
                    setSelectedChart(chart);
                    setShowDetailModal(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-cyan-100">
                        <Network className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{chart.name}</p>
                        <p className="text-sm text-gray-500">{chart.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {metrics && (
                        <div className="text-sm text-right">
                          <p><span className="text-gray-500">Employees:</span> {metrics.totalEmployees}</p>
                          <p><span className="text-gray-500">Layers:</span> {chart.layerCount || 'N/A'}</p>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptimize(chart);
                        }}
                        disabled={optimizing}
                        className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded text-sm hover:bg-cyan-200 flex items-center gap-1"
                      >
                        {optimizing ? <Loader className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Optimize
                      </button>
                      <span className={`px-2 py-1 rounded text-xs ${
                        chart.status === 'current' ? 'bg-green-100 text-green-700' :
                        chart.status === 'proposed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {chart.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(chart.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Org Chart</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Current Structure',
                      data: { name: 'Q1 2026 Organization Structure', description: 'Current organizational chart reflecting all departments and reporting lines as of Q1 2026' },
                    },
                    {
                      label: 'Engineering Dept',
                      data: { name: 'Engineering Department Structure', description: 'Detailed engineering team hierarchy including frontend, backend, DevOps, and QA teams' },
                    },
                    {
                      label: 'Post-Merger Plan',
                      data: { name: 'Post-Merger Reorganization Plan', description: 'Proposed organizational structure after the upcoming merger, focusing on eliminating redundancies and creating cross-functional teams' },
                    },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setFormData(sample.data)}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 rounded-full text-gray-700 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Chart Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Q1 2024 Org Structure"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Brief description of this org chart..."
                />
              </div>
              <p className="text-sm text-gray-500">
                This will create an org chart from your current employee data ({employees.length} employees).
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                  {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {creating ? 'Creating & Analyzing...' : 'Create & Optimize with AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedChart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedChart.chart?.name || selectedChart.name} - AI Analysis</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const chart = selectedChart.chart || selectedChart;
              const savedAI = parseData(chart, 'aiOptimizations');
              const savedMetrics = parseData(chart, 'metrics');
              // Handle both formats: full analysis object or legacy array of optimizations
              let analysis = selectedChart.analysis;
              if (!analysis && savedAI) {
                if (Array.isArray(savedAI)) {
                  // Old format: aiOptimizations was just the optimizations array
                  analysis = { optimizations: savedAI, currentMetrics: savedMetrics };
                } else {
                  // New format: aiOptimizations is the full analysis object
                  analysis = savedAI;
                }
              }
              const metrics = analysis?.currentMetrics || savedMetrics;
              const optimizations = analysis?.optimizations;

              if (!analysis && !metrics) {
                return (
                  <div className="text-center py-12">
                    <Network className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No AI analysis available yet. Click "Optimize" on this chart to generate insights.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Metrics Overview */}
                  {metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                        <p className="text-sm text-gray-600">Total Employees</p>
                        <p className="text-2xl font-bold text-cyan-600">{metrics.totalEmployees}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Total Managers</p>
                        <p className="text-2xl font-bold text-blue-600">{metrics.totalManagers}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Avg Span of Control</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {metrics.averageSpanOfControl?.toFixed(1) || chart.spanOfControl?.toFixed(1)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Hierarchy Levels</p>
                        <p className="text-2xl font-bold text-green-600">
                          {metrics.hierarchyLevels || chart.layerCount}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Health Score */}
                  {analysis?.healthScore !== undefined && (
                    <div className={`p-4 rounded-lg border ${
                      analysis.healthScore >= 80 ? 'bg-green-50 border-green-200' :
                      analysis.healthScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Organization Health Score</h3>
                          <p className="text-sm text-gray-600">Based on structure, span of control, and efficiency</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-4xl font-bold ${
                            analysis.healthScore >= 80 ? 'text-green-600' :
                            analysis.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {analysis.healthScore}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {analysis?.issues && analysis.issues.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Identified Issues
                      </h3>
                      <div className="space-y-3">
                        {analysis.issues.map((issue, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border ${
                            issue.severity === 'critical' ? 'bg-red-50 border-red-200' :
                            issue.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                            issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium capitalize">{issue.type?.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-600">{issue.description}</p>
                                {issue.location && (
                                  <p className="text-xs text-gray-500 mt-1">Location: {issue.location}</p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimizations */}
                  {optimizations && optimizations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-600" />
                        AI Optimization Recommendations
                      </h3>
                      <div className="space-y-3">
                        {optimizations.map((opt, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium">{opt.recommendation}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  opt.effort === 'low' ? 'bg-green-100 text-green-700' :
                                  opt.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {opt.effort} effort
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  Priority: {opt.priority}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 capitalize">Type: {opt.type?.replace('_', ' ')}</p>
                            {opt.benefits && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">Benefits:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {opt.benefits.map((b, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Gaps */}
                  {analysis?.skillGaps && analysis.skillGaps.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Skill Gaps</h3>
                      <div className="space-y-2">
                        {analysis.skillGaps.map((gap, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{gap.skill}</p>
                              <p className="text-sm text-gray-500">{gap.currentCoverage}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              gap.recommendation === 'hire' ? 'bg-blue-100 text-blue-700' :
                              gap.recommendation === 'train' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {gap.recommendation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {analysis?.summary && (
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-gray-700">{analysis.summary}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart;
