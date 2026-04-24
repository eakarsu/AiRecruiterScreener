import React from 'react';
import { CheckSquare, Square, MinusSquare, Trash2, Edit3, Download, X } from 'lucide-react';

const BulkActions = ({
  items = [],
  selectedIds = [],
  onSelectAll,
  onDeselectAll,
  onDelete,
  onUpdate,
  onExportCSV,
  updateOptions = [],
  children,
}) => {
  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const someSelected = selectedCount > 0 && selectedCount < items.length;

  const handleToggleAll = () => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <>
      {/* Selection toggle */}
      <button
        onClick={handleToggleAll}
        className="p-1 rounded hover:bg-gray-100"
        title={allSelected ? 'Deselect all' : 'Select all'}
      >
        {allSelected ? (
          <CheckSquare className="w-5 h-5 text-primary-600" />
        ) : someSelected ? (
          <MinusSquare className="w-5 h-5 text-primary-600" />
        ) : (
          <Square className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-xl px-6 py-3 flex items-center gap-4 z-50 animate-slideIn">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <div className="w-px h-6 bg-gray-600" />

          {onDelete && (
            <button
              onClick={() => onDelete(selectedIds)}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors"
              title="Delete selected"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}

          {updateOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onUpdate(selectedIds, opt.data)}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              {opt.label}
            </button>
          ))}

          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}

          {children}

          <button
            onClick={onDeselectAll}
            className="ml-2 p-1 rounded hover:bg-gray-700"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

// Checkbox for individual rows
export const RowCheckbox = ({ checked, onChange }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className="p-0.5 rounded hover:bg-gray-100"
  >
    {checked ? (
      <CheckSquare className="w-4 h-4 text-primary-600" />
    ) : (
      <Square className="w-4 h-4 text-gray-400" />
    )}
  </button>
);

export default BulkActions;
