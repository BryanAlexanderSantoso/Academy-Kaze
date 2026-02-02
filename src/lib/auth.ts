import { supabase } from './supabase';

export interface AuthUser {
    id: string;
    email: string;
    role: 'admin' | 'member';
    full_name: string;
    learning_path?: 'fe' | 'be' | 'fs' | null;
    is_premium?: boolean;
    premium_until?: string | null;
}

// Admin login with numeric password
export const adminLogin = async (password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '159159';

    if (password !== adminPassword) {
        return { success: false, error: 'Invalid admin password' };
    }

    // Return admin user object (no database call needed)
    return {
        success: true,
        user: {
            id: 'admin',
            email: 'admin@kazedev.com',
            role: 'admin',
            full_name: 'Administrator',
            is_premium: true,
        }
    };
};

// Member signup
export const signUp = async (email: string, password: string, fullName: string) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) throw error;

        // Create profile
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        full_name: fullName,
                        role: 'member',
                        progress_percentage: 0,
                    }
                ]);

            if (profileError) throw profileError;
        }

        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
};

// Member login
export const signIn = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
};

// Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Get current user profile
export const getCurrentUserProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
};

// Update learning path
export const updateLearningPath = async (userId: string, learningPath: 'fe' | 'be' | 'fs') => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ learning_path: learningPath })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
};

// Reset password request
export const resetPassword = async (email: string) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

// Update password
export const updatePassword = async (newPassword: string) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

