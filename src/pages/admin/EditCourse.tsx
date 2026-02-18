import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
    Save,
    ArrowLeft,
    Layers,
    Clock,
    Calendar,
    Monitor,
    Palette,
    Code2,
    CheckCircle2,
    Sparkles,
    Layout,
    LogOut,
    Shield,
    Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EditCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'fe' as 'fe' | 'be' | 'fs',
        content_body: '',
        schedule_date: '',
        duration_hours: '',
        thumbnail_url: '',
        is_published: false,
        author_name: '',
        author_image_url: '',
        is_free: false,
    });

    useEffect(() => {
        if (id) loadCourse();
    }, [id]);

    const loadCourse = async () => {
        const { data } = await supabase.from('courses').select('*').eq('id', id).single();

        if (data) {
            setFormData({
                title: data.title,
                description: data.description || '',
                category: data.category,
                content_body: data.content_body || '',
                schedule_date: data.schedule_date ? data.schedule_date.slice(0, 16) : '',
                duration_hours: data.duration_hours?.toString() || '',
                thumbnail_url: data.thumbnail_url || '',
                is_published: data.is_published,
                author_name: data.author_name || '',
                author_image_url: data.author_image_url || '',
                is_free: data.is_free || false,
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from('courses')
            .update({
                ...formData,
                duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
            })
            .eq('id', id);

        if (!error) {
            navigate('/admin/courses');
        } else {
            alert('Gagal memperbarui kursus: ' + error.message);
        }

        setSaving(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('adminUser');
        setUser(null);
        navigate('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menyinkronkan Data Manifest...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header Hub */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/admin/courses')}
                                className="p-3.5 bg-gray-50 hover:bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3 uppercase italic">
                                    <Sparkles className="w-6 h-6 text-indigo-600" />
                                    Revisi Manifest
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formData.title || 'Memuat Node...'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSignOut}
                                className="p-3.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-20">
                <form onSubmit={handleSubmit} className="space-y-16">
                    <div className="text-center space-y-4 mb-24">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex p-6 bg-indigo-50 rounded-[40px] shadow-inner mb-6"
                        >
                            <Layers className="w-12 h-12 text-indigo-600" />
                        </motion.div>
                        <h2 className="text-6xl font-black tracking-tighter uppercase italic text-gray-900">Tambal Node Pengetahuan</h2>
                        <p className="text-gray-400 font-bold max-w-xl mx-auto uppercase tracking-[0.3em] text-[10px]">Memperbarui parameter operasional dan payload pengetahuan</p>
                    </div>

                    <div className="space-y-16">
                        {/* Manifest Data Section */}
                        <div className="bg-white border border-gray-100 rounded-[60px] p-16 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700">
                            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                                <Layout className="w-80 h-80 text-indigo-600" />
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-12 flex items-center gap-5 uppercase italic text-gray-900">
                                <Shield className="w-7 h-7 text-indigo-600" />
                                Manifest Persisten
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Identifikasi Manifest (Judul)</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[32px] py-6 px-10 text-gray-900 font-black text-3xl tracking-tighter focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner placeholder:text-gray-200"
                                        placeholder="Arsitektur Neural Lanjutan"
                                        required
                                    />
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Abstrak Teknis (Deskripsi)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[40px] py-7 px-10 text-gray-600 font-medium text-lg leading-relaxed focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner h-40 placeholder:text-gray-200"
                                        placeholder="Ikhtisar modul inti dan dependensi teknis..."
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Jalur Kurikulum</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as 'fe' | 'be' | 'fs' })}
                                            className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-gray-900 font-black text-xs uppercase tracking-[0.2em] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner"
                                            required
                                        >
                                            <option value="fe">Protokol Frontend</option>
                                            <option value="be">Protokol Backend</option>
                                            <option value="fs">Sintesis Fullstack</option>
                                        </select>
                                        <Monitor className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Durasi Siklus (Jam)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.duration_hours}
                                            onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-gray-900 font-black text-sm uppercase tracking-[0.25em] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                            placeholder="000"
                                            min="1"
                                        />
                                        <Clock className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Timestamp Revisi</label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            value={formData.schedule_date}
                                            onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-gray-900 font-black text-[11px] uppercase tracking-[0.2em] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                        />
                                        <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Cetak Biru Visual (URL Thumbnail)</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={formData.thumbnail_url}
                                            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-indigo-600 font-mono text-[11px] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                            placeholder="https://cdn.archive/visual.img"
                                        />
                                        <Palette className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nama Penulis</label>
                                    <input
                                        type="text"
                                        value={formData.author_name}
                                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-gray-900 font-black text-sm uppercase tracking-[0.2em] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">URL Foto Penulis</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={formData.author_image_url}
                                            onChange={(e) => setFormData({ ...formData, author_image_url: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-indigo-600 font-mono text-[11px] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                            placeholder="https://cdn.archive/author.img"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e: any) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `author-${Math.random().toString(36).substring(2)}.${fileExt}`;
                                                        const filePath = `authors/${fileName}`;
                                                        const { error: uploadError } = await supabase.storage
                                                            .from('course-materials')
                                                            .upload(filePath, file);
                                                        if (uploadError) throw uploadError;
                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('course-materials')
                                                            .getPublicUrl(filePath);
                                                        setFormData({ ...formData, author_image_url: publicUrl });
                                                    } catch (error: any) {
                                                        alert(error.message);
                                                    }
                                                };
                                                input.click();
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/50 hover:bg-white rounded-2xl text-indigo-600 transition-all shadow-sm"
                                        >
                                            <Upload className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Knowledge Flux Section */}
                        <div className="bg-white border border-gray-100 rounded-[60px] p-16 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700">
                            <h3 className="text-2xl font-black tracking-tight mb-12 flex items-center gap-5 uppercase italic text-gray-900">
                                <Code2 className="w-7 h-7 text-indigo-600" />
                                Payload Flux Pengetahuan (HTML)
                            </h3>
                            <div className="space-y-6">
                                <textarea
                                    value={formData.content_body}
                                    onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-[45px] py-12 px-14 text-gray-800 font-mono text-sm leading-relaxed focus:ring-[20px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner h-[600px] custom-scrollbar placeholder:text-gray-200"
                                    placeholder="&lt;h2&gt;Inisialisasi Logika&lt;/h2&gt;\n&lt;p&gt;Mulai artikulasi teknis...&lt;/p&gt;"
                                    required
                                />
                                <div className="flex items-center gap-4 px-8 py-5 bg-indigo-50 rounded-3xl border border-indigo-100/50">
                                    <div className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Hidrasi Aktif: Payload manifest siap sinkronisasi.</p>
                                </div>
                            </div>
                        </div>

                        {/* Deployment Footer */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-16 bg-white border border-gray-100 rounded-[60px] shadow-sm">
                            <div className="flex flex-col gap-12 w-full">
                                <div className="flex items-start gap-8">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_free"
                                            checked={formData.is_free}
                                            onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                                            className="peer w-12 h-12 appearance-none bg-gray-50 border-2 border-gray-100 rounded-3xl checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer shadow-inner"
                                        />
                                        <CheckCircle2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div>
                                        <label htmlFor="is_free" className="text-2xl font-black tracking-tighter cursor-pointer uppercase italic text-gray-900">Akses Gratis (Penuh)</label>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Jika aktif, member gratis dapat mengakses SELURUH modul di kursus ini tanpa premium.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-8">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_published"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                            className="peer w-12 h-12 appearance-none bg-gray-50 border-2 border-gray-100 rounded-3xl checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer shadow-inner"
                                        />
                                        <CheckCircle2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div>
                                        <label htmlFor="is_published" className="text-2xl font-black tracking-tighter cursor-pointer uppercase italic text-gray-900">Siaran Universal (Published)</label>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Jika aktif, manifest dapat diakses segera oleh semua operatif.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-6 w-full md:w-auto mt-10 md:mt-0">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/courses')}
                                    className="flex-1 md:flex-none px-12 py-6 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase tracking-[0.25em] rounded-[30px] transition-all shadow-inner"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 md:flex-none px-16 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.25em] rounded-[30px] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {saving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-6 h-6" />}
                                    Terapkan Tambalan (Deploy Patch)
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* Studio Accents */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-100/40 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/20 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
        </div>
    );
};

export default EditCourse;
