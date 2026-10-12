import AutoAIExamples from '../components/AutoAIExamples';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sentimentApi, employeesApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  Brain,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  Loader,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Heart,
  Frown,
  Smile,
  Meh,
} from 'lucide-react';

const SentimentAnalyzer = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    content: '',
    source: 'feedback',
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analysesRes, employeesRes] = await Promise.all([
        sentimentApi.getAll(),
        employeesApi.getAll(),
      ]);
      setAnalyses(analysesRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await sentimentApi.analyze(formData);
      setAnalyses([res.data.record, ...analyses]);
      setShowModal(false);
      setFormData({ employeeId: '', content: '', source: 'feedback' });
      setSelectedAnalysis(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Analysis', 'Are you sure you want to delete this sentiment analysis?');
    if (!confirmed) return;
    try {
      await sentimentApi.delete(id);
      setAnalyses(analyses.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getSentimentInfo = (score) => {
    if (score >= 50) return { label: 'Positive', color: 'green', icon: Smile };
    if (score >= -20) return { label: 'Neutral', color: 'yellow', icon: Meh };
    return { label: 'Negative', color: 'red', icon: Frown };
  };

  const parseAnalysis = (record) => {
    try {
      return JSON.parse(record.aiAnalysis);
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
              <Brain className="w-8 h-8 text-pink-600" />
              AI Employee Sentiment Analyzer
            </h1>
            <p className="text-gray-500 mt-1">Understand employee feelings and workplace satisfaction</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Analyze Feedback
        </button>
      </div>

      {/* Analyses List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Sentiment Analysis History</h2>
        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No sentiment analyses yet. Analyze your first feedback!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => {
              const sentiment = getSentimentInfo(analysis.sentimentScore);
              const SentimentIcon = sentiment.icon;
              return (
                <div
                  key={analysis.id}
                  onClick={() => {
                    setSelectedAnalysis(analysis);
                    setShowDetailModal(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <SentimentIcon className={`w-8 h-8 text-${sentiment.color}-500`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {analysis.employee?.firstName} {analysis.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">Source: {analysis.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold text-${sentiment.color}-600`}>
                          {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore}
                        </p>
                        <p className="text-sm text-gray-500">{sentiment.label}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(analysis.id);
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Analyze Employee Feedback</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAnalyze} className="space-y-4">
          <AutoAIExamples />
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Positive Feedback',
                      data: {
                        source: 'survey',
                        content: `I really enjoy working here. The team is incredibly supportive and my manager always makes time for 1-on-1s. I feel valued and heard. The recent flexible work policy has been amazing for my work-life balance. I'm excited about the new projects coming up and feel like I'm growing professionally. The company culture is exactly what I was looking for. I'd definitely recommend this company to friends.`,
                      },
                    },
                    {
                      label: 'Negative Feedback',
                      data: {
                        source: 'feedback',
                        content: `I'm feeling increasingly frustrated with the lack of career growth opportunities. My workload has doubled since the layoffs but my compensation hasn't changed. Management seems disconnected from what's happening on the ground. The constant reorganizations are exhausting and I never know who my manager will be next month. I've raised these concerns multiple times but nothing changes. I'm starting to look at other options.`,
                      },
                    },
                    {
                      label: 'Mixed Feedback',
                      data: {
                        source: 'review',
                        content: `The work itself is interesting and challenging, which I appreciate. However, the communication between departments is terrible. I love my immediate team but cross-functional collaboration is a nightmare. Benefits are great, especially the health insurance. But the promotion process feels completely opaque - I have no idea what I need to do to advance. Training opportunities are good but there's never enough time to actually use them because of deadline pressure.`,
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
                      {emp.firstName} {emp.lastName} - {emp.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Source Type</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input"
                >
                  <option value="feedback">General Feedback</option>
                  <option value="survey">Survey Response</option>
                  <option value="review">Performance Review</option>
                  <option value="chat">Chat/Message</option>
                </select>
              </div>
              <div>
                <label className="label">Feedback Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="input"
                  placeholder="Paste the employee feedback to analyze..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={analyzing} className="btn-primary flex items-center gap-2">
                  {analyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Sentiment Analysis Results</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const analysis = parseAnalysis(selectedAnalysis);
              if (!analysis) return <p>No analysis data available</p>;

              const sentiment = getSentimentInfo(analysis.sentimentScore);

              return (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg bg-${sentiment.color}-50 border border-${sentiment.color}-200`}>
                      <p className="text-sm text-gray-600">Sentiment Score</p>
                      <p className={`text-3xl font-bold text-${sentiment.color}-600`}>
                        {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore}
                      </p>
                      <p className="text-sm text-gray-600">{analysis.sentimentLabel?.replace('_', ' ')}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      analysis.urgency === 'critical' ? 'bg-red-50 border-red-200' :
                      analysis.urgency === 'high' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    } border`}>
                      <p className="text-sm text-gray-600">Urgency Level</p>
                      <p className="text-3xl font-bold capitalize text-gray-900">{analysis.urgency}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-gray-600">Themes Detected</p>
                      <p className="text-3xl font-bold text-blue-600">{analysis.themes?.length || 0}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700">{analysis.summary}</p>
                  </div>

                  {/* Emotions */}
                  {analysis.emotions && analysis.emotions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Detected Emotions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {analysis.emotions.map((emotion, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <p className="font-medium capitalize">{emotion.emotion}</p>
                            <div className="mt-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${emotion.intensity}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{emotion.intensity}% intensity</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Themes */}
                  {analysis.themes && analysis.themes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Key Themes</h3>
                      <div className="space-y-3">
                        {analysis.themes.map((theme, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border ${
                            theme.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                            theme.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{theme.theme.replace('_', ' ')}</span>
                              <span className={`px-2 py-1 rounded text-xs capitalize ${
                                theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {theme.sentiment}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{theme.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {analysis.actionItems && analysis.actionItems.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommended Actions</h3>
                      <div className="space-y-2">
                        {analysis.actionItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle className={`w-5 h-5 ${
                                item.priority === 'high' ? 'text-red-500' :
                                item.priority === 'medium' ? 'text-yellow-500' :
                                'text-green-500'
                              }`} />
                              <span>{item.action}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{item.owner}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        Risk Factors
                      </h3>
                      <ul className="space-y-1">
                        {analysis.riskFactors.map((risk, idx) => (
                          <li key={idx} className="text-sm text-red-600">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Positive Highlights */}
                  {analysis.positiveHighlights && analysis.positiveHighlights.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                        <Heart className="w-5 h-5" />
                        Positive Highlights
                      </h3>
                      <ul className="space-y-1">
                        {analysis.positiveHighlights.map((highlight, idx) => (
                          <li key={idx} className="text-sm text-green-600">• {highlight}</li>
                        ))}
                      </ul>
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

export default SentimentAnalyzer;
