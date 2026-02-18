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
    AlertTriangle,
    Activity,
    ChevronRight
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
            <div className="max-w-3xl mx-auto py-20 px-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-white border p-16 rounded-[60px] text-center relative overflow-hidden shadow-2xl ${isPremiumPlus
                        ? 'border-amber-100'
                        : 'border-indigo-100'}`}
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12 scale-150">
                        {isPremiumPlus ? <Crown size={240} className="text-amber-600" /> : <ShieldCheck size={240} className="text-indigo-600" />}
                    </div>

                    <div className={`w-24 h-24 rounded-[35px] flex items-center justify-center mx-auto mb-10 shadow-2xl relative z-10 ${isPremiumPlus
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                        : 'bg-indigo-600 shadow-indigo-600/30'}`}>
                        {isPremiumPlus ? <Crown className="w-12 h-12 text-white" /> : <ShieldCheck className="w-12 h-12 text-white" />}
                    </div>

                    <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase italic tracking-tighter leading-none relative z-10">
                        {isPremiumPlus ? 'PREMIUM+ AKTIF!' : 'PREMIUM AKTIF!'}
                    </h2>

                    <div className="flex flex-col items-center gap-6 relative z-10">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl border italic ${isPremiumPlus ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {isPremiumPlus ? '🌟 AKSES_TANPA_BATAS_TERVERSION' : '📚 AKSES_SECTOR_JALUR_BELAJAR'}
                        </p>

                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-black italic tracking-tight text-lg shadow-inner border ${user.premium_until ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {user.premium_until ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            {(() => {
                                if (!user.premium_until) return 'AKSES_SELAMANYA';
                                const today = new Date();
                                const expiry = new Date(user.premium_until);
                                if (expiry < today) return 'KEDALUWARSA';
                                const diffTime = expiry.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return `${diffDays} HARI TERSISA`;
                            })()}
                        </div>
                    </div>

                    <p className="text-gray-400 font-medium italic mt-10 mb-12 max-w-md mx-auto relative z-10 leading-relaxed">
                        {isPremiumPlus
                            ? 'Selamat! Protokol Premium Plus aktif. Akun Anda memiliki otorisasi penuh ke SEMUA library materi di seluruh sector teknologi.'
                            : 'Selamat! Protokol Premium aktif. Seluruh enkripsi materi di jalur belajar pilihan Anda telah dibuka secara permanen.'}
                    </p>

                    <div className="space-y-4 relative z-10">
                        {!isPremiumPlus && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="mb-10 p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-[40px] text-left relative overflow-hidden group/upgrade"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 rotate-12 group-hover/upgrade:rotate-0 transition-transform duration-700">
                                    <Sparkles size={80} className="text-amber-600" />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Crown className="w-6 h-6 text-amber-600" />
                                    <span className="font-black text-amber-900 text-sm uppercase italic tracking-widest">Upgrade ke Premium+?</span>
                                </div>
                                <p className="text-xs text-amber-700 mb-6 font-medium italic">Butuh fleksibilitas lebih? Buka kunci semua materi dari sector Frontend, Backend, hingga Fullstack sekaligus!</p>
                                <button
                                    onClick={() => setSelectedTier('premium_plus')}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black py-4 rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all uppercase tracking-[0.2em] italic"
                                >
                                    EKSES_SEMUA_SECTOR
                                </button>
                            </motion.div>
                        )}

                        <button
                            onClick={() => navigate('/dashboard/courses')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[30px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                        >
                            LANJUTKAN_DEPLOY_KOMPETENSI
                            <ArrowRight size={18} />
                        </button>

                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-[10px] text-red-400 font-black hover:text-red-600 uppercase tracking-widest italic transition-colors mt-6 block mx-auto underline-offset-8 hover:underline"
                        >
                            Dermatasi Otoritas Premium
                        </button>
                    </div>
                </motion.div>

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
                                className="relative w-full max-w-xl bg-white rounded-[60px] shadow-2xl p-16 overflow-hidden text-center"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-xl">
                                    <AlertTriangle className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">TERMINASI_AKSES?</h3>
                                <p className="text-gray-400 font-medium italic mb-10">Seluruh otorisasi materi akan dikunci kembali secara permanen.</p>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={cancelling}
                                        className="flex-1 py-6 bg-gray-100 text-gray-400 font-black text-[10px] rounded-[25px] hover:bg-gray-200 hover:text-gray-900 transition-all uppercase tracking-[0.3em] italic"
                                    >
                                        BATALKAN_PROSES
                                    </button>
                                    <button
                                        onClick={handleCancelPremium}
                                        disabled={cancelling}
                                        className="flex-1 py-6 bg-red-600 text-white font-black text-[10px] rounded-[25px] hover:bg-red-700 transition-all uppercase tracking-[0.3em] italic shadow-xl shadow-red-500/20"
                                    >
                                        {cancelling ? 'EXECUTING...' : 'YA_TERMINASI'}
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
        <div className="max-w-6xl mx-auto space-y-16 pb-40 px-10">
            {/* Header Stage */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-5 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[25px] transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic mb-3">
                            <Activity className="w-3.5 h-3.5" />
                            Upgrade Protokol
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                            Aktivasi <br />
                            <span className="text-indigo-600">Akses Elit</span>
                        </h1>
                    </div>
                </div>
                <p className="max-w-xs text-gray-400 text-sm font-medium italic text-right hidden md:block">Pilih paket otorisasi yang sesuai dengan kurikulum belajar Anda saat ini.</p>
            </div>

            {/* Tier Grid Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Premium Card */}
                <motion.div
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedTier('premium')}
                    className={`relative cursor-pointer rounded-[60px] p-12 transition-all duration-700 border-2 flex flex-col justify-between h-full ${selectedTier === 'premium'
                        ? 'border-indigo-600 bg-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] ring-[20px] ring-indigo-50'
                        : 'border-gray-50 bg-white hover:border-indigo-100 hover:shadow-2xl'}`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-10">
                            <div className={`w-16 h-16 rounded-[25px] flex items-center justify-center transition-all shadow-2xl ${selectedTier === 'premium' ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-gray-50 text-gray-300'}`}>
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            {selectedTier === 'premium' && (
                                <span className="px-5 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg italic">
                                    TERPILIH
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 mb-10">
                            <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Premium</h3>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">FOCUS_SECTOR_ACCESS</p>
                        </div>

                        <div className="mb-12">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-gray-900 italic tracking-tighter">Rp{PRICES.premium.toLocaleString()}</span>
                                <span className="text-sm font-black text-gray-300 uppercase italic">/lifetime</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: BookOpen, text: 'Akses seluruh modul di jalur belajar pilihan' },
                                { icon: CheckCircle, text: 'Dekripsi semua bab dari awal hingga akhir' },
                                { icon: Star, text: 'Sekali bayar untuk akses selamanya' },
                            ].map((f, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <f.icon className={`w-5 h-5 transition-colors ${selectedTier === 'premium' ? 'text-indigo-600' : 'text-gray-200'}`} />
                                    </div>
                                    <span className="text-sm font-medium italic text-gray-500">{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Premium+ Card */}
                <motion.div
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedTier('premium_plus')}
                    className={`relative cursor-pointer rounded-[60px] p-12 transition-all duration-700 border-2 overflow-hidden flex flex-col justify-between h-full group/plus ${selectedTier === 'premium_plus'
                        ? 'border-amber-400 bg-white shadow-[0_40px_100px_-20px_rgba(251,191,36,0.2)] ring-[20px] ring-amber-50'
                        : 'border-gray-50 bg-white hover:border-amber-100 hover:shadow-2xl'}`}
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12 scale-150 group-hover/plus:rotate-0 transition-transform duration-1000">
                        <Crown size={200} className="text-amber-500" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className={`w-16 h-16 rounded-[25px] flex items-center justify-center transition-all shadow-2xl ${selectedTier === 'premium_plus' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30' : 'bg-gray-50 text-gray-300'}`}>
                                <Crown className="w-8 h-8" />
                            </div>
                            <div className="flex gap-2">
                                <span className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 italic">
                                    <Sparkles className="w-3.5 h-3.5" />PILIHAN_TERBAIK
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-10 relative z-10">
                            <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Premium+</h3>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">TOTAL_SECTOR_OVERRIDE</p>
                        </div>

                        <div className="mb-12 relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-gray-900 italic tracking-tighter">Rp{PRICES.premium_plus.toLocaleString()}</span>
                                <span className="text-sm font-black text-gray-300 uppercase italic">/lifetime</span>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {[
                                { icon: Globe, text: 'Akses SEMUA materi dari SEMUA sector (FE, BE, FS)' },
                                { icon: Zap, text: 'Otorisasi penuh lintas jalur kurikulum' },
                                { icon: Sparkles, text: 'Prioritas akses untuk modul & fitur teknologi terbaru' },
                                { icon: Star, text: 'Mastering multi-stack tanpa batasan gateway' },
                            ].map((f, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <f.icon className={`w-5 h-5 transition-colors ${selectedTier === 'premium_plus' ? 'text-amber-500' : 'text-gray-200'}`} />
                                    </div>
                                    <span className="text-sm font-medium italic text-gray-500">{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Promo & Final Review Stage */}
                <div className="space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-gray-100 p-10 rounded-[50px] shadow-sm space-y-8"
                    >
                        <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] italic">
                            <Tag className="w-4 h-4" />
                            Injeksi Kode Promo
                        </div>

                        {appliedPromo ? (
                            <div className="bg-emerald-50 p-8 rounded-[35px] border border-emerald-100 relative overflow-hidden group/promo">
                                <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 rotate-12 group-hover/promo:rotate-0 transition-transform">
                                    <CheckCircle size={100} className="text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">KODE_AKTIF:</p>
                                        <h4 className="text-3xl font-black text-emerald-900 italic tracking-tighter leading-none">{appliedPromo.code}</h4>
                                    </div>
                                    <button onClick={handleRemovePromo} className="p-4 bg-white text-emerald-600 hover:text-red-500 rounded-2xl shadow-sm transition-all active:scale-90">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm font-medium italic text-emerald-700 italic">Diskon instan {appliedPromo.discount_percent}% telah didekripsi sistem.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                                    placeholder="MASUKKAN KODE..."
                                    className="flex-1 bg-gray-50 border-none rounded-[25px] px-8 py-5 text-[11px] font-black uppercase tracking-widest placeholder:text-gray-200 focus:ring-[15px] focus:ring-indigo-600/5 transition-all italic shadow-inner"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={promoLoading || !promoCode.trim()}
                                    className="px-10 py-5 bg-gray-900 text-white font-black text-[10px] rounded-[25px] hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-[0.3em] italic shadow-xl shadow-gray-900/10"
                                >
                                    {promoLoading ? 'VERIFYING...' : 'APPLY_PAYLOAD'}
                                </button>
                            </div>
                        )}
                        {promoError && (
                            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest italic flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {promoError}
                            </p>
                        )}
                    </motion.div>

                    <div className={`p-12 rounded-[50px] relative overflow-hidden shadow-2xl transition-colors duration-700 ${selectedTier === 'premium_plus'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                        : 'bg-indigo-600'}`}>
                        <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12 scale-[2.5] pointer-events-none">
                            <CreditCard size={200} />
                        </div>

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    {selectedTier === 'premium_plus' ? <Crown className="w-6 h-6 text-white" /> : <ShieldCheck className="w-6 h-6 text-white" />}
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none">
                                        TOTAL_INVESENT_{selectedTier.toUpperCase()}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {appliedPromo && (
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-black text-white/40 line-through italic tracking-tighter leading-none">Rp{getBasePrice().toLocaleString()}</span>
                                            <span className="px-3 py-1 bg-white/20 rounded-xl text-[9px] font-black text-white italic uppercase tracking-widest">-{appliedPromo.discount_percent}% OFF</span>
                                        </div>
                                    )}
                                    <div className="text-6xl font-black text-white italic tracking-tighter leading-none">Rp{getFinalPrice().toLocaleString()}</div>
                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic leading-relaxed">
                                        INVESTASI SEKALI UNTUK AKSES SEUMUR HIDUP DI KAZA FOR DEVELOPER.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-[50px] border border-amber-100 p-10 space-y-8">
                        <div className="flex items-center gap-4 text-amber-700 font-black text-[10px] uppercase tracking-[0.2em] italic">
                            <Info className="w-4 h-4" />
                            PROTOKOL TRANSFER MANUAL
                        </div>
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 gap-6">
                                {[
                                    { step: '01', text: 'Scan QRIS Bryan Dev melalui aplikasi bank/e-wallet Anda.' },
                                    { step: '02', text: `Tentukan nominal transfer: Rp${getFinalPrice().toLocaleString()}.` },
                                    { step: '03', text: 'Simpan screenshot bukti transfer digital Anda.' },
                                    { step: '04', text: 'Upload bukti pada terminal konfirmasi di samping.' },
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6 items-start">
                                        <span className="text-xl font-black text-amber-300 italic tracking-tighter">{s.step}</span>
                                        <p className="text-sm font-medium italic text-amber-800 leading-relaxed">{s.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="relative group/qris">
                                <img
                                    src="/qris_payment.jpg"
                                    alt="QRIS Bryan Dev"
                                    className="w-full h-auto rounded-[40px] shadow-2xl border-8 border-white group-hover:scale-[1.02] transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-amber-600/10 blur-3xl rounded-full -z-10" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submission Form Stage */}
                <div className="space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-100 p-10 rounded-[60px] shadow-sm flex flex-col justify-between"
                    >
                        {submitted ? (
                            <div className="py-20 text-center space-y-10">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">DATA_TERKIRIM</h3>
                                    <p className="text-sm font-medium italic text-gray-400 max-w-xs mx-auto">Admin akan melakukan verifikasi payload pembayaran Anda dalam kurun waktu 1x24 jam.</p>
                                </div>
                                <button onClick={() => setSubmitted(false)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic hover:underline">
                                    INJEKSI_ULANG_BUKTI?
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Terminal <br /><span className="text-indigo-600">Konfirmasi</span></h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">UPLOAD_PAYMENT_PAYLOAD</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">FILE_INPUT_SCREENSHOT</label>
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
                                                className="w-full h-80 border-4 border-dashed border-gray-50 rounded-[50px] hover:border-indigo-600/30 hover:bg-gray-50/50 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer group"
                                            >
                                                <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center text-gray-200 group-hover:text-indigo-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] italic">TEKAN UNTUK UPLOAD</p>
                                                    <p className="text-[8px] font-bold text-gray-200">PNG, JPG, ATAU JPEG (MAX 5MB)</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-[50px] overflow-hidden border-4 border-gray-50 bg-gray-50 group/preview shadow-inner">
                                                <img src={previewUrl!} alt="Preview" className="w-full h-auto max-h-[500px] object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={handleClearFile}
                                                        className="p-6 bg-white rounded-[30px] text-red-500 hover:scale-110 transition-transform shadow-2xl"
                                                    >
                                                        <X size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-4 shadow-inner">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                                            <span>PAKET_{selectedTier.toUpperCase()}</span>
                                            <span className={appliedPromo ? 'line-through opacity-50' : 'text-gray-900'}>Rp{getBasePrice().toLocaleString()}</span>
                                        </div>
                                        {appliedPromo && (
                                            <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic animate-in fade-in slide-in-from-left duration-500">
                                                <span>PROMO_OVERRIDE_{appliedPromo.code}</span>
                                                <span>-{appliedPromo.discount_percent}%</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 pt-4 flex justify-between items-end">
                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">TOTAL_SETTLEMENT</span>
                                            <span className="text-3xl font-black text-indigo-600 italic tracking-tighter">Rp{getFinalPrice().toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleManualPayment}
                                        disabled={loading || !selectedFile}
                                        className={`w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] italic rounded-[30px] transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl flex items-center justify-center gap-4 ${selectedTier === 'premium_plus'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30'
                                            : 'bg-indigo-600 text-white shadow-indigo-600/30'} disabled:opacity-30 disabled:grayscale disabled:pointer-events-none`}
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                UPGRADE_SEKARANG
                                                <ChevronRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <div className="bg-indigo-600 p-12 rounded-[60px] relative overflow-hidden group/chat">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover/chat:rotate-0 transition-transform duration-1000">
                            <Activity size={180} className="text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[30px] flex items-center justify-center shadow-2xl">
                                <Info className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-2xl font-black text-white italic tracking-tighter mb-2 italic">SUPPORT_CENTER</h4>
                                <p className="text-sm font-medium italic text-indigo-100 mb-6">Butuh asistensi manual untuk aktivasi protokol atau kendala gateway pembayaran?</p>
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest italic">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                    HUBUNGI ADMIN VIA LIVE CHAT
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Stage */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-[80px] p-20 shadow-sm overflow-hidden relative"
            >
                <div className="space-y-16">
                    <div className="text-center space-y-4">
                        <h3 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">Matriks <br /><span className="text-indigo-600">Otoritas</span></h3>
                        <p className="text-gray-400 font-medium italic max-w-lg mx-auto">Tabel perbandingan level akses untuk efisiensi pemilihan paket upgrade.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-50">
                                    <th className="text-left pb-10 px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">VARIABEL_FITUR</th>
                                    <th className="text-center pb-10 px-6 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] italic">PREMIUM</th>
                                    <th className="text-center pb-10 px-6 text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] italic">PREMIUM+</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { feature: 'Library materi sector pilihan', premium: true, plus: true },
                                    { feature: 'Dekripsi seluruh bab (chapter)', premium: true, plus: true },
                                    { feature: 'Lifetime authority (selamanya)', premium: true, plus: true },
                                    { feature: 'Akses bypass lintas sector teknologi', premium: false, plus: true },
                                    { feature: 'Sektor Kurikulum Frontend', premium: 'LIMITED', plus: true },
                                    { feature: 'Sektor Kurikulum Backend', premium: 'LIMITED', plus: true },
                                    { feature: 'Sektor Kurikulum Fullstack', premium: 'LIMITED', plus: true },
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-8 px-6 text-[13px] font-black text-gray-600 uppercase italic tracking-tighter">{row.feature}</td>
                                        <td className="py-8 px-6 text-center">
                                            {row.premium === true ? (
                                                <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm"><CheckCircle size={20} /></div>
                                            ) : row.premium === 'LIMITED' ? (
                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic bg-gray-50 px-3 py-1.5 rounded-lg">SESUAI JALUR</span>
                                            ) : (
                                                <div className="inline-flex p-3 bg-gray-50 text-gray-200 rounded-2xl"><X size={20} /></div>
                                            )}
                                        </td>
                                        <td className="py-8 px-6 text-center">
                                            {row.plus ? (
                                                <div className="inline-flex p-3 bg-amber-50 text-amber-500 rounded-2xl border border-amber-100 shadow-sm shadow-amber-500/10"><CheckCircle size={20} /></div>
                                            ) : (
                                                <div className="inline-flex p-3 bg-gray-50 text-gray-200 rounded-2xl"><X size={20} /></div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PremiumPayment;
