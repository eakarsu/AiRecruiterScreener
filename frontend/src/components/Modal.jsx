import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

const typeConfig = {
  confirm: { icon: AlertTriangle, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-50' },
  danger: { icon: AlertTriangle, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
  info: { icon: Info, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
  success: { icon: CheckCircle, iconColor: 'text-green-500', iconBg: 'bg-green-50' },
  content: { icon: null, iconColor: '', iconBg: '' },
};

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const showModal = useCallback(({ title, message, content, type = 'info', confirmText = 'OK', cancelText = 'Cancel', onConfirm, onCancel, showCancel = false }) => {
    return new Promise((resolve) => {
      setModal({
        title,
        message,
        content,
        type,
        confirmText,
        cancelText,
        showCancel,
        resolve,
        onConfirm,
        onCancel,
      });
    });
  }, []);

  const closeModal = useCallback((result) => {
    if (modal) {
      modal.resolve(result);
      if (result && modal.onConfirm) modal.onConfirm();
      if (!result && modal.onCancel) modal.onCancel();
    }
    setModal(null);
  }, [modal]);

  const confirm = useCallback((title, message) => {
    return showModal({ title, message, type: 'confirm', confirmText: 'Confirm', showCancel: true });
  }, [showModal]);

  const confirmDanger = useCallback((title, message) => {
    return showModal({ title, message, type: 'danger', confirmText: 'Delete', cancelText: 'Cancel', showCancel: true });
  }, [showModal]);

  const showContent = useCallback((title, content) => {
    return showModal({ title, content, type: 'content', confirmText: 'Close' });
  }, [showModal]);

  return (
    <ModalContext.Provider value={{ showModal, confirm, confirmDanger, showContent }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => closeModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full animate-slideIn overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{modal.title}</h3>
              <button
                onClick={() => closeModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {modal.type !== 'content' && modal.message && (
                <div className="flex gap-4">
                  {typeConfig[modal.type]?.icon && (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeConfig[modal.type].iconBg} flex items-center justify-center`}>
                      {React.createElement(typeConfig[modal.type].icon, {
                        className: `w-5 h-5 ${typeConfig[modal.type].iconColor}`,
                      })}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed pt-2">{modal.message}</p>
                </div>
              )}
              {modal.content && (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {modal.content}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              {modal.showCancel && (
                <button
                  onClick={() => closeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                onClick={() => closeModal(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  modal.type === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
