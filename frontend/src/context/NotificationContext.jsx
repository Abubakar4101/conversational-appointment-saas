import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                flex items-center space-x-4 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl min-w-[320px]
                ${n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        'bg-slate-900/90 border-white/10 text-slate-100'}
              `}>
                                <div className="shrink-0">
                                    {n.type === 'success' && <CheckCircle size={24} />}
                                    {n.type === 'error' && <XCircle size={24} />}
                                    {n.type === 'info' && <Info size={24} />}
                                </div>
                                <div className="flex-grow font-bold text-sm tracking-tight">{n.message}</div>
                                <button
                                    onClick={() => removeNotification(n.id)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
