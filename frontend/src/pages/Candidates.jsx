import { listPayload } from '../utils/listPayload';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { candidatesApi, jobsApi, downloadBlob } from '../services/api';
import { Plus, Search, Users, ChevronRight, X, Download, FileText } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { SortDropdown } from '../components/SortControls';
import BulkActions, { RowCheckbox } from '../components/BulkActions';
import { TableSkeleton } from '../components/Skeleton';
import RowDetail from '../components/RowDetail';

const statusColors = {
  new: 'badge-blue', screening: 'badge-yellow', interviewed: 'badge-purple',
  offered: 'badge-green', hired: 'badge-green', rejected: 'badge-red',
};

const sortOptions = [
  { value: 'createdAt', label: 'Date Applied' },
  { value: 'firstName', label: 'Name' },
  { value: 'aiScore', label: 'AI Score' },
  { value: 'status', label: 'Status' },
  { value: 'yearsExperience', label: 'Experience' },
];

const rowDetailFields = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'currentTitle', label: 'Current Title' },
  { key: 'currentCompany', label: 'Company' },
  { key: 'yearsExperience', label: 'Experience (years)' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'source', label: 'Source' },
  { key: 'aiScore', label: 'AI Score' },
  { key: 'jobPosting.title', label: 'Applied For' },
  { key: 'expectedSalary', label: 'Expected Salary', type: 'currency' },
  { key: 'createdAt', label: 'Applied', type: 'date' },
];

const exportToPDF = (data, title) => {
  const cols = [
    { key: 'firstName', label: 'First Name' }, { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' }, { key: 'currentTitle', label: 'Title' },
    { key: 'status', label: 'Status' }, { key: 'aiScore', label: 'AI Score' },
    { key: 'source', label: 'Source' },
  ];
  const rows = data.map(item => cols.map(c => item[c.key] ?? '--'));
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1f2937}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>${title}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${cols.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'candidates_report.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const CandidateRow = ({ candidate, onClick, selected, onSelect }) => (
  <tr className="cursor-pointer hover:bg-gray-50">
    <td className="px-4 py-4"><RowCheckbox checked={selected} onChange={onSelect} /></td>
    <td className="px-6 py-4" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-primary-700 font-medium">{candidate.firstName[0]}{candidate.lastName[0]}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{candidate.firstName} {candidate.lastName}</p>
          <p className="text-sm text-gray-500">{candidate.email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4" onClick={onClick}>
      <p className="text-gray-900">{candidate.currentTitle || '-'}</p>
      <p className="text-sm text-gray-500">{candidate.currentCompany || '-'}</p>
    </td>
    <td className="px-6 py-4" onClick={onClick}>
      <p className="text-gray-900">{candidate.jobPosting?.title || '-'}</p>
    </td>
    <td className="px-6 py-4" onClick={onClick}>
      {candidate.aiScore ? (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${candidate.aiScore >= 80 ? 'bg-green-500' : candidate.aiScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${candidate.aiScore}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-700">{candidate.aiScore}</span>
        </div>
      ) : <span className="text-gray-400">--</span>}
    </td>
    <td className="px-6 py-4" onClick={onClick}><span className={statusColors[candidate.status]}>{candidate.status}</span></td>
    <td className="px-6 py-4" onClick={onClick}><span className="text-sm text-gray-500">{candidate.source || '-'}</span></td>
    <td className="px-6 py-4 text-right" onClick={onClick}><ChevronRight className="w-5 h-5 text-gray-400" /></td>
  </tr>
);

const NewCandidateModal = ({ isOpen, onClose, onSave, defaultJobId }) => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', linkedIn: '', currentTitle: '', currentCompany: '', yearsExperience: '', source: 'direct', jobPostingId: defaultJobId || '', resumeText: '', coverLetter: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchJobs(); }, []);
  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll({ status: 'active' });
      const data = listPayload(response.data);
      setJobs(data);
      if (!defaultJobId && data.length > 0) setFormData(prev => ({ ...prev, jobPostingId: data[0].id }));
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await candidatesApi.create(formData); onSave(); onClose(); toast.success('Candidate added'); }
    catch { toast.error('Failed to create candidate'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add New Candidate</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">First Name *</label><input type="text" className="input" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required /></div>
              <div><label className="label">Last Name *</label><input type="text" className="input" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Email *</label><input type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
              <div><label className="label">Phone</label><input type="tel" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
            </div>
            <div><label className="label">Job Position *</label>
              <select className="input" value={formData.jobPostingId} onChange={e => setFormData({ ...formData, jobPostingId: e.target.value })} required>
                <option value="">Select a position</option>
                {jobs.map(job => <option key={job.id} value={job.id}>{job.title} - {job.department}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Current Title</label><input type="text" className="input" value={formData.currentTitle} onChange={e => setFormData({ ...formData, currentTitle: e.target.value })} /></div>
              <div><label className="label">Current Company</label><input type="text" className="input" value={formData.currentCompany} onChange={e => setFormData({ ...formData, currentCompany: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Years of Experience</label><input type="number" className="input" value={formData.yearsExperience} onChange={e => setFormData({ ...formData, yearsExperience: e.target.value })} /></div>
              <div><label className="label">Source</label>
                <select className="input" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                  <option value="direct">Direct</option><option value="linkedin">LinkedIn</option><option value="indeed">Indeed</option><option value="referral">Referral</option>
                </select>
              </div>
            </div>
            <div><label className="label">Resume Text</label><textarea className="input min-h-[100px]" value={formData.resumeText} onChange={e => setFormData({ ...formData, resumeText: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Adding...' : 'Add Candidate'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditCandidateModal = ({ candidate, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (candidate) setFormData({ firstName: candidate.firstName, lastName: candidate.lastName, email: candidate.email, phone: candidate.phone || '', currentTitle: candidate.currentTitle || '', currentCompany: candidate.currentCompany || '', yearsExperience: candidate.yearsExperience || '', status: candidate.status, source: candidate.source || '' });
  }, [candidate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await candidatesApi.update(candidate.id, formData); onSave(); onClose(); toast.success('Candidate updated'); }
    catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  if (!isOpen || !candidate) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Candidate</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">First Name</label><input type="text" className="input" value={formData.firstName || ''} onChange={e => setFormData({ ...formData, firstName: e.target.value })} /></div>
              <div><label className="label">Last Name</label><input type="text" className="input" value={formData.lastName || ''} onChange={e => setFormData({ ...formData, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Email</label><input type="email" className="input" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><label className="label">Status</label>
                <select className="input" value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="new">New</option><option value="screening">Screening</option><option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option><option value="hired">Hired</option><option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Current Title</label><input type="text" className="input" value={formData.currentTitle || ''} onChange={e => setFormData({ ...formData, currentTitle: e.target.value })} /></div>
              <div><label className="label">Company</label><input type="text" className="input" value={formData.currentCompany || ''} onChange={e => setFormData({ ...formData, currentCompany: e.target.value })} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Candidates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { confirmDelete } = useConfirm();
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNewModal, setShowNewModal] = useState(searchParams.get('action') === 'new');
  const [detailCandidate, setDetailCandidate] = useState(null);
  const [editCandidate, setEditCandidate] = useState(null);

  useEffect(() => { fetchCandidates(); }, [statusFilter, sort, page, limit]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await candidatesApi.getAll({ status: statusFilter || undefined, search: search || undefined, page, limit, sortBy: sort.sortBy, sortOrder: sort.sortOrder });
      const res = response.data;
      setCandidates(listPayload(res));
      setPagination(res.pagination || null);
    } catch { toast.error('Failed to fetch candidates'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchCandidates(); };

  const handleDelete = async (candidate) => {
    const ok = await confirmDelete(`${candidate.firstName} ${candidate.lastName}`);
    if (!ok) return;
    try { await candidatesApi.delete(candidate.id); toast.success('Candidate deleted'); setDetailCandidate(null); fetchCandidates(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleBulkDelete = async (ids) => {
    const ok = await confirmDelete('candidates', ids.length);
    if (!ok) return;
    try { await candidatesApi.bulkDelete(ids); toast.success(`${ids.length} candidates deleted`); setSelectedIds([]); fetchCandidates(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleBulkUpdate = async (ids, data) => {
    try { await candidatesApi.bulkUpdate(ids, data); toast.success(`${ids.length} candidates updated`); setSelectedIds([]); fetchCandidates(); }
    catch { toast.error('Failed to update'); }
  };

  const handleExportCSV = async () => {
    try { const res = await candidatesApi.exportCSV(); downloadBlob(res.data, 'candidates.csv'); toast.success('CSV exported'); }
    catch { toast.error('Export failed'); }
  };

  const handleExportPDF = () => { exportToPDF(candidates, 'Candidates Report'); toast.success('PDF exported'); };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">Manage and track all your applicants</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" />CSV</button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" />PDF</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Add Candidate</button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="input pl-10" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-40">
          <option value="">All Status</option><option value="new">New</option><option value="screening">Screening</option>
          <option value="interviewed">Interviewed</option><option value="offered">Offered</option><option value="hired">Hired</option><option value="rejected">Rejected</option>
        </select>
        <SortDropdown options={sortOptions} currentSort={sort} onSort={(sortBy, sortOrder) => { setSort({ sortBy, sortOrder }); setPage(1); }} />
        <BulkActions
          items={candidates} selectedIds={selectedIds}
          onSelectAll={() => setSelectedIds(candidates.map(c => c.id))}
          onDeselectAll={() => setSelectedIds([])}
          onDelete={handleBulkDelete}
          onUpdate={handleBulkUpdate}
          onExportCSV={handleExportCSV}
          updateOptions={[
            { label: 'Screening', data: { status: 'screening' } },
            { label: 'Interviewed', data: { status: 'interviewed' } },
            { label: 'Offered', data: { status: 'offered' } },
            { label: 'Rejected', data: { status: 'rejected' } },
          ]}
        />
      </div>

      {loading ? (
        <div className="card p-0 overflow-hidden"><TableSkeleton rows={8} cols={7} /></div>
      ) : candidates.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-10"></th><th>Candidate</th><th>Current Role</th><th>Applied For</th><th>AI Score</th><th>Status</th><th>Source</th><th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {candidates.map(candidate => (
                  <CandidateRow key={candidate.id} candidate={candidate}
                    selected={selectedIds.includes(candidate.id)}
                    onSelect={() => toggleSelect(candidate.id)}
                    onClick={() => setDetailCandidate(candidate)}
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
          <p className="text-gray-500 mb-4">{search ? 'Try adjusting your search' : 'Add your first candidate'}</p>
          {!search && <button onClick={() => setShowNewModal(true)} className="btn-primary">Add Candidate</button>}
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1); }} />}

      {detailCandidate && (
        <RowDetail item={detailCandidate} fields={rowDetailFields} title={`${detailCandidate.firstName} ${detailCandidate.lastName}`}
          onClose={() => setDetailCandidate(null)}
          onEdit={item => { setDetailCandidate(null); setEditCandidate(item); }}
          onDelete={item => handleDelete(item)}
          onNavigate={item => navigate(`/candidates/${item.id}`)}
        />
      )}

      <NewCandidateModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onSave={fetchCandidates} defaultJobId={searchParams.get('jobId')} />
      <EditCandidateModal candidate={editCandidate} isOpen={!!editCandidate} onClose={() => setEditCandidate(null)} onSave={fetchCandidates} />
    </div>
  );
};

export default Candidates;
