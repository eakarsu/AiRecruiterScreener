import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jobsApi } from '../services/api';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  X,
  Briefcase,
} from 'lucide-react';

const statusColors = {
  draft: 'badge-gray',
  active: 'badge-green',
  paused: 'badge-yellow',
  closed: 'badge-red',
};

const JobCard = ({ job, onClick }) => (
  <div onClick={onClick} className="card-hover">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
        <p className="text-sm text-gray-500">{job.department}</p>
      </div>
      <span className={statusColors[job.status]}>{job.status}</span>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{job.location}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span className="capitalize">{job.type}</span>
      </div>
      {(job.salaryMin || job.salaryMax) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>
            ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
          </span>
        </div>
      )}
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        <span>{job._count?.candidates || 0} candidates</span>
      </div>
      <span className="text-xs text-gray-400">
        {new Date(job.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const NewJobModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    benefits: '',
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.department) {
      alert('Please enter job title and department first');
      return;
    }

    setGenerating(true);
    try {
      const response = await jobsApi.generateDescription({
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
      });

      const generated = response.data;
      setFormData((prev) => ({
        ...prev,
        description: generated.summary + '\n\nResponsibilities:\n' + generated.responsibilities.map(r => `• ${r}`).join('\n'),
        requirements: generated.requirements.map(r => `• ${r}`).join('\n'),
        benefits: generated.benefits.map(b => `• ${b}`).join('\n'),
        salaryMin: generated.salaryRange?.min || prev.salaryMin,
        salaryMax: generated.salaryRange?.max || prev.salaryMax,
      }));
    } catch (error) {
      console.error('Failed to generate:', error);
      alert('Failed to generate job description');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsApi.create({ ...formData, status: 'active' });
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Job Posting</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Job Title *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
              <div>
                <label className="label">Department *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Engineering"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Location *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  required
                />
              </div>
              <div>
                <label className="label">Employment Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Salary Min ($)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="e.g., 100000"
                />
              </div>
              <div>
                <label className="label">Salary Max ($)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="e.g., 150000"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generating || !formData.title || !formData.department}
                className="btn-secondary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            <div>
              <label className="label">Job Description *</label>
              <textarea
                className="input min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what success looks like..."
                required
              />
            </div>

            <div>
              <label className="label">Requirements *</label>
              <textarea
                className="input min-h-[100px]"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List the required skills, experience, and qualifications..."
                required
              />
            </div>

            <div>
              <label className="label">Benefits</label>
              <textarea
                className="input min-h-[80px]"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="List the benefits and perks..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(searchParams.get('action') === 'new');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll({ status: statusFilter || undefined });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.department.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-1">Manage your open positions and track applicants</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
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
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => navigate(`/jobs/${job.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            {search ? 'Try adjusting your search terms' : 'Get started by creating your first job posting'}
          </p>
          {!search && (
            <button onClick={() => setShowNewModal(true)} className="btn-primary">
              Create Job Posting
            </button>
          )}
        </div>
      )}

      {/* New Job Modal */}
      <NewJobModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={fetchJobs}
      />
    </div>
  );
};

export default Jobs;
