import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../hooks/useToasts';
import { CloseIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '../icons/Icons';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    className: 'toast-success',
  },
  error: {
    icon: XCircleIcon,
    className: 'toast-error',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'toast-warning',
  },
  info: {
    icon: InformationCircleIcon,
    className: 'toast-info',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { message, type } = toast;
  const { icon: Icon, className } = toastConfig[type];
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsClosing(true);
        // We call onDismiss in the parent context which will remove the toast from the state
        // The animation will play due to isClosing state
    }, 4500); // Start fade out animation before removing

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    // Let animation play before removing from DOM
    setTimeout(onDismiss, 500); 
  };
  
  useEffect(() => {
      if (isClosing) {
          const timer = setTimeout(onDismiss, 500);
          return () => clearTimeout(timer);
      }
  }, [isClosing, onDismiss]);


  return (
    <div
      className={`toast ${className} ${isClosing ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 ml-3 mr-3 font-semibold text-sm">
        {message}
      </div>
      <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-black/10 transition-colors">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;