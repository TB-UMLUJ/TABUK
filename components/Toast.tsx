import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../hooks/useToasts';

// SVGs are from the image. They are circles with check, x, and !.
const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const DeletedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const IconWrapper: React.FC<{ type: ToastMessage['type'] }> = ({ type }) => {
    const config = {
        success: { icon: <SuccessIcon />, className: 'bg-[#25D366]' },
        error: { icon: <ErrorIcon />, className: 'bg-[#F44336]' },
        warning: { icon: <WarningIcon />, className: 'bg-[#FFC107]' },
        info: { icon: <InfoIcon />, className: 'bg-[#2196F3]' },
        deleted: { icon: <DeletedIcon />, className: 'bg-[#F44336]' },
    };
    const { icon, className } = config[type];

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${className}`}>
            {icon}
        </div>
    );
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
      className={`toast toast-${type} ${isClosing ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
        <IconWrapper type={type} />
        <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-base">{title}</p>
            <p className="text-sm text-gray-300">{message}</p>
        </div>
    </div>
  );
};

export default Toast;