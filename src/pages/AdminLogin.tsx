import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ChevronRight, AlertCircle, Fingerprint, Activity } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await adminLogin(password);

        if (!result.success) {
            setError(result.error || 'Invalid clearance level password');
            setLoading(false);
            return;
        }

        if (result.user) {
            localStorage.setItem('adminUser', JSON.stringify(result.user));
            setUser(result.user);
            navigate('/admin/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Dark Tech Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#ffffff 0.5px, transparent 0.5px), linear-gradient(90deg, #ffffff 0.5px, transparent 0.5px)', backgroundSize: '50px 50px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* ID Card Aesthetic */}
                <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-3xl overflow-hidden p-10 relative">
                    {/* Top Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-6 relative">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"
                            />
                            <div className="relative p-6 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 shadow-inner w-24 h-24 flex items-center justify-center overflow-hidden">
                                <img
                                    src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                                    alt="Kaze Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Clearance Entry</h1>
                        <div className="flex items-center justify-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">System Identity Required</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-indigo-400 transition-colors">Access Cipher</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-indigo-500 transition-all" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-mono tracking-widest focus:ring-4 focus:ring-indigo-500/5 focus:bg-white/[0.05] focus:border-indigo-500/30 outline-none transition-all placeholder:text-gray-800"
                                    placeholder="••••••••"
                                    required
                                />
                                <Fingerprint className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-800 pointer-events-none" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-3"
                        >
                            {loading ? 'Authenticating...' : 'Authorize Access'}
                            {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/[0.05] text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            Return to Base Portal
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[8px] font-black text-gray-800 uppercase tracking-[0.5em] leading-relaxed">
                        Authorized Personnel Only <br />
                        Kaze For Developer Command Systems © 2026
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
