import React, { useState, createContext, useContext, useCallback } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const confirmDelete = useCallback((itemName, count) => {
    return confirm({
      type: 'danger',
      title: count ? `Delete ${count} items?` : `Delete ${itemName}?`,
      message: count
        ? `Are you sure you want to delete ${count} selected items? This action cannot be undone.`
        : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }, [confirm]);

  const confirmAction = useCallback((title, message) => {
    return confirm({
      type: 'warning',
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
    });
  }, [confirm]);

  return (
    <ConfirmContext.Provider value={{ confirm, confirmDelete, confirmAction }}>
      {children}
      {dialog && <ConfirmDialogUI {...dialog} />}
    </ConfirmContext.Provider>
  );
};

const icons = {
  danger: <Trash2 className="w-6 h-6 text-red-600" />,
  warning: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
  success: <CheckCircle className="w-6 h-6 text-green-600" />,
  info: <Info className="w-6 h-6 text-blue-600" />,
};

const buttonStyles = {
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  info: 'bg-blue-600 hover:bg-blue-700 text-white',
};

const ConfirmDialogUI = ({ type = 'warning', title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              type === 'danger' ? 'bg-red-100' :
              type === 'warning' ? 'bg-yellow-100' :
              type === 'success' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {icons[type]}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
          <button onClick={onCancel} className="btn btn-secondary">
            {cancelText || 'Cancel'}
          </button>
          <button onClick={onConfirm} className={`btn ${buttonStyles[type]}`}>
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialogUI;
