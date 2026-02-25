import { supabase } from '../../lib/supabase';
import type { Assignment } from '../../lib/supabase';

export const assignmentsApi = {
    /**
     * Get assignments for a specific student
     */
    async getByStudent(studentId: string) {
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                *,
                course:courses(title, category)
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Assignment[];
    },

    /**
     * Get all assignments (for admin)
     */
    async getAll() {
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                *,
                student:profiles!assignments_student_id_fkey(id, full_name, email, learning_path),
                course:courses(id, title, category)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Assignment[];
    },

    /**
     * Bulk create assignments (for admin)
     */
    async createBulk(assignments: Partial<Assignment>[]) {
        const { data, error } = await supabase
            .from('assignments')
            .insert(assignments)
            .select();

        if (error) throw error;
        return data as Assignment[];
    },

    /**
     * Update an assignment (grading)
     */
    async update(id: string, updates: Partial<Assignment>) {
        const { data, error } = await supabase
            .from('assignments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Assignment;
    },

    /**
     * Submit an assignment
     */
    async submit(assignmentId: string, submissionLink: string) {
        const { data, error } = await supabase
            .from('assignments')
            .update({
                submission_link: submissionLink,
                submitted_at: new Date().toISOString()
            })
            .eq('id', assignmentId)
            .select()
            .single();

        if (error) throw error;
        return data as Assignment;
    },

    /**
     * Get average grade of all graded assignments
     */
    async getAverageGrade() {
        const { data, error } = await supabase
            .from('assignments')
            .select('grade')
            .not('grade', 'is', null);

        if (error) throw error;
        if (!data || data.length === 0) return 0;

        const sum = data.reduce((acc, curr) => acc + (curr.grade || 0), 0);
        return Math.round(sum / data.length);
    }
};
