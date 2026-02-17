import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    CheckCircle,
    AlertCircle,
    Clock,
    ShieldCheck,
    ArrowLeft,
    Info,
    Upload,
    X,
    ImageIcon,
    Crown,
    Zap,
    Star,
    BookOpen,
    Globe,
    Tag,
    Sparkles,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRICES = {
    premium: 12000,
    premium_plus: 25000,
};

const PremiumPayment: React.FC = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [existingPayments, setExistingPayments] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Tier & Promo state
    const [selectedTier, setSelectedTier] = useState<'premium' | 'premium_plus'>('premium');
    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string;
        discount_percent: number;
        description?: string;
    } | null>(null);
    const [promoError, setPromoError] = useState('');

    // Cancel state
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    useEffect(() => {
        if (user) loadExistingPayments();
    }, [user]);

    const loadExistingPayments = async () => {
        const { data } = await supabase
            .from('premium_payments')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (data) setExistingPayments(data);
    };

    const getBasePrice = () => PRICES[selectedTier];

    const getFinalPrice = () => {
        const base = getBasePrice();
        if (appliedPromo) {
            return Math.round(base * (1 - appliedPromo.discount_percent / 100));
        }
        return base;
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        setAppliedPromo(null);

        try {
            const { data, error } = await supabase
                .from('promos')
                .select('*')
                .eq('code', promoCode.toUpperCase().trim())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setPromoError('Kode promo tidak valid atau sudah tidak aktif.');
                setPromoLoading(false);
                return;
            }

            // Check expiry
            if (data.valid_until && new Date(data.valid_until) < new Date()) {
                setPromoError('Kode promo sudah kadaluarsa.');
                setPromoLoading(false);
                return;
            }

            // Check usage limit
            if (data.max_usage !== null && data.current_usage >= data.max_usage) {
                setPromoError('Kode promo sudah mencapai batas penggunaan.');
                setPromoLoading(false);
                return;
            }

            setAppliedPromo({
                code: data.code,
                discount_percent: data.discount_percent,
                description: data.description,
            });
        } catch {
            setPromoError('Gagal memeriksa kode promo.');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file maksimal 5MB');
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleManualPayment = async () => {
        if (!selectedFile) {
            alert('Mohon upload bukti transfer terlebih dahulu.');
            return;
        }

        setLoading(true);
        try {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, selectedFile);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error('Gagal mengupload bukti pembayaran. Pastikan bucket "payment-proofs" tersedia.');
            }

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath);

            const finalAmount = getFinalPrice();
            const baseAmount = getBasePrice();

            // Create Payment Record
            const { error: insertError } = await supabase.from('premium_payments').insert([{
                user_id: user?.id,
                full_name: user?.full_name,
                payment_method: 'manual_transfer',
                transaction_id: `MANUAL-${Date.now()}`,
                amount: finalAmount,
                original_amount: baseAmount,
                proof_url: publicUrl,
                status: 'pending',
                premium_type: selectedTier,
                promo_code: appliedPromo?.code || null,
                discount_percent: appliedPromo?.discount_percent || 0,
            }]);

            if (insertError) throw insertError;

            // Increment promo usage if applied
            if (appliedPromo) {
                const { data: promoData } = await supabase
                    .from('promos')
                    .select('current_usage')
                    .eq('code', appliedPromo.code)
                    .single();
                if (promoData) {
                    await supabase
                        .from('promos')
                        .update({ current_usage: (promoData.current_usage || 0) + 1 })
                        .eq('code', appliedPromo.code);
                }
            }

            setSubmitted(true);
            loadExistingPayments();
            handleClearFile();
            handleRemovePromo();
        } catch (error: any) {
            console.error('Payment Error:', error);
            alert(`Terjadi kesalahan: ${error.message || 'Gagal mengirim pembayaran'}`);
        } finally {
            setLoading(false);
        }
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

    // User already has premium
    if (user?.is_premium) {
        const isPremiumPlus = user.premium_type === 'premium_plus';
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`card text-center p-12 rounded-[2rem] border-2 ${isPremiumPlus
                        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200'
                        : 'bg-gradient-to-br from-green-50 to-white border-green-200'}`}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${isPremiumPlus
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                        : 'bg-green-500'}`}>
                        {isPremiumPlus ? <Crown className="w-10 h-10 text-white" /> : <ShieldCheck className="w-10 h-10 text-white" />}
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                        {isPremiumPlus ? 'PREMIUM+ AKTIF!' : 'PREMIUM AKTIF!'}
                    </h2>
                    <p className={`text-sm font-bold mb-4 px-4 py-1.5 rounded-full inline-block ${isPremiumPlus ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {isPremiumPlus ? '🌟 Akses Semua Materi Tanpa Batas' : '📚 Akses Materi Learning Path Anda'}
                    </p>
                    {user?.is_premium && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-6 border ${user.premium_until ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                            {user.premium_until ? <Clock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            {(() => {
                                if (!user.premium_until) return 'LIFETIME ACCESS';
                                const today = new Date();
                                const expiry = new Date(user.premium_until);
                                if (expiry < today) return 'EXPIRED';
                                const diffTime = expiry.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return `${diffDays} HARI TERSISA`;
                            })()}
                        </div>
                    )}
                    <p className="text-gray-600 mb-8">
                        {isPremiumPlus
                            ? 'Selamat! Akun Anda memiliki akses penuh ke SEMUA materi di SEMUA learning path.'
                            : 'Selamat! Akun Anda memiliki akses ke semua materi di learning path Anda.'}
                    </p>

                    {/* If user is Premium (not Plus), offer upgrade */}
                    {!isPremiumPlus && (
                        <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-5 h-5 text-amber-600" />
                                <span className="font-black text-amber-800 text-sm">Upgrade ke Premium+?</span>
                            </div>
                            <p className="text-xs text-amber-700 mb-3">Mau akses materi dari semua learning path? Upgrade ke Premium+!</p>
                            <button
                                onClick={() => {
                                    setSelectedTier('premium_plus');
                                    // Redirect to payment section by scrolling or state
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                            >
                                UPGRADE SEKARANG
                            </button>
                        </div>
                    )}

                    <button onClick={() => navigate('/dashboard/courses')} className="btn-primary w-full mb-4">
                        LANJUT BELAJAR SEKARANG
                    </button>

                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="text-xs text-red-500 font-bold hover:underline opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Batalkan Langganan Premium
                    </button>
                </motion.div>

                {/* Cancel Confirmation Modal (Duplicate for the Premium-Active view) */}
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
                                    <p className="text-sm text-gray-600">Akses premium Anda akan segera dicabut.</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={cancelling}
                                        className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        Tidak
                                    </button>
                                    <button
                                        onClick={handleCancelPremium}
                                        disabled={cancelling}
                                        className="flex-1 py-3.5 bg-red-600 text-white font-bold text-sm rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {cancelling ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Ya, Batalkan'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-6 mb-8 md:mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-fit p-3 md:p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-3xl transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-1">Elite Access Activation</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium">Pilih paket yang sesuai kebutuhanmu dan mulai karir profesional.</p>
                </div>
            </div>

            {/* Tier Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Premium Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedTier('premium')}
                    className={`relative cursor-pointer rounded-[2rem] p-8 transition-all duration-500 border-2 ${selectedTier === 'premium'
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-white shadow-2xl shadow-indigo-500/10 scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg'}`}
                >
                    {selectedTier === 'premium' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-600/30">
                                SELECTED
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Premium</h3>
                            <p className="text-xs text-gray-500 font-medium">Learning Path Fokus</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-gray-900">Rp {PRICES.premium.toLocaleString()}</span>
                            <span className="text-sm text-gray-400">/lifetime</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {[
                            { icon: BookOpen, text: 'Akses semua materi di learning path pilihanmu' },
                            { icon: CheckCircle, text: 'Bab 1 + semua bab selanjutnya terbuka' },
                            { icon: Star, text: 'Akses lifetime, bayar sekali selamanya' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <f.icon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{f.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Info className="w-3 h-3" />
                        <span>Hanya bisa akses materi yang sesuai learning path-mu</span>
                    </div>
                </motion.div>

                {/* Premium+ Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setSelectedTier('premium_plus')}
                    className={`relative cursor-pointer rounded-[2rem] p-8 transition-all duration-500 border-2 overflow-hidden ${selectedTier === 'premium_plus'
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-2xl shadow-amber-500/10 scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-amber-200 hover:shadow-lg'}`}
                >
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />BEST VALUE
                        </span>
                    </div>
                    {selectedTier === 'premium_plus' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/30">
                                SELECTED
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Premium+</h3>
                            <p className="text-xs text-amber-600 font-bold">Akses Tanpa Batas</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-gray-900">Rp {PRICES.premium_plus.toLocaleString()}</span>
                            <span className="text-sm text-gray-400">/lifetime</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {[
                            { icon: Globe, text: 'Akses SEMUA materi dari SEMUA learning path' },
                            { icon: BookOpen, text: 'Frontend, Backend, Fullstack - semuanya!' },
                            { icon: Zap, text: 'Akses lifetime + prioritas fitur baru' },
                            { icon: Star, text: 'Lintas learning path tanpa batasan' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <f.icon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{f.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-600 font-bold">
                        <Crown className="w-3 h-3" />
                        <span>Investasi terbaik untuk developer multi-skill</span>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left: Payment Info + Promo */}
                <div className="space-y-6">
                    {/* Promo Code Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card p-6 md:p-8 rounded-[2rem] border-2 border-purple-100 bg-purple-50/30"
                    >
                        <div className="flex items-center gap-2 text-purple-700 font-bold mb-4">
                            <Tag className="w-5 h-5" />
                            PUNYA KODE PROMO?
                        </div>

                        {appliedPromo ? (
                            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <span className="font-black text-emerald-700 text-lg">{appliedPromo.code}</span>
                                    </div>
                                    <button onClick={handleRemovePromo} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-emerald-600 font-bold">Diskon {appliedPromo.discount_percent}% berhasil diterapkan!</p>
                                {appliedPromo.description && (
                                    <p className="text-xs text-gray-500 mt-1">{appliedPromo.description}</p>
                                )}
                                <div className="mt-3 p-3 bg-emerald-50 rounded-xl">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Harga asli</span>
                                        <span className="text-gray-400 line-through">Rp {getBasePrice().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black mt-1">
                                        <span className="text-emerald-700">Harga setelah diskon</span>
                                        <span className="text-emerald-700">Rp {getFinalPrice().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                                    placeholder="Masukkan kode promo..."
                                    className="flex-1 bg-white border border-purple-200 rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider placeholder:text-gray-300 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 transition-all"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={promoLoading || !promoCode.trim()}
                                    className="px-6 py-3 bg-purple-600 text-white font-black text-xs rounded-2xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                                >
                                    {promoLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'APPLY'}
                                </button>
                            </div>
                        )}
                        {promoError && (
                            <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {promoError}
                            </p>
                        )}
                    </motion.div>

                    {/* Price Summary */}
                    <div className={`text-white p-6 md:p-8 overflow-hidden relative rounded-[2rem] shadow-xl ${selectedTier === 'premium_plus'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                        : 'bg-indigo-600'}`}>
                        <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                        <div className="flex items-center gap-2 mb-2">
                            {selectedTier === 'premium_plus'
                                ? <Crown className="w-5 h-5" />
                                : <ShieldCheck className="w-5 h-5" />}
                            <h3 className="text-lg md:text-xl font-bold">
                                {selectedTier === 'premium_plus' ? 'Premium+' : 'Premium'} — Sekali Bayar
                            </h3>
                        </div>
                        <p className={`text-sm mb-6 ${selectedTier === 'premium_plus' ? 'text-amber-100' : 'text-indigo-100'}`}>
                            {selectedTier === 'premium_plus'
                                ? 'Buka akses ke SEMUA materi di semua learning path.'
                                : 'Buka akses ke semua materi di learning path pilihanmu.'}
                        </p>
                        {appliedPromo ? (
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-lg line-through opacity-60">Rp {getBasePrice().toLocaleString()}</span>
                                    <span className="px-2 py-0.5 bg-white/20 rounded-lg text-xs font-black">-{appliedPromo.discount_percent}%</span>
                                </div>
                                <div className="text-3xl md:text-4xl font-black">Rp {getFinalPrice().toLocaleString()}</div>
                            </div>
                        ) : (
                            <div className="text-3xl md:text-4xl font-black mb-2">Rp {getFinalPrice().toLocaleString()}</div>
                        )}
                        <p className={`text-xs mt-2 ${selectedTier === 'premium_plus' ? 'text-amber-200' : 'text-indigo-200'}`}>
                            Investasi terbaik untuk masa depan Anda.
                        </p>
                    </div>

                    {/* Payment Instructions */}
                    <div className="card border-2 border-yellow-100 bg-yellow-50/30 p-5 md:p-6 space-y-4 rounded-[2rem]">
                        <div className="flex items-center gap-2 text-yellow-700 font-bold">
                            <Info className="w-5 h-5" />
                            CARA PEMBAYARAN MANUAL
                        </div>
                        <ol className="text-sm text-gray-600 space-y-3 list-decimal ml-4">
                            <li>Scan QRIS <b>Bryan Dev</b> di bawah ini.</li>
                            <li>Tentukan nominal <b>Rp {getFinalPrice().toLocaleString()}</b>.</li>
                            <li>Selesaikan pembayaran sampai muncul tanda <b>BERHASIL</b>.</li>
                            <li>Screenshot bukti pembayaran tersebut.</li>
                            <li>Upload buktinya pada form di samping.</li>
                        </ol>
                        <img
                            src="/qris_payment.jpg"
                            alt="QRIS Bryan Dev"
                            className="w-full h-auto rounded-xl shadow-lg border-4 border-white"
                        />
                    </div>
                </div>

                {/* Right: Submission Form */}
                <div className="space-y-6">
                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-6 md:p-8 text-center border-green-200 bg-green-50/50 rounded-[2rem]"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Formulir Terkirim!</h3>
                            <p className="text-gray-600 text-sm mb-2">
                                Terima kasih! Admin akan memverifikasi pembayaran Anda maksimal dalam 1x24 jam.
                            </p>
                            <p className="text-sm font-bold text-indigo-600 mb-6">
                                Paket: {selectedTier === 'premium_plus' ? '✨ Premium+' : '🛡️ Premium'}
                            </p>
                            <button onClick={() => setSubmitted(false)} className="text-indigo-600 font-bold hover:underline">
                                Kirim bukti lain?
                            </button>
                        </motion.div>
                    ) : (
                        <div className="card p-6 md:p-8 rounded-[2rem]">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Pembayaran</h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Paket: <span className={`font-black ${selectedTier === 'premium_plus' ? 'text-amber-600' : 'text-indigo-600'}`}>
                                    {selectedTier === 'premium_plus' ? '✨ Premium+' : '🛡️ Premium'}
                                </span>
                                {appliedPromo && <span className="text-emerald-600 ml-2">• Diskon {appliedPromo.discount_percent}%</span>}
                            </p>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-widest">Upload Bukti Transfer</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg"
                                    />

                                    {!selectedFile ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-40 md:h-48 border-4 border-dashed border-gray-200 rounded-3xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group"
                                        >
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                                                <Upload className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center px-4">Tap untuk pilih gambar</p>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gray-50">
                                            <img src={previewUrl!} alt="Preview" className="w-full h-auto max-h-64 object-contain" />
                                            <button
                                                onClick={handleClearFile}
                                                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-3">
                                                <ImageIcon className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs font-bold text-gray-700 truncate">{selectedFile.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Summary */}
                                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Paket {selectedTier === 'premium_plus' ? 'Premium+' : 'Premium'}</span>
                                        <span className={appliedPromo ? 'line-through text-gray-400' : 'font-bold'}>Rp {getBasePrice().toLocaleString()}</span>
                                    </div>
                                    {appliedPromo && (
                                        <>
                                            <div className="flex justify-between text-sm text-emerald-600">
                                                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Promo {appliedPromo.code}</span>
                                                <span>-{appliedPromo.discount_percent}%</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2">
                                                <div className="flex justify-between text-base font-black text-gray-900">
                                                    <span>Total Bayar</span>
                                                    <span>Rp {getFinalPrice().toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleManualPayment}
                                    disabled={loading || !selectedFile}
                                    className={`w-full py-3 md:py-4 text-base md:text-lg font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-xl transition-all ${selectedTier === 'premium_plus'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20 hover:shadow-amber-500/40'
                                        : 'btn-primary'}`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        'KIRIM BUKTI'
                                    )}
                                </button>
                                <p className="text-[10px] md:text-xs text-center text-gray-400 mt-2">
                                    Pastikan bukti transfer terlihat jelas
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="card p-6 border-2 border-blue-100 bg-blue-50/30 rounded-[2rem]">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Info className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2">Butuh Bantuan?</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Jika Anda mengalami kendala dalam proses pembayaran atau memiliki pertanyaan, silakan hubungi admin melalui live chat.
                                </p>
                                <p className="text-xs text-blue-700 font-medium">
                                    💬 Klik tombol chat di pojok kanan bawah untuk berbicara dengan admin
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tier Comparison */}
                    <div className="card p-6 md:p-8 rounded-[2rem]">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            Perbandingan Paket
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 text-gray-500 font-bold text-xs uppercase">Fitur</th>
                                        <th className="text-center py-3 text-indigo-600 font-black text-xs uppercase">Premium</th>
                                        <th className="text-center py-3 text-amber-600 font-black text-xs uppercase">Premium+</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[
                                        { feature: 'Materi learning path pilihan', premium: true, plus: true },
                                        { feature: 'Akses semua bab (chapter)', premium: true, plus: true },
                                        { feature: 'Akses lifetime', premium: true, plus: true },
                                        { feature: 'Materi lintas learning path', premium: false, plus: true },
                                        { feature: 'Akses materi Frontend', premium: false, plus: true },
                                        { feature: 'Akses materi Backend', premium: false, plus: true },
                                        { feature: 'Akses materi Fullstack', premium: false, plus: true },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="py-3 text-gray-700 font-medium">{row.feature}</td>
                                            <td className="py-3 text-center">
                                                {row.premium
                                                    ? <CheckCircle className="w-5 h-5 text-indigo-500 inline" />
                                                    : <X className="w-5 h-5 text-gray-300 inline" />}
                                            </td>
                                            <td className="py-3 text-center">
                                                {row.plus
                                                    ? <CheckCircle className="w-5 h-5 text-amber-500 inline" />
                                                    : <X className="w-5 h-5 text-gray-300 inline" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Transaction History */}
                    {existingPayments.length > 0 && (
                        <div className="card p-5 md:p-6 rounded-[2rem]">
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                Riwayat Pembayaran
                            </h3>
                            <div className="space-y-3">
                                {existingPayments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${p.status === 'approved' ? 'bg-green-100' :
                                                p.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                                                }`}>
                                                {p.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                                                    p.status === 'rejected' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                                                        <Clock className="w-4 h-4 text-yellow-600" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900">Rp {Number(p.amount).toLocaleString()}</p>
                                                    {p.premium_type && (
                                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.premium_type === 'premium_plus' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                            {p.premium_type === 'premium_plus' ? 'PREMIUM+' : 'PREMIUM'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                                                {p.promo_code && (
                                                    <p className="text-[9px] text-purple-600 font-bold flex items-center gap-1">
                                                        <Tag className="w-2.5 h-2.5" /> {p.promo_code} (-{p.discount_percent}%)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-green-200 text-green-800' :
                                                p.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PremiumPayment;
