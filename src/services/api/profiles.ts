import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/supabase';

export const profilesApi = {
    /**
     * Get profile by ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Profile;
    },

    /**
     * Update profile
     */
    async update(id: string, updates: Partial<Profile>) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    /**
     * Update user learning path
     */
    async updateLearningPath(userId: string, path: string) {
        return this.update(userId, { learning_path: path as any });
    },

    /**
     * Cancel premium subscription
     */
    async cancelPremium(id: string) {
        return this.update(id, {
            is_premium: false,
            premium_type: 'none',
            premium_until: null,
        });
    },

    /**
     * Get all members (for admin)
     */
    async getAllMembers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'member')
            .order('full_name');

        if (error) throw error;
        return data as Profile[];
    },

    /**
     * Get active student count for landing page
     */
    async getActiveStudentCount() {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'member');

        if (error) throw error;
        return count || 0;
    },

    /**
     * Get premium user count for landing page
     */
    async getPremiumCount() {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_premium', true);

        if (error) throw error;
        return count || 0;
    },

    /**
     * Get all user profiles (for admin)
     */
    async getAll() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Profile[];
    },

    /**
     * Toggle user ban status
     */
    async toggleBan(userId: string, isBanned: boolean) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ is_banned: isBanned })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },

    /**
     * Promote a user to premium (30 days)
     */
    async promoteToPremium(userId: string, type: 'premium' | 'premium_plus') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        return this.update(userId, {
            is_premium: true,
            premium_type: type,
            premium_until: expiryDate.toISOString()
        });
    }
};
