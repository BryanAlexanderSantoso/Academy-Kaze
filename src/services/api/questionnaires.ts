import { supabase } from '../../lib/supabase';
import type { Questionnaire, QuestionnaireResponse } from '../../lib/supabase';

export const questionnairesApi = {
    /**
     * Get all questionnaires
     */
    async getAll() {
        const { data, error } = await supabase
            .from('questionnaires')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Questionnaire[];
    },

    /**
     * Get questionnaire by ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('questionnaires')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Questionnaire;
    },

    /**
     * Create a new questionnaire
     */
    async create(questionnaire: Partial<Questionnaire>) {
        const { data, error } = await supabase
            .from('questionnaires')
            .insert([questionnaire])
            .select()
            .single();

        if (error) throw error;
        return data as Questionnaire;
    },

    /**
     * Update a questionnaire
     */
    async update(id: string, updates: Partial<Questionnaire>) {
        const { data, error } = await supabase
            .from('questionnaires')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Questionnaire;
    },

    /**
     * Delete a questionnaire
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('questionnaires')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Get all responses for a questionnaire (for admin)
     */
    async getResponses(questionnaireId: string) {
        const { data, error } = await supabase
            .from('questionnaire_responses')
            .select(`
                *,
                student:profiles!questionnaire_responses_student_id_fkey(*)
            `)
            .eq('questionnaire_id', questionnaireId);

        if (error) throw error;
        return data;
    },

    /**
     * Update a questionnaire response (grade it)
     */
    async updateResponse(responseId: string, updates: Partial<QuestionnaireResponse>) {
        const { data, error } = await supabase
            .from('questionnaire_responses')
            .update(updates)
            .eq('id', responseId)
            .select()
            .single();

        if (error) throw error;
        return data as QuestionnaireResponse;
    },

    /**
     * Get all published questionnaires
     */
    async getPublished() {
        const { data, error } = await supabase
            .from('questionnaires')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Questionnaire[];
    },

    /**
     * Get all responses for a specific user
     */
    async getUserResponses(userId: string) {
        const { data, error } = await supabase
            .from('questionnaire_responses')
            .select('*')
            .eq('student_id', userId);

        if (error) throw error;
        return data as QuestionnaireResponse[];
    },

    /**
     * Get latest response for a questionnaire and user
     */
    async getLatestUserResponse(questionnaireId: string, userId: string) {
        const { data, error } = await supabase
            .from('questionnaire_responses')
            .select('*')
            .eq('questionnaire_id', questionnaireId)
            .eq('student_id', userId)
            .order('attempt_number', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data as QuestionnaireResponse | null;
    },

    /**
     * Create or update questionnaire response
     */
    async upsertResponse(response: Partial<QuestionnaireResponse>) {
        if (response.id) {
            return this.updateResponse(response.id, response);
        }

        const { data, error } = await supabase
            .from('questionnaire_responses')
            .insert([response])
            .select()
            .single();

        if (error) throw error;
        return data as QuestionnaireResponse;
    }
};
