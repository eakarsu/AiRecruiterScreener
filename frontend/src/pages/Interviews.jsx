import { listPayload } from '../utils/listPayload';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { interviewsApi, candidatesApi, downloadBlob } from '../services/api';
import {
  Plus, Search, Calendar, Clock, Video, Phone, MapPin, X, ChevronRight, Download, FileText,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { SortDropdown } from '../components/SortControls';
import BulkActions, { RowCheckbox } from '../components/BulkActions';
import { CardSkeleton } from '../components/Skeleton';
import RowDetail from '../components/RowDetail';

const statusColors = {
  scheduled: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', no_show: 'badge-yellow',
};

const typeIcons = { phone: Phone, video: Video, onsite: MapPin, technical: Clock };

const sortOptions = [
  { value: 'scheduledAt', label: 'Date' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'duration', label: 'Duration' },
];

const rowDetailFields = [
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'candidate.firstName', label: 'Candidate First Name' },
  { key: 'candidate.lastName', label: 'Candidate Last Name' },
  { key: 'interviewer.firstName', label: 'Interviewer First Name' },
  { key: 'interviewer.lastName', label: 'Interviewer Last Name' },
  { key: 'meetingLink', label: 'Meeting Link' },
  { key: 'overallRating', label: 'Rating' },
  { key: 'notes', label: 'Notes', fullWidth: true },
  { key: 'feedback', label: 'Feedback', fullWidth: true },
];

const exportToPDF = (data, title) => {
  const cols = [
    { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' },
    { key: 'scheduledAt', label: 'Scheduled' }, { key: 'duration', label: 'Duration' },
  ];
  const rows = data.map(item => cols.map(c => {
    const v = item[c.key];
    if (c.key === 'scheduledAt' && v) return new Date(v).toLocaleString();
    return v ?? '--';
  }));
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1f2937}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>${title}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${cols.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'interviews_report.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const InterviewCard = ({ interview, onClick, selected, onSelect }) => {
  const Icon = typeIcons[interview.type] || Calendar;
  return (
    <div className="card-hover relative">
      <div className="absolute top-3 left-3 z-10">
        <RowCheckbox checked={selected} onChange={onSelect} />
      </div>
      <div onClick={onClick} className="pl-8">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 capitalize">{interview.type} Interview</p>
              <p className="text-sm text-gray-500">{interview.candidate?.firstName} {interview.candidate?.lastName}</p>
            </div>
          </div>
          <span className={statusColors[interview.status]}>{interview.status}</span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" /><span>{new Date(interview.scheduledAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} min)</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">{interview.interviewer?.firstName} {interview.interviewer?.lastName}</p>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const NewInterviewModal = ({ isOpen, onClose, onSave }) => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ candidateId: '', scheduledAt: '', duration: 60, type: 'video', meetingLink: '', notes: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await interviewsApi.create(formData); onSave(); onClose(); toast.success('Interview scheduled'); }
    catch { toast.error('Failed to schedule interview'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Schedule Interview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="label">Candidate *</label>
              <select className="input" value={formData.candidateId} onChange={e => setFormData({ ...formData, candidateId: e.target.value })} required>
                <option value="">Select candidate</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.jobPosting?.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Date & Time *</label><input type="datetime-local" className="input" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} required /></div>
              <div><label className="label">Duration</label>
                <select className="input" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}>
                  <option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option>
                </select>
              </div>
            </div>
            <div><label className="label">Interview Type</label>
              <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="phone">Phone</option><option value="video">Video</option><option value="onsite">On-site</option><option value="technical">Technical</option>
              </select>
            </div>
            <div><label className="label">Meeting Link</label><input type="url" className="input" value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://zoom.us/j/..." /></div>
            <div><label className="label">Notes</label><textarea className="input min-h-[80px]" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Scheduling...' : 'Schedule Interview'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditInterviewModal = ({ interview, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (interview) setFormData({ scheduledAt: interview.scheduledAt ? interview.scheduledAt.slice(0, 16) : '', duration: interview.duration, type: interview.type, meetingLink: interview.meetingLink || '', notes: interview.notes || '', status: interview.status });
  }, [interview]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await interviewsApi.update(interview.id, formData); onSave(); onClose(); toast.success('Interview updated'); }
    catch { toast.error('Failed to update interview'); }
    finally { setLoading(false); }
  };

  if (!isOpen || !interview) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Interview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={formData.scheduledAt || ''} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} /></div>
              <div><label className="label">Duration</label>
                <select className="input" value={formData.duration || 60} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}>
                  <option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Type</label>
                <select className="input" value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="phone">Phone</option><option value="video">Video</option><option value="onsite">On-site</option><option value="technical">Technical</option>
                </select>
              </div>
              <div><label className="label">Status</label>
                <select className="input" value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No Show</option>
                </select>
              </div>
            </div>
            <div><label className="label">Meeting Link</label><input type="url" className="input" value={formData.meetingLink || ''} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} /></div>
            <div><label className="label">Notes</label><textarea className="input min-h-[80px]" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} /></div>
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

const Interviews = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { confirmDelete } = useConfirm();
  const [interviews, setInterviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'scheduledAt', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNewModal, setShowNewModal] = useState(searchParams.get('action') === 'new');
  const [detailInterview, setDetailInterview] = useState(null);
  const [editInterview, setEditInterview] = useState(null);

  useEffect(() => { fetchInterviews(); }, [statusFilter, sort, page, limit]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await interviewsApi.getAll({ status: statusFilter || undefined, page, limit, sortBy: sort.sortBy, sortOrder: sort.sortOrder });
      const res = response.data;
      setInterviews(listPayload(res));
      setPagination(res.pagination || null);
    } catch { toast.error('Failed to fetch interviews'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (interview) => {
    const ok = await confirmDelete(`${interview.type} interview`);
    if (!ok) return;
    try { await interviewsApi.delete(interview.id); toast.success('Interview deleted'); setDetailInterview(null); fetchInterviews(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleBulkDelete = async (ids) => {
    const ok = await confirmDelete('interviews', ids.length);
    if (!ok) return;
    try { await interviewsApi.bulkDelete(ids); toast.success(`${ids.length} interviews deleted`); setSelectedIds([]); fetchInterviews(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleBulkUpdate = async (ids, data) => {
    try { await interviewsApi.bulkUpdate(ids, data); toast.success(`${ids.length} interviews updated`); setSelectedIds([]); fetchInterviews(); }
    catch { toast.error('Failed to update'); }
  };

  const handleExportCSV = async () => {
    try { const res = await interviewsApi.exportCSV(); downloadBlob(res.data, 'interviews.csv'); toast.success('CSV exported'); }
    catch { toast.error('Export failed'); }
  };

  const handleExportPDF = () => { exportToPDF(interviews, 'Interviews Report'); toast.success('PDF exported'); };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-500 mt-1">Manage and track all scheduled interviews</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" />CSV</button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" />PDF</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Schedule Interview</button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input w-40">
          <option value="">All Status</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no_show">No Show</option>
        </select>
        <SortDropdown options={sortOptions} currentSort={sort} onSort={(sortBy, sortOrder) => { setSort({ sortBy, sortOrder }); setPage(1); }} />
        <BulkActions
          items={interviews} selectedIds={selectedIds}
          onSelectAll={() => setSelectedIds(interviews.map(i => i.id))}
          onDeselectAll={() => setSelectedIds([])}
          onDelete={handleBulkDelete}
          onUpdate={handleBulkUpdate}
          onExportCSV={handleExportCSV}
          updateOptions={[
            { label: 'Set Completed', data: { status: 'completed' } },
            { label: 'Set Cancelled', data: { status: 'cancelled' } },
            { label: 'Set No Show', data: { status: 'no_show' } },
          ]}
        />
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : interviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviews.map(interview => (
            <InterviewCard key={interview.id} interview={interview}
              selected={selectedIds.includes(interview.id)}
              onSelect={() => toggleSelect(interview.id)}
              onClick={() => setDetailInterview(interview)}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
          <p className="text-gray-500 mb-4">Schedule your first interview</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">Schedule Interview</button>
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1); }} />}

      {detailInterview && (
        <RowDetail
          item={detailInterview} fields={rowDetailFields} title={`${detailInterview.type} Interview - ${detailInterview.candidate?.firstName} ${detailInterview.candidate?.lastName}`}
          onClose={() => setDetailInterview(null)}
          onEdit={item => { setDetailInterview(null); setEditInterview(item); }}
          onDelete={item => handleDelete(item)}
          onNavigate={item => navigate(`/interviews/${item.id}`)}
        />
      )}

      <NewInterviewModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onSave={fetchInterviews} />
      <EditInterviewModal interview={editInterview} isOpen={!!editInterview} onClose={() => setEditInterview(null)} onSave={fetchInterviews} />
    </div>
  );
};

export default Interviews;
