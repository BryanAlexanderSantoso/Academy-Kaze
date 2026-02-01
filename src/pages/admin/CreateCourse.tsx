import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
    Save,
    ArrowLeft,
    Shield,
    LogOut,
    Zap,
    Clock,
    Calendar,
    Monitor,
    Palette,
    Code2,
    CheckCircle2,
    Sparkles,
    Layout
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateCourse: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'fe' as 'fe' | 'be' | 'fs',
        content_body: '',
        schedule_date: '',
        duration_hours: '',
        thumbnail_url: '',
        is_published: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const courseData = {
            ...formData,
            duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
        };

        const { data, error } = await supabase.from('courses').insert([courseData]).select();

        if (error) {
            alert('Error creating course: ' + error.message);
        } else if (data && data.length > 0) {
            navigate('/admin/courses');
        }

        setLoading(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('adminUser');
        setUser(null);
        navigate('/admin');
    };

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
                                    <Zap className="w-6 h-6 text-indigo-600" />
                                    Module Fabrication
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Curriculum Node</p>
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
                            <Sparkles className="w-12 h-12 text-indigo-600" />
                        </motion.div>
                        <h2 className="text-6xl font-black tracking-tighter uppercase italic text-gray-900">Incept Module</h2>
                        <p className="text-gray-400 font-bold max-w-xl mx-auto uppercase tracking-[0.3em] text-[10px]">Initialize a new educational sequence into the global repository</p>
                    </div>

                    <div className="space-y-16">
                        {/* Primary Configuration */}
                        <div className="bg-white border border-gray-100 rounded-[60px] p-16 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700">
                            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                                <Layout className="w-80 h-80 text-indigo-600" />
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-12 flex items-center gap-5 uppercase italic text-gray-900">
                                <Shield className="w-7 h-7 text-indigo-600" />
                                Core Parameters
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[32px] py-6 px-10 text-gray-900 font-black text-3xl tracking-tighter focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner placeholder:text-gray-200"
                                        placeholder="Advanced Neural Architecture"
                                        required
                                    />
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Knowledge Abstract</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[40px] py-7 px-10 text-gray-600 font-medium text-lg leading-relaxed focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner h-40 placeholder:text-gray-200"
                                        placeholder="Overview of core modules and technical dependencies..."
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Vector Field (Path)</label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as 'fe' | 'be' | 'fs' })}
                                            className="w-full bg-gray-50 border-none rounded-[30px] py-6 px-10 text-gray-900 font-black text-xs uppercase tracking-[0.2em] focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner"
                                            required
                                        >
                                            <option value="fe">Frontend Protocol</option>
                                            <option value="be">Backend Protocol</option>
                                            <option value="fs">Fullstack Synthesis</option>
                                        </select>
                                        <Monitor className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Time Consumption (H)</label>
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
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Deployment Slot</label>
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
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Visual Marker (URL)</label>
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
                            </div>
                        </div>

                        {/* Payload Injection Section */}
                        <div className="bg-white border border-gray-100 rounded-[60px] p-16 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700">
                            <h3 className="text-2xl font-black tracking-tight mb-12 flex items-center gap-5 uppercase italic text-gray-900">
                                <Code2 className="w-7 h-7 text-indigo-600" />
                                Payload Injection (HTML)
                            </h3>
                            <div className="space-y-6">
                                <textarea
                                    value={formData.content_body}
                                    onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-[45px] py-12 px-14 text-gray-800 font-mono text-sm leading-relaxed focus:ring-[20px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner h-[600px] custom-scrollbar placeholder:text-gray-200"
                                    placeholder="&lt;h2&gt;Initialize Logic&lt;/h2&gt;\n&lt;p&gt;Begin technical articulation...&lt;/p&gt;"
                                    required
                                />
                                <div className="flex items-center gap-4 px-8 py-5 bg-indigo-50 rounded-3xl border border-indigo-100/50">
                                    <div className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Compiler Ready: Support for standard HTML tags active.</p>
                                </div>
                            </div>
                        </div>

                        {/* Broadcast Settings */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-16 bg-white border border-gray-100 rounded-[60px] shadow-sm">
                            <div className="flex items-start gap-8 mb-10 md:mb-0">
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
                                    <label htmlFor="is_published" className="text-2xl font-black tracking-tighter cursor-pointer uppercase italic text-gray-900">Global Broadcast</label>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Make this module discoverable immediately upon initialization.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/courses')}
                                    className="flex-1 md:flex-none px-12 py-6 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black uppercase tracking-[0.25em] rounded-[30px] transition-all shadow-inner"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 md:flex-none px-16 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.25em] rounded-[30px] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-6 h-6" />}
                                    Commit Node
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* Studio Accents */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-100/40 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-100/20 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
        </div>
    );
};

export default CreateCourse;
