import React, { useState, useEffect } from 'react';
import { assessmentsApi, candidatesApi } from '../services/api';
import {
  ClipboardCheck,
  Plus,
  Sparkles,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const statusColors = {
  pending: 'badge-yellow',
  in_progress: 'badge-blue',
  completed: 'badge-green',
};

const typeColors = {
  technical: 'bg-blue-50 text-blue-600',
  personality: 'bg-purple-50 text-purple-600',
  cognitive: 'bg-green-50 text-green-600',
};

const AssessmentCard = ({ assessment }) => (
  <div className="card">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-medium text-gray-900">{assessment.name}</p>
        <p className="text-sm text-gray-500">
          {assessment.candidate?.firstName} {assessment.candidate?.lastName}
        </p>
      </div>
      <span className={statusColors[assessment.status]}>{assessment.status.replace('_', ' ')}</span>
    </div>

    <div className="flex items-center gap-4 mb-4">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[assessment.type]}`}>
        {assessment.type}
      </span>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        {assessment.timeLimit} min
      </div>
    </div>

    {assessment.score !== null && (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Score</span>
          <span className="font-semibold">{assessment.score}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              assessment.score >= 80 ? 'bg-green-500' : assessment.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${assessment.score}%` }}
          />
        </div>
      </div>
    )}

    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        {assessment.candidate?.jobPosting?.title}
      </span>
      <span className="text-xs text-gray-400">
        {new Date(assessment.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const NewAssessmentModal = ({ isOpen, onClose, onSave }) => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    candidateId: '',
    type: 'technical',
    difficulty: 'medium',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await candidatesApi.getAll();
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!formData.candidateId) {
      alert('Please select a candidate first');
      return;
    }
    setLoading(true);
    try {
      await assessmentsApi.generate(formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to generate assessment:', error);
      alert('Failed to generate assessment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Assessment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div>
            <label className="label">Candidate *</label>
            <select
              className="input"
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
            >
              <option value="">Select candidate</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} - {c.jobPosting?.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Assessment Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="technical">Technical</option>
              <option value="personality">Personality</option>
              <option value="cognitive">Cognitive</option>
            </select>
          </div>

          <div>
            <label className="label">Difficulty</label>
            <select
              className="input"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleGenerateAssessment}
            disabled={loading || !formData.candidateId}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, [statusFilter, typeFilter]);

  const fetchAssessments = async () => {
    try {
      const response = await assessmentsApi.getAll({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setAssessments(response.data);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pending: assessments.filter((a) => a.status === 'pending').length,
    inProgress: assessments.filter((a) => a.status === 'in_progress').length,
    completed: assessments.filter((a) => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500 mt-1">Manage candidate skills assessments</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Types</option>
          <option value="technical">Technical</option>
          <option value="personality">Personality</option>
          <option value="cognitive">Cognitive</option>
        </select>
      </div>

      {/* Assessments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-500 mb-4">Create assessments to evaluate candidates</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">
            Create Assessment
          </button>
        </div>
      )}

      {/* New Assessment Modal */}
      <NewAssessmentModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={fetchAssessments}
      />
    </div>
  );
};

export default Assessments;
