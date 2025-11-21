import React from 'react';
import ReactDOM from 'react-dom';
import { CloudArrowUpIcon, CheckCircleIcon } from '../icons/Icons';

interface ImportProgressModalProps {
    isOpen: boolean;
    fileName: string;
    fileSize: number; // in bytes
    progress: number; // 0-100
}

const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-2">
        <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
        />
    </div>
);


const ImportProgressModal: React.FC<ImportProgressModalProps> = ({ isOpen, fileName, fileSize, progress }) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;
    
    const isComplete = progress >= 100;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
        >
            <div className="fixed inset-0 bg-black/60 animate-backdrop-in" />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md m-4 p-6 dark:bg-gray-800 animate-modal-in-scale">
                <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full mb-4 transition-colors duration-300 ${isComplete ? 'bg-green-100 dark:bg-green-900/50' : 'bg-primary/10 dark:bg-primary/20'}`}>
                        {isComplete ? (
                            <CheckCircleIcon className="w-10 h-10 text-green-500" />
                        ) : (
                            <CloudArrowUpIcon className="w-10 h-10 text-primary" />
                        )}
                    </div>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white">
                        {isComplete ? 'اكتمل الاستيراد' : 'جاري استيراد الملف'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate w-full" title={fileName}>
                        {fileName || 'Importing...'}
                    </p>

                    <div className="w-full mt-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(fileSize)}</span>
                            <span className={`text-sm font-semibold ${isComplete ? 'text-green-500' : 'text-primary dark:text-primary-light'}`}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <ProgressBar progress={progress} />
                    </div>
                </div>
            </div>
        </div>,
        modalRoot
    );
};

export default ImportProgressModal;
