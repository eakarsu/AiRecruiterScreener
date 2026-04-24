import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const SortHeader = ({ label, field, currentSort, onSort }) => {
  const isActive = currentSort.sortBy === field;
  const isAsc = isActive && currentSort.sortOrder === 'asc';

  const handleClick = () => {
    if (isActive) {
      onSort(field, isAsc ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700 group"
    >
      {label}
      <span className="ml-1">
        {isActive ? (
          isAsc ? <ArrowUp className="w-3 h-3 text-primary-600" /> : <ArrowDown className="w-3 h-3 text-primary-600" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
        )}
      </span>
    </button>
  );
};

const SortDropdown = ({ options, currentSort, onSort }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Sort by:</label>
      <select
        value={currentSort.sortBy}
        onChange={(e) => onSort(e.target.value, currentSort.sortOrder)}
        className="input py-1.5 px-2 text-sm w-auto"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        onClick={() => onSort(currentSort.sortBy, currentSort.sortOrder === 'asc' ? 'desc' : 'asc')}
        className="p-1.5 rounded hover:bg-gray-100"
        title={currentSort.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {currentSort.sortOrder === 'asc' ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export { SortHeader, SortDropdown };
