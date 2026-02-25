import { supabase } from '../../lib/supabase';
import type { CourseChapter } from '../../lib/supabase';

export const chaptersApi = {
    /**
     * Get chapters for a course
     */
    async getByCourse(courseId: string) {
        const { data, error } = await supabase
            .from('course_chapters')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index');

        if (error) throw error;
        return data as CourseChapter[];
    },

    /**
     * Get chapter total count for landing page
     */
    async getTotalCount() {
        const { count, error } = await supabase
            .from('course_chapters')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    },

    /**
     * Create a new chapter (for admin)
     */
    async create(chapter: Partial<CourseChapter>) {
        const { data, error } = await supabase
            .from('course_chapters')
            .insert([chapter])
            .select()
            .single();

        if (error) throw error;
        return data as CourseChapter;
    },

    /**
     * Update a chapter (for admin)
     */
    async update(id: string, updates: Partial<CourseChapter>) {
        const { data, error } = await supabase
            .from('course_chapters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as CourseChapter;
    },

    /**
     * Delete a chapter (for admin)
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('course_chapters')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Upsert chapters (for admin)
     */
    async upsertChapters(chapters: Partial<CourseChapter>[]) {
        const { data, error } = await supabase
            .from('course_chapters')
            .upsert(chapters)
            .select();

        if (error) throw error;
        return data as CourseChapter[];
    }
};
