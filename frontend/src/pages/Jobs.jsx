import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jobsApi, downloadBlob } from '../services/api';
import {
  Plus, Search, MapPin, Clock, Users, DollarSign, Sparkles, X, Briefcase, Download, FileText,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { SortDropdown } from '../components/SortControls';
import BulkActions, { RowCheckbox } from '../components/BulkActions';
import { CardSkeleton } from '../components/Skeleton';
import RowDetail from '../components/RowDetail';

const statusColors = {
  draft: 'badge-gray', active: 'badge-green', paused: 'badge-yellow', closed: 'badge-red',
};

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'department', label: 'Department' },
  { value: 'salaryMax', label: 'Salary' },
];

const rowDetailFields = [
  { key: 'title', label: 'Title' },
  { key: 'department', label: 'Department' },
  { key: 'location', label: 'Location' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'salaryMin', label: 'Salary Min', type: 'currency' },
  { key: 'salaryMax', label: 'Salary Max', type: 'currency' },
  { key: '_count.candidates', label: 'Candidates' },
  { key: 'createdAt', label: 'Created', type: 'date' },
  { key: 'description', label: 'Description', fullWidth: true },
  { key: 'requirements', label: 'Requirements', fullWidth: true },
];

const exportToPDF = (data, title) => {
  const cols = [
    { key: 'title', label: 'Title' }, { key: 'department', label: 'Dept' },
    { key: 'location', label: 'Location' }, { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' }, { key: 'salaryMin', label: 'Min Salary' },
    { key: 'salaryMax', label: 'Max Salary' },
  ];
  const rows = data.map(item => cols.map(c => {
    const v = c.key.split('.').reduce((o, k) => o?.[k], item);
    return v ?? '--';
  }));
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1f2937}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>${title}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${cols.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'jobs_report.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const JobCard = ({ job, onClick, selected, onSelect }) => (
  <div className="card-hover relative">
    <div className="absolute top-3 left-3 z-10">
      <RowCheckbox checked={selected} onChange={onSelect} />
    </div>
    <div onClick={onClick} className="pl-8">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.department}</p>
        </div>
        <span className={statusColors[job.status]}>{job.status}</span>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" /><span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" /><span className="capitalize">{job.type}</span>
        </div>
        {(job.salaryMin || job.salaryMax) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" /><span>{job._count?.candidates || 0} candidates</span>
        </div>
        <span className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
);

const NewJobModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ title: '', department: '', location: '', type: 'full-time', salaryMin: '', salaryMax: '', description: '', requirements: '', benefits: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.department) { toast.warning('Please enter job title and department first'); return; }
    setGenerating(true);
    try {
      const response = await jobsApi.generateDescription({ title: formData.title, department: formData.department, location: formData.location, type: formData.type });
      const generated = response.data;
      setFormData(prev => ({
        ...prev,
        description: (generated.summary || '') + (generated.responsibilities ? '\n\nResponsibilities:\n' + generated.responsibilities.map(r => `- ${r}`).join('\n') : ''),
        requirements: generated.requirements ? generated.requirements.map(r => `- ${r}`).join('\n') : prev.requirements,
        benefits: generated.benefits ? generated.benefits.map(b => `- ${b}`).join('\n') : prev.benefits,
        salaryMin: generated.salaryRange?.min || prev.salaryMin,
        salaryMax: generated.salaryRange?.max || prev.salaryMax,
      }));
    } catch { toast.error('Failed to generate job description'); }
    finally { setGenerating(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await jobsApi.create({ ...formData, status: 'active' }); onSave(); onClose(); toast.success('Job created'); }
    catch { toast.error('Failed to create job'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Job Posting</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Job Title *</label><input type="text" className="input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div><label className="label">Department *</label><input type="text" className="input" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Location *</label><input type="text" className="input" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required /></div>
              <div><label className="label">Type</label>
                <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Salary Min ($)</label><input type="number" className="input" value={formData.salaryMin} onChange={e => setFormData({ ...formData, salaryMin: e.target.value })} /></div>
              <div><label className="label">Salary Max ($)</label><input type="number" className="input" value={formData.salaryMax} onChange={e => setFormData({ ...formData, salaryMax: e.target.value })} /></div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleGenerateDescription} disabled={generating || !formData.title || !formData.department} className="btn-secondary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />{generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <div><label className="label">Description *</label><textarea className="input min-h-[120px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required /></div>
            <div><label className="label">Requirements *</label><textarea className="input min-h-[100px]" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} required /></div>
            <div><label className="label">Benefits</label><textarea className="input min-h-[80px]" value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Job'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditJobModal = ({ job, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (job) setFormData({ title: job.title, department: job.department, location: job.location, type: job.type, salaryMin: job.salaryMin || '', salaryMax: job.salaryMax || '', description: job.description, requirements: job.requirements, benefits: job.benefits || '', status: job.status });
  }, [job]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await jobsApi.update(job.id, formData); onSave(); onClose(); toast.success('Job updated'); }
    catch { toast.error('Failed to update job'); }
    finally { setLoading(false); }
  };

  if (!isOpen || !job) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Job</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Title *</label><input type="text" className="input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div><label className="label">Department *</label><input type="text" className="input" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Location</label><input type="text" className="input" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
              <div><label className="label">Status</label>
                <select className="input" value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Salary Min</label><input type="number" className="input" value={formData.salaryMin || ''} onChange={e => setFormData({ ...formData, salaryMin: e.target.value })} /></div>
              <div><label className="label">Salary Max</label><input type="number" className="input" value={formData.salaryMax || ''} onChange={e => setFormData({ ...formData, salaryMax: e.target.value })} /></div>
            </div>
            <div><label className="label">Description</label><textarea className="input min-h-[100px]" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><label className="label">Requirements</label><textarea className="input min-h-[80px]" value={formData.requirements || ''} onChange={e => setFormData({ ...formData, requirements: e.target.value })} /></div>
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

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { confirmDelete } = useConfirm();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNewModal, setShowNewModal] = useState(searchParams.get('action') === 'new');
  const [detailJob, setDetailJob] = useState(null);
  const [editJob, setEditJob] = useState(null);

  useEffect(() => { fetchJobs(); }, [statusFilter, sort, page, limit]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsApi.getAll({ status: statusFilter || undefined, search: search || undefined, page, limit, sortBy: sort.sortBy, sortOrder: sort.sortOrder });
      const res = response.data;
      setJobs(res.data || res);
      setPagination(res.pagination || null);
    } catch { toast.error('Failed to fetch jobs'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchJobs(); };

  const filteredJobs = search
    ? jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase()))
    : jobs;

  const handleDelete = async (job) => {
    const ok = await confirmDelete(job.title);
    if (!ok) return;
    try { await jobsApi.delete(job.id); toast.success('Job deleted'); setDetailJob(null); fetchJobs(); }
    catch { toast.error('Failed to delete job'); }
  };

  const handleBulkDelete = async (ids) => {
    const ok = await confirmDelete('jobs', ids.length);
    if (!ok) return;
    try { await jobsApi.bulkDelete(ids); toast.success(`${ids.length} jobs deleted`); setSelectedIds([]); fetchJobs(); }
    catch { toast.error('Failed to delete jobs'); }
  };

  const handleBulkUpdate = async (ids, data) => {
    try { await jobsApi.bulkUpdate(ids, data); toast.success(`${ids.length} jobs updated`); setSelectedIds([]); fetchJobs(); }
    catch { toast.error('Failed to update jobs'); }
  };

  const handleExportCSV = async () => {
    try { const res = await jobsApi.exportCSV(); downloadBlob(res.data, 'jobs.csv'); toast.success('CSV exported'); }
    catch { toast.error('Failed to export CSV'); }
  };

  const handleExportPDF = () => { exportToPDF(filteredJobs, 'Job Postings Report'); toast.success('PDF exported'); };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-1">Manage your open positions and track applicants</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" />CSV</button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" />PDF</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Job</button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="input pl-10" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-40">
          <option value="">All Status</option><option value="active">Active</option><option value="draft">Draft</option><option value="paused">Paused</option><option value="closed">Closed</option>
        </select>
        <SortDropdown options={sortOptions} currentSort={sort} onSort={(sortBy, sortOrder) => { setSort({ sortBy, sortOrder }); setPage(1); }} />
        <BulkActions
          items={filteredJobs} selectedIds={selectedIds}
          onSelectAll={() => setSelectedIds(filteredJobs.map(j => j.id))}
          onDeselectAll={() => setSelectedIds([])}
          onDelete={handleBulkDelete}
          onUpdate={handleBulkUpdate}
          onExportCSV={handleExportCSV}
          updateOptions={[
            { label: 'Set Active', data: { status: 'active' } },
            { label: 'Set Paused', data: { status: 'paused' } },
            { label: 'Close', data: { status: 'closed' } },
          ]}
        />
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job}
              selected={selectedIds.includes(job.id)}
              onSelect={() => toggleSelect(job.id)}
              onClick={() => setDetailJob(job)}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">{search ? 'Try adjusting your search terms' : 'Get started by creating your first job posting'}</p>
          {!search && <button onClick={() => setShowNewModal(true)} className="btn-primary">Create Job Posting</button>}
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1); }} />}

      {detailJob && (
        <RowDetail
          item={detailJob} fields={rowDetailFields} title={detailJob.title}
          onClose={() => setDetailJob(null)}
          onEdit={(item) => { setDetailJob(null); setEditJob(item); }}
          onDelete={(item) => handleDelete(item)}
          onNavigate={(item) => navigate(`/jobs/${item.id}`)}
        />
      )}

      <NewJobModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onSave={fetchJobs} />
      <EditJobModal job={editJob} isOpen={!!editJob} onClose={() => setEditJob(null)} onSave={fetchJobs} />
    </div>
  );
};

export default Jobs;
