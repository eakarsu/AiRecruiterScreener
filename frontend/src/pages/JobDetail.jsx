import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsApi, candidatesApi } from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Sparkles,
  ChevronRight,
  Award,
} from 'lucide-react';

const statusColors = {
  draft: 'badge-gray',
  active: 'badge-green',
  paused: 'badge-yellow',
  closed: 'badge-red',
};

const candidateStatusColors = {
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
      <span className={candidateStatusColors[candidate.status]}>{candidate.status}</span>
    </td>
    <td className="px-6 py-4 text-right">
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </td>
  </tr>
);

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobsApi.getById(id);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      await jobsApi.generateQuestions(id, { count: 5 });
      fetchJob();
      alert('Screening questions generated successfully!');
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsApi.delete(id);
      navigate('/jobs');
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <button onClick={() => navigate('/jobs')} className="btn-primary mt-4">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/jobs')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <span className={statusColors[job.status]}>{job.status}</span>
          </div>
          <p className="text-gray-500">{job.department}</p>
        </div>
        <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Job Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="capitalize">{job.type}</span>
              </div>
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span>
                    ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{job.candidates?.length || 0} candidates</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
              </div>
              {job.benefits && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Benefits</h3>
                  <p className="text-gray-600 whitespace-pre-line">{job.benefits}</p>
                </div>
              )}
            </div>
          </div>

          {/* Candidates Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Candidates</h2>
              <button
                onClick={() => navigate(`/candidates?jobId=${job.id}&action=new`)}
                className="btn-secondary text-sm"
              >
                Add Candidate
              </button>
            </div>

            {job.candidates?.length > 0 ? (
              <div className="overflow-x-auto -mx-6 -mb-6">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Current Role</th>
                      <th>AI Score</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {job.candidates.map((candidate) => (
                      <CandidateRow
                        key={candidate.id}
                        candidate={candidate}
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No candidates yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Screening Questions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Screening Questions</h2>
              <button
                onClick={handleGenerateQuestions}
                disabled={generating}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {job.screeningQuestions?.length > 0 ? (
              <div className="space-y-3">
                {job.screeningQuestions.map((q, index) => (
                  <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}. {q.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 capitalize">{q.type}</span>
                      {q.aiGenerated && (
                        <span className="badge-purple text-xs">AI Generated</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No screening questions yet</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Applicants</span>
                <span className="font-semibold">{job.candidates?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interviews Scheduled</span>
                <span className="font-semibold">
                  {job.candidates?.filter(c => c.interviews?.length > 0).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg AI Score</span>
                <span className="font-semibold">
                  {job.candidates?.length > 0
                    ? Math.round(
                        job.candidates.reduce((acc, c) => acc + (c.aiScore || 0), 0) /
                          job.candidates.filter(c => c.aiScore).length || 0
                      )
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
