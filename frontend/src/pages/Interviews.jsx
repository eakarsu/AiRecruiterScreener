import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { interviewsApi, candidatesApi } from '../services/api';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  X,
  ChevronRight,
} from 'lucide-react';

const statusColors = {
  scheduled: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
  no_show: 'badge-yellow',
};

const typeIcons = {
  phone: Phone,
  video: Video,
  onsite: MapPin,
  technical: Clock,
};

const InterviewCard = ({ interview, onClick }) => {
  const Icon = typeIcons[interview.type] || Calendar;

  return (
    <div onClick={onClick} className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Icon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 capitalize">{interview.type} Interview</p>
            <p className="text-sm text-gray-500">
              {interview.candidate?.firstName} {interview.candidate?.lastName}
            </p>
          </div>
        </div>
        <span className={statusColors[interview.status]}>{interview.status}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(interview.scheduledAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' '}({interview.duration} min)
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {interview.interviewer?.firstName} {interview.interviewer?.lastName}
        </p>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

const NewInterviewModal = ({ isOpen, onClose, onSave }) => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    candidateId: '',
    scheduledAt: '',
    duration: 60,
    type: 'video',
    meetingLink: '',
    notes: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await interviewsApi.create(formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create interview:', error);
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
            <div>
              <label className="label">Candidate *</label>
              <select
                className="input"
                value={formData.candidateId}
                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                required
              >
                <option value="">Select candidate</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} - {c.jobPosting?.title}
                  </option>
                ))}
              </select>
            </div>

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
                <label className="label">Duration</label>
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

const Interviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(searchParams.get('action') === 'new');

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  const fetchInterviews = async () => {
    try {
      const response = await interviewsApi.getAll({ status: statusFilter || undefined });
      setInterviews(response.data);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (i) => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date()
  );
  const pastInterviews = interviews.filter(
    (i) => i.status !== 'scheduled' || new Date(i.scheduledAt) <= new Date()
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-500 mt-1">Manage and track all scheduled interviews</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Interviews */}
          {pastInterviews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Interviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {interviews.length === 0 && (
            <div className="card text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-500 mb-4">Schedule your first interview</p>
              <button onClick={() => setShowNewModal(true)} className="btn-primary">
                Schedule Interview
              </button>
            </div>
          )}
        </>
      )}

      {/* New Interview Modal */}
      <NewInterviewModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={fetchInterviews}
      />
    </div>
  );
};

export default Interviews;
