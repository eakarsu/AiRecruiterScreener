import React, { useState, useEffect } from 'react';
import { communicationsApi } from '../services/api';
import { FileText, Plus, X, Edit, Eye } from 'lucide-react';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { SortDropdown } from '../components/SortControls';
import { CardSkeleton } from '../components/Skeleton';
import RowDetail from '../components/RowDetail';

const typeColors = {
  application_received: 'badge-blue', interview_invite: 'badge-purple', rejection: 'badge-red', offer: 'badge-green',
};

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
];

const rowDetailFields = [
  { key: 'name', label: 'Template Name' },
  { key: 'type', label: 'Type' },
  { key: 'subject', label: 'Subject' },
  { key: 'aiGenerated', label: 'AI Generated', type: 'boolean' },
  { key: 'createdAt', label: 'Created', type: 'date' },
  { key: 'body', label: 'Body', fullWidth: true },
];

const exportToPDF = (data, title) => {
  const cols = [
    { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' },
    { key: 'subject', label: 'Subject' }, { key: 'createdAt', label: 'Date' },
  ];
  const rows = data.map(item => cols.map(c => {
    const v = item[c.key];
    if (c.key === 'createdAt' && v) return new Date(v).toLocaleDateString();
    return v ?? '--';
  }));
  const html = `<html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#1f2937}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6;font-weight:600}tr:nth-child(even){background:#f9fafb}</style></head><body><h1>${title}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${cols.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(v => '<td>' + v + '</td>').join('') + '</tr>').join('')}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'email_templates_report.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

const TemplateCard = ({ template, onClick }) => (
  <div className="card-hover" onClick={() => onClick(template)}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-medium text-gray-900">{template.name}</p>
        <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
      </div>
      <span className={typeColors[template.type] || 'badge-gray'}>{template.type.replace('_', ' ')}</span>
    </div>
    <p className="text-gray-600 text-sm line-clamp-2">{template.body}</p>
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
      {template.aiGenerated && <span className="badge-purple text-xs">AI Generated</span>}
      <span className="text-xs text-gray-400">{new Date(template.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
);

const NewTemplateModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', subject: '', body: '', type: 'application_received', variables: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = { ...formData, variables: formData.variables ? formData.variables.split(',').map(v => v.trim()) : [] };
      await communicationsApi.createTemplate(data); onSave(); onClose(); toast.success('Template created');
    } catch { toast.error('Failed to create template'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Email Template</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div><label className="label">Template Name *</label><input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><label className="label">Type</label>
              <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="application_received">Application Received</option><option value="interview_invite">Interview Invite</option>
                <option value="rejection">Rejection</option><option value="offer">Offer</option>
              </select>
            </div>
            <div><label className="label">Subject *</label><input type="text" className="input" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="Use {{variable}} for dynamic content" required /></div>
            <div><label className="label">Body *</label><textarea className="input min-h-[200px]" value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} placeholder="Use {{variable}} for dynamic content" required /></div>
            <div><label className="label">Variables (comma-separated)</label><input type="text" className="input" value={formData.variables} onChange={e => setFormData({ ...formData, variables: e.target.value })} placeholder="firstName, position, startDate" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Template'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmailTemplates = () => {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailTemplate, setDetailTemplate] = useState(null);

  useEffect(() => { fetchTemplates(); }, [typeFilter, sort, page, limit]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await communicationsApi.getTemplates({ type: typeFilter || undefined, page, limit, sortBy: sort.sortBy, sortOrder: sort.sortOrder });
      const res = response.data;
      setTemplates(res.data || res);
      setPagination(res.pagination || null);
    } catch { toast.error('Failed to fetch templates'); }
    finally { setLoading(false); }
  };

  const handleExportPDF = () => { exportToPDF(templates, 'Email Templates Report'); toast.success('PDF exported'); };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500 mt-1">Manage your communication templates</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" />PDF</button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />New Template</button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="input w-48">
          <option value="">All Types</option><option value="application_received">Application Received</option>
          <option value="interview_invite">Interview Invite</option><option value="rejection">Rejection</option><option value="offer">Offer</option>
        </select>
        <SortDropdown options={sortOptions} currentSort={sort} onSort={(sortBy, sortOrder) => { setSort({ sortBy, sortOrder }); setPage(1); }} />
      </div>

      {loading ? (
        <CardSkeleton count={6} />
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} onClick={setDetailTemplate} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">Create templates for faster communication</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">Create Template</button>
        </div>
      )}

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={v => { setLimit(v); setPage(1); }} />}

      {detailTemplate && (
        <RowDetail
          item={detailTemplate} fields={rowDetailFields} title={detailTemplate.name}
          onClose={() => setDetailTemplate(null)}
        />
      )}

      <NewTemplateModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onSave={fetchTemplates} />
    </div>
  );
};

export default EmailTemplates;
