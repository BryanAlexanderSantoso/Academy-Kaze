import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { CourseChapter, Course } from '../../lib/supabase';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    Type,
    FileText,
    Link as LinkIcon,
    Trash2,
    GripVertical,
    Save,
    ArrowLeft,
    Layers,
    Sparkles,
    Edit,
    Monitor,
    BookOpen,
    Zap,
    LogOut,
    Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ManageChapters: React.FC = () => {
    const { id: courseId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<CourseChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Editor State
    const [editingChapter, setEditingChapter] = useState<Partial<CourseChapter> | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadCourseAndChapters();
        }
    }, [courseId]);

    const loadCourseAndChapters = async () => {
        setLoading(true);
        try {
            const [courseRes, chaptersRes] = await Promise.all([
                supabase.from('courses').select('*').eq('id', courseId).single(),
                supabase.from('course_chapters').select('*').eq('course_id', courseId).order('order_index')
            ]);

            if (courseRes.data) setCourse(courseRes.data);
            if (chaptersRes.data) setChapters(chaptersRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChapter = (type: 'text' | 'file' | 'link') => {
        const newChapter: Partial<CourseChapter> = {
            course_id: courseId as string,
            title: '',
            material_type: type,
            content_body: '',
            file_url: '',
            file_name: '',
            order_index: chapters.length,
            is_preview: false
        };
        setEditingChapter(newChapter);
        setIsSidebarOpen(true);
    };

    const handleEditChapter = (chapter: CourseChapter) => {
        setEditingChapter({ ...chapter });
        setIsSidebarOpen(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingChapter) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${courseId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('course-materials')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('course-materials')
                .getPublicUrl(filePath);

            setEditingChapter({
                ...editingChapter,
                file_url: publicUrl,
                file_name: file.name
            });
        } catch (error: any) {
            console.error('Error uploading file:', error);
            alert('Gagal mengupload file: ' + error.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSaveChapter = async () => {
        if (!editingChapter || !editingChapter.title) return;
        setSaving(true);

        try {
            // Clean up object for DB
            const payload = {
                course_id: editingChapter.course_id,
                title: editingChapter.title,
                material_type: editingChapter.material_type,
                content_body: editingChapter.content_body || null,
                file_url: editingChapter.file_url || null,
                file_name: editingChapter.file_name || null,
                order_index: editingChapter.order_index,
                is_preview: editingChapter.is_preview
            };

            if (editingChapter.id) {
                // Update
                const { error } = await supabase
                    .from('course_chapters')
                    .update(payload)
                    .eq('id', editingChapter.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('course_chapters')
                    .insert([payload]);
                if (error) throw error;
            }

            await loadCourseAndChapters();
            setIsSidebarOpen(false);
            setEditingChapter(null);
        } catch (error) {
            console.error('Error saving chapter:', error);
            alert('Gagal menyimpan chapter.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (!confirm('Yakin ingin menghapus chapter ini?')) return;

        try {
            const { error } = await supabase
                .from('course_chapters')
                .delete()
                .eq('id', chapterId);

            if (error) throw error;
            setChapters(chapters.filter(c => c.id !== chapterId));
        } catch (error) {
            console.error('Error deleting chapter:', error);
        }
    };

    const handleReorder = async (newOrder: CourseChapter[]) => {
        setChapters(newOrder);

        // Update order_index in DB
        const updates = newOrder.map((chapter, index) => ({
            id: chapter.id,
            order_index: index,
            course_id: chapter.course_id,
            title: chapter.title,
            material_type: chapter.material_type,
            file_url: chapter.file_url,
            is_preview: chapter.is_preview
        }));

        const { error } = await supabase.from('course_chapters').upsert(updates);
        if (error) console.error('Error updating order:', error);
    };

    const handleSignOut = () => {
        localStorage.removeItem('adminUser');
        setUser(null);
        navigate('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-4 text-gray-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Nodes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Premium Header */}
                <header className="bg-white border-b border-gray-100 px-10 py-6 sticky top-0 z-30 shadow-sm backdrop-blur-md">
                    <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/admin/courses')}
                                className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                    Knowledge Architect
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course?.title || 'System Index'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col text-right mr-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modules Count</p>
                                <p className="text-sm font-black text-indigo-600">{chapters.length} Units</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-[1200px] mx-auto w-full px-10 py-12">
                    {/* Action Hub */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { label: 'Inject Text', icon: Type, type: 'text', color: 'indigo' },
                            { label: 'Upload Module', icon: FileText, type: 'file', color: 'emerald' },
                            { label: 'Link Resource', icon: LinkIcon, type: 'link', color: 'amber' }
                        ].map((action) => (
                            <button
                                key={action.type}
                                onClick={() => handleAddChapter(action.type as any)}
                                className="group relative bg-white border border-gray-100 hover:border-indigo-500/30 rounded-[32px] p-8 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 text-left"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-${action.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{action.label}</h3>
                                <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase">Initialize Node</p>
                            </button>
                        ))}
                    </div>

                    {/* Chapter Sequencer */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase italic">
                                <Monitor className="w-5 h-5 text-indigo-600" />
                                Sequence Pipeline
                            </h2>
                            <div className="px-4 py-2 bg-indigo-50 rounded-xl">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Drag to reorder modules</span>
                            </div>
                        </div>

                        {chapters.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[40px] py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Layers className="w-8 h-8 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase">Architecture Empty</h3>
                                <p className="text-gray-400 font-medium text-sm mt-2">Initialize your first knowledge unit to begin.</p>
                            </div>
                        ) : (
                            <Reorder.Group axis="y" values={chapters} onReorder={handleReorder} className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {chapters.map((chapter) => (
                                        <Reorder.Item
                                            key={chapter.id}
                                            value={chapter}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group relative bg-white border border-gray-100 hover:border-indigo-500/20 rounded-[28px] p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all cursor-move"
                                        >
                                            <div className="text-gray-300 group-hover:text-indigo-400 transition-colors">
                                                <GripVertical className="w-5 h-5" />
                                            </div>

                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${chapter.material_type === 'text' ? 'bg-indigo-50 text-indigo-600' :
                                                chapter.material_type === 'file' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                {chapter.material_type === 'text' ? <Type className="w-5 h-5" /> :
                                                    chapter.material_type === 'file' ? <FileText className="w-5 h-5" /> :
                                                        <LinkIcon className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-black text-gray-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors truncate">
                                                        {chapter.title || 'Untitled Node'}
                                                    </h3>
                                                    {chapter.is_preview && (
                                                        <span className="px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white rounded uppercase tracking-widest">Preview</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    {chapter.material_type} module • Index {chapter.order_index + 1}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditChapter(chapter)}
                                                    className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteChapter(chapter.id)}
                                                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </AnimatePresence>
                            </Reorder.Group>
                        )}
                    </div>
                </main>
            </div>

            {/* Premium Sidebar Editor */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 border-l border-gray-100 flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-indigo-600" />
                                        Unit Fabrication
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configuring module parameters</p>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Module Identity</label>
                                    <input
                                        type="text"
                                        value={editingChapter?.title || ''}
                                        onChange={(e) => setEditingChapter({ ...editingChapter!, title: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[24px] py-5 px-8 text-gray-900 font-black text-xl tracking-tight focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner placeholder:text-gray-300"
                                        placeholder="Introduction to Core Systems"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Module Payload ({editingChapter?.material_type})</label>
                                    {editingChapter?.material_type === 'text' ? (
                                        <textarea
                                            value={editingChapter?.content_body || ''}
                                            onChange={(e) => setEditingChapter({ ...editingChapter!, content_body: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-[32px] py-8 px-10 text-gray-800 font-medium text-lg leading-relaxed focus:ring-8 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner h-[400px] placeholder:text-gray-300"
                                            placeholder="Translate knowledge into text payload..."
                                        />
                                    ) : editingChapter?.material_type === 'file' ? (
                                        <div className="space-y-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.mp4,.zip,.jpg,.png"
                                            />

                                            {editingChapter.file_url ? (
                                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[30px] flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                                                            <FileText />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-emerald-900 uppercase truncate max-w-[200px]">{editingChapter.file_name || 'Uploaded File'}</p>
                                                            <p className="text-[9px] font-bold text-emerald-600/60 uppercase">System Linked</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditingChapter({ ...editingChapter, file_url: '', file_name: '' })}
                                                        className="p-2 bg-white text-emerald-400 hover:text-red-500 rounded-xl transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                    className="w-full h-48 border-4 border-dashed border-gray-100 rounded-[40px] hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-4 group"
                                                >
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center gap-4 w-full px-12">
                                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                                <motion.div
                                                                    className="h-full bg-indigo-600"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${uploadProgress}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Uploading {uploadProgress}%</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm">
                                                                <Upload />
                                                            </div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Payload Module</p>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editingChapter?.file_url || ''}
                                                onChange={(e) => setEditingChapter({ ...editingChapter!, file_url: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-[24px] py-5 px-8 text-indigo-600 font-mono text-sm focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                                placeholder="https://resource.payload.com"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[32px]">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_preview_edit"
                                                checked={editingChapter?.is_preview || false}
                                                onChange={(e) => setEditingChapter({ ...editingChapter!, is_preview: e.target.checked })}
                                                className="peer w-8 h-8 appearance-none bg-white border border-gray-200 rounded-xl checked:bg-indigo-600 transition-all cursor-pointer"
                                            />
                                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <div>
                                            <label htmlFor="is_preview_edit" className="text-sm font-black text-gray-900 uppercase tracking-tight cursor-pointer">Preview Tier Access</label>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Accessible by non-premium operatives.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-50 flex gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black uppercase tracking-[0.2em] rounded-[24px] transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSaveChapter}
                                    disabled={saving || uploading}
                                    className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-[24px] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5 drop-shadow-lg" />}
                                    Commit Module
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Aesthetic Background Accents */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-50/30 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
        </div>
    );
};

export default ManageChapters;
