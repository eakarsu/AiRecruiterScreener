import { listPayload } from '../utils/listPayload';
import AutoAIExamples from '../components/AutoAIExamples';
import React, { useState, useEffect } from 'react';
import { assessmentsApi, candidatesApi } from '../services/api';
import {
  ClipboardCheck, Plus, Sparkles, X, Clock, CheckCircle, AlertCircle, FileText,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { SortDropdown } from '../components/SortControls';
import { CardSkeleton } from '../components/Skeleton';
import RowDetail from '../components/RowDetail';

const statusColors = { pending: 'badge-yellow', in_progress: 'badge-blue', completed: 'badge-green' };
const typeColors = { technical: 'bg-blue-50 text-blue-600', personality: 'bg-purple-50 text-purple-600', cognitive: 'bg-green-50 text-green-600' };

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
  { value: 'score', label: 'Score' },
];

const rowDetailFields = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'score', label: 'Score' },
  { key: 'timeLimit', label: 'Time Limit (min)' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'candidate.firstName', label: 'Candidate First Name' },
  { key: 'candidate.lastName', label: 'Candidate Last Name' },
  { key: 'candidate.jobPosting.title', label: 'Job Position' },
  { key: 'createdAt', label: 'Created', type: 'date' },
  { key: 'completedAt', label: 'Completed', type: 'datetime' },
  { key: 'aiAnalysis', label: 'AI Analysis', fullWidth: true },
];

const exportToPDF = (data, title) => {
  const cols = [
    { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' }, { key: 'score', label: 'Score' },
    { key: 'timeLimit', label: 'Time Limit' }, { key: 'createdAt', label: 'Date' },
  ];
  const rows = data.map(item => cols.map(c => {
    const v = item[c.key];
    if (c.key === 'createdAt' && v) return new Date(v).toLocaleDateString();
    return v ?? '--';
  }));
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1f2937}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>${title}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${cols.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'assessments_report.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const AssessmentCard = ({ assessment, onClick }) => (
  <div className="card-hover" onClick={onClick}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-medium text-gray-900">{assessment.name}</p>
        <p className="text-sm text-gray-500">{assessment.candidate?.firstName} {assessment.candidate?.lastName}</p>
      </div>
      <span className={statusColors[assessment.status]}>{assessment.status.replace('_', ' ')}</span>
    </div>
    <div className="flex items-center gap-4 mb-4">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[assessment.type]}`}>{assessment.type}</span>
      <div className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" />{assessment.timeLimit} min</div>
    </div>
    {assessment.score !== null && (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">Score</span>
          <span className="font-semibold">{assessment.score}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${assessment.score >= 80 ? 'bg-green-500' : assessment.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${assessment.score}%` }} />
        </div>
      </div>
    )}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">{assessment.candidate?.jobPosting?.title}</span>
      <span className="text-xs text-gray-400">{new Date(assessment.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
);

const NewAssessmentModal = ({ isOpen, onClose, onSave }) => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ candidateId: '', type: 'technical', difficulty: 'medium' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchCandidates(); }, []);
  const fetchCandidates = async () => {
    try {
      const response = await candidatesApi.getAll();
      const res = response.data;
      setCandidates(listPayload(res));
    } catch {}
  };

  const handleGenerateAssessment = async () => {
    if (!formData.candidateId) { toast.warning('Please select a candidate first'); return; }
    setLoading(true);
    try { await assessmentsApi.generate(formData); onSave(); onClose(); toast.success('Assessment generated'); }
    catch { toast.error('Failed to generate assessment'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Assessment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="modal-body space-y-4" data-ai-example-scope>
          <AutoAIExamples />
          <div>
            <label className="label">Candidate *</label>
            <select className="input" value={formData.candidateId} onChange={e => setFormData({ ...formData, candidateId: e.target.value })}>
              <option value="">Select candidate</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.jobPosting?.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assessment Type</label>
            <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="technical">Technical</option><option value="personality">Personality</option><option value="cognitive">Cognitive</option>
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleGenerateAssessment} disabled={loading || !formData.candidateId} className="btn-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />{loading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Assessments = () => {
  const toast = useToast();
  const [assessments, setAssessments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailAssessment, setDetailAssessment] = useState(null);

  useEffect(() => { fetchAssessments(); }, [statusFilter, typeFilter, sort, page, limit]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const response = await assessmentsApi.getAll({ status: statusFilter || undefined, type: typeFilter || undefined, page, limit, sortBy: sort.sortBy, sortOrder: sort.sortOrder });
      const res = response.data;
      setAssessments(listPayload(res));
      setPagination(res.pagination || null);
    } catch { toast.error('Failed to fetch assessments'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = () => { exportToPDF(assessments, 'Assessments Report'); toast.success('PDF exported'); };

  const stats = {
    pending: assessments.filter(a => a.status === 'pending').length,
    inProgress: assessments.filter(a => a.status === 'in_progress').length,
    completed: assessments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500 mt-1">Manage candidate skills assessments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" />PDF</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Assessment</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg"><AlertCircle className="w-6 h-6 text-yellow-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.pending}</p><p className="text-sm text-gray-500">Pending</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg"><Clock className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p><p className="text-sm text-gray-500">In Progress</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.completed}</p><p className="text-sm text-gray-500">Completed</p></div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-40">
          <option value="">All Status</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input w-40">
          <option value="">All Types</option><option value="technical">Technical</option><option value="personality">Personality</option><option value="cognitive">Cognitive</option>
        </select>
        <SortDropdown options={sortOptions} currentSort={sort} onSort={(sortBy, sortOrder) => { setSort({ sortBy, sortOrder }); setPage(1); }} />
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map(assessment => (
            <AssessmentCard key={assessment.id} assessment={assessment} onClick={() => setDetailAssessment(assessment)} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-500 mb-4">Create assessments to evaluate candidates</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">Create Assessment</button>
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1); }} />}

      {detailAssessment && (
        <RowDetail
          item={detailAssessment} fields={rowDetailFields} title={detailAssessment.name}
          onClose={() => setDetailAssessment(null)}
        />
      )}

      <NewAssessmentModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onSave={fetchAssessments} />
    </div>
  );
};

export default Assessments;
