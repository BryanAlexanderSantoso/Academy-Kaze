import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, AlertCircle,
    Key, ChevronRight, CheckCircle2, ArrowLeft
} from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        const { error: resetError } = await resetPassword(email);

        if (resetError) {
            setError(resetError);
        } else {
            setSuccess(true);
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
                className="w-full max-w-xl bg-white rounded-[60px] border border-gray-100 shadow-3xl relative z-10 overflow-hidden p-10 md:p-20"
            >
                <div className="mb-12">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back_to_Access
                    </Link>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-8">
                        <Key className="w-3.5 h-3.5" />
                        Recovery_Protocol
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Reset Cipher</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-tight">Enter your uplink email to receive a recovery link.</p>
                </div>

                {!success ? (
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
                                {loading ? 'SENDING...' : 'SEND RECOVERY LINK'}
                                {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-10"
                    >
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[30px] flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/10">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Transmission Sent</h4>
                            <p className="text-gray-400 font-bold text-sm uppercase tracking-tight leading-relaxed">
                                Recovery uplink has been sent to <br />
                                <span className="text-indigo-600 font-black">{email}</span>
                            </p>
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest max-w-xs mx-auto">
                            Check your inbox and follow the instructions to reset your security cipher.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-3 w-full border-2 border-gray-100 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all py-6 rounded-[30px] text-[10px] font-black uppercase tracking-[0.3em]"
                        >
                            Return_to_Login
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
