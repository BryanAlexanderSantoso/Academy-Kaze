import { supabase } from '../../lib/supabase';
import type { PremiumPayment } from '../../lib/supabase';

export const paymentsApi = {
    /**
     * Submit a new payment proof
     */
    async submitProof(paymentData: Partial<PremiumPayment>) {
        const { data, error } = await supabase
            .from('premium_payments')
            .insert([paymentData])
            .select()
            .single();

        if (error) throw error;
        return data as PremiumPayment;
    },

    /**
     * Get payment history for a user
     */
    async getByUser(userId: string) {
        const { data, error } = await supabase
            .from('premium_payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as PremiumPayment[];
    },

    /**
     * Get all payments (for admin)
     */
    async getAll() {
        const { data, error } = await supabase
            .from('premium_payments')
            .select(`
                *,
                user:profiles(full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as (PremiumPayment & { user: { full_name: string, email: string } })[];
    },

    /**
     * Update payment status (for admin)
     */
    async updateStatus(paymentId: string, status: 'approved' | 'rejected', feedback?: string) {
        const { data, error } = await supabase
            .from('premium_payments')
            .update({ status, admin_feedback: feedback, updated_at: new Date().toISOString() })
            .eq('id', paymentId)
            .select()
            .single();

        if (error) throw error;
        return data as PremiumPayment;
    }
};
