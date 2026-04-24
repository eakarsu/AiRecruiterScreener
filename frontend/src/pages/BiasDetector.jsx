import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { biasDetectorApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  Eye,
  X,
  Sparkles,
  FileText,
  Loader,
} from 'lucide-react';

const BiasDetector = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    targetType: 'job_description',
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await biasDetectorApi.getAll();
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await biasDetectorApi.analyze(formData);
      setReports([res.data.report, ...reports]);
      setShowModal(false);
      setFormData({ content: '', targetType: 'job_description' });
      setSelectedReport(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Report', 'Are you sure you want to delete this bias report?');
    if (!confirmed) return;
    try {
      await biasDetectorApi.delete(id);
      setReports(reports.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const getBiasLevel = (score) => {
    if (score <= 20) return { label: 'Low Bias', color: 'green', icon: CheckCircle };
    if (score <= 50) return { label: 'Moderate Bias', color: 'yellow', icon: AlertTriangle };
    return { label: 'High Bias', color: 'red', icon: AlertTriangle };
  };

  const parseAnalysis = (report) => {
    try {
      return JSON.parse(report.aiAnalysis);
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
              <Shield className="w-8 h-8 text-purple-600" />
              AI Bias Detector
            </h1>
            <p className="text-gray-500 mt-1">Detect and eliminate unconscious bias in your content</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Analyze Content
        </button>
      </div>

      {/* Reports List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Bias Analysis Reports</h2>
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bias reports yet. Analyze your first content!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const biasLevel = getBiasLevel(report.biasScore);
              const BiasIcon = biasLevel.icon;
              return (
                <div
                  key={report.id}
                  onClick={() => handleViewDetails(report)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-${biasLevel.color}-100`}>
                        <BiasIcon className={`w-5 h-5 text-${biasLevel.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{report.targetType.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {report.content.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold text-${biasLevel.color}-600`}>{report.biasScore}%</p>
                        <p className="text-sm text-gray-500">{biasLevel.label}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(report.id);
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
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Analyze Content for Bias
              </h2>
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
                      label: 'Biased Job Post',
                      data: {
                        targetType: 'job_description',
                        content: `We are looking for a young, energetic rockstar developer to join our tight-knit brotherhood of coders. The ideal candidate is a native English speaker who can hit the ground running. He should have a strong work ethic and be willing to work long hours. We need someone who is a culture fit for our team of guys. Must be able to handle the fast-paced, high-pressure environment. No job hoppers please - we want someone committed. Prefer candidates from top-tier universities only.`,
                      },
                    },
                    {
                      label: 'Candidate Review',
                      data: {
                        targetType: 'candidate_review',
                        content: `Sarah is a solid candidate but I'm concerned she might not be a good fit. She has kids and I worry about her commitment to the role given the travel requirements. She's articulate for someone from her background. While technically strong, she seems too soft-spoken for a leadership position. Her accent might be an issue for client-facing work. On the plus side, she's surprisingly technical for a woman in this field.`,
                      },
                    },
                    {
                      label: 'Performance Review',
                      data: {
                        targetType: 'performance_review',
                        content: `John has been a reliable team member this quarter. While his older colleagues struggle with new technology, John adapts quickly given his age. He could be more assertive - he's too agreeable which I attribute to his cultural background. His English has improved significantly this year. He should try to be less emotional in meetings and focus on being more rational. Compared to his female teammates, he handles pressure better.`,
                      },
                    },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, ...sample.data })}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 rounded-full text-gray-700 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Content Type</label>
                <select
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="input"
                >
                  <option value="job_description">Job Description</option>
                  <option value="candidate_review">Candidate Review</option>
                  <option value="performance_review">Performance Review</option>
                  <option value="email">Email Communication</option>
                </select>
              </div>
              <div>
                <label className="label">Content to Analyze</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="input"
                  placeholder="Paste the content you want to analyze for bias..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={analyzing} className="btn-primary flex items-center gap-2">
                  {analyzing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Bias Analysis Results</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const analysis = parseAnalysis(selectedReport);
              if (!analysis) return <p>No analysis data available</p>;

              const biasLevel = getBiasLevel(analysis.biasScore);

              return (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg bg-${biasLevel.color}-50 border border-${biasLevel.color}-200`}>
                      <p className="text-sm text-gray-600">Bias Score</p>
                      <p className={`text-3xl font-bold text-${biasLevel.color}-600`}>{analysis.biasScore}%</p>
                      <p className="text-sm text-gray-600">{biasLevel.label}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm text-gray-600">Inclusivity Score</p>
                      <p className="text-3xl font-bold text-green-600">{analysis.inclusivityScore}%</p>
                      <p className="text-sm text-gray-600">Higher is better</p>
                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Overall Assessment</h3>
                    <p className="text-gray-700">{analysis.overallAssessment}</p>
                  </div>

                  {/* Bias Types */}
                  {analysis.biasTypes && analysis.biasTypes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Detected Bias Types</h3>
                      <div className="space-y-3">
                        {analysis.biasTypes.map((bias, idx) => (
                          <div key={idx} className="p-4 border rounded-lg bg-yellow-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{bias.type} Bias</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                bias.severity === 'high' ? 'bg-red-100 text-red-700' :
                                bias.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {bias.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{bias.explanation}</p>
                            {bias.examples && (
                              <div className="text-sm">
                                <span className="font-medium">Examples: </span>
                                {bias.examples.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problematic Phrases */}
                  {analysis.problematicPhrases && analysis.problematicPhrases.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Suggested Improvements</h3>
                      <div className="space-y-3">
                        {analysis.problematicPhrases.map((phrase, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-600 line-through">{phrase.original}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-green-600 font-medium">{phrase.suggestion}</span>
                            </div>
                            <p className="text-sm text-gray-600">{phrase.issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{rec}</span>
                          </li>
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

export default BiasDetector;
