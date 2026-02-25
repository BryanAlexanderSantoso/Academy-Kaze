import { supabase } from '../../lib/supabase';
import type { Promo } from '../../lib/supabase';

export const promosApi = {
    /**
     * Get active promo by code
     */
    async getByCode(code: string) {
        const { data, error } = await supabase
            .from('promos')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data as Promo;
    },

    /**
     * Increment promo usage
     */
    async incrementUsage(code: string) {
        const { data: promoData, error: fetchError } = await supabase
            .from('promos')
            .select('current_usage')
            .eq('code', code)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('promos')
            .update({ current_usage: (promoData.current_usage || 0) + 1 })
            .eq('code', code)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all promos (for admin)
     */
    async getAll() {
        const { data, error } = await supabase
            .from('promos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Promo[];
    },

    /**
     * Create a new promo (for admin)
     */
    async create(promo: Partial<Promo>) {
        const { data, error } = await supabase
            .from('promos')
            .insert([promo])
            .select()
            .single();

        if (error) throw error;
        return data as Promo;
    },

    /**
     * Update a promo (for admin)
     */
    async update(id: string, updates: Partial<Promo>) {
        const { data, error } = await supabase
            .from('promos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Promo;
    },

    /**
     * Delete a promo (for admin)
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('promos')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
