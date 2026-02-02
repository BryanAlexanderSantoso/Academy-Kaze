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
            setUser({
                id: profile.id,
                email: profile.email,
                role: profile.role,
                full_name: profile.full_name,
                learning_path: profile.learning_path,
                is_premium: profile.is_premium,
                premium_until: profile.premium_until,
            });
        }
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
