import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, User } from 'lucide-react';
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

        console.log('[LiveChat] Sending message...', {
            user_id: user.id,
            message: newMessage.trim(),
        });

        setSending(true);
        try {
            const { data, error } = await supabase
                .from('support_messages')
                .insert([{
                    user_id: user.id,
                    sender_role: 'member',
                    message: newMessage.trim(),
                }])
                .select();

            if (error) {
                console.error('[LiveChat] Insert error:', error);
                throw error;
            }

            console.log('[LiveChat] Message sent successfully:', data);

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
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-blue-500/50 transition-shadow"
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Admin Support</h3>
                                    <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Response time: ~15 mins
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Notice Section */}
                        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                            <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">
                                System Notice: Pesan akan dihapus otomatis setelah 24 jam untuk keamanan.
                            </p>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium mb-2">
                                        Butuh bantuan?
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Kirim pesan dan admin akan segera membantu Anda
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.sender_role === 'member' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender_role === 'member'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                            <p className={`text-xs mt-1 ${msg.sender_role === 'member' ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ketik pesan Anda..."
                                    rows={1}
                                    className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LiveChat;
