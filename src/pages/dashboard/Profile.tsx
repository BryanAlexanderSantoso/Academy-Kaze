import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Code2, Save, TrendingUp, Crown, ShieldCheck, XCircle, AlertTriangle, Clock, Activity, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user?.id)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setUser({ ...user!, full_name: data.full_name });
                setMessage('Profil berhasil diperbarui!');
            }
        } catch (error: any) {
            setMessage('Error memperbarui profil: ' + error.message);
        }

        setSaving(false);
    };

    const handleCancelPremium = async () => {
        setCancelling(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_premium: false,
                    premium_type: 'none',
                    premium_until: null,
                })
                .eq('id', user?.id);

            if (error) throw error;

            // Update local state
            setUser({
                ...user!,
                is_premium: false,
                premium_type: 'none',
                premium_until: undefined,
            });

            setCancelSuccess(true);
            setShowCancelConfirm(false);
        } catch (error: any) {
            console.error('Error cancelling premium:', error);
            alert('Gagal membatalkan premium: ' + (error.message || 'Unknown error'));
        } finally {
            setCancelling(false);
        }
    };

    const getPathInfo = () => {
        switch (user?.learning_path) {
            case 'fe':
                return {
                    name: 'Frontend Development',
                    color: 'indigo',
                    description: 'HTML, CSS, JavaScript, React',
                };
            case 'be':
                return {
                    name: 'Backend Development',
                    color: 'emerald',
                    description: 'Node.js, Databases, APIs',
                };
            case 'fs':
                return {
                    name: 'Fullstack Development',
                    color: 'purple',
                    description: 'Frontend + Backend',
                };
            case 'seo':
                return {
                    name: 'SEO Specialist',
                    color: 'amber',
                    description: 'Technical SEO, Content Strategy, Analytics',
                };
            default:
                return { name: 'Belum Terdaftar', color: 'gray', description: '' };
        }
    };

    const pathInfo = getPathInfo();

    return (
        <div className="space-y-16 pb-20">
            <div className="flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">
                    <User className="w-4 h-4" />
                    Identitas Digital
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                    Informasi <br />
                    <span className="text-indigo-600">Akun</span>
                </h1>
                <p className="text-gray-400 text-lg font-medium italic">Kelola profil personal dan status langganan Anda dalam satu terminal.</p>
            </div>

            {/* Profile Overview Stage */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-[60px] p-12 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Activity size={240} className="text-indigo-600" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12 mb-16">
                    <div className="relative group/avatar">
                        <div className={`w-36 h-36 rounded-[45px] flex items-center justify-center text-white text-5xl font-black italic transform -rotate-3 group-hover/avatar:rotate-3 transition-transform duration-500 shadow-2xl ${pathInfo.color === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/30' :
                            pathInfo.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/30' :
                                pathInfo.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30' :
                                    pathInfo.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/30' :
                                        'bg-gradient-to-br from-gray-500 to-gray-700'
                            }`}>
                            {(user?.full_name?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-gray-100">
                            <Activity className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">{user?.full_name}</h2>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium italic">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </div>
                            <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${pathInfo.color === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                pathInfo.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    pathInfo.color === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        pathInfo.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>
                                SECTOR: {pathInfo.name}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 group/stat hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Code2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jalur Belajar</h3>
                        </div>
                        <p className="text-sm font-black text-gray-900 italic tracking-tighter leading-relaxed uppercase">{pathInfo.description}</p>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 group/stat hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress Global</h3>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black text-gray-900 italic tracking-tighter tabular-nums leading-none">0</span>
                            <span className="text-2xl font-black text-indigo-600 italic tracking-tighter leading-none mb-1">%</span>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 group/stat hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${user?.is_premium ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                                <Crown className="w-5 h-5" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Otoritas</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xl font-black text-gray-900 tracking-tighter italic uppercase flex items-center gap-2">
                                {user?.is_premium
                                    ? (user.premium_type === 'premium_plus' ? 'PREMIUM+ ACCESS' : 'PREMIUM ACCESS')
                                    : 'FREE_ACCESS_ZONE'
                                }
                                {user?.is_premium && (
                                    <span className={`text-[10px] px-2 py-1 rounded-xl font-black shadow-xl italic ${user.premium_type === 'premium_plus'
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-500/20'
                                        : 'bg-indigo-600 text-white shadow-indigo-500/20'
                                        }`}>
                                        {user.premium_type === 'premium_plus' ? 'PLUS' : 'PRO'}
                                    </span>
                                )}
                            </p>
                            {user?.is_premium && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border italic ${user.premium_until ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {(() => {
                                        if (!user.premium_until) return 'Akses Selamanya';
                                        const today = new Date();
                                        const expiry = new Date(user.premium_until);
                                        if (expiry < today) return 'KEDALUWARSA';
                                        const diffTime = expiry.getTime() - today.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        return `${diffDays} HARI TERSISA`;
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Edit Profile Stage */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="bg-white border border-gray-100 rounded-[60px] p-12 shadow-sm relative overflow-hidden group"
                >
                    <div className="space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Konfigurasi <br /><span className="text-indigo-600">Bio</span></h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 italic">
                                    NAMA LENGKAP PENGGUNA
                                </label>
                                <div className="relative group/input">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-[30px] py-6 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest focus:ring-[15px] focus:ring-indigo-600/5 focus:bg-white transition-all shadow-inner italic"
                                        placeholder="Masukkan nama lengkap Anda..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 italic">
                                    ALAMAT_EMAIL (READ_ONLY)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-200" />
                                    <input
                                        type="email"
                                        value={user?.email}
                                        className="w-full bg-gray-50/50 border-none rounded-[30px] py-6 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest text-gray-300 cursor-not-allowed italic"
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <p className="mt-4 text-[9px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2 italic">
                                    <AlertTriangle size={14} className="text-amber-300" />
                                    Endpoint email tidak dapat dimodifikasi sistem
                                </p>
                            </div>

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-6 rounded-[30px] text-[10px] font-black uppercase tracking-widest italic ${message.includes('Error')
                                        ? 'bg-red-50 text-red-700 border border-red-100'
                                        : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                        }`}
                                >
                                    {message}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={saving || fullName === user?.full_name}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white font-black py-6 rounded-[30px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'MENYIMPAN...' : 'EXECUTE_UPDATE'}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Subscription Management Stage */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="bg-white border border-gray-100 rounded-[60px] p-12 shadow-sm relative overflow-hidden group flex flex-col justify-between"
                >
                    <div className="space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Status <br /><span className="text-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Premium</span></h2>
                        </div>

                        {cancelSuccess ? (
                            <div className="p-10 bg-gray-50 rounded-[45px] border border-gray-100 text-center space-y-8">
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-xl">
                                    <XCircle className="w-10 h-10 text-gray-200" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-3">OTORITAS_DICABUT</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">Akun Anda telah didegradasi ke akses gratis. Anda masih memiliki akses terbatas ke modul pendahuluan.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/premium')}
                                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-[25px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                                >
                                    PULIHKAN_AKSES
                                </button>
                            </div>
                        ) : user?.is_premium ? (
                            <div className="space-y-10">
                                <div className={`p-10 rounded-[45px] border-2 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 ${user.premium_type === 'premium_plus'
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400'
                                    : 'bg-gradient-to-br from-indigo-600 to-indigo-800 border-indigo-400'
                                    }`}>
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform rotate-12 scale-150">
                                        {user.premium_type === 'premium_plus' ? <Crown size={120} /> : <ShieldCheck size={120} />}
                                    </div>

                                    <div className="flex items-center gap-6 mb-10 relative z-10">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[25px] flex items-center justify-center shadow-xl">
                                            {user.premium_type === 'premium_plus'
                                                ? <Crown className="w-8 h-8 text-white" />
                                                : <ShieldCheck className="w-8 h-8 text-white" />}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none">
                                                {user.premium_type === 'premium_plus' ? 'PREMIUM+' : 'PREMIUM'}
                                            </h3>
                                            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">STATUS: FULL_AUTHORITY</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        {[
                                            { label: 'Tier', value: user.premium_type === 'premium_plus' ? '✨ PLUS' : '🛡️ PRO' },
                                            { label: 'Status', value: 'ONLINE', isStatus: true },
                                            { label: 'Path', value: pathInfo.name },
                                            { label: 'Expiry', value: user.premium_until ? new Date(user.premium_until).toLocaleDateString() : '∞ PERMANENT' },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-4 bg-white/10 backdrop-blur-md rounded-[22px] border border-white/10">
                                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className={`text-[11px] font-black text-white tracking-widest uppercase italic flex items-center gap-2 ${stat.isStatus ? 'text-green-300' : ''}`}>
                                                    {stat.isStatus && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                                                    {stat.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-red-50 rounded-[40px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-8 group/danger">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover/danger:rotate-12 transition-transform">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-black text-red-800 uppercase tracking-widest italic leading-none mb-2">TERMINASI_PREMIUM</h4>
                                            <p className="text-[10px] text-red-400 font-medium italic">Pencabutan status akan berdampak langsung pada hilangnya akses modul eksklusif.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="w-full md:w-auto px-8 py-5 bg-white text-red-600 font-black text-[10px] rounded-2xl border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase tracking-widest shadow-xl shadow-red-500/5 italic"
                                    >
                                        BATALKAN_AKSES
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 bg-gray-50 rounded-[50px] border border-gray-100 text-center space-y-10 group/free">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl"
                                >
                                    <ShieldCheck className="w-10 h-10 text-indigo-200 group-hover/free:text-indigo-600 transition-colors" />
                                </motion.div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">AKSES_TERBATAS</h3>
                                    <p className="text-sm text-gray-400 font-medium italic leading-relaxed">Upgrade ke level otonom untuk membuka seluruh enkripsi materi dan fitur akselerasi karir.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/premium')}
                                    className="w-full bg-indigo-600 text-white font-black py-5 rounded-[25px] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                                >
                                    LIHAT_OPSI_UPGRADE
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            onClick={() => !cancelling && setShowCancelConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className="relative w-full max-w-xl bg-white rounded-[60px] shadow-2xl p-16 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-red-600 rounded-full" />

                            <div className="text-center mb-12">
                                <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-4xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">PROTOKOL_TERMINASI</h3>
                                <p className="text-gray-400 font-medium italic">Tindakan ini akan mengakibatkan dekripsi permanen pada aset premium Anda.</p>
                            </div>

                            <div className="bg-red-50/50 rounded-[40px] border border-red-100 p-10 mb-10 space-y-6">
                                <p className="text-[10px] font-black text-red-800 uppercase tracking-[0.2em] italic mb-4">KEHILANGAN_DATA_AKSES:</p>
                                <ul className="space-y-4">
                                    {[
                                        'SELURUH LIBRARY MATERI EKSKLUSIF',
                                        user?.premium_type === 'premium_plus' ? 'AKSES LINTAS_SECTOR TEKNOLOGI' : 'MODUL PASCA PENDAHULUAN',
                                        'OOTORITAS STATUS PREMIUM DASHBOARD',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-4 text-[11px] font-black text-red-700 italic uppercase">
                                            <XCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    disabled={cancelling}
                                    className="flex-1 py-6 bg-gray-100 text-gray-400 font-black text-[10px] rounded-[25px] hover:bg-gray-200 hover:text-gray-900 transition-all uppercase tracking-[0.3em] disabled:opacity-30 italic"
                                >
                                    ABORT_TERMINATION
                                </button>
                                <button
                                    onClick={handleCancelPremium}
                                    disabled={cancelling}
                                    className="flex-1 py-6 bg-red-600 text-white font-black text-[10px] rounded-[25px] hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.3em] italic"
                                >
                                    {cancelling ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'CONFIRM_EXECUTION'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
