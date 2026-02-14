import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle,
    Send,
    ArrowLeft,
    CheckCheck,
    Loader2,
    Search,
} from 'lucide-react';

interface Message {
    id: string;
    user_id: string;
    sender_role: 'member' | 'admin';
    message: string;
    is_read: boolean;
    created_at: string;
}

interface UserChat {
    user_id: string;
    full_name: string;
    email: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
}

const AdminSupport: React.FC = () => {
    const navigate = useNavigate();
    const [userChats, setUserChats] = useState<UserChat[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadUserChats();

        const channel = supabase
            .channel('admin_support_messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'support_messages',
            }, () => {
                loadUserChats();
                if (selectedUserId) {
                    loadMessages(selectedUserId);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadUserChats = async () => {
        try {
            console.log('[AdminSupport] Loading user chats...');

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log('[AdminSupport] Current Auth ID:', user.id);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                console.log('[AdminSupport] Current Profile Role:', profile?.role);

                if (profile?.role !== 'admin') {
                    console.warn('[AdminSupport] WARNING: This user is NOT an ADMIN!');
                }
            }

            const { data: messagesData, error: msgError } = await supabase
                .from('support_messages')
                .select('user_id, message, created_at, is_read')
                .order('created_at', { ascending: false });

            if (msgError) {
                console.error('[AdminSupport] Error fetching messages:', msgError);
                throw msgError;
            }

            console.log('[AdminSupport] Messages data:', messagesData);
            console.log('[AdminSupport] Total messages:', messagesData?.length || 0);

            if (!messagesData || messagesData.length === 0) {
                console.log('[AdminSupport] No messages found in database');
                setUserChats([]);
                return;
            }

            const userMap = new Map<string, any>();
            messagesData?.forEach(msg => {
                if (!userMap.has(msg.user_id) || new Date(msg.created_at) > new Date(userMap.get(msg.user_id).last_message_time)) {
                    userMap.set(msg.user_id, {
                        user_id: msg.user_id,
                        last_message: msg.message,
                        last_message_time: msg.created_at,
                    });
                }
            });

            const userIds = Array.from(userMap.keys());
            console.log('[AdminSupport] Unique user IDs:', userIds);

            if (userIds.length === 0) {
                setUserChats([]);
                return;
            }

            const { data: profilesData, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            if (profileError) {
                console.error('[AdminSupport] Error fetching profiles:', profileError);
                throw profileError;
            }

            console.log('[AdminSupport] Profiles data:', profilesData);

            const chats: UserChat[] = [];
            for (const profile of profilesData || []) {
                const chatInfo = userMap.get(profile.id);

                const { count: unreadCount } = await supabase
                    .from('support_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id)
                    .eq('sender_role', 'member')
                    .eq('is_read', false);

                chats.push({
                    user_id: profile.id,
                    full_name: profile.full_name || 'Unknown User',
                    email: profile.email || '',
                    last_message: chatInfo.last_message,
                    last_message_time: chatInfo.last_message_time,
                    unread_count: unreadCount || 0,
                });
            }

            chats.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
            console.log('[AdminSupport] Final chats:', chats);
            setUserChats(chats);
        } catch (error) {
            console.error('[AdminSupport] Error loading user chats:', error);
            alert('Error loading chats. Check console for details.');
        }
    };

    const loadMessages = async (userId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);

            await supabase
                .from('support_messages')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('sender_role', 'member')
                .eq('is_read', false);

            loadUserChats();
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUserId) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('support_messages')
                .insert([{
                    user_id: selectedUserId,
                    sender_role: 'admin',
                    message: newMessage.trim(),
                }]);

            if (error) throw error;

            setNewMessage('');
            loadMessages(selectedUserId);
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert('Gagal mengirim pesan. Silakan coba lagi.');
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

    const selectedChat = userChats.find(chat => chat.user_id === selectedUserId);

    const filteredChats = userChats.filter(chat =>
        chat.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 rounded-lg transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Live Support</h1>
                        <p className="text-gray-600">Kelola chat dengan member</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Search */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari user..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {/* User List */}
                            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                                {filteredChats.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <MessageCircle className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">Belum ada chat</p>
                                        <p className="text-xs text-gray-500 mt-1">Member belum mengirim pesan</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredChats.map((chat) => (
                                            <button
                                                key={chat.user_id}
                                                onClick={() => {
                                                    setSelectedUserId(chat.user_id);
                                                    loadMessages(chat.user_id);
                                                }}
                                                className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${selectedUserId === chat.user_id
                                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                                    : 'border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                            {chat.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-gray-900 truncate">{chat.full_name}</div>
                                                            <div className="text-xs text-gray-500 truncate">{chat.email}</div>
                                                        </div>
                                                    </div>
                                                    {chat.unread_count > 0 && (
                                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {chat.unread_count}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 truncate mb-1">{chat.last_message}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(chat.last_message_time).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: '700px' }}>
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-6 border-b border-gray-100 bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                {selectedChat.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{selectedChat.full_name}</h3>
                                                <p className="text-sm text-gray-500">{selectedChat.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                        {loading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                    <MessageCircle className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">Belum ada pesan</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {messages.map((msg) => (
                                                    <motion.div
                                                        key={msg.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender_role === 'admin'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-gray-900 border border-gray-200'
                                                            }`}>
                                                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                                                            <div className="flex items-center justify-end gap-1 mt-2">
                                                                <p className={`text-xs ${msg.sender_role === 'admin' ? 'text-blue-100' : 'text-gray-500'
                                                                    }`}>
                                                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                                {msg.sender_role === 'admin' && msg.is_read && (
                                                                    <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Input */}
                                    <div className="p-6 bg-white border-t border-gray-100">
                                        <div className="flex items-end gap-3">
                                            <textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Ketik pesan Anda..."
                                                rows={2}
                                                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                disabled={!newMessage.trim() || sending}
                                                className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                            >
                                                {sending ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Tekan Enter untuk mengirim
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-gray-50">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                        <MessageCircle className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Chat</h3>
                                    <p className="text-sm text-gray-600">
                                        Pilih user dari daftar untuk memulai percakapan
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
