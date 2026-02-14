import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
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
    ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumPayment: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [existingPayments, setExistingPayments] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            // Create Payment Record
            const { error: insertError } = await supabase.from('premium_payments').insert([{
                user_id: user?.id,
                full_name: user?.full_name,
                payment_method: 'manual_transfer',
                transaction_id: `MANUAL-${Date.now()}`, // Temporary ID for manual
                amount: 50000,
                proof_url: publicUrl,
                status: 'pending',
            }]);

            if (insertError) throw insertError;

            setSubmitted(true);
            loadExistingPayments();
            handleClearFile();
        } catch (error: any) {
            console.error('Payment Error:', error);
            alert(`Terjadi kesalahan: ${error.message || 'Gagal mengirim pembayaran'}`);
        } finally {
            setLoading(false);
        }
    };

    if (user?.is_premium) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card text-center p-12 bg-gradient-to-br from-green-50 to-white border-green-200"
                >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">AKSES PREMIUM AKTIF!</h2>
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
                        Selamat! Akun Anda sudah memiliki akses penuh ke semua materi.
                        Selamat belajar dan semoga sukses jadi developer handal!
                    </p>
                    <button onClick={() => navigate('/dashboard/courses')} className="btn-primary w-full">
                        LANJUT BELAJAR SEKARANG
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-6 mb-8 md:mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-fit p-3 md:p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-3xl transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-1">Elite Access Activation</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium">Buka gerbang kurikulum premium dan mulai karir profesional Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left: Payment Info */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 text-white p-6 md:p-8 overflow-hidden relative rounded-[2rem] shadow-xl">
                        <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                        <h3 className="text-lg md:text-xl font-bold mb-2">Hanya Sekali Bayar</h3>
                        <p className="text-indigo-100 text-sm mb-6">Dapatkan akses seumur hidup ke seluruh konten kurikulum Kaze For Developers.</p>
                        <div className="text-3xl md:text-4xl font-black mb-2">Rp 12.000</div>
                        <p className="text-xs text-indigo-200">Investasi terbaik untuk masa depan Anda.</p>
                    </div>

                    <div className="card border-2 border-yellow-100 bg-yellow-50/30 p-5 md:p-6 space-y-4 rounded-[2rem]">
                        <div className="flex items-center gap-2 text-yellow-700 font-bold">
                            <Info className="w-5 h-5" />
                            CARA PEMBAYARAN MANUAL
                        </div>
                        <ol className="text-sm text-gray-600 space-y-3 list-decimal ml-4">
                            <li>Scan QRIS <b>Bryan Dev</b> di bawah ini.</li>
                            <li>Tentukan nominal <b>Rp 12.000</b>.</li>
                            <li>Selesaikan pembayaran sampai muncul tanda <b>BERHASIL</b>.</li>
                            <li>Screenshot bukti pembayaran tersebut.</li>
                            <li>Upload buktinya pada form di bawah.</li>
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
                            <p className="text-gray-600 text-sm mb-6">
                                Terima kasih! Admin akan memverifikasi pembayaran Anda maksimal dalam 1x24 jam.
                                Anda akan menerima notifikasi jika sudah aktif.
                            </p>
                            <button onClick={() => setSubmitted(false)} className="text-indigo-600 font-bold hover:underline">
                                Kirim bukti lain?
                            </button>
                        </motion.div>
                    ) : (
                        <div className="card p-6 md:p-8 rounded-[2rem]">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Konfirmasi Pembayaran</h3>
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

                                <button
                                    onClick={handleManualPayment}
                                    disabled={loading || !selectedFile}
                                    className="btn-primary w-full py-3 md:py-4 text-base md:text-lg font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
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
                                                <p className="text-sm font-bold text-gray-900">Rp {Number(p.amount).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
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

