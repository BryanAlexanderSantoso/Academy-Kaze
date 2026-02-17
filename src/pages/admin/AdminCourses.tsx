import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft,
    Search, Grid, List as ListIcon,
    ChevronRight, Layout, Layers,
    Calendar, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

const AdminCourses: React.FC = () => {
    const navigate = useNavigate();
    const { } = useAuth();
    const { showAlert } = useAlert();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const { data } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setCourses(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading courses:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        showAlert({
            title: 'Terminate Course',
            message: 'Are you sure you want to permanently delete this course index from the curriculum?',
            type: 'delete',
            confirmText: 'Confirm Deletion',
            cancelText: 'Abort',
            showCancel: true,
            onConfirm: async () => {
                const { error } = await supabase.from('courses').delete().eq('id', id);
                if (!error) {
                    setCourses(courses.filter((c) => c.id !== id));
                    showAlert({
                        title: 'Success',
                        message: 'Course has been successfully removed.',
                        type: 'success'
                    });
                } else {
                    showAlert({
                        title: 'Error',
                        message: 'Failed to delete course: ' + error.message,
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleTogglePublish = async (course: Course) => {
        const { error } = await supabase
            .from('courses')
            .update({ is_published: !course.is_published })
            .eq('id', course.id);

        if (!error) {
            loadCourses();
        }
    };


    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryBadge = (category: string) => {
        const colors = {
            fe: 'bg-indigo-50 text-indigo-600',
            be: 'bg-emerald-50 text-emerald-600',
            fs: 'bg-amber-50 text-amber-600',
        };
        const labels = {
            fe: 'Frontend',
            be: 'Backend',
            fs: 'Fullstack',
        };
        return (
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${colors[category as keyof typeof colors]}`}>
                {labels[category as keyof typeof labels] || category}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-4 text-gray-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Compiling Catalog...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Control Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-5 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Layout className="w-6 h-6 text-indigo-600" />
                                Curriculum Control
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Library Master</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-all" />
                            <input
                                type="text"
                                placeholder="Search index..."
                                className="w-full md:w-64 bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="p-1.5 bg-gray-100 rounded-2xl flex items-center gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <Link to="/admin/courses/new" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                            <Plus className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                {filteredCourses.length === 0 ? (
                    <div className="card py-32 text-center border-dashed border-2 bg-gray-50/50 rounded-[40px]">
                        <BookOpen className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">Library Empty</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-10 font-medium">Your learning materials database is currently empty. Start by digitizing your first curriculum.</p>
                        <Link to="/admin/courses/new" className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all inline-block">
                            INITIALIZE FIRST COURSE
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
                        <AnimatePresence mode="popLayout">
                            {filteredCourses.map((course, idx) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`card group hover:shadow-2xl transition-all duration-500 border-none relative overflow-hidden bg-white p-0 flex flex-col ${viewMode === 'list' ? 'flex-row items-center !p-4' : 'rounded-[40px]'}`}
                                >
                                    {/* Thumbnail / Visual Area */}
                                    <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'grid' ? 'aspect-[16/10] w-full' : 'w-48 h-28 rounded-3xl flex-shrink-0'}`}>
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <BookOpen className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {getCategoryBadge(course.category)}
                                        </div>
                                        <div className="absolute top-4 right-4 z-10">
                                            <button
                                                onClick={() => handleTogglePublish(course)}
                                                className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${course.is_published
                                                    ? 'bg-indigo-600/90 text-white'
                                                    : 'bg-white/90 text-gray-400'
                                                    }`}
                                            >
                                                {course.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className={`flex flex-col flex-1 ${viewMode === 'grid' ? 'p-8 pb-10' : 'px-8'}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className={`font-black text-gray-900 group-hover:text-indigo-600 transition-colors ${viewMode === 'grid' ? 'text-2xl leading-tight' : 'text-lg'}`}>
                                                {course.title}
                                            </h3>
                                        </div>

                                        <p className={`text-gray-400 font-medium line-clamp-2 leading-relaxed mb-6 ${viewMode === 'grid' ? 'text-sm' : 'text-xs'}`}>
                                            {course.description || 'No descriptive data encapsulated.'}
                                        </p>

                                        <div className="flex items-center gap-6 mt-auto">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {course.schedule_date ? new Date(course.schedule_date).toLocaleDateString() : 'DRAFT'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                {course.duration_hours || '0'} HOURS
                                            </div>
                                        </div>

                                        <div className={`mt-8 pt-8 border-t border-gray-50 flex items-center justify-between ${viewMode === 'list' ? 'hidden' : 'block'}`}>
                                            <Link
                                                to={`/admin/courses/${course.id}/chapters`}
                                                className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group/link"
                                            >
                                                MANAGE CHAPTERS
                                                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                            </Link>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/courses/${course.id}/edit`}
                                                    className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List View Actions */}
                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-3 pr-6">
                                            <Link
                                                to={`/admin/courses/${course.id}/chapters`}
                                                className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"
                                                title="Chapters"
                                            >
                                                <Layers className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to={`/admin/courses/${course.id}/edit`}
                                                className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-2xl"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 rounded-2xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
