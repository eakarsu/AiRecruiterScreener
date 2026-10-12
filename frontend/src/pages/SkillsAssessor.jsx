import { listPayload } from '../utils/listPayload';

import FullAIExamples, { useFullAIExamples } from "../components/FullAIExamples.jsx";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillsAssessorApi, candidatesApi } from '../services/api';
import {
  Target,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
  Loader,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Trash2,
  Eye,
} from 'lucide-react';

const SkillsAssessor = () => {
  const fullAIExamples = useFullAIExamples();

  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [assessing, setAssessing] = useState(false);
  const [savedAssessments, setSavedAssessments] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [formData, setFormData] = useState({
    candidateId: '',
    requiredSkills: '',
  });

  useEffect(() => {
    fetchCandidates();
    fetchSavedAssessments();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await candidatesApi.getAll();
      setCandidates(listPayload(res.data));
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAssessments = async () => {
    try {
      const res = await skillsAssessorApi.getAll();
      setSavedAssessments(listPayload(res.data));
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleAssess = async (e) => {
    e.preventDefault();
    setAssessing(true);
    try {
      const skills = formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
      const res = await skillsAssessorApi.assess({
        candidateId: formData.candidateId,
        requiredSkills: skills,
      });
      setAssessmentResult(res.data);
      setShowModal(false);
      setShowResultModal(true);
      // Refresh saved assessments
      if (res.data.assessment) {
        setSavedAssessments(prev => [{ ...res.data.assessment, candidate: res.data.candidate }, ...prev]);
      }
    } catch (error) {
      console.error('Failed to assess:', error);
    } finally {
      setAssessing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await skillsAssessorApi.delete(id);
      setSavedAssessments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const viewSavedAssessment = (assessment) => {
    let analysis = null;
    try {
      analysis = typeof assessment.aiAnalysis === 'string'
        ? JSON.parse(assessment.aiAnalysis)
        : assessment.aiAnalysis;
    } catch { /* ignore */ }

    setAssessmentResult({
      candidate: assessment.candidate,
      analysis,
    });
    setShowResultModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'expert': return { icon: CheckCircle, color: 'green' };
      case 'advanced': return { icon: CheckCircle, color: 'blue' };
      case 'intermediate': return { icon: HelpCircle, color: 'yellow' };
      case 'beginner': return { icon: AlertTriangle, color: 'orange' };
      default: return { icon: AlertTriangle, color: 'red' };
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
              <Target className="w-8 h-8 text-green-600" />
              AI Skills Assessor
            </h1>
            <p className="text-gray-500 mt-1">Evaluate candidate skills objectively</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Assess Candidate
        </button>
      </div>

      {/* Instructions */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50">
        <h2 className="text-lg font-semibold mb-3">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-medium">Select Candidate</p>
              <p className="text-sm text-gray-600">Choose a candidate from your pipeline</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-medium">Define Skills</p>
              <p className="text-sm text-gray-600">List required skills for the role</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-medium">Get Assessment</p>
              <p className="text-sm text-gray-600">AI analyzes skills match and gaps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Assessments */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Saved Assessments ({savedAssessments.length})</h2>
        {loadingSaved ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : savedAssessments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No assessments yet. Click "Assess Candidate" to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-gray-500">Candidate</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Assessment</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Score</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedAssessments.map((assessment) => {
                  const scoreColor = getScoreColor(assessment.score || 0);
                  return (
                    <tr
                      key={assessment.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => viewSavedAssessment(assessment)}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-primary-600">
                              {assessment.candidate?.firstName?.[0]}{assessment.candidate?.lastName?.[0]}
                            </span>
                          </div>
                          <span className="font-medium">
                            {assessment.candidate?.firstName} {assessment.candidate?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{assessment.name}</td>
                      <td className="py-3">
                        <span className={`font-bold text-${scoreColor}-600`}>
                          {assessment.score || 0}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          assessment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {assessment.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); viewSavedAssessment(assessment); }}
                            className="p-1 hover:bg-blue-50 rounded text-blue-600"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(assessment.id); }}
                            className="p-1 hover:bg-red-50 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidates for Quick Assessment */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.slice(0, 6).map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => {
                setFormData({ ...formData, candidateId: candidate.id });
                setShowModal(true);
              }}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-primary-600">
                    {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                  <p className="text-sm text-gray-500">{candidate.currentTitle || 'Candidate'}</p>
                </div>
              </div>
              {candidate.aiScore && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-500">AI Score:</span>
                  <span className={`font-semibold text-${getScoreColor(candidate.aiScore)}-600`}>
                    {candidate.aiScore}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Assess Candidate Skills</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssess} className="space-y-4" data-full-ai-workspace="SkillsAssessor"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} />
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Frontend Developer',
                      data: { requiredSkills: 'JavaScript, React, TypeScript, CSS, HTML, Redux, REST APIs, Git, Responsive Design, Testing' },
                    },
                    {
                      label: 'Backend Developer',
                      data: { requiredSkills: 'Node.js, Python, SQL, PostgreSQL, MongoDB, Docker, AWS, REST APIs, GraphQL, Redis' },
                    },
                    {
                      label: 'Full Stack Engineer',
                      data: { requiredSkills: 'JavaScript, React, Node.js, TypeScript, PostgreSQL, Docker, AWS, CI/CD, System Design, Agile' },
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
                  required data-full-ai-field={fullAIExamples.bind({ current: formData.candidateId, change: (e) => setFormData({ ...formData, candidateId: e.target.value }), label: "formData.candidateId", manual: false, json: false, sample: '' }, "p1-14296", undefined)}
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
                <label className="label">Required Skills (comma-separated)</label>
                <textarea
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="e.g., JavaScript, React, Node.js, SQL, AWS"
                  required data-full-ai-field={fullAIExamples.bind({ current: formData.requiredSkills, change: (e) => setFormData({ ...formData, requiredSkills: e.target.value }), label: "formData.requiredSkills", manual: false, json: false, sample: '' }, "p1-14984", undefined)}
                />
                <p className="text-xs text-gray-500 mt-1">Enter skills separated by commas</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={assessing} className="btn-primary flex items-center gap-2">
                  {assessing ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {assessing ? 'Assessing & Saving...' : 'Assess & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && assessmentResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Skills Assessment - {assessmentResult.candidate?.firstName} {assessmentResult.candidate?.lastName}
              </h2>
              <button onClick={() => setShowResultModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const analysis = assessmentResult.analysis;
              if (!analysis) return <p className="text-gray-500">No analysis data available</p>;

              const scoreColor = getScoreColor(analysis.overallScore);

              return (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="flex items-center justify-center gap-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className={`w-24 h-24 rounded-full bg-${scoreColor}-100 flex items-center justify-center border-4 border-${scoreColor}-300`}>
                      <span className={`text-3xl font-bold text-${scoreColor}-600`}>{analysis.overallScore}</span>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold capitalize`}>{analysis.skillsMatch?.replace('_', ' ')}</p>
                      <p className="text-gray-500">Skills Match</p>
                      <p className={`mt-2 px-3 py-1 rounded-full text-sm inline-block ${
                        analysis.recommendation === 'strong_hire' ? 'bg-green-100 text-green-700' :
                        analysis.recommendation === 'hire' ? 'bg-blue-100 text-blue-700' :
                        analysis.recommendation === 'conditional_hire' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {analysis.recommendation?.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Skill Assessments */}
                  {analysis.skillAssessments && analysis.skillAssessments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Skill-by-Skill Assessment</h3>
                      <div className="space-y-3">
                        {analysis.skillAssessments.map((skill, idx) => {
                          const levelInfo = getLevelIcon(skill.candidateLevel);
                          const LevelIcon = levelInfo.icon;
                          return (
                            <div key={idx} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <LevelIcon className={`w-5 h-5 text-${levelInfo.color}-500`} />
                                  <span className="font-medium">{skill.skill}</span>
                                  {skill.required && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Required</span>
                                  )}
                                </div>
                                <span className={`font-bold text-${getScoreColor(skill.score)}-600`}>
                                  {skill.score}/100
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500">
                                  Level: <span className="capitalize font-medium">{skill.candidateLevel}</span>
                                </span>
                                <span className="text-gray-500">
                                  Required: <span className="capitalize font-medium">{skill.requiredLevel}</span>
                                </span>
                              </div>
                              {skill.gap && (
                                <p className="text-sm text-orange-600 mt-1">{skill.gap}</p>
                              )}
                              {skill.evidence && skill.evidence.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Evidence: {skill.evidence.join(', ')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Technical Depth & Learning Agility */}
                  <div className="grid grid-cols-2 gap-4">
                    {analysis.technicalDepth && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-2">Technical Depth</h4>
                        <p className="text-2xl font-bold text-blue-600">{analysis.technicalDepth.score}/100</p>
                        <p className="text-sm text-gray-600 mt-1">{analysis.technicalDepth.assessment}</p>
                      </div>
                    )}
                    {analysis.learningAgility && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold mb-2">Learning Agility</h4>
                        <p className="text-2xl font-bold text-purple-600">{analysis.learningAgility.score}/100</p>
                        <p className="text-sm text-gray-600 mt-1">{analysis.learningAgility.assessment}</p>
                      </div>
                    )}
                  </div>

                  {/* Skill Gaps */}
                  {analysis.skillGaps && analysis.skillGaps.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="w-5 h-5" />
                        Skill Gaps
                      </h3>
                      <div className="space-y-3">
                        {analysis.skillGaps.map((gap, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{gap.skill}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                gap.importance === 'critical' ? 'bg-red-100 text-red-700' :
                                gap.importance === 'important' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {gap.importance}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Training time: {gap.trainingTime}
                            </p>
                            <p className="text-sm text-gray-500">
                              Approach: {gap.trainingApproach}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden Strengths */}
                  {analysis.hiddenStrengths && analysis.hiddenStrengths.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold mb-2 text-green-700">Hidden Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.hiddenStrengths.map((strength, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verification Questions */}
                  {analysis.verificationQuestions && analysis.verificationQuestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Interview Questions to Verify Skills</h3>
                      <div className="space-y-3">
                        {analysis.verificationQuestions.map((q, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <p className="text-sm text-gray-500">Skill: {q.skill}</p>
                            <p className="font-medium mt-1">{q.question}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Look for: {q.expectedAnswer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {analysis.summary && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
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

export default SkillsAssessor;
