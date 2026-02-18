import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, Trash2, ExternalLink, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activePopup, setActivePopup] = useState<Notification | null>(null);
    const [isMorphing, setIsMorphing] = useState(false);

    const bellRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel(`notifications-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotif = payload.new as Notification;
                    setNotifications((prev) => [newNotif, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    // Show popup for new notifications
                    setActivePopup(newNotif);

                    // Auto dismiss after 8 seconds if not interacted with
                    setTimeout(() => {
                        setActivePopup(prev => prev?.id === newNotif.id ? null : prev);
                    }, 8000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        setNotifications(data || []);
        setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user?.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        }
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (!error) {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            setShowDropdown(false);
            setActivePopup(null);
        }
    };

    const dismissPopup = () => {
        setIsMorphing(true);
        setTimeout(() => {
            setActivePopup(null);
            setIsMorphing(false);
        }, 600);
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                ref={bellRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-3.5 rounded-2xl transition-all relative group shadow-sm border ${showDropdown ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50'}`}
            >
                <Bell className={`w-5.5 h-5.5 ${unreadCount > 0 ? 'animate-[bell-swing_2s_infinite]' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-black text-white items-center justify-center border-2 border-white shadow-lg italic">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </motion.button>

            {/* Premium Morphing Notification Popup */}
            <AnimatePresence>
                {activePopup && (
                    <motion.div
                        initial={{ opacity: 0, x: 200, scale: 0.8 }}
                        animate={isMorphing ? {
                            opacity: 0,
                            x: 0,
                            y: 0,
                            scale: 0.1,
                            backgroundColor: 'rgb(79, 70, 229)',
                        } : {
                            opacity: 1,
                            x: 0,
                            scale: 1
                        }}
                        exit={{ opacity: 0, scale: 0.8, x: 200 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="fixed bottom-10 right-10 z-[100] w-full max-w-[340px] bg-white rounded-[35px] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-indigo-100 p-6 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-5 mb-5 border-b border-gray-50 pb-5">
                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-indigo-600/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1.5 italic">INTEL_MASUK</h4>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter truncate italic">{activePopup.title}</h3>
                                </div>
                                <button
                                    onClick={dismissPopup}
                                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-300"
                                >
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>

                            <p className="text-[13px] font-medium text-gray-600 mb-6 line-clamp-2 leading-relaxed italic">
                                {activePopup.message}
                            </p>

                            <button
                                onClick={() => handleNotificationClick(activePopup)}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-gray-900/10 italic"
                            >
                                DEKRIPSI_STATUS <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Notification Console Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-gray-900/5 backdrop-blur-[2px]"
                            onClick={() => setShowDropdown(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute right-0 mt-6 w-[350px] md:w-[420px] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div className="space-y-1">
                                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-900 italic">LOG_ARSIP</span>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Sinkronisasi Realtime</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="px-4 py-2 bg-indigo-50 text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all tracking-wider flex items-center gap-2 italic"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        SYNC_ALL
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-white">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-7 transition-all relative group flex gap-5 border-l-4 ${notification.is_read ? 'opacity-40 border-transparent' : 'bg-indigo-50/10 border-indigo-600'}`}
                                            >
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <h4
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="text-sm font-black text-gray-900 uppercase tracking-tighter cursor-pointer hover:text-indigo-600 transition-colors truncate italic"
                                                            >
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block opacity-60">
                                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[12px] font-medium text-gray-500 line-clamp-2 leading-relaxed italic">
                                                        {notification.message}
                                                    </p>
                                                    {notification.link && (
                                                        <button
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-600 hover:underline tracking-widest italic"
                                                        >
                                                            AKSES_DATA <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center px-12">
                                        <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner group">
                                            <Bell className="w-8 h-8 text-gray-200 transition-transform group-hover:scale-110" />
                                        </div>
                                        <h4 className="font-black text-[11px] uppercase text-gray-400 tracking-[0.4em] italic mb-3">TIDAK_ADA_PULSA</h4>
                                        <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.2em] leading-relaxed">Gateway komunikasi sedang dalam status siaga.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-100/50 text-center">
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-red-500 transition-all py-3 active:scale-95 italic"
                                >
                                    TERMINASI TERMINAL
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes bell-swing {
                    0% { transform: rotate(0deg); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-10deg); }
                    30% { transform: rotate(5deg); }
                    40% { transform: rotate(-5deg); }
                    50% { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #F3F4F6;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #E5E7EB;
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
