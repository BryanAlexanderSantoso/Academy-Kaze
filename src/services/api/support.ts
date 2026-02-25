import { supabase } from '../../lib/supabase';

export interface Message {
    id: string;
    user_id: string;
    sender_role: 'member' | 'admin';
    message: string;
    is_read: boolean;
    created_at: string;
}

export const supportApi = {
    /**
     * Get recent messages for a specific user
     */
    async getMessages(userId: string, hours = 24) {
        const since = new Date();
        since.setHours(since.getHours() - hours);

        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Message[];
    },

    /**
     * Get all recent messages (for admin chat list)
     */
    async getAllRecentMessages(hours = 24) {
        const since = new Date();
        since.setHours(since.getHours() - hours);

        const { data, error } = await supabase
            .from('support_messages')
            .select('user_id, message, created_at, is_read, sender_role')
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get unread count for a user (from member perspective or admin perspective)
     */
    async getUnreadCount(userId: string, roleToCount: 'member' | 'admin') {
        const { count, error } = await supabase
            .from('support_messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('sender_role', roleToCount)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    /**
     * Mark messages as read
     */
    async markAsRead(userId: string, roleToMark: 'member' | 'admin') {
        const { error } = await supabase
            .from('support_messages')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('sender_role', roleToMark)
            .eq('is_read', false);

        if (error) throw error;
    },

    /**
     * Send a message
     */
    async sendMessage(userId: string, message: string, senderRole: 'member' | 'admin') {
        const { data, error } = await supabase
            .from('support_messages')
            .insert([{
                user_id: userId,
                sender_role: senderRole,
                message: message.trim(),
            }])
            .select()
            .single();

        if (error) throw error;
        return data as Message;
    }
};
