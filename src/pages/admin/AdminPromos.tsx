import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Promo } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    Plus,
    Percent,
    Trash2,
    Edit3,
    X,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Search,
    ToggleLeft,
    ToggleRight,
    Gift,
    Clock,
    Users,
    Copy,
    Zap
} from 'lucide-react';

const AdminPromos: React.FC = () => {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        discount_percent: 10,
        description: '',
        max_usage: '',
        valid_until: '',
        is_active: true,
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        loadPromos();
    }, []);

    const loadPromos = async () => {
        setIsRefreshing(true);
        try {
            const { data, error } = await supabase
                .from('promos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPromos(data);
        } catch (error) {
            console.error('Error loading promos:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discount_percent: 10,
            description: '',
            max_usage: '',
            valid_until: '',
            is_active: true,
        });
        setEditingPromo(null);
        setFormError('');
        setFormSuccess('');
    };

    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (promo: Promo) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            discount_percent: promo.discount_percent,
            description: promo.description || '',
            max_usage: promo.max_usage ? String(promo.max_usage) : '',
            valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : '',
            is_active: promo.is_active,
        });
        setFormError('');
        setFormSuccess('');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.code.trim()) {
            setFormError('Kode promo wajib diisi');
            return;
        }
        if (formData.discount_percent < 1 || formData.discount_percent > 100) {
            setFormError('Diskon harus antara 1% - 100%');
            return;
        }

        try {
            const payload: any = {
                code: formData.code.toUpperCase().trim(),
                discount_percent: formData.discount_percent,
                description: formData.description || null,
                max_usage: formData.max_usage ? parseInt(formData.max_usage) : null,
                valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
                is_active: formData.is_active,
                updated_at: new Date().toISOString(),
            };

            if (editingPromo) {
                const { error } = await supabase
                    .from('promos')
                    .update(payload)
                    .eq('id', editingPromo.id);
                if (error) throw error;
                setFormSuccess('Promo berhasil diperbarui!');
            } else {
                const { error } = await supabase
                    .from('promos')
                    .insert([payload]);
                if (error) {
                    if (error.message.includes('duplicate') || error.message.includes('unique')) {
                        setFormError('Kode promo sudah digunakan. Pilih kode lain.');
                        return;
                    }
                    throw error;
                }
                setFormSuccess('Promo berhasil dibuat!');
            }

            loadPromos();
            setTimeout(() => {
                setShowForm(false);
                resetForm();
            }, 1500);
        } catch (error: any) {
            console.error('Error saving promo:', error);
            setFormError(`Gagal menyimpan: ${error.message || 'Unknown error'}`);
        }
    };

    const handleToggleActive = async (promo: Promo) => {
        try {
            const { error } = await supabase
                .from('promos')
                .update({ is_active: !promo.is_active, updated_at: new Date().toISOString() })
                .eq('id', promo.id);
            if (error) throw error;
            loadPromos();
        } catch (error) {
            console.error('Error toggling promo:', error);
        }
    };

    const handleDelete = async (promoId: string) => {
        try {
            const { error } = await supabase
                .from('promos')
                .delete()
                .eq('id', promoId);
            if (error) throw error;
            setDeleteConfirm(null);
            loadPromos();
        } catch (error) {
            console.error('Error deleting promo:', error);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    const filteredPromos = promos.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: promos.length,
        active: promos.filter(p => p.is_active).length,
        totalUsage: promos.reduce((acc, p) => acc + p.current_usage, 0),
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                    <Gift className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Promo Engine...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32 selection:bg-purple-100 selection:text-purple-900">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[22px] flex items-center justify-center shadow-xl shadow-purple-500/20">
                            <Tag className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic">Promo Management</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Discount Engine Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-purple-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH_PROMO_CODE..."
                                className="bg-gray-100 border-none rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-[12px] focus:ring-purple-500/5 focus:bg-white transition-all w-full md:w-80 shadow-inner placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={loadPromos}
                            className={`p-3.5 bg-gray-100 text-gray-400 hover:text-purple-600 hover:bg-white rounded-2xl transition-all shadow-inner hover:shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={openCreateForm}
                            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            CREATE PROMO
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto px-6 md:px-10 mt-12 space-y-12">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Total Promos', value: stats.total, icon: Tag, sub: 'All Codes', color: 'purple' },
                        { label: 'Active Promos', value: stats.active, icon: Zap, sub: 'Currently Live', color: 'emerald' },
                        { label: 'Total Redeemed', value: stats.totalUsage, icon: Users, sub: 'All Time Usage', color: 'pink' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-white border border-gray-100 hover:border-purple-500/20 rounded-[40px] p-8 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <stat.icon className={`w-16 h-16 text-${stat.color}-600 opacity-5`} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">{stat.label}</h3>
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-4xl font-black tracking-tighter text-gray-900">{stat.value}</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Promo List */}
                <div className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 md:px-10 py-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <Gift className="w-5 h-5 text-purple-500" />
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Promo Code Registry</span>
                        </div>
                    </div>

                    {filteredPromos.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredPromos.map((promo, idx) => (
                                <motion.div
                                    key={promo.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group px-8 md:px-10 py-8 hover:bg-purple-50/20 transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6 flex-1 min-w-0">
                                            <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-white font-black text-2xl shadow-lg ${promo.is_active ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/20' : 'bg-gray-300'}`}>
                                                <Percent className="w-7 h-7" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-lg font-black text-gray-900 tracking-tight uppercase group-hover:text-purple-600 transition-colors">
                                                        {promo.code}
                                                    </span>
                                                    <button
                                                        onClick={() => copyCode(promo.code)}
                                                        className="p-1.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                        title="Copy code"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${promo.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                                        {promo.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{promo.description || 'No description'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-purple-600 tracking-tighter">{promo.discount_percent}%</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Diskon</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black text-gray-700">{promo.current_usage}{promo.max_usage ? `/${promo.max_usage}` : '/∞'}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Usage</p>
                                            </div>
                                            <div className="text-center min-w-[80px]">
                                                {promo.valid_until ? (
                                                    <>
                                                        <p className="text-xs font-black text-gray-700">
                                                            {new Date(promo.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expires</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-xs font-black text-emerald-600">♾️ Forever</p>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No Expiry</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(promo)}
                                                    className={`p-2.5 rounded-xl transition-all ${promo.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}
                                                    title={promo.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {promo.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditForm(promo)}
                                                    className="p-2.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                {deleteConfirm === promo.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleDelete(promo.id)}
                                                            className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-lg uppercase tracking-wider"
                                                        >
                                                            YA
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-3 py-1.5 bg-gray-200 text-gray-600 text-[9px] font-black rounded-lg uppercase tracking-wider"
                                                        >
                                                            BATAL
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(promo.id)}
                                                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-[45px] flex items-center justify-center mb-8 shadow-inner">
                                    <Gift className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase italic">No Promos Found</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">
                                    {searchTerm ? 'No matching promo codes' : 'Create your first promo code to get started'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={openCreateForm}
                                        className="mt-8 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-105 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        CREATE FIRST PROMO
                                    </button>
                                )}
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl"
                            onClick={() => { setShowForm(false); resetForm(); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[50px] shadow-2xl shadow-black/20 p-10 md:p-14 overflow-y-auto max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        {editingPromo ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                                        {editingPromo ? 'Edit Promo' : 'Create Promo'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                    className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kode Promo</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-5 text-lg font-black text-gray-900 uppercase tracking-widest focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-inner placeholder:text-gray-300"
                                        placeholder="KAZEDISKON50"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Diskon (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.discount_percent}
                                            onChange={e => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                                            min={1}
                                            max={100}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-5 text-3xl font-black text-purple-600 tracking-tighter focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-inner"
                                            required
                                        />
                                        <Percent className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-300" />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[10, 20, 25, 50, 75].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, discount_percent: v })}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.discount_percent === v ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}
                                            >
                                                {v}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Deskripsi (opsional)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-inner placeholder:text-gray-300"
                                        placeholder="Promo spesial hari kemerdekaan..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                                            <Users className="w-3 h-3 inline mr-1" />
                                            Maks. penggunaan
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.max_usage}
                                            onChange={e => setFormData({ ...formData, max_usage: e.target.value })}
                                            min={1}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-inner placeholder:text-gray-300"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            Berlaku sampai
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.valid_until}
                                            onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl p-5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-purple-500/10 focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`p-1 rounded-full transition-all ${formData.is_active ? 'text-emerald-600' : 'text-gray-300'}`}
                                    >
                                        {formData.is_active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                    </button>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{formData.is_active ? 'Active' : 'Inactive'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">Promo {formData.is_active ? 'akan langsung bisa digunakan' : 'tidak bisa digunakan'}</p>
                                    </div>
                                </div>

                                {formError && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-bold">{formError}</p>
                                    </div>
                                )}
                                {formSuccess && (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-bold">{formSuccess}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black uppercase tracking-widest text-sm rounded-[30px] shadow-2xl shadow-purple-500/30 hover:-translate-y-1 active:scale-95 transition-all"
                                >
                                    {editingPromo ? 'UPDATE PROMO' : 'CREATE PROMO'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-1/4 -right-1/4 w-[60%] h-[60%] bg-purple-100/30 blur-[200px] rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] bg-pink-100/20 blur-[200px] rounded-full" />
            </div>
        </div>
    );
};

export default AdminPromos;
