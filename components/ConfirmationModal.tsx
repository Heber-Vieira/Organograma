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
    const [isLoading, setIsLoading] = React.useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Erro na confirmação:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const variants = {
        danger: {
            icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            border: 'border-red-200 dark:border-red-900',
            iconBg: 'bg-red-50 dark:bg-red-900/20'
        },
        warning: {
            icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
            button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
            border: 'border-amber-200 dark:border-amber-900',
            iconBg: 'bg-amber-50 dark:bg-amber-900/20'
        },
        info: {
            icon: <Info className="w-10 h-10 text-blue-500" />,
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            border: 'border-blue-200 dark:border-blue-900',
            iconBg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        success: {
            icon: <CheckCircle className="w-10 h-10 text-emerald-500" />,
            button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
            border: 'border-emerald-200 dark:border-emerald-900',
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/20'
        }
    };

    const currentVariant = variants[variant];

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.3)] w-full max-w-sm overflow-hidden border border-white/20 dark:border-white/10 animate-in zoom-in-95 duration-300 transform`}>
                <div className="flex flex-col items-center p-10 text-center">
                    <div className={`mb-6 p-5 ${currentVariant.iconBg} rounded-[1.5rem] shadow-sm`}>
                        {currentVariant.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{title}</h3>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
                        {message}
                    </p>
                    <div className="flex w-full gap-4">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase letter-spacing-[0.05em] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase letter-spacing-[0.05em] text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center ${currentVariant.button}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
