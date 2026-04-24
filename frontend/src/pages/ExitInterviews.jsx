import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exitInterviewsApi, employeesApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  LogOut,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  Loader,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  MessageSquare,
} from 'lucide-react';

const ExitInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    exitDate: '',
    reason: 'resignation',
    feedback: '',
    satisfactionScore: 5,
    wouldRecommend: true,
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [interviewsRes, employeesRes] = await Promise.all([
        exitInterviewsApi.getAll(),
        employeesApi.getAll(),
      ]);
      setInterviews(interviewsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await exitInterviewsApi.create(formData);
      const data = res.data;
      const interview = data.interview || data;
      setInterviews([interview, ...interviews]);
      setShowModal(false);
      setFormData({
        employeeId: '',
        exitDate: '',
        reason: 'resignation',
        feedback: '',
        satisfactionScore: 5,
        wouldRecommend: true,
      });
      // Show AI results if analysis was returned
      if (data.analysis) {
        setSelectedInterview(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to create:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async (interview) => {
    setAnalyzing(true);
    try {
      const res = await exitInterviewsApi.analyze(interview.id);
      const updatedInterviews = interviews.map((i) =>
        i.id === interview.id ? res.data.interview : i
      );
      setInterviews(updatedInterviews);
      setSelectedInterview(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Exit Interview', 'Are you sure you want to delete this exit interview?');
    if (!confirmed) return;
    try {
      await exitInterviewsApi.delete(id);
      setInterviews(interviews.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const parseAnalysis = (interview) => {
    try {
      return interview.analysis || {
        summary: interview.aiSummary,
        keyThemes: JSON.parse(interview.keyThemes || '[]'),
        actionableInsights: JSON.parse(interview.actionableInsights || '[]'),
        sentimentScore: interview.sentimentScore,
      };
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
              <LogOut className="w-8 h-8 text-slate-600" />
              AI Exit Interview Analyzer
            </h1>
            <p className="text-gray-500 mt-1">Extract actionable insights from exit interviews</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Exit Interview
        </button>
      </div>

      {/* Interviews List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Exit Interviews</h2>
        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <LogOut className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No exit interviews yet. Record your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => {
                  setSelectedInterview(interview);
                  setShowDetailModal(true);
                }}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      interview.status === 'analyzed' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <MessageSquare className={`w-6 h-6 ${
                        interview.status === 'analyzed' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {interview.employee?.firstName} {interview.employee?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {interview.employee?.department} | {interview.reason} |{' '}
                        {new Date(interview.exitDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      interview.status === 'analyzed' ? 'bg-green-100 text-green-700' :
                      interview.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {interview.status}
                    </span>
                    {interview.status !== 'analyzed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyze(interview);
                        }}
                        disabled={analyzing}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm hover:bg-primary-200 flex items-center gap-1"
                      >
                        {analyzing ? <Loader className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Analyze
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(interview.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Record Exit Interview</h2>
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
                      label: 'Career Growth',
                      data: {
                        exitDate: '2026-03-15',
                        reason: 'resignation',
                        satisfactionScore: 6,
                        wouldRecommend: true,
                        feedback: `I've enjoyed my time here and learned a lot, but I feel like I've hit a ceiling in terms of career growth. I applied for the senior position twice but was passed over both times without clear feedback on what I needed to improve. The new opportunity offers a leadership role that aligns with my career goals. I wish the promotion path here was more transparent. The team and culture are great, and I'd recommend this company to others, but for someone at my level, there needs to be clearer advancement opportunities.`,
                      },
                    },
                    {
                      label: 'Work-Life Balance',
                      data: {
                        exitDate: '2026-02-28',
                        reason: 'resignation',
                        satisfactionScore: 3,
                        wouldRecommend: false,
                        feedback: `The constant crunch periods and expectation to be available on weekends have taken a serious toll on my health and family life. When I joined 3 years ago, the work-life balance was reasonable, but after the restructuring last year, my workload doubled without additional support. I raised this with my manager multiple times but was told "that's just how it is right now." I'm burned out and need a change. The compensation doesn't justify the hours expected.`,
                      },
                    },
                    {
                      label: 'Management Issues',
                      data: {
                        exitDate: '2026-04-01',
                        reason: 'resignation',
                        satisfactionScore: 4,
                        wouldRecommend: false,
                        feedback: `My direct manager micromanages every aspect of my work, which has been extremely demoralizing. I've been in this industry for 10 years and I'm being treated like a junior. Decisions are made top-down without input from the team. Good ideas get shot down regularly. Several other team members feel the same way - 3 people have left in the last 6 months. The company itself has a great product and good benefits, but the management culture in my department needs serious attention.`,
                      },
                    },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, ...sample.data }))}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 rounded-full text-gray-700 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Exit Date</label>
                  <input
                    type="date"
                    value={formData.exitDate}
                    onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Reason for Leaving</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input"
                  >
                    <option value="resignation">Resignation</option>
                    <option value="termination">Termination</option>
                    <option value="retirement">Retirement</option>
                    <option value="layoff">Layoff</option>
                    <option value="relocation">Relocation</option>
                    <option value="career_change">Career Change</option>
                  </select>
                </div>
                <div>
                  <label className="label">Would Recommend Company?</label>
                  <select
                    value={formData.wouldRecommend}
                    onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.value === 'true' })}
                    className="input"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Satisfaction Score (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.satisfactionScore}
                  onChange={(e) => setFormData({ ...formData, satisfactionScore: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Very Dissatisfied</span>
                  <span className="font-bold text-lg text-primary-600">{formData.satisfactionScore}</span>
                  <span>Very Satisfied</span>
                </div>
              </div>
              <div>
                <label className="label">Feedback & Comments</label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows={6}
                  className="input"
                  placeholder="Record the employee's feedback, reasons for leaving, suggestions for improvement..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={analyzing} className="btn-primary flex items-center gap-2">
                  {analyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Saving & Analyzing...' : 'Save & Analyze with AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInterview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Exit Interview - {selectedInterview.interview?.employee?.firstName || selectedInterview.employee?.firstName}{' '}
                {selectedInterview.interview?.employee?.lastName || selectedInterview.employee?.lastName}
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const interview = selectedInterview.interview || selectedInterview;
              const analysis = selectedInterview.analysis || parseAnalysis(interview);

              return (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 border">
                      <p className="text-sm text-gray-600">Exit Date</p>
                      <p className="text-lg font-bold">{new Date(interview.exitDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border">
                      <p className="text-sm text-gray-600">Reason</p>
                      <p className="text-lg font-bold capitalize">{interview.reason?.replace('_', ' ')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border">
                      <p className="text-sm text-gray-600">Satisfaction</p>
                      <p className="text-lg font-bold">{interview.satisfactionScore}/10</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      interview.wouldRecommend ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <p className="text-sm text-gray-600">Would Recommend?</p>
                      <p className={`text-lg font-bold ${interview.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                        {interview.wouldRecommend ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Employee Feedback</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{interview.feedback}</p>
                  </div>

                  {/* AI Analysis */}
                  {analysis && (
                    <>
                      {/* Sentiment */}
                      {analysis.sentimentScore !== undefined && (
                        <div className={`p-4 rounded-lg border ${
                          analysis.sentimentScore >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            AI Sentiment Analysis
                          </h3>
                          <p className={`text-2xl font-bold ${
                            analysis.sentimentScore >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore}
                          </p>
                        </div>
                      )}

                      {/* Summary */}
                      {analysis.summary && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                          <h3 className="font-semibold mb-2">AI Summary</h3>
                          <p className="text-gray-700">{analysis.summary}</p>
                        </div>
                      )}

                      {/* Key Themes */}
                      {analysis.keyThemes && analysis.keyThemes.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Key Themes</h3>
                          <div className="space-y-3">
                            {analysis.keyThemes.map((theme, idx) => (
                              <div key={idx} className={`p-4 rounded-lg border ${
                                theme.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                                theme.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                                'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{theme.theme}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                    theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {theme.sentiment}
                                  </span>
                                </div>
                                {theme.quotes && theme.quotes.length > 0 && (
                                  <p className="text-sm text-gray-600 italic">"{theme.quotes[0]}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actionable Insights */}
                      {analysis.actionableInsights && analysis.actionableInsights.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Actionable Insights
                          </h3>
                          <div className="space-y-3">
                            {analysis.actionableInsights.map((insight, idx) => (
                              <div key={idx} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{insight.insight}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    insight.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                    insight.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {insight.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{insight.recommendedAction}</p>
                                <p className="text-xs text-gray-500 mt-1">Owner: {insight.owner}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Primary Reasons */}
                      {analysis.primaryReasons && analysis.primaryReasons.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3">Primary Reasons for Leaving</h3>
                          <div className="space-y-2">
                            {analysis.primaryReasons.map((reason, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <TrendingDown className={`w-5 h-5 ${
                                    reason.preventable ? 'text-red-500' : 'text-gray-500'
                                  }`} />
                                  <div>
                                    <p className="font-medium">{reason.reason}</p>
                                    <p className="text-sm text-gray-500 capitalize">{reason.category}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {reason.preventable && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                      Preventable
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    reason.severity === 'high' ? 'bg-red-100 text-red-700' :
                                    reason.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {reason.severity}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
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

export default ExitInterviews;
