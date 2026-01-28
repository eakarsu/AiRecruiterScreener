import React, { useState, useEffect } from 'react';
import { communicationsApi, candidatesApi } from '../services/api';
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Sparkles,
  X,
  Plus,
  Search,
} from 'lucide-react';

const typeIcons = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
};

const statusColors = {
  draft: 'badge-gray',
  sent: 'badge-blue',
  delivered: 'badge-green',
  read: 'badge-purple',
  failed: 'badge-red',
};

const CommunicationCard = ({ comm }) => {
  const Icon = typeIcons[comm.type] || Mail;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${comm.direction === 'inbound' ? 'bg-green-50' : 'bg-blue-50'}`}>
            <Icon className={`w-5 h-5 ${comm.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{comm.subject || `${comm.type} Communication`}</p>
            <p className="text-sm text-gray-500">
              {comm.candidate?.firstName} {comm.candidate?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={statusColors[comm.status]}>{comm.status}</span>
          {comm.aiGenerated && <span className="badge-purple">AI</span>}
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-3">{comm.content}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 capitalize">{comm.direction}</span>
        <span className="text-xs text-gray-400">
          {new Date(comm.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const NewCommunicationModal = ({ isOpen, onClose, onSave }) => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    candidateId: '',
    type: 'email',
    direction: 'outbound',
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const handleGenerateEmail = async (templateType) => {
    if (!formData.candidateId) {
      alert('Please select a candidate first');
      return;
    }
    setGenerating(true);
    try {
      const response = await communicationsApi.generateEmail({
        candidateId: formData.candidateId,
        templateType,
      });
      setFormData((prev) => ({
        ...prev,
        subject: response.data.subject,
        content: response.data.body,
      }));
    } catch (error) {
      console.error('Failed to generate email:', error);
      alert('Failed to generate email');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await communicationsApi.create({ ...formData, status: 'sent' });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to send communication:', error);
      alert('Failed to send communication');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Communication</h2>
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
                    {c.firstName} {c.lastName} - {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="call">Call Log</option>
                </select>
              </div>
              <div>
                <label className="label">Direction</label>
                <select
                  className="input"
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
            </div>

            {formData.type === 'email' && (
              <div>
                <label className="label">Generate with AI</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'application_received', label: 'Thank You' },
                    { type: 'interview_invite', label: 'Interview Invite' },
                    { type: 'rejection', label: 'Rejection' },
                    { type: 'offer', label: 'Offer' },
                    { type: 'follow_up', label: 'Follow Up' },
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleGenerateEmail(type)}
                      disabled={generating || !formData.candidateId}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.type === 'email' && (
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  className="input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="label">Content *</label>
              <textarea
                className="input min-h-[150px]"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Communications = () => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    fetchCommunications();
  }, [typeFilter]);

  const fetchCommunications = async () => {
    try {
      const response = await communicationsApi.getAll({ type: typeFilter || undefined });
      setCommunications(response.data);
    } catch (error) {
      console.error('Failed to fetch communications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-500 mt-1">Track all candidate communications</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Communication
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Types</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="call">Call</option>
        </select>
      </div>

      {/* Communications Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : communications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communications.map((comm) => (
            <CommunicationCard key={comm.id} comm={comm} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
          <p className="text-gray-500 mb-4">Start communicating with your candidates</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">
            Send Communication
          </button>
        </div>
      )}

      {/* New Communication Modal */}
      <NewCommunicationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={fetchCommunications}
      />
    </div>
  );
};

export default Communications;
