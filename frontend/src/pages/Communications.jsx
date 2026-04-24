import React, { useState, useEffect } from 'react';
import { communicationsApi, candidatesApi } from '../services/api';
import {
  Mail, Phone, MessageSquare, Send, Sparkles, X, Plus, Search, FileText,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { SortDropdown } from '../components/SortControls';
import { CardSkeleton } from '../components/Skeleton';
import RowDetail from '../components/RowDetail';

const typeIcons = { email: Mail, sms: MessageSquare, call: Phone };

const statusColors = {
  draft: 'badge-gray', sent: 'badge-blue', delivered: 'badge-green', read: 'badge-purple', failed: 'badge-red',
};

const sortOptions = [
  { value: 'createdAt', label: 'Date' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
];

const rowDetailFields = [
  { key: 'subject', label: 'Subject' },
  { key: 'type', label: 'Type' },
  { key: 'direction', label: 'Direction' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'candidate.firstName', label: 'Candidate First Name' },
  { key: 'candidate.lastName', label: 'Candidate Last Name' },
  { key: 'aiGenerated', label: 'AI Generated', type: 'boolean' },
  { key: 'sentAt', label: 'Sent At', type: 'datetime' },
  { key: 'createdAt', label: 'Created', type: 'datetime' },
  { key: 'content', label: 'Content', fullWidth: true },
];

const exportToPDF = (data, title) => {
  const cols = [
    { key: 'subject', label: 'Subject' }, { key: 'type', label: 'Type' },
    { key: 'direction', label: 'Direction' }, { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date' },
  ];
  const rows = data.map(item => cols.map(c => {
    const v = item[c.key];
    if (c.key === 'createdAt' && v) return new Date(v).toLocaleDateString();
    return v ?? '--';
  }));
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1f2937}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>${title}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${cols.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'communications_report.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const CommunicationCard = ({ comm, onClick }) => {
  const Icon = typeIcons[comm.type] || Mail;
  return (
    <div className="card-hover" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${comm.direction === 'inbound' ? 'bg-green-50' : 'bg-blue-50'}`}>
            <Icon className={`w-5 h-5 ${comm.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{comm.subject || `${comm.type} Communication`}</p>
            <p className="text-sm text-gray-500">{comm.candidate?.firstName} {comm.candidate?.lastName}</p>
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
        <span className="text-xs text-gray-400">{new Date(comm.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const NewCommunicationModal = ({ isOpen, onClose, onSave }) => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ candidateId: '', type: 'email', direction: 'outbound', subject: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchCandidates(); }, []);
  const fetchCandidates = async () => {
    try {
      const response = await candidatesApi.getAll();
      const res = response.data;
      setCandidates(res.data || res);
    } catch {}
  };

  const handleGenerateEmail = async (templateType) => {
    if (!formData.candidateId) { toast.warning('Please select a candidate first'); return; }
    setGenerating(true);
    try {
      const response = await communicationsApi.generateEmail({ candidateId: formData.candidateId, templateType });
      setFormData(prev => ({ ...prev, subject: response.data.subject, content: response.data.body }));
    } catch { toast.error('Failed to generate email'); }
    finally { setGenerating(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await communicationsApi.create({ ...formData, status: 'sent' }); onSave(); onClose(); toast.success('Communication sent'); }
    catch { toast.error('Failed to send communication'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Communication</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="label">Candidate *</label>
              <select className="input" value={formData.candidateId} onChange={e => setFormData({ ...formData, candidateId: e.target.value })} required>
                <option value="">Select candidate</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.email}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Type</label>
                <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="email">Email</option><option value="sms">SMS</option><option value="call">Call Log</option>
                </select>
              </div>
              <div><label className="label">Direction</label>
                <select className="input" value={formData.direction} onChange={e => setFormData({ ...formData, direction: e.target.value })}>
                  <option value="outbound">Outbound</option><option value="inbound">Inbound</option>
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
                    <button key={type} type="button" onClick={() => handleGenerateEmail(type)} disabled={generating || !formData.candidateId} className="btn-secondary text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />{label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {formData.type === 'email' && (
              <div><label className="label">Subject</label><input type="text" className="input" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} /></div>
            )}
            <div><label className="label">Content *</label><textarea className="input min-h-[150px]" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><Send className="w-4 h-4" />{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Communications = () => {
  const toast = useToast();
  const [communications, setCommunications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailComm, setDetailComm] = useState(null);

  useEffect(() => { fetchCommunications(); }, [typeFilter, sort, page, limit]);

  const fetchCommunications = async () => {
    setLoading(true);
    try {
      const response = await communicationsApi.getAll({ type: typeFilter || undefined, page, limit, sortBy: sort.sortBy, sortOrder: sort.sortOrder });
      const res = response.data;
      setCommunications(res.data || res);
      setPagination(res.pagination || null);
    } catch { toast.error('Failed to fetch communications'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = () => { exportToPDF(communications, 'Communications Report'); toast.success('PDF exported'); };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-500 mt-1">Track all candidate communications</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" />PDF</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Communication</button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input w-40">
          <option value="">All Types</option><option value="email">Email</option><option value="sms">SMS</option><option value="call">Call</option>
        </select>
        <SortDropdown options={sortOptions} currentSort={sort} onSort={(sortBy, sortOrder) => { setSort({ sortBy, sortOrder }); setPage(1); }} />
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : communications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communications.map(comm => (
            <CommunicationCard key={comm.id} comm={comm} onClick={() => setDetailComm(comm)} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
          <p className="text-gray-500 mb-4">Start communicating with your candidates</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">Send Communication</button>
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1); }} />}

      {detailComm && (
        <RowDetail
          item={detailComm} fields={rowDetailFields} title={detailComm.subject || `${detailComm.type} Communication`}
          onClose={() => setDetailComm(null)}
        />
      )}

      <NewCommunicationModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onSave={fetchCommunications} />
    </div>
  );
};

export default Communications;
