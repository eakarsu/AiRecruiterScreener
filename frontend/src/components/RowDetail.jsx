import React from 'react';
import { X, Edit3, Trash2, ExternalLink } from 'lucide-react';

const RowDetail = ({ item, fields, title, onClose, onEdit, onDelete, onNavigate }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{title || 'Details'}</h3>
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate(item)}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
                title="Open full page"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              let value = field.key.split('.').reduce((o, k) => o?.[k], item);

              if (field.render) {
                value = field.render(value, item);
              } else if (value === null || value === undefined) {
                value = <span className="text-gray-400">--</span>;
              } else if (typeof value === 'boolean') {
                value = value ? 'Yes' : 'No';
              } else if (field.type === 'date' && value) {
                value = new Date(value).toLocaleDateString();
              } else if (field.type === 'datetime' && value) {
                value = new Date(value).toLocaleString();
              } else if (field.type === 'currency' && value) {
                value = `$${Number(value).toLocaleString()}`;
              } else if (field.type === 'badge') {
                const colors = {
                  active: 'badge-green', hired: 'badge-green', completed: 'badge-green', approved: 'badge-green',
                  new: 'badge-blue', screening: 'badge-blue', pending: 'badge-blue', draft: 'badge-blue',
                  interviewed: 'badge-yellow', scheduled: 'badge-yellow', in_progress: 'badge-yellow', submitted: 'badge-yellow',
                  rejected: 'badge-red', cancelled: 'badge-red', failed: 'badge-red', closed: 'badge-red',
                  offered: 'badge-purple', paused: 'badge-gray',
                };
                value = <span className={`badge ${colors[value] || 'badge-gray'}`}>{String(value).replace(/_/g, ' ')}</span>;
              }

              return (
                <div key={field.key} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RowDetail;
