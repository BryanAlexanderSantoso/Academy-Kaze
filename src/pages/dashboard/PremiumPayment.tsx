import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Upload,
    CheckCircle,
    AlertCircle,
    Clock,
    ShieldCheck,
    ArrowLeft,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumPayment: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [existingPayments, setExistingPayments] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        payment_method: 'QRIS',
        transaction_id: '',
        amount: 50000,
        proof_url: ''
    });

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `proofs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, proof_url: publicUrl }));
        } catch (error) {
            console.error('Error uploading proof:', error);
            alert('Gagal upload bukti pembayaran. Pastikan bucket "payment-proofs" sudah dibuat di Supabase Dashboard (Storage).');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.proof_url) {
            alert('Harap upload bukti pembayaran!');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('premium_payments')
                .insert([{
                    user_id: user?.id,
                    full_name: formData.full_name,
                    payment_method: formData.payment_method,
                    transaction_id: formData.transaction_id,
                    amount: formData.amount,
                    proof_url: formData.proof_url,
                    status: 'pending'
                }]);

            if (error) throw error;
            setSubmitted(true);
            loadExistingPayments();
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert('Gagal mengirim form pembayaran.');
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-6 mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-3xl transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-1">Elite Access Activation</h1>
                    <p className="text-gray-500 font-medium">Buka gerbang kurikulum premium dan mulai karir profesional Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Payment Info */}
                <div className="space-y-6">
                    <div className="card bg-primary-600 text-white p-8 overflow-hidden relative">
                        <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                        <h3 className="text-xl font-bold mb-2">Hanya Sekali Bayar</h3>
                        <p className="text-primary-100 text-sm mb-6">Dapatkan akses seumur hidup ke seluruh konten kurikulum Kaze For Developers.</p>
                        <div className="text-4xl font-black mb-2">Rp 50.000</div>
                        <p className="text-xs text-primary-200">Investasi terbaik untuk masa depan Anda.</p>
                    </div>

                    <div className="card border-2 border-yellow-100 bg-yellow-50/30 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-yellow-700 font-bold">
                            <Info className="w-5 h-5" />
                            CARA PEMBAYARAN
                        </div>
                        <ol className="text-sm text-gray-600 space-y-3 list-decimal ml-4">
                            <li>Scan QRIS <b>Bryan Dev</b> di bawah ini.</li>
                            <li>Tentukan nominal <b>Rp 50.000</b>.</li>
                            <li>Selesaikan pembayaran sampai muncul tanda <b>BERHASIL</b>.</li>
                            <li>Screenshot bukti pembayaran tersebut.</li>
                            <li>Upload buktinya melalui form di samping.</li>
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
                            className="card p-8 text-center border-green-200 bg-green-50/50"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Formulir Terkirim!</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Terima kasih! Admin akan memverifikasi pembayaran Anda maksimal dalam 1x24 jam.
                                Anda akan menerima notifikasi jika sudah aktif.
                            </p>
                            <button onClick={() => setSubmitted(false)} className="text-primary-600 font-bold hover:underline">
                                Kirim bukti lain?
                            </button>
                        </motion.div>
                    ) : (
                        <div className="card p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Konfirmasi Pembayaran</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap (Sesuai Form)</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        placeholder="Contoh: Muhammad Pilar"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Metode Pembayaran</label>
                                    <select
                                        className="input"
                                        value={formData.payment_method}
                                        onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                    >
                                        <option value="QRIS">QRIS (Gopay/OVO/Dana/M-Banking)</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ID Transaksi / Reff (Opsional)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Contoh: TRX12345678"
                                        value={formData.transaction_id}
                                        onChange={e => setFormData({ ...formData, transaction_id: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Upload Bukti Pembayaran (SS)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition-colors bg-gray-50/50 relative overflow-hidden group">
                                        {formData.proof_url ? (
                                            <div className="space-y-2 text-center">
                                                <img src={formData.proof_url} alt="Proof" className="h-40 mx-auto rounded-lg shadow-md" />
                                                <p className="text-xs text-green-600 font-bold">Bukti sudah diupload!</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, proof_url: '' })}
                                                    className="text-xs text-red-500 hover:underline"
                                                >
                                                    Ganti File
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                        <span>Upload a file</span>
                                                        <input type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || uploading || !formData.proof_url}
                                    className="btn-primary w-full py-4 text-lg font-black"
                                >
                                    {loading ? 'Mengirim...' : 'KIRIM KONFIRMASI'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Transaction History */}
                    {existingPayments.length > 0 && (
                        <div className="card p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                Riwayat Pembayaran
                            </h3>
                            <div className="space-y-3">
                                {existingPayments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${p.status === 'approved' ? 'bg-green-100' :
                                                p.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                                                }`}>
                                                {p.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                                                    p.status === 'rejected' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                                                        <Clock className="w-4 h-4 text-yellow-600" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Rp {Number(p.amount).toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-green-200 text-green-800' :
                                                p.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                                }`}>
                                                {p.status}
                                            </span>
                                            {p.admin_feedback && (
                                                <p className="text-[10px] text-red-500 mt-1 max-w-[120px] truncate">{p.admin_feedback}</p>
                                            )}
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
