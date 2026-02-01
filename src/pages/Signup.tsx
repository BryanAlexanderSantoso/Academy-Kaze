import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Mail, Lock, User, ArrowRight,
    Sparkles, ShieldCheck, Zap, ChevronRight, AlertCircle,
    UserPlus, Shapes, Shield, Fingerprint, Activity
} from 'lucide-react';

const Signup: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error: signUpError } = await signUp(email, password, fullName);

        if (signUpError) {
            setError(signUpError);
            setLoading(false);
            return;
        }

        if (data) {
            navigate('/onboarding');
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
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Architectural Studio</p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <h1 className="text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter uppercase italic">
                                JOIN THE <br />
                                <span className="text-indigo-600">ELITE Force.</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm italic">
                                Enroll in the industry's most rigorous training environment. Master the craft, validate your skills, and architect the future.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 gap-6">
                        <div className="flex items-center gap-6 p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Performance Load</p>
                                <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">Industrial Grade</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 group">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Validation Sync</p>
                                <p className="text-xl font-black text-gray-900 tracking-tighter uppercase">Verified Logic</p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Icon */}
                    <Fingerprint className="absolute -bottom-20 -left-20 w-80 h-80 text-indigo-600/5 rotate-12" />
                </div>

                {/* Right Side: Signup Form */}
                <div className="p-10 md:p-20 flex flex-col justify-center bg-white">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8">
                            <Activity className="w-3.5 h-3.5" />
                            Sector_Authorization
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Initiate Enrollment</h3>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-tight">Access the command terminal via designated credentials.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Identity designation</label>
                            <div className="relative group/input">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-black text-gray-900 transition-all shadow-inner placeholder:text-gray-200 uppercase tracking-widest"
                                    placeholder="Alexander Kaze"
                                    required
                                />
                            </div>
                        </div>

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
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Security Cipher Key</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-black text-gray-900 transition-all shadow-inner placeholder:text-gray-200"
                                    placeholder="••••••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-6">Minimum security load: 06_Bits</p>
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
                                {loading ? 'SYNCING_DATA...' : 'AUTHORIZE_ENROLLMENT'}
                                {!loading && <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                            Already integrated?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors border-b-2 border-indigo-100 hover:border-indigo-600">
                                Sign_In_Terminal
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Aesthetic Accents */}
            <div className="fixed top-1/2 left-10 -translate-y-1/2 hidden 2xl:block opacity-5">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[1em] rotate-180" style={{ writingMode: 'vertical-rl' }}>ENROLLMENT_ALPHA_NODE</p>
            </div>
        </div>
    );
};

export default Signup;
