import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    id: string;
    user_id: string;
    sender_role: 'member' | 'admin';
    message: string;
    is_read: boolean;
    created_at: string;
}

const SELF_DESTRUCT_HOURS = 24;

const LiveChat: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && user) {
            loadMessages();

            // Real-time subscription
            const channel = supabase
                .channel('support_messages')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    loadMessages();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isOpen, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - SELF_DESTRUCT_HOURS);

            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', yesterday.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('support_messages')
                .insert([{
                    user_id: user.id,
                    sender_role: 'member',
                    message: newMessage.trim(),
                }]);

            if (error) throw error;

            setNewMessage('');
            loadMessages();
        } catch (error: any) {
            console.error('[LiveChat] Error sending message:', error);
            alert(`Gagal mengirim pesan: ${error.message || 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Premium Floating Button */}
            <motion.button
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 z-[70] w-18 h-18 rounded-[24px] shadow-2xl flex items-center justify-center transition-all duration-500 overflow-hidden group ${isOpen ? 'bg-gray-900 border-gray-800' : 'bg-indigo-600 border-indigo-500 ring-8 ring-indigo-500/10'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? (
                    <X className="w-8 h-8 text-white relative z-10" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="w-8 h-8 text-white relative z-10" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse" />
                    </div>
                )}
            </motion.button>

            {/* Premium Chat Terminal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 2 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-32 right-8 z-[70] w-[400px] h-[600px] bg-white rounded-[45px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Status Header */}
                        <div className="bg-gray-900 px-8 py-7 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-20 blur-3xl -mr-16 -mt-16 rounded-full" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Support_Nexus</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Online • Respons: ~15 Mnit</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ID: {user?.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Protocol Banner */}
                        <div className="bg-amber-500/5 px-6 py-3 flex items-center gap-3 border-b border-amber-500/10">
                            <ShieldAlert size={14} className="text-amber-500 animate-pulse" />
                            <p className="text-[9px] font-black text-amber-600/80 uppercase tracking-widest italic leading-none">
                                Protokol_Keamanan: Pesan dihancurkan otomatis dalam 24 jam.
                            </p>
                        </div>

                        {/* Transmission Logs Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FAFAFF] custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">Sinkronisasi_Data...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                                    <div className="w-20 h-20 bg-white shadow-xl rounded-[30px] flex items-center justify-center mb-6 group">
                                        <MessageCircle className="w-10 h-10 text-indigo-600 transition-transform group-hover:scale-110" />
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 uppercase italic tracking-tighter mb-2">Butuh Bantuan Teknis?</h4>
                                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest leading-relaxed italic">
                                        Kirim pesan transmisi dan biarkan admin memvalidasi kendala Anda.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, x: msg.sender_role === 'member' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex ${msg.sender_role === 'member' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className="max-w-[85%] space-y-2">
                                                <div className={`rounded-[22px] px-6 py-4 shadow-xl shadow-indigo-600/5 ${msg.sender_role === 'member'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm font-medium leading-relaxed italic">{msg.message}</p>
                                                </div>
                                                <div className={`flex items-center gap-2 px-1 ${msg.sender_role === 'member' ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-1 h-1 rounded-full ${msg.sender_role === 'member' ? 'bg-indigo-300' : 'bg-gray-300'}`} />
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">
                                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Command Input Area */}
                        <div className="p-8 bg-white border-t border-gray-100">
                            <div className="flex items-end gap-3 p-2 bg-gray-50 rounded-[30px] border border-gray-100 focus-within:border-indigo-600/30 focus-within:bg-white transition-all shadow-inner">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Input pesan transmisi..."
                                    rows={1}
                                    className="flex-1 resize-none bg-transparent border-none px-4 py-3 text-sm font-medium focus:ring-0 placeholder:text-gray-300 placeholder:italic placeholder:font-black placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </motion.button>
                            </div>
                            <div className="mt-4 flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-indigo-400 italic">
                                    <Sparkles size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Premium_Encrypted_Link</span>
                                </div>
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Shift+Enter untuk baris baru</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #EEF2FF;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #E0E7FF;
                }
            `}</style>
        </>
    );
};

export default LiveChat;
