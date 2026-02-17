import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Code2, Save, TrendingUp, Crown, ShieldCheck, XCircle, AlertTriangle, Clock } from 'lucide-react';
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
                setMessage('Profile updated successfully!');
            }
        } catch (error: any) {
            setMessage('Error updating profile: ' + error.message);
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
                    color: 'primary',
                    description: 'HTML, CSS, JavaScript, React',
                };
            case 'be':
                return {
                    name: 'Backend Development',
                    color: 'backend',
                    description: 'Node.js, Databases, APIs',
                };
            case 'fs':
                return {
                    name: 'Fullstack Development',
                    color: 'fullstack',
                    description: 'Frontend + Backend',
                };
            case 'seo':
                return {
                    name: 'SEO Specialist',
                    color: 'amber',
                    description: 'Technical SEO, Content Strategy, Analytics',
                };
            default:
                return { name: 'Not Selected', color: 'gray', description: '' };
        }
    };

    const pathInfo = getPathInfo();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>

            {/* Profile Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center gap-6 mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold ${pathInfo.color === 'primary' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                        pathInfo.color === 'backend' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                            pathInfo.color === 'fullstack' ? 'bg-gradient-to-br from-violet-500 to-violet-700' :
                                pathInfo.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                                    'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}>
                        {(user?.full_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                        <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${pathInfo.color === 'primary' ? 'bg-blue-100 text-blue-700' :
                            pathInfo.color === 'backend' ? 'bg-emerald-100 text-emerald-700' :
                                pathInfo.color === 'fullstack' ? 'bg-violet-100 text-violet-700' :
                                    pathInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                            {pathInfo.name}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Code2 className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Learning Path</h3>
                        </div>
                        <p className="text-sm text-gray-600">{pathInfo.description}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Progress</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">0%</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Status</h3>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                {user?.is_premium
                                    ? (user.premium_type === 'premium_plus' ? 'PREMIUM+ ACCESS' : 'PREMIUM ACCESS')
                                    : 'FREE TIER'
                                }
                                {user?.is_premium && (
                                    <span className={`text-[10px] px-1.5 rounded font-black ${user.premium_type === 'premium_plus'
                                            ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                                            : 'bg-yellow-400 text-black'
                                        }`}>
                                        {user.premium_type === 'premium_plus' ? 'PLUS' : 'PRO'}
                                    </span>
                                )}
                            </p>
                            {user?.is_premium && (
                                <p className={`text-xs font-bold mt-1 ${user.premium_until ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {(() => {
                                        if (!user.premium_until) return 'Lifetime Access';
                                        const today = new Date();
                                        const expiry = new Date(user.premium_until);
                                        if (expiry < today) return 'Expired';
                                        const diffTime = expiry.getTime() - today.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        return `${diffDays} days remaining`;
                                    })()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Edit Profile Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Full Name - Editable */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-field pl-11"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    {/* Email - Read Only */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="email"
                                value={user?.email}
                                className="input-field pl-11 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                                disabled
                                readOnly
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                            Email address cannot be modified
                        </p>
                    </div>

                    {/* Learning Path - Read Only */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Learning Path
                        </label>
                        <div className="relative">
                            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="text"
                                value={pathInfo.name}
                                className="input-field pl-11 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                                disabled
                                readOnly
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                            Contact administrator to change your learning path
                        </p>
                    </div>

                    {message && (
                        <div
                            className={`p-3 rounded-lg text-sm ${message.includes('Error')
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving || fullName === user?.full_name}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </motion.div>

            {/* Premium Subscription Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Subscription</h2>
                <p className="text-gray-500 text-sm mb-8">Kelola langganan premium Anda</p>

                {cancelSuccess ? (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Telah Dibatalkan</h3>
                        <p className="text-sm text-gray-600 mb-6">Akun Anda telah kembali ke Free Tier. Anda masih bisa mengakses Bab 1 dari setiap course secara gratis.</p>
                        <button
                            onClick={() => navigate('/dashboard/premium')}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                        >
                            Langganan Lagi
                        </button>
                    </div>
                ) : user?.is_premium ? (
                    <div className="space-y-6">
                        {/* Current Plan Info */}
                        <div className={`p-6 rounded-2xl border-2 relative overflow-hidden ${user.premium_type === 'premium_plus'
                                ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200'
                                : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200'
                            }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${user.premium_type === 'premium_plus'
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20'
                                        : 'bg-indigo-600 shadow-indigo-600/20'
                                    }`}>
                                    {user.premium_type === 'premium_plus'
                                        ? <Crown className="w-6 h-6 text-white" />
                                        : <ShieldCheck className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">
                                        {user.premium_type === 'premium_plus' ? 'Premium+' : 'Premium'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {user.premium_type === 'premium_plus'
                                            ? 'Akses semua materi dari semua learning path'
                                            : 'Akses semua materi di learning path Anda'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tier</p>
                                    <p className={`text-sm font-black ${user.premium_type === 'premium_plus' ? 'text-amber-700' : 'text-indigo-700'
                                        }`}>
                                        {user.premium_type === 'premium_plus' ? '✨ Premium+' : '🛡️ Premium'}
                                    </p>
                                </div>
                                <div className="p-3 bg-white/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                    <p className="text-sm font-black text-green-700 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Active
                                    </p>
                                </div>
                                <div className="p-3 bg-white/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Learning Path</p>
                                    <p className="text-sm font-bold text-gray-700">{pathInfo.name}</p>
                                </div>
                                <div className="p-3 bg-white/60 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Berlaku Sampai</p>
                                    <p className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {user.premium_until
                                            ? new Date(user.premium_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : 'Selamanya'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cancel Button */}
                        <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-800 text-sm">Zona Bahaya</h4>
                                    <p className="text-xs text-red-600 mt-1">Membatalkan premium akan langsung menghapus akses premium Anda. Anda tidak akan mendapat refund.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="w-full md:w-auto px-6 py-3 bg-white text-red-600 font-bold text-sm rounded-xl border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
                            >
                                Batalkan Premium
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Punya Premium</h3>
                        <p className="text-sm text-gray-600 mb-6">Upgrade ke premium untuk akses semua materi dan fitur eksklusif lainnya.</p>
                        <button
                            onClick={() => navigate('/dashboard/premium')}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-lg shadow-indigo-600/20"
                        >
                            Lihat Paket Premium
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => !cancelling && setShowCancelConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Yakin Batalkan?</h3>
                                <p className="text-sm text-gray-600">Tindakan ini tidak bisa dibatalkan.</p>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6 space-y-3">
                                <p className="text-sm font-bold text-red-800">Yang akan Anda kehilangan:</p>
                                <ul className="space-y-2">
                                    {[
                                        'Akses ke semua materi premium',
                                        user?.premium_type === 'premium_plus' ? 'Akses lintas learning path' : 'Materi setelah Bab 1',
                                        'Status premium di profil Anda',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-red-700">
                                            <XCircle className="w-4 h-4 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                <p className="text-xs text-gray-500 text-center">
                                    ⚠️ Pembayaran yang sudah dilakukan <b>tidak dapat di-refund</b>. Anda dapat berlangganan lagi kapan saja.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    disabled={cancelling}
                                    className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Batal, Pertahankan
                                </button>
                                <button
                                    onClick={handleCancelPremium}
                                    disabled={cancelling}
                                    className="flex-1 py-3.5 bg-red-600 text-white font-bold text-sm rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {cancelling ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Ya, Batalkan Premium'
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
