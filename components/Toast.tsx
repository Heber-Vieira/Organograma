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
        info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
        warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
    };

    const textColors = {
        success: 'text-emerald-800 dark:text-emerald-200',
        error: 'text-red-800 dark:text-red-200',
        info: 'text-blue-800 dark:text-blue-200',
        warning: 'text-amber-800 dark:text-amber-200'
    };

    const icons = {
        success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
        error: <AlertCircle className="w-6 h-6 text-red-500" />,
        info: <Info className="w-6 h-6 text-blue-500" />,
        warning: <AlertTriangle className="w-6 h-6 text-amber-500" />
    };

    return (
        <div className={`fixed top-6 right-6 z-[300] transition-all duration-500 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
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
