import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    notification: Notification | null;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, notification.duration || 4000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification && !isVisible) return null;

    const bgColors = {
        success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
        error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
        info: 'bg-[var(--primary-color)]/5 border-[var(--primary-color)]/20 shadow-[var(--primary-color)]/5',
        warning: 'bg-[var(--primary-color)]/5 border-[var(--primary-color)]/20 shadow-[var(--primary-color)]/5'
    };

    const textColors = {
        success: 'text-emerald-800 dark:text-emerald-200',
        error: 'text-red-800 dark:text-red-200',
        info: 'text-[var(--primary-color)] dark:text-[var(--primary-color)] brightness-75 dark:brightness-125',
        warning: 'text-[var(--primary-color)] dark:text-[var(--primary-color)] brightness-75 dark:brightness-125'
    };

    const icons = {
        success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
        error: <AlertCircle className="w-6 h-6 text-red-500" />,
        info: <Info className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />,
        warning: <AlertTriangle className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
    };

    return (
        <div data-html2canvas-ignore className={`fixed top-6 right-6 z-[300] transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
            <div className={`flex items-start gap-4 p-4 rounded-2xl border shadow-xl backdrop-blur-sm max-w-md ${bgColors[notification?.type || 'info']}`}>
                <div className="flex-shrink-0 mt-0.5">
                    {icons[notification?.type || 'info']}
                </div>
                <div className="flex-1 pt-0.5">
                    <h3 className={`font-bold text-sm ${textColors[notification?.type || 'info']}`}>
                        {notification?.title}
                    </h3>
                    {notification?.message && (
                        <p className={`mt-1 text-xs opacity-90 ${textColors[notification?.type || 'info']}`}>
                            {notification.message}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className={`p-1 rounded-full hover:bg-black/5 transition-colors ${textColors[notification?.type || 'info']}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
