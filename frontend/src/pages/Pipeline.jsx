import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi, analyticsApi } from '../services/api';
import { Users, ChevronRight } from 'lucide-react';

const stageColors = {
  new: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  screening: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  interviewed: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  offered: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  hired: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  rejected: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
};

const CandidateCard = ({ candidate, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 cursor-pointer transition-all"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-primary-700">
          {candidate.firstName[0]}{candidate.lastName[0]}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {candidate.firstName} {candidate.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{candidate.currentTitle || 'No title'}</p>
      </div>
    </div>
    {candidate.aiScore && (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              candidate.aiScore >= 80 ? 'bg-green-500' :
              candidate.aiScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${candidate.aiScore}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">{candidate.aiScore}</span>
      </div>
    )}
    <p className="text-xs text-gray-400 mt-2 truncate">
      {candidate.jobPosting?.title}
    </p>
  </div>
);

const PipelineColumn = ({ status, candidates, onCandidateClick }) => {
  const colors = stageColors[status] || stageColors.new;

  return (
    <div className={`flex-1 min-w-[280px] ${colors.bg} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold capitalize ${colors.text}`}>{status}</h3>
        <span className={`text-sm font-medium ${colors.text}`}>
          {candidates.length}
        </span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onClick={() => onCandidateClick(candidate)}
          />
        ))}
        {candidates.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No candidates</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Pipeline = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await candidatesApi.getAll();
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = ['new', 'screening', 'interviewed', 'offered', 'hired', 'rejected'];

  const getCandidatesByStatus = (status) =>
    candidates.filter((c) => c.status === status);

  const handleCandidateClick = (candidate) => {
    navigate(`/candidates/${candidate.id}`);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
        <p className="text-gray-500 mt-1">Track candidates through your hiring process</p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-6 gap-4">
        {stages.map((status) => {
          const count = getCandidatesByStatus(status).length;
          const colors = stageColors[status];
          return (
            <div
              key={status}
              className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}
            >
              <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
              <p className={`text-sm capitalize ${colors.text} opacity-80`}>{status}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            candidates={getCandidatesByStatus(status)}
            onCandidateClick={handleCandidateClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Pipeline Stages</h3>
        <div className="flex flex-wrap gap-4">
          {stages.map((status) => {
            const colors = stageColors[status];
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
                <span className="text-sm text-gray-600 capitalize">{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;
