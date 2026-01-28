import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { candidatesApi, jobsApi } from '../services/api';
import {
  Plus,
  Search,
  Filter,
  Users,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

const statusColors = {
  new: 'badge-blue',
  screening: 'badge-yellow',
  interviewed: 'badge-purple',
  offered: 'badge-green',
  hired: 'badge-green',
  rejected: 'badge-red',
};

const CandidateRow = ({ candidate, onClick }) => (
  <tr onClick={onClick} className="cursor-pointer hover:bg-gray-50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-700 font-medium">
            {candidate.firstName[0]}{candidate.lastName[0]}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="text-sm text-gray-500">{candidate.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <p className="text-gray-900">{candidate.currentTitle || '-'}</p>
      <p className="text-sm text-gray-500">{candidate.currentCompany || '-'}</p>
    </td>
    <td className="px-6 py-4">
      <p className="text-gray-900">{candidate.jobPosting?.title || '-'}</p>
      <p className="text-sm text-gray-500">{candidate.jobPosting?.department || '-'}</p>
    </td>
    <td className="px-6 py-4">
      {candidate.aiScore ? (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                candidate.aiScore >= 80
                  ? 'bg-green-500'
                  : candidate.aiScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${candidate.aiScore}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{candidate.aiScore}</span>
        </div>
      ) : (
        <span className="text-gray-400">Not scored</span>
      )}
    </td>
    <td className="px-6 py-4">
      <span className={statusColors[candidate.status]}>{candidate.status}</span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      {candidate.source || '-'}
    </td>
    <td className="px-6 py-4 text-right">
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </td>
  </tr>
);

const NewCandidateModal = ({ isOpen, onClose, onSave, defaultJobId }) => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedIn: '',
    currentTitle: '',
    currentCompany: '',
    yearsExperience: '',
    source: 'direct',
    jobPostingId: defaultJobId || '',
    resumeText: '',
    coverLetter: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll({ status: 'active' });
      setJobs(response.data);
      if (!defaultJobId && response.data.length > 0) {
        setFormData(prev => ({ ...prev, jobPostingId: response.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await candidatesApi.create(formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create candidate:', error);
      alert('Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Candidate</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Job Position *</label>
              <select
                className="input"
                value={formData.jobPostingId}
                onChange={(e) => setFormData({ ...formData, jobPostingId: e.target.value })}
                required
              >
                <option value="">Select a position</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Current Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.currentTitle}
                  onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Current Company</label>
                <input
                  type="text"
                  className="input"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Years of Experience</label>
                <input
                  type="number"
                  className="input"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Source</label>
                <select
                  className="input"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="direct">Direct Application</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">LinkedIn Profile</label>
              <input
                type="url"
                className="input"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="label">Resume Text (for AI Analysis)</label>
              <textarea
                className="input min-h-[100px]"
                value={formData.resumeText}
                onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                placeholder="Paste the resume text here for AI analysis..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Candidates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [showNewModal, setShowNewModal] = useState(searchParams.get('action') === 'new');

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter]);

  const fetchCandidates = async () => {
    try {
      const params = { status: statusFilter || undefined };
      const response = await candidatesApi.getAll(params);
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.firstName.toLowerCase().includes(search.toLowerCase()) ||
    candidate.lastName.toLowerCase().includes(search.toLowerCase()) ||
    candidate.email.toLowerCase().includes(search.toLowerCase()) ||
    candidate.currentTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">Manage and track all your applicants</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="screening">Screening</option>
          <option value="interviewed">Interviewed</option>
          <option value="offered">Offered</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Current Role</th>
                  <th>Applied For</th>
                  <th>AI Score</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-500 mb-4">
            {search ? 'Try adjusting your search terms' : 'Get started by adding your first candidate'}
          </p>
          {!search && (
            <button onClick={() => setShowNewModal(true)} className="btn-primary">
              Add Candidate
            </button>
          )}
        </div>
      )}

      {/* New Candidate Modal */}
      <NewCandidateModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={fetchCandidates}
        defaultJobId={searchParams.get('jobId')}
      />
    </div>
  );
};

export default Candidates;
