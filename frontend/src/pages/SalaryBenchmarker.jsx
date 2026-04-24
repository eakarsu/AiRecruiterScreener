import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salaryBenchmarkApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  DollarSign,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  Loader,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from 'lucide-react';

const SalaryBenchmarker = () => {
  const navigate = useNavigate();
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBenchmark, setSelectedBenchmark] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    yearsExperience: 3,
    currentSalary: '',
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const res = await salaryBenchmarkApi.getAll();
      setBenchmarks(res.data);
    } catch (error) {
      console.error('Failed to fetch benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await salaryBenchmarkApi.analyze({
        ...formData,
        currentSalary: formData.currentSalary ? parseInt(formData.currentSalary) : null,
      });
      setBenchmarks([res.data.benchmark, ...benchmarks]);
      setShowModal(false);
      setSelectedBenchmark(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Benchmark', 'Are you sure you want to delete this salary benchmark?');
    if (!confirmed) return;
    try {
      await salaryBenchmarkApi.delete(id);
      setBenchmarks(benchmarks.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCompetitivenessInfo = (comp) => {
    if (comp === 'above_market') return { label: 'Above Market', color: 'green', icon: TrendingUp };
    if (comp === 'at_market') return { label: 'At Market', color: 'blue', icon: Minus };
    return { label: 'Below Market', color: 'red', icon: TrendingDown };
  };

  const parseAnalysis = (benchmark) => {
    try {
      return JSON.parse(benchmark.aiAnalysis);
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
              <DollarSign className="w-8 h-8 text-emerald-600" />
              AI Salary Benchmarker
            </h1>
            <p className="text-gray-500 mt-1">Benchmark salaries against market data</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Benchmark
        </button>
      </div>

      {/* Benchmarks List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Salary Benchmarks</h2>
        {benchmarks.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No salary benchmarks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {benchmarks.map((benchmark) => {
              const compInfo = benchmark.competitiveness ? getCompetitivenessInfo(benchmark.competitiveness) : null;
              const CompIcon = compInfo?.icon || Minus;
              return (
                <div
                  key={benchmark.id}
                  onClick={() => {
                    setSelectedBenchmark(benchmark);
                    setShowDetailModal(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-${compInfo?.color || 'gray'}-100`}>
                        <CompIcon className={`w-6 h-6 text-${compInfo?.color || 'gray'}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{benchmark.title}</p>
                        <p className="text-sm text-gray-500">
                          {benchmark.department} | {benchmark.location} | {benchmark.yearsExperience} years
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatSalary(benchmark.marketMedian)}</p>
                        <p className={`text-sm text-${compInfo?.color || 'gray'}-600`}>
                          {compInfo?.label || 'Analyzing...'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(benchmark.id);
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

      {/* Analysis Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Benchmark Salary</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Senior Engineer (SF)',
                      data: { title: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA', yearsExperience: 7, currentSalary: '165000' },
                    },
                    {
                      label: 'Marketing Manager (NYC)',
                      data: { title: 'Marketing Manager', department: 'Marketing', location: 'New York, NY', yearsExperience: 5, currentSalary: '110000' },
                    },
                    {
                      label: 'Data Analyst (Remote)',
                      data: { title: 'Data Analyst', department: 'Analytics', location: 'Remote', yearsExperience: 3, currentSalary: '85000' },
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
                <label className="label">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input"
                    placeholder="e.g., Engineering"
                    required
                  />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input"
                    placeholder="e.g., San Francisco, CA"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                    className="input"
                    min={0}
                    max={40}
                    required
                  />
                </div>
                <div>
                  <label className="label">Current Salary (Optional)</label>
                  <input
                    type="number"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                    className="input"
                    placeholder="e.g., 150000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={analyzing} className="btn-primary flex items-center gap-2">
                  {analyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Analyzing...' : 'Benchmark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBenchmark && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Salary Benchmark Analysis</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const analysis = parseAnalysis(selectedBenchmark);
              if (!analysis) return <p>No analysis data available</p>;

              return (
                <div className="space-y-6">
                  {/* Market Range */}
                  <div>
                    <h3 className="font-semibold mb-3">Market Salary Range</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">Min</span>
                        <span className="text-sm text-gray-500">Median</span>
                        <span className="text-sm text-gray-500">Max</span>
                      </div>
                      <div className="relative h-4 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full">
                        {selectedBenchmark.currentSalary && (
                          <div
                            className="absolute w-4 h-4 bg-primary-600 rounded-full border-2 border-white shadow-lg transform -translate-y-0"
                            style={{
                              left: `${Math.min(100, Math.max(0, ((selectedBenchmark.currentSalary - analysis.marketAnalysis.min) / (analysis.marketAnalysis.max - analysis.marketAnalysis.min)) * 100))}%`,
                            }}
                            title={`Current: ${formatSalary(selectedBenchmark.currentSalary)}`}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold">{formatSalary(analysis.marketAnalysis.min)}</span>
                        <span className="font-semibold text-lg">{formatSalary(analysis.marketAnalysis.median)}</span>
                        <span className="font-semibold">{formatSalary(analysis.marketAnalysis.max)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Range */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-gray-600">Recommended Min</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatSalary(analysis.recommendedRange?.min || analysis.marketAnalysis.min)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm text-gray-600">Target Salary</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatSalary(analysis.recommendedRange?.target || analysis.marketAnalysis.median)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-sm text-gray-600">Recommended Max</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatSalary(analysis.recommendedRange?.max || analysis.marketAnalysis.max)}
                      </p>
                    </div>
                  </div>

                  {/* Current Position */}
                  {analysis.currentPositioning && (
                    <div className={`p-4 rounded-lg border ${
                      analysis.currentPositioning.competitiveness === 'above_market' ? 'bg-green-50 border-green-200' :
                      analysis.currentPositioning.competitiveness === 'at_market' ? 'bg-blue-50 border-blue-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <h3 className="font-semibold mb-2">Current Position</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Percentile</p>
                          <p className="text-xl font-bold">{analysis.currentPositioning.percentile}th</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-xl font-bold capitalize">
                            {analysis.currentPositioning.competitiveness?.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gap from Median</p>
                          <p className="text-xl font-bold">{formatSalary(analysis.currentPositioning.gap)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Factors */}
                  {analysis.factors && analysis.factors.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Salary Factors</h3>
                      <div className="space-y-2">
                        {analysis.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${
                                factor.impact === 'positive' ? 'bg-green-500' :
                                factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                              <span className="capitalize font-medium">{factor.factor}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm ${
                                factor.impact === 'positive' ? 'text-green-600' :
                                factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {factor.adjustment}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trends */}
                  {analysis.trends && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-600" />
                        Market Trends
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Year-over-Year Change</p>
                          <p className="text-xl font-bold">{analysis.trends.yearOverYear}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Outlook</p>
                          <p className="text-xl font-bold capitalize">{analysis.trends.outlook}</p>
                        </div>
                      </div>
                      {analysis.trends.hotSkills && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Hot Skills (Premium Pay)</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.trends.hotSkills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700">{analysis.summary}</p>
                  </div>

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <p className="font-medium">{rec.action}</p>
                            <p className="text-sm text-gray-500">{rec.rationale}</p>
                            {rec.timing && (
                              <p className="text-xs text-primary-600 mt-1">Timing: {rec.timing}</p>
                            )}
                          </div>
                        ))}
                      </div>
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

export default SalaryBenchmarker;
