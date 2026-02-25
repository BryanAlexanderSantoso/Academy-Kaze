import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/supabase';

export const coursesApi = {
    /**
     * Get all published courses
     * Supports filtering by category/learning path
     */
    async getAll(filters?: { category?: string; isPremium?: boolean; includeUnpublished?: boolean }) {
        let query = supabase
            .from('courses')
            .select('*')
            .order('schedule_date', { ascending: true });

        if (!filters?.includeUnpublished) {
            query = query.eq('is_published', true);
        }

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Course[];
    },

    /**
     * Get specific course by ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Course;
    },

    /**
     * Get recent courses for dashboard
     */
    async getRecent(category?: string, limit = 3) {
        let query = supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('schedule_date', { ascending: true })
            .limit(limit);

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Course[];
    },

    /**
     * Create a new course (for admin)
     */
    async create(course: Partial<Course>) {
        const { data, error } = await supabase
            .from('courses')
            .insert([course])
            .select()
            .single();

        if (error) throw error;
        return data as Course;
    },

    /**
     * Update a course (for admin)
     */
    async update(id: string, updates: Partial<Course>) {
        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Course;
    },

    /**
     * Delete a course (for admin)
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
