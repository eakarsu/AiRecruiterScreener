import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidatesApi, interviewsApi, communicationsApi } from '../services/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  Calendar,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Send,
  MessageSquare,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  X,
} from 'lucide-react';

const statusColors = {
  new: 'badge-blue',
  screening: 'badge-yellow',
  interviewed: 'badge-purple',
  offered: 'badge-green',
  hired: 'badge-green',
  rejected: 'badge-red',
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {children}
  </button>
);

const ScheduleInterviewModal = ({ isOpen, onClose, candidateId, onSave }) => {
  const [formData, setFormData] = useState({
    scheduledAt: '',
    duration: 60,
    type: 'video',
    meetingLink: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await interviewsApi.create({ ...formData, candidateId });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      alert('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule Interview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <select
                  className="input"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Interview Type</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="phone">Phone</option>
                <option value="video">Video</option>
                <option value="onsite">On-site</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div>
              <label className="label">Meeting Link</label>
              <input
                type="url"
                className="input"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                className="input min-h-[80px]"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes for the interview..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyzing, setAnalyzing] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const response = await candidatesApi.getById(id);
      setCandidate(response.data);
    } catch (error) {
      console.error('Failed to fetch candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    try {
      const response = await candidatesApi.analyzeResume(id);
      setCandidate(response.data.candidate);
      alert('Resume analyzed successfully!');
    } catch (error) {
      console.error('Failed to analyze resume:', error);
      alert('Failed to analyze resume. Make sure the candidate has resume text.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await candidatesApi.addNote(id, { content: newNote, type: 'general' });
      setNewNote('');
      fetchCandidate();
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleGenerateEmail = async (templateType) => {
    setGeneratingEmail(true);
    try {
      const response = await communicationsApi.generateEmail({
        candidateId: id,
        templateType,
      });
      alert(`Generated Email:\n\nSubject: ${response.data.subject}\n\n${response.data.body}`);
    } catch (error) {
      console.error('Failed to generate email:', error);
      alert('Failed to generate email');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await candidatesApi.update(id, { status: newStatus });
      fetchCandidate();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Candidate not found</p>
        <button onClick={() => navigate('/candidates')} className="btn-primary mt-4">
          Back to Candidates
        </button>
      </div>
    );
  }

  const strengths = candidate.aiStrengths ? JSON.parse(candidate.aiStrengths) : [];
  const weaknesses = candidate.aiWeaknesses ? JSON.parse(candidate.aiWeaknesses) : [];
  const skills = candidate.skills ? JSON.parse(candidate.skills) : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/candidates')} className="p-2 hover:bg-gray-100 rounded-lg mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <span className={statusColors[candidate.status]}>{candidate.status}</span>
              </div>
              <p className="text-gray-500">
                {candidate.currentTitle} {candidate.currentCompany && `at ${candidate.currentCompany}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={candidate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input"
          >
            <option value="new">New</option>
            <option value="screening">Screening</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={() => setShowInterviewModal(true)} className="btn-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center gap-6 text-sm">
        <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
          <Mail className="w-4 h-4" />
          {candidate.email}
        </a>
        {candidate.phone && (
          <a href={`tel:${candidate.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
            <Phone className="w-4 h-4" />
            {candidate.phone}
          </a>
        )}
        {candidate.linkedIn && (
          <a href={candidate.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'ai-analysis'} onClick={() => setActiveTab('ai-analysis')}>
            AI Analysis
          </TabButton>
          <TabButton active={activeTab === 'interviews'} onClick={() => setActiveTab('interviews')}>
            Interviews ({candidate.interviews?.length || 0})
          </TabButton>
          <TabButton active={activeTab === 'communications'} onClick={() => setActiveTab('communications')}>
            Communications ({candidate.communications?.length || 0})
          </TabButton>
          <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
            Notes ({candidate.notes?.length || 0})
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Applied For</p>
                    <p className="font-medium">{candidate.jobPosting?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{candidate.jobPosting?.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="font-medium">{candidate.yearsExperience || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p className="font-medium capitalize">{candidate.source || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Salary</p>
                    <p className="font-medium">
                      {candidate.expectedSalary ? `$${candidate.expectedSalary.toLocaleString()}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applied Date</p>
                    <p className="font-medium">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {candidate.resumeText && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
                  <p className="text-gray-600 whitespace-pre-line">{candidate.resumeText}</p>
                </div>
              )}

              {candidate.coverLetter && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>
                  <p className="text-gray-600 whitespace-pre-line">{candidate.coverLetter}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-analysis' && (
            <div className="space-y-6">
              {!candidate.aiScore ? (
                <div className="card text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analysis Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Run AI analysis to get insights about this candidate
                  </p>
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={analyzing || !candidate.resumeText}
                    className="btn-primary"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Resume with AI'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">AI Score</h2>
                      <button onClick={handleAnalyzeResume} disabled={analyzing} className="btn-secondary text-sm">
                        {analyzing ? 'Analyzing...' : 'Re-analyze'}
                      </button>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke={candidate.aiScore >= 80 ? '#22c55e' : candidate.aiScore >= 60 ? '#eab308' : '#ef4444'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(candidate.aiScore / 100) * 251} 251`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{candidate.aiScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium capitalize">
                          Recommendation: <span className={
                            candidate.aiRecommendation === 'hire' ? 'text-green-600' :
                            candidate.aiRecommendation === 'consider' ? 'text-yellow-600' : 'text-red-600'
                          }>{candidate.aiRecommendation}</span>
                        </p>
                        {candidate.aiSummary && (
                          <p className="text-gray-600 mt-2">{candidate.aiSummary}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="card">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {strengths.map((s, i) => (
                          <li key={i} className="text-gray-600 flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {weaknesses.map((w, i) => (
                          <li key={i} className="text-gray-600 flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="card">
                      <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                          <span key={i} className="badge-blue">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-4">
              {candidate.interviews?.length > 0 ? (
                candidate.interviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                    className="card-hover"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{interview.type} Interview</p>
                        <p className="text-sm text-gray-500">
                          {new Date(interview.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={statusColors[interview.status] || 'badge-gray'}>
                        {interview.status}
                      </span>
                    </div>
                    {interview.interviewer && (
                      <p className="text-sm text-gray-500 mt-2">
                        Interviewer: {interview.interviewer.firstName} {interview.interviewer.lastName}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No interviews scheduled yet</p>
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="btn-primary mt-4"
                  >
                    Schedule Interview
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              {candidate.communications?.length > 0 ? (
                candidate.communications.map((comm) => (
                  <div key={comm.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{comm.subject || `${comm.type} Communication`}</p>
                      <span className="text-sm text-gray-500">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{comm.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge-gray capitalize">{comm.type}</span>
                      <span className="badge-gray capitalize">{comm.direction}</span>
                      {comm.aiGenerated && <span className="badge-purple">AI Generated</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No communications yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="card">
                <textarea
                  className="input min-h-[80px] mb-3"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="btn-primary"
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>

              {candidate.notes?.length > 0 ? (
                candidate.notes.map((note) => (
                  <div key={note.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">
                        {note.author?.firstName} {note.author?.lastName}
                      </p>
                      <span className="text-sm text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                    <span className="badge-gray text-xs mt-2 capitalize">{note.type}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notes yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleGenerateEmail('interview_invite')}
                disabled={generatingEmail}
                className="w-full btn-secondary justify-start"
              >
                <Send className="w-4 h-4 mr-2" />
                {generatingEmail ? 'Generating...' : 'Generate Interview Invite'}
              </button>
              <button
                onClick={() => handleGenerateEmail('application_received')}
                disabled={generatingEmail}
                className="w-full btn-secondary justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                Generate Thank You Email
              </button>
              <button
                onClick={handleAnalyzeResume}
                disabled={analyzing || !candidate.resumeText}
                className="w-full btn-secondary justify-start"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
          </div>

          {/* AI Score Card */}
          {candidate.aiScore && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">AI Assessment</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900">{candidate.aiScore}</div>
                <p className="text-sm text-gray-500">out of 100</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Recommendation</span>
                  <span className={`font-medium capitalize ${
                    candidate.aiRecommendation === 'hire' ? 'text-green-600' :
                    candidate.aiRecommendation === 'consider' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{candidate.aiRecommendation}</span>
                </div>
              </div>
            </div>
          )}

          {/* Assessments */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Assessments</h3>
            {candidate.assessments?.length > 0 ? (
              <div className="space-y-3">
                {candidate.assessments.map((assessment) => (
                  <div key={assessment.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{assessment.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 capitalize">{assessment.type}</span>
                      {assessment.score !== null ? (
                        <span className="text-sm font-medium">{assessment.score}%</span>
                      ) : (
                        <span className="badge-yellow text-xs">{assessment.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No assessments assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        candidateId={id}
        onSave={fetchCandidate}
      />
    </div>
  );
};

export default CandidateDetail;
