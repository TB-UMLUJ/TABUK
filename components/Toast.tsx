import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../hooks/useToasts';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '../icons/Icons';

const iconMap: Record<ToastMessage['type'], React.ReactNode> = {
    success: <CheckCircleIcon className="toast-icon" />,
    error: <XCircleIcon className="toast-icon" />,
    warning: <ExclamationTriangleIcon className="toast-icon" />,
    info: <InformationCircleIcon className="toast-icon" />,
    deleted: <XCircleIcon className="toast-icon" />,
};

const typeClassMap: Record<ToastMessage['type'], string> = {
    success: 'toast-success',
    error: 'toast-failed',
    warning: 'toast-pending',
    info: 'toast-submitted',
    deleted: 'toast-failed',
};

interface ToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { title, message, type } = toast;
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsClosing(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
      if (isClosing) {
          const timer = setTimeout(onDismiss, 500);
          return () => clearTimeout(timer);
      }
  }, [isClosing, onDismiss]);

  return (
    <div
      className={`toast ${typeClassMap[type]} ${isClosing ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
        <div className="toast-icon-container">
            {iconMap[type]}
        </div>
        <div className="toast-content">
            <p className="title">{title}</p>
            <p className="message">{message}</p>
        </div>
    </div>
  );
};

export default Toast;