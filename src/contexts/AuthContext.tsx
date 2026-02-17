import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '../lib/auth';
import { getCurrentUserProfile } from '../lib/auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    setUser: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for admin in localStorage
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            setUser(JSON.parse(adminUser));
            setLoading(false);
            return;
        }

        // Check for member auth
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadUserProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUserProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (authUser: User) => {
        const { data: profile } = await getCurrentUserProfile(authUser.id);
        if (profile) {
            // Check if banned
            if (profile.is_banned) {
                await supabase.auth.signOut();
                setUser(null);
                setLoading(false);
                alert('Akun Anda telah dinonaktifkan oleh administrator.');
                return;
            }

            // Auto-migrate: If premium but no expiry, set to 30 days from now
            if (profile.is_premium && !profile.premium_until) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);

                await supabase
                    .from('profiles')
                    .update({ premium_until: expiryDate.toISOString() })
                    .eq('id', profile.id);

                profile.premium_until = expiryDate.toISOString();
            }

            setUser({
                id: profile.id,
                email: profile.email,
                role: profile.role,
                full_name: profile.full_name,
                learning_path: profile.learning_path,
                is_premium: profile.is_premium,
                premium_type: profile.premium_type || 'none',
                premium_until: profile.premium_until,
                is_banned: profile.is_banned,
            });
        }
        setLoading(false);
    };

    // Realtime Ban Enforcement
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`ban_check:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    const newProfile = payload.new as any;
                    if (newProfile.is_banned) {
                        supabase.auth.signOut().then(() => {
                            setUser(null);
                            alert('Session Terminated: Akun Anda telah dinonaktifkan oleh administrator.');
                            window.location.href = '/login';
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
