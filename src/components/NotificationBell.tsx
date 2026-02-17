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
            <button
                ref={bellRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className={`p-3.5 rounded-xl transition-all relative group ${showDropdown ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-[bell-swing_2s_infinite]' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] font-black text-white items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Morphing Popup Notif */}
            <AnimatePresence>
                {activePopup && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.5 }}
                        animate={isMorphing ? {
                            opacity: 0,
                            x: 0,
                            y: 0,
                            scale: 0.1,
                            backgroundColor: 'rgb(79, 70, 229)', // transition to indigo-600
                        } : {
                            opacity: 1,
                            x: 0,
                            scale: 1
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-[100] w-full max-w-[320px] bg-white/95 backdrop-blur-md rounded-2xl shadow-3xl border border-indigo-100 p-5 overflow-hidden"
                        style={{
                            transformOrigin: 'top right'
                        }}
                    >
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl -mr-12 -mt-12 rounded-full" />

                        <div className="relative">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/20">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1">New Intel Received</h4>
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-tight truncate">{activePopup.title}</h3>
                                </div>
                                <button
                                    onClick={dismissPopup}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-[11px] font-medium text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                {activePopup.message}
                            </p>

                            <button
                                onClick={() => handleNotificationClick(activePopup)}
                                className="w-full py-3 bg-gray-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all group"
                            >
                                Dispatch To Content <ExternalLink className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-900">Archive Log</span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-wider flex items-center gap-1.5"
                                    >
                                        <Check className="w-3 h-3" />
                                        Sync All Read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-5 transition-all relative group flex gap-4 ${notification.is_read ? 'opacity-60' : 'bg-indigo-50/10'}`}
                                            >
                                                <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${notification.is_read ? 'bg-gray-200' : 'bg-indigo-500 shadow-lg shadow-indigo-500/30 animate-pulse'}`} />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className="text-xs font-black text-gray-900 uppercase tracking-tight cursor-pointer hover:text-indigo-600 transition-colors truncate"
                                                        >
                                                            {notification.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="p-1.5 text-red-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })}
                                                        </span>
                                                        {notification.link && (
                                                            <button
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="text-[9px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:underline tracking-widest"
                                                            >
                                                                Dispatch <ExternalLink className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center px-10">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                            <Bell className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="font-black text-[10px] uppercase text-gray-400 tracking-[0.2em]">Silence Detected</p>
                                        <p className="text-[11px] font-medium text-gray-300 mt-2">No active communications found in history.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-indigo-600 transition-colors py-2 block w-full"
                                >
                                    Dismiss Terminal
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
            `}</style>
        </div>
    );
};

export default NotificationBell;
