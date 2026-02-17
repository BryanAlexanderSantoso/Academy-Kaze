import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'member';
    learning_path: 'fe' | 'be' | 'fs' | null;
    is_premium: boolean;
    premium_type: 'none' | 'premium' | 'premium_plus';
    premium_until: string | null;
    progress_percentage: number;
    created_at: string;
}

export interface PremiumPayment {
    id: string;
    user_id: string;
    full_name: string;
    payment_method: string;
    transaction_id?: string;
    amount: number;
    original_amount?: number;
    proof_url: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_feedback?: string;
    premium_type: 'premium' | 'premium_plus';
    promo_code?: string;
    discount_percent?: number;
    created_at: string;
    updated_at: string;
}

export interface Promo {
    id: string;
    code: string;
    discount_percent: number;
    description?: string;
    is_active: boolean;
    max_usage?: number | null;
    current_usage: number;
    valid_from: string;
    valid_until?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    category: 'fe' | 'be' | 'fs';
    content_body: string;
    schedule_date: string;
    created_at: string;
    thumbnail_url?: string;
    duration_hours?: number;
    is_published: boolean;
}

export interface Assignment {
    id: string;
    student_id: string;
    course_id: string;
    submission_link: string | null;
    grade: number | null;
    feedback: string | null;
    submitted_at: string | null;
    due_date: string | null;
    created_at: string;
    student?: Profile;
    course?: Course;
}

export interface CourseChapter {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    content_body: string | null;
    order_index: number;
    material_type: 'file' | 'link' | 'text';
    file_url: string | null;
    file_name: string | null;
    is_preview: boolean;
    created_at: string;
    updated_at: string;
}

// Question Types
export type QuestionType =
    | 'multiple_choice'
    | 'checkbox'
    | 'short_answer'
    | 'long_answer'
    | 'rating'
    | 'linear_scale';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean; // For auto-grading
}

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    description?: string;
    options?: QuestionOption[]; // For multiple choice, checkbox
    required: boolean;
    points?: number; // For grading
    minValue?: number; // For linear scale
    maxValue?: number; // For linear scale
    minLabel?: string; // For linear scale
    maxLabel?: string; // For linear scale
}

export interface Questionnaire {
    id: string;
    title: string;
    description?: string;
    questions_json: Question[];
    target_learning_paths: ('fe' | 'be' | 'fs')[];
    target_student_ids?: string[] | null;
    due_date?: string;
    is_published: boolean;
    allow_late_submission: boolean;
    show_correct_answers: boolean;
    max_attempts: number;
    time_limit_minutes?: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface QuestionnaireResponse {
    id: string;
    questionnaire_id: string;
    student_id: string;
    answers_json: Record<string, any>; // { questionId: answer }
    score?: number;
    max_score?: number;
    feedback?: string;
    attempt_number: number;
    started_at: string;
    submitted_at?: string;
    time_spent_seconds?: number;
    is_graded: boolean;
    graded_by?: string;
    graded_at?: string;
    student?: Profile;
    questionnaire?: Questionnaire;
}
