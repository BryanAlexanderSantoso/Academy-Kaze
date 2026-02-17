import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    Info,
    Trash2,
    Save,
    AlertTriangle
} from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'delete' | 'save';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<AlertOptions | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const showAlert = useCallback((options: AlertOptions) => {
        setAlert(options);
        setIsVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => setAlert(null), 300);
    }, []);

    const getIcon = (type?: AlertType) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
            case 'error': return <XCircle className="w-8 h-8 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-8 h-8 text-amber-500" />;
            case 'delete': return <Trash2 className="w-8 h-8 text-red-500" />;
            case 'save': return <Save className="w-8 h-8 text-indigo-500" />;
            default: return <Info className="w-8 h-8 text-blue-500" />;
        }
    };

    const getTypeColor = (type?: AlertType) => {
        switch (type) {
            case 'success': return 'border-emerald-500/20 bg-emerald-500/5';
            case 'error': return 'border-red-500/20 bg-red-500/5';
            case 'warning': return 'border-amber-500/20 bg-amber-500/5';
            case 'delete': return 'border-red-500/20 bg-red-500/5';
            case 'save': return 'border-indigo-500/20 bg-indigo-500/5';
            default: return 'border-blue-500/20 bg-blue-500/5';
        }
    };

    const getButtonColor = (type?: AlertType) => {
        if (type === 'delete' || type === 'error') return 'bg-red-600 hover:bg-red-700 shadow-red-600/20';
        if (type === 'success') return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20';
        if (type === 'warning') return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20';
        return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20';
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <AnimatePresence>
                {isVisible && alert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !alert.onConfirm && hideAlert()}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`relative w-full max-w-sm bg-white rounded-[32px] shadow-3xl border ${getTypeColor(alert.type)} p-8 overflow-hidden`}
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 z-0" />

                            <div className="relative z-10">
                                <div className="flex flex-col items-center text-center">
                                    <div className={`p-4 rounded-2xl mb-6 ${getTypeColor(alert.type)} border shadow-inner`}>
                                        {getIcon(alert.type)}
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                                        {alert.title}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 px-2">
                                        {alert.message}
                                    </p>

                                    <div className="flex flex-col w-full gap-3">
                                        <button
                                            onClick={() => {
                                                if (alert.onConfirm) alert.onConfirm();
                                                hideAlert();
                                            }}
                                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 ${getButtonColor(alert.type)}`}
                                        >
                                            {alert.confirmText || 'Confirm Action'}
                                        </button>

                                        {(alert.showCancel || alert.onCancel) && (
                                            <button
                                                onClick={() => {
                                                    if (alert.onCancel) alert.onCancel();
                                                    hideAlert();
                                                }}
                                                className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all active:scale-95 underline underline-offset-4"
                                            >
                                                {alert.cancelText || 'Dismiss'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};
