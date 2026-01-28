import React, { useState, useEffect } from 'react';
import { communicationsApi } from '../services/api';
import { FileText, Plus, X, Edit, Eye } from 'lucide-react';

const typeColors = {
  application_received: 'badge-blue',
  interview_invite: 'badge-purple',
  rejection: 'badge-red',
  offer: 'badge-green',
};

const TemplateCard = ({ template, onView }) => (
  <div className="card-hover" onClick={() => onView(template)}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-medium text-gray-900">{template.name}</p>
        <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
      </div>
      <span className={typeColors[template.type] || 'badge-gray'}>
        {template.type.replace('_', ' ')}
      </span>
    </div>
    <p className="text-gray-600 text-sm line-clamp-2">{template.body}</p>
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
      {template.aiGenerated && <span className="badge-purple text-xs">AI Generated</span>}
      <span className="text-xs text-gray-400">
        {new Date(template.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const TemplateModal = ({ template, isOpen, onClose }) => {
  if (!isOpen || !template) return null;

  const variables = template.variables ? JSON.parse(template.variables) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">{template.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div>
            <label className="label">Type</label>
            <span className={typeColors[template.type] || 'badge-gray'}>
              {template.type.replace('_', ' ')}
            </span>
          </div>

          <div>
            <label className="label">Subject</label>
            <p className="p-3 bg-gray-50 rounded-lg">{template.subject}</p>
          </div>

          <div>
            <label className="label">Body</label>
            <pre className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm font-sans">
              {template.body}
            </pre>
          </div>

          {variables.length > 0 && (
            <div>
              <label className="label">Available Variables</label>
              <div className="flex flex-wrap gap-2">
                {variables.map((v, i) => (
                  <code key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const NewTemplateModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'application_received',
    variables: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        variables: formData.variables ? formData.variables.split(',').map(v => v.trim()) : [],
      };
      await communicationsApi.createTemplate(data);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Email Template</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="label">Template Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="application_received">Application Received</option>
                <option value="interview_invite">Interview Invite</option>
                <option value="rejection">Rejection</option>
                <option value="offer">Offer</option>
              </select>
            </div>

            <div>
              <label className="label">Subject *</label>
              <input
                type="text"
                className="input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Use {{variable}} for dynamic content"
                required
              />
            </div>

            <div>
              <label className="label">Body *</label>
              <textarea
                className="input min-h-[200px]"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Use {{variable}} for dynamic content"
                required
              />
            </div>

            <div>
              <label className="label">Variables (comma-separated)</label>
              <input
                type="text"
                className="input"
                value={formData.variables}
                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                placeholder="firstName, position, startDate"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [typeFilter]);

  const fetchTemplates = async () => {
    try {
      const response = await communicationsApi.getTemplates({ type: typeFilter || undefined });
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500 mt-1">Manage your communication templates</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">All Types</option>
          <option value="application_received">Application Received</option>
          <option value="interview_invite">Interview Invite</option>
          <option value="rejection">Rejection</option>
          <option value="offer">Offer</option>
        </select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onView={setSelectedTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">Create templates for faster communication</p>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">
            Create Template
          </button>
        </div>
      )}

      {/* View Template Modal */}
      <TemplateModal
        template={selectedTemplate}
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />

      {/* New Template Modal */}
      <NewTemplateModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={fetchTemplates}
      />
    </div>
  );
};

export default EmailTemplates;
