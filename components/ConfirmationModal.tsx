import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'warning'
}) => {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            border: 'border-red-200 dark:border-red-900'
        },
        warning: {
            icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
            button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
            border: 'border-amber-200 dark:border-amber-900'
        },
        info: {
            icon: <Info className="w-12 h-12 text-blue-500" />,
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            border: 'border-blue-200 dark:border-blue-900'
        },
        success: {
            icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
            button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
            border: 'border-emerald-200 dark:border-emerald-900'
        }
    };

    const currentVariant = variants[variant];

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border ${currentVariant.border} animate-in zoom-in-95 duration-200 transform`}>
                <div className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-full shadow-inner">
                        {currentVariant.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8">
                        {message}
                    </p>
                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${currentVariant.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
