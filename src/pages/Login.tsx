import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Mail, Lock, ShieldCheck,
    Sparkles, Globe, Cpu, ChevronRight, AlertCircle,
    Fingerprint, Shield, Key
} from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError);
            setLoading(false);
            return;
        }

        if (data?.user) {
            const { supabase } = await import('../lib/supabase');
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profile) {
                setUser({
                    id: profile.id,
                    email: profile.email,
                    role: profile.role,
                    full_name: profile.full_name,
                    learning_path: profile.learning_path,
                    is_premium: profile.is_premium,
                });

                if (!profile.learning_path) {
                    navigate('/onboarding');
                } else {
                    navigate('/dashboard');
                }
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-100">
            {/* Architectural Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03]">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-50 blur-[150px] rounded-full" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-50 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[60px] border border-gray-100 shadow-3xl relative z-10 overflow-hidden"
            >
                {/* Left Side: Visual Branding */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gray-50/50 relative overflow-hidden border-r border-gray-100">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Kaze Collective</h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Developer Terminal</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <h1 className="text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter uppercase italic">
                                WELCOME BACK <br />
                                <span className="text-indigo-600">OPERATIVE.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm italic">
                                Access your personalized training environment. Continue your mission towards architectural mastery and fullstack elite status.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-6">
                        <div className="p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 group">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 mb-4">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">System Core</p>
                            <p className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">V.4.2_LNK</p>
                        </div>
                        <div className="p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 group">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 mb-4">
                                <Globe className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Node</p>
                            <p className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">SYMB_ACTIVE</p>
                        </div>
                    </div>

                    {/* Decorative Background Icon */}
                    <Fingerprint className="absolute -bottom-20 -left-20 w-80 h-80 text-indigo-600/5 rotate-12" />
                </div>

                {/* Right Side: Login Form */}
                <div className="p-10 md:p-20 flex flex-col justify-center bg-white">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8">
                            <Key className="w-3.5 h-3.5" />
                            Secure_Credentials
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Access Terminal</h3>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-tight">Synchronize your session to continue the curriculum.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Credential email Uplink</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-black text-gray-900 transition-all shadow-inner placeholder:text-gray-200"
                                    placeholder="IDENTIFIER@COLLECTIVE.DEV"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-4 mr-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Cipher Key</label>
                                <button type="button" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">Recovery</button>
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-black text-gray-900 transition-all shadow-inner placeholder:text-gray-200"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-4 px-6 py-4 bg-red-50 border border-red-100 rounded-[20px] text-red-600 text-xs font-black uppercase tracking-widest"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-black uppercase tracking-[0.3em] py-6 rounded-[30px] shadow-2xl shadow-gray-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden text-[10px] mt-4"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-4">
                                {loading ? 'DECRYPTING...' : 'DECRYPT & ACCESS'}
                                {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="mt-12 text-center space-y-8">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                            New to the collective?{' '}
                            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 transition-colors border-b-2 border-indigo-100 hover:border-indigo-600">
                                Enroll_Now
                            </Link>
                        </p>

                        <div className="flex items-center justify-center gap-6 pt-10 border-t border-gray-50">
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 text-[9px] font-black text-gray-300 hover:text-indigo-500 transition-all uppercase tracking-[0.3em]"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Admin_Gateway
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Aesthetic Accents */}
            <div className="fixed top-1/2 left-10 -translate-y-1/2 hidden 2xl:block opacity-5">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[1em] rotate-180" style={{ writingMode: 'vertical-rl' }}>TERMINAL_SYNC_READY</p>
            </div>
            <div className="fixed bottom-10 right-10 flex gap-4 opacity-5">
                <Sparkles className="w-12 h-12 text-gray-900" />
                <Shield className="w-12 h-12 text-gray-900" />
            </div>
        </div>
    );
};

export default Login;
