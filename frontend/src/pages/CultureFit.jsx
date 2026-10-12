import { listPayload } from '../utils/listPayload';
import AutoAIExamples from '../components/AutoAIExamples';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cultureFitApi, candidatesApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  Heart,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  Loader,
  CheckCircle,
  Users,
  Target,
} from 'lucide-react';

const CultureFit = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [formData, setFormData] = useState({
    candidateId: '',
    companyValues: {
      innovation: true,
      collaboration: true,
      integrity: true,
      excellence: true,
      customerFocus: true,
    },
    workStyle: 'hybrid',
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scoresRes, candidatesRes] = await Promise.all([
        cultureFitApi.getAll(),
        candidatesApi.getAll(),
      ]);
      setScores(listPayload(scoresRes.data));
      setCandidates(listPayload(candidatesRes.data));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async (e) => {
    e.preventDefault();
    setScoring(true);
    try {
      const candidate = candidates.find(c => c.id === formData.candidateId);
      const res = await cultureFitApi.score({
        candidateId: formData.candidateId,
        candidateInfo: {
          name: `${candidate.firstName} ${candidate.lastName}`,
          currentTitle: candidate.currentTitle,
          yearsExperience: candidate.yearsExperience,
          skills: candidate.skills ? JSON.parse(candidate.skills) : [],
          resumeSummary: candidate.aiSummary,
        },
        companyValues: formData.companyValues,
        teamDynamics: { workStyle: formData.workStyle },
      });
      setScores([res.data.score, ...scores]);
      setShowModal(false);
      setSelectedScore(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to score:', error);
    } finally {
      setScoring(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Score', 'Are you sure you want to delete this culture fit score?');
    if (!confirmed) return;
    try {
      await cultureFitApi.delete(id);
      setScores(scores.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getRecommendationInfo = (rec) => {
    const map = {
      strong_fit: { label: 'Strong Fit', color: 'green' },
      good_fit: { label: 'Good Fit', color: 'blue' },
      moderate_fit: { label: 'Moderate Fit', color: 'yellow' },
      poor_fit: { label: 'Poor Fit', color: 'red' },
    };
    return map[rec] || { label: rec, color: 'gray' };
  };

  const parseAnalysis = (score) => {
    try {
      return JSON.parse(score.aiAnalysis);
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
              <Heart className="w-8 h-8 text-red-600" />
              AI Culture Fit Scorer
            </h1>
            <p className="text-gray-500 mt-1">Assess candidate cultural alignment objectively</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Score Candidate
        </button>
      </div>

      {/* Scores List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Culture Fit Scores</h2>
        {scores.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No culture fit scores yet. Score your first candidate!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((score) => {
              const scoreColor = getScoreColor(score.overallScore);
              const recInfo = getRecommendationInfo(score.recommendation);
              return (
                <div
                  key={score.id}
                  onClick={() => {
                    setSelectedScore(score);
                    setShowDetailModal(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-${scoreColor}-100 flex items-center justify-center`}>
                        <span className={`text-lg font-bold text-${scoreColor}-600`}>{score.overallScore}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {score.candidate?.firstName} {score.candidate?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {score.candidate?.currentTitle || 'Candidate'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${recInfo.color}-100 text-${recInfo.color}-700`}>
                        {recInfo.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(score.id);
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

      {/* Score Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Score Culture Fit</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScore} className="space-y-4">
          <AutoAIExamples />
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Innovation Focus',
                      data: {
                        companyValues: { innovation: true, collaboration: true, integrity: false, excellence: true, customerFocus: false },
                        workStyle: 'remote',
                      },
                    },
                    {
                      label: 'Team-Oriented',
                      data: {
                        companyValues: { innovation: false, collaboration: true, integrity: true, excellence: false, customerFocus: true },
                        workStyle: 'onsite',
                      },
                    },
                    {
                      label: 'All Values / Hybrid',
                      data: {
                        companyValues: { innovation: true, collaboration: true, integrity: true, excellence: true, customerFocus: true },
                        workStyle: 'hybrid',
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
                <label className="label">Candidate</label>
                <select
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} - {c.currentTitle || 'Candidate'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Company Values (Select applicable)</label>
                <div className="space-y-2">
                  {Object.entries(formData.companyValues).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          companyValues: { ...formData.companyValues, [key]: e.target.checked }
                        })}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Work Style</label>
                <select
                  value={formData.workStyle}
                  onChange={(e) => setFormData({ ...formData, workStyle: e.target.value })}
                  className="input"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={scoring} className="btn-primary flex items-center gap-2">
                  {scoring ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {scoring ? 'Scoring...' : 'Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedScore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Culture Fit Analysis</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const score = selectedScore.score || selectedScore;
              const analysis = selectedScore.analysis || parseAnalysis(score);

              if (!analysis) return <p>No analysis data available</p>;

              const scoreColor = getScoreColor(analysis.overallScore);
              const recInfo = getRecommendationInfo(analysis.recommendation);

              return (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="flex items-center justify-center gap-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                    <div className={`w-24 h-24 rounded-full bg-${scoreColor}-100 flex items-center justify-center border-4 border-${scoreColor}-300`}>
                      <span className={`text-3xl font-bold text-${scoreColor}-600`}>{analysis.overallScore}</span>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold text-${recInfo.color}-600`}>{recInfo.label}</p>
                      <p className="text-gray-500">Overall Culture Fit Score</p>
                    </div>
                  </div>

                  {/* Dimensions */}
                  {analysis.dimensions && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary-600" />
                        Dimension Scores
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(analysis.dimensions).map(([key, value]) => (
                          <div key={key} className="p-4 border rounded-lg">
                            <p className="text-sm text-gray-600 capitalize mb-2">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    value.score >= 80 ? 'bg-green-500' :
                                    value.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${value.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{value.score}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{value.assessment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        Cultural Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-green-600">
                            <span>•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Challenges */}
                  {analysis.potentialChallenges && analysis.potentialChallenges.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold mb-3 text-yellow-700">Potential Challenges</h3>
                      <ul className="space-y-2">
                        {analysis.potentialChallenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-yellow-600">
                            <span>•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Onboarding Recommendations */}
                  {analysis.onboardingRecommendations && analysis.onboardingRecommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Onboarding Recommendations
                      </h3>
                      <div className="space-y-2">
                        {analysis.onboardingRecommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 border rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {analysis.summary && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
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

export default CultureFit;
