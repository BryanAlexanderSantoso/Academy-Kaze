import { supabase } from '../../lib/supabase';

export const authApi = {
    /**
     * Admin login with numeric password
     */
    async adminLogin(password: string) {
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '159159';

        if (password !== adminPassword) {
            throw new Error('Invalid admin password');
        }

        // Return admin user object (no database call needed)
        return {
            id: 'admin',
            email: 'admin@kazedev.com',
            role: 'admin' as const,
            full_name: 'Administrator',
            is_premium: true,
        };
    },

    /**
     * Member signup
     */
    async signUp(email: string, password: string, fullName: string) {
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

        return data;
    },

    /**
     * Member login
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Reset password request
     */
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    /**
     * Update password
     */
    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    }
};
