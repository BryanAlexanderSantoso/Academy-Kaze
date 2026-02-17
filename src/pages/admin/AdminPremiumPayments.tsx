import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { PremiumPayment } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Image as ImageIcon,
    Shield,
    Search,
    Filter,
    ArrowUpRight,
    Users,
    Clock,
    DollarSign,
    RefreshCw,
    X,
    Maximize2,
    Activity,
    CreditCard,
    Zap,
    Crown,
    Tag
} from 'lucide-react';

const AdminPremiumPayments: React.FC = () => {
    const [payments, setPayments] = useState<PremiumPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedPayment, setSelectedPayment] = useState<PremiumPayment | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        setIsRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('premium_payments')
                .select(`
                    *,
                    user:profiles(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPayments(data as any);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleUpdateStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
        try {
            const payment = payments.find(p => p.id === paymentId);
            if (!payment) return;

            // 1. Update Payment Status
            const { data: updatedPayment, error: paymentError } = await supabase
                .from('premium_payments')
                .update({
                    status,
                    admin_feedback: feedback,
                    // updated_at is handled by trigger usually, but we force it here for now
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId)
                .select(); // Request returned data to verify update

            if (paymentError) throw paymentError;

            // Check if any row was actually updated
            if (!updatedPayment || updatedPayment.length === 0) {
                throw new Error('Update blocked: Policy matched 0 rows. ensure you are Admin.');
            }

            // 2. If approved, explicitly update the User's Profile to premium
            if (status === 'approved') {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30); // Add 30 days

                const premiumType = (payment as any).premium_type || 'premium';

                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        is_premium: true,
                        premium_type: premiumType,
                        premium_until: expiryDate.toISOString()
                    })
                    .eq('id', payment.user_id);

                if (profileError) {
                    console.error('Failed to update user premium status:', profileError);
                }
            }

            loadPayments();
            setSelectedPayment(null);
            setFeedback('');
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(`Gagal memperbarui status: ${error.message || 'Unknown error'}`);
        }
    };

    const filteredPayments = payments.filter(p => {
        const user = (p as any).user;
        const matchesSearch =
            (user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        pending: payments.filter(p => p.status === 'pending').length,
        approved: payments.filter(p => p.status === 'approved').length,
        rejected: payments.filter(p => p.status === 'rejected').length,
        revenue: payments.filter(p => p.status === 'approved').length * 50000,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <CreditCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Financial Core...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Command Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic">Financial Oversight</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Live Transaction Audit</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="SCAN_TRANSACTION_ID..."
                                className="bg-gray-100 border-none rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all w-full md:w-80 shadow-inner placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={loadPayments}
                            className={`p-3.5 bg-gray-100 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-inner hover:shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto px-10 mt-12 space-y-12">
                {/* Visual Stats Intelligence */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Pending Validation', value: stats.pending, icon: Clock, sub: 'Awaiting Audit', color: 'amber' },
                        { label: 'Approved Access', value: stats.approved, icon: CheckCircle, sub: 'Sync Verified', color: 'emerald' },
                        { label: 'System Denials', value: stats.rejected, icon: XCircle, sub: 'Protocol Breach', color: 'red' },
                        { label: 'Gross Revenue', value: stats.revenue.toLocaleString(), icon: DollarSign, sub: 'Aggregate Yield', color: 'indigo', isCurrency: true }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-white border border-gray-100 hover:border-indigo-500/20 rounded-[40px] p-8 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <stat.icon className={`w-16 h-16 text-${stat.color}-600 opacity-5`} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">{stat.label}</h3>
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl font-black tracking-tighter text-gray-900">
                                    {stat.isCurrency ? `Rp ${stat.value}` : stat.value}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Transaction Matrix */}
                <div className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tactical Filter Deck */}
                    <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/30">
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-3">
                                <Filter className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Protocol Filter</span>
                            </div>
                            <div className="flex bg-white p-1.5 rounded-[22px] shadow-sm">
                                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s as any)}
                                        className={`px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all rounded-[18px] ${statusFilter === s
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                            System Registry Index: {filteredPayments.length} Entries
                        </div>
                    </div>

                    {/* Operational Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white text-left">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operative</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Descriptor</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Entry</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence mode="popLayout">
                                    {filteredPayments.map((payment, idx) => (
                                        <motion.tr
                                            key={payment.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-indigo-50/20 transition-all duration-300"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                                                        {(payment as any).user?.full_name?.charAt(0) || <Users className="w-5 h-5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-gray-900 tracking-tight uppercase italic group-hover:text-indigo-600 transition-colors">{(payment as any).user?.full_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{(payment as any).user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xl font-black text-gray-900 tracking-tighter">Rp {Number(payment.amount).toLocaleString()}</span>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${(payment as any).premium_type === 'premium_plus'
                                                                ? 'text-amber-600 bg-amber-50 border-amber-100'
                                                                : 'text-indigo-600 bg-indigo-50 border-indigo-100'
                                                            }`}>
                                                            {(payment as any).premium_type === 'premium_plus' ? '✨ PREMIUM+' : '🛡️ PREMIUM'}
                                                        </span>
                                                        {(payment as any).promo_code && (
                                                            <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 flex items-center gap-1">
                                                                <Tag className="w-2.5 h-2.5" />{(payment as any).promo_code} (-{(payment as any).discount_percent}%)
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] font-mono text-gray-400 tracking-tighter">REF_{payment.transaction_id || 'NULL'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{new Date(payment.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    {payment.status === 'pending' ? (
                                                        <button
                                                            onClick={() => setSelectedPayment(payment)}
                                                            className="flex items-center gap-3 px-8 py-4 bg-gray-900 border border-black hover:bg-black text-white text-[10px] font-black rounded-2xl shadow-xl shadow-gray-900/10 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                                                        >
                                                            REVIEW_CASE
                                                            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                                                        </button>
                                                    ) : (
                                                        <div className={`px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border ${payment.status === 'approved'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-red-50 text-red-600 border-red-100'
                                                            }`}>
                                                            {payment.status}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {filteredPayments.length === 0 && (
                            <div className="py-32 text-center bg-white rounded-b-[50px]">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-24 h-24 bg-gray-50 rounded-[45px] flex items-center justify-center mb-8 shadow-inner">
                                        <Activity className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase italic">Repository Void</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Zero matching records detected in sector.</p>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tactical Review Overlay */}
            <AnimatePresence>
                {selectedPayment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl"
                            onClick={() => setSelectedPayment(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 100 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="relative w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-[60px] shadow-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/20"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Evidence Showcase */}
                            <div className="md:w-[60%] bg-gray-50/50 p-12 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent scale-150" />
                                </div>

                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                                            <ImageIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Transaction Evidence</h4>
                                            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mt-0.5">PAY_PROOF_RESOLVE</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(selectedPayment.proof_url, '_blank')}
                                        className="p-4 bg-white/80 backdrop-blur hover:bg-white rounded-2xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100 shadow-sm"
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 relative rounded-[45px] overflow-hidden bg-white shadow-2xl border border-gray-100 p-8 flex items-center justify-center group/img">
                                    <img
                                        src={selectedPayment.proof_url}
                                        alt="Transaction Proof"
                                        className="max-w-full max-h-full object-contain transition-transform duration-1000 group-hover/img:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent flex items-end p-10 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-center">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">ENHANCED_VIEW_READY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tactical Console */}
                            <div className="md:w-[40%] p-14 flex flex-col bg-white border-l border-gray-100 relative">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Audit Console</h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPayment(null)}
                                        className="p-4 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-[20px] transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-12 overflow-y-auto pr-2 custom-scrollbar">
                                    <section className="space-y-6">
                                        <div className="p-8 bg-gray-50/50 rounded-[35px] border border-gray-100 relative overflow-hidden group/card shadow-inner">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Target Identity</p>
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                                                    {(selectedPayment as any).user?.full_name?.charAt(0)}
                                                </div>
                                                <p className="text-xl font-black text-gray-900 uppercase">{(selectedPayment as any).user?.full_name}</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 tracking-widest ml-14">{(selectedPayment as any).user?.email}</p>
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/card:opacity-10 transition-opacity">
                                                <Users className="w-16 h-16 text-indigo-600" />
                                            </div>
                                        </div>

                                        <div className={`p-8 rounded-[35px] text-white relative overflow-hidden group shadow-2xl ${(selectedPayment as any).premium_type === 'premium_plus'
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
                                                : 'bg-indigo-600 shadow-indigo-600/30'
                                            }`}>
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Validation Amount</p>
                                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                        {(selectedPayment as any).premium_type === 'premium_plus' ? <><Crown className="w-3 h-3" /> PREMIUM+</> : <><Shield className="w-3 h-3" /> PREMIUM</>}
                                                    </span>
                                                </div>
                                                <p className="text-5xl font-black tracking-tighter mb-2">Rp {Number(selectedPayment.amount).toLocaleString()}</p>
                                                {(selectedPayment as any).original_amount && Number((selectedPayment as any).original_amount) > Number(selectedPayment.amount) && (
                                                    <p className="text-sm opacity-60 line-through mb-4">Rp {Number((selectedPayment as any).original_amount).toLocaleString()}</p>
                                                )}
                                                {(selectedPayment as any).promo_code && (
                                                    <div className="mb-4 p-3 bg-white/10 rounded-xl flex items-center gap-2">
                                                        <Tag className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-wider">Promo: {(selectedPayment as any).promo_code} (-{(selectedPayment as any).discount_percent}%)</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-6 pt-6 border-t border-white/10">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase mb-1 opacity-60">Method</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest">{selectedPayment.payment_method}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase mb-1 opacity-60">Reference</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest font-mono">{selectedPayment.transaction_id || 'NULL'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <DollarSign className="absolute -right-6 -bottom-6 w-40 h-40 text-white opacity-5 group-hover:scale-125 transition-transform duration-1000" />
                                        </div>
                                    </section>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Administrative Feedback Vector</label>
                                        <textarea
                                            className="w-full bg-gray-50 border-none rounded-[35px] p-8 text-sm font-bold text-gray-700 focus:bg-white transition-all h-36 outline-none resize-none shadow-inner placeholder:text-gray-300 italic"
                                            placeholder="Specify audit remarks here..."
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mt-12 pt-10 border-t border-gray-50">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedPayment.id, 'rejected')}
                                        className="flex items-center justify-center gap-3 py-6 rounded-[30px] bg-white border-2 border-red-50 text-red-600 font-black hover:bg-red-50 transition-all uppercase tracking-widest text-[10px] active:scale-95"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Reject_Case
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedPayment.id, 'approved')}
                                        className="flex items-center justify-center gap-3 py-6 rounded-[30px] bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 uppercase tracking-widest text-[10px] active:scale-95 hover:-translate-y-1"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Authorize_Access
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Studio Accents */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-1/4 -right-1/4 w-[60%] h-[60%] bg-indigo-100/30 blur-[200px] rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] bg-blue-100/20 blur-[200px] rounded-full" />
            </div>
        </div>
    );
};

export default AdminPremiumPayments;
