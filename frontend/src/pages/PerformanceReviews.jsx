import AutoAIExamples from '../components/AutoAIExamples';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceReviewsApi, employeesApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  X,
  Sparkles,
  Loader,
  Star,
  TrendingUp,
  Target,
  Award,
  CheckCircle,
} from 'lucide-react';

const PerformanceReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewPeriod: 'Q1 2024',
    reviewType: 'quarterly',
    performanceData: {
      projectsCompleted: '',
      goalsAchieved: '',
      keyAccomplishments: '',
      challenges: '',
      teamFeedback: '',
    },
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, employeesRes] = await Promise.all([
        performanceReviewsApi.getAll(),
        employeesApi.getAll(),
      ]);
      setReviews(reviewsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await performanceReviewsApi.generate({
        employeeId: formData.employeeId,
        reviewPeriod: formData.reviewPeriod,
        performanceData: formData.performanceData,
      });
      setReviews([res.data.review, ...reviews]);
      setShowModal(false);
      setSelectedReview(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Review', 'Are you sure you want to delete this performance review?');
    if (!confirmed) return;
    try {
      await performanceReviewsApi.delete(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'yellow';
    return 'red';
  };

  const parseJSON = (str) => {
    try {
      return JSON.parse(str);
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
              <FileText className="w-8 h-8 text-orange-600" />
              AI Performance Review Writer
            </h1>
            <p className="text-gray-500 mt-1">Generate balanced, constructive performance reviews</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Performance Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No performance reviews yet. Generate your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const ratingColor = getRatingColor(review.overallRating);
              return (
                <div
                  key={review.id}
                  onClick={() => {
                    setSelectedReview(review);
                    setShowDetailModal(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-${ratingColor}-100`}>
                        <Award className={`w-6 h-6 text-${ratingColor}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.employee?.firstName} {review.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {review.reviewPeriod} - {review.reviewType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= review.overallRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        review.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {review.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(review.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {review.aiSummary && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{review.aiSummary}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Generate Performance Review</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
          <AutoAIExamples />
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Strong Performer',
                      data: {
                        reviewPeriod: 'Q4 2025',
                        reviewType: 'quarterly',
                        performanceData: {
                          projectsCompleted: 'Led migration to microservices architecture, Delivered customer dashboard v2.0, Implemented CI/CD pipeline',
                          goalsAchieved: '5 out of 5 quarterly goals met',
                          keyAccomplishments: 'Reduced API response time by 40%, Mentored 2 junior developers, Presented at company tech talks',
                          challenges: 'Initial difficulty with cross-team coordination on the migration project, resolved through weekly sync meetings',
                          teamFeedback: 'Highly collaborative, always willing to help others. Great at explaining complex technical concepts.',
                        },
                      },
                    },
                    {
                      label: 'Needs Improvement',
                      data: {
                        reviewPeriod: 'Annual 2025',
                        reviewType: 'annual',
                        performanceData: {
                          projectsCompleted: 'Bug fixes on legacy system, Partially completed inventory module (behind schedule)',
                          goalsAchieved: '2 out of 5 annual goals met',
                          keyAccomplishments: 'Successfully resolved critical production outage in March',
                          challenges: 'Missed multiple deadlines on the inventory project, Difficulty communicating blockers early, Struggled with new testing framework',
                          teamFeedback: 'Good technical skills but needs to improve on communication and time management. Sometimes works in isolation.',
                        },
                      },
                    },
                    {
                      label: 'New Employee (90-day)',
                      data: {
                        reviewPeriod: '90-Day Probation',
                        reviewType: 'probation',
                        performanceData: {
                          projectsCompleted: 'Completed onboarding, Fixed 15 bugs, Contributed to sprint planning',
                          goalsAchieved: 'All probation goals on track',
                          keyAccomplishments: 'Ramped up quickly on codebase, Already contributing to code reviews, Built good relationships with team',
                          challenges: 'Still learning domain knowledge, Needs more exposure to deployment processes',
                          teamFeedback: 'Great attitude, asks good questions. Eager to learn and already adding value.',
                        },
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
                  <label className="label">Review Period</label>
                  <input
                    type="text"
                    value={formData.reviewPeriod}
                    onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                    className="input"
                    placeholder="e.g., Q1 2024, Annual 2024"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Review Type</label>
                <select
                  value={formData.reviewType}
                  onChange={(e) => setFormData({ ...formData, reviewType: e.target.value })}
                  className="input"
                >
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="probation">Probation</option>
                  <option value="project">Project-based</option>
                </select>
              </div>
              <div>
                <label className="label">Projects Completed</label>
                <textarea
                  value={formData.performanceData.projectsCompleted}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceData: { ...formData.performanceData, projectsCompleted: e.target.value }
                  })}
                  className="input"
                  rows={2}
                  placeholder="List major projects completed..."
                />
              </div>
              <div>
                <label className="label">Key Accomplishments</label>
                <textarea
                  value={formData.performanceData.keyAccomplishments}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceData: { ...formData.performanceData, keyAccomplishments: e.target.value }
                  })}
                  className="input"
                  rows={2}
                  placeholder="Notable achievements..."
                />
              </div>
              <div>
                <label className="label">Challenges Faced</label>
                <textarea
                  value={formData.performanceData.challenges}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceData: { ...formData.performanceData, challenges: e.target.value }
                  })}
                  className="input"
                  rows={2}
                  placeholder="Any challenges or areas for improvement..."
                />
              </div>
              <div>
                <label className="label">Team Feedback (Optional)</label>
                <textarea
                  value={formData.performanceData.teamFeedback}
                  onChange={(e) => setFormData({
                    ...formData,
                    performanceData: { ...formData.performanceData, teamFeedback: e.target.value }
                  })}
                  className="input"
                  rows={2}
                  placeholder="Feedback from team members..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={generating} className="btn-primary flex items-center gap-2">
                  {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? 'Generating...' : 'Generate Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Performance Review - {selectedReview.employee?.firstName} {selectedReview.employee?.lastName}
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const analysis = selectedReview.analysis || parseJSON(selectedReview.aiRecommendations);
              const achievements = parseJSON(selectedReview.achievements);
              const competencyScores = parseJSON(selectedReview.competencyScores);
              const goals = parseJSON(selectedReview.goals);
              const areasForImprovement = parseJSON(selectedReview.areasForImprovement);

              return (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-gray-600">Overall Rating</p>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= selectedReview.overallRating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-gray-600">Review Period</p>
                      <p className="text-xl font-bold text-blue-600">{selectedReview.reviewPeriod}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-xl font-bold text-green-600 capitalize">{selectedReview.status}</p>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  {selectedReview.aiSummary && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Executive Summary
                      </h3>
                      <p className="text-gray-700">{selectedReview.aiSummary}</p>
                    </div>
                  )}

                  {/* Competency Scores */}
                  {competencyScores && (
                    <div>
                      <h3 className="font-semibold mb-3">Competency Scores</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(competencyScores).map(([key, value]) => (
                          <div key={key} className="p-3 border rounded-lg">
                            <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    value.score >= 4 ? 'bg-green-500' :
                                    value.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(value.score / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{value.score}/5</span>
                            </div>
                            {value.comments && (
                              <p className="text-xs text-gray-500 mt-1">{value.comments}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {achievements && achievements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Key Achievements
                      </h3>
                      <div className="space-y-3">
                        {achievements.map((item, idx) => (
                          <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-medium text-green-800">{item.achievement}</p>
                            {item.impact && (
                              <p className="text-sm text-green-600 mt-1">Impact: {item.impact}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {areasForImprovement && areasForImprovement.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Development Areas
                      </h3>
                      <div className="space-y-3">
                        {areasForImprovement.map((item, idx) => (
                          <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-800">{item.area}</p>
                            {item.actionPlan && (
                              <p className="text-sm text-blue-600 mt-1">Action Plan: {item.actionPlan}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goals */}
                  {goals && goals.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Goals for Next Period
                      </h3>
                      <div className="space-y-3">
                        {goals.map((goal, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                              <div>
                                <p className="font-medium">{goal.goal}</p>
                                {goal.timeline && (
                                  <p className="text-sm text-gray-500 mt-1">Timeline: {goal.timeline}</p>
                                )}
                                {goal.metrics && (
                                  <p className="text-sm text-gray-500">Success Metrics: {goal.metrics}</p>
                                )}
                              </div>
                            </div>
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

export default PerformanceReviews;
