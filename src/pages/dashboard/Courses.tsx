import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Search, Book, GraduationCap, ChevronRight, Layout, Activity } from 'lucide-react';

const Courses: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCourses();
    }, [user]);

    const loadCourses = async () => {
        try {
            let query = supabase
                .from('courses')
                .select('*')
                .eq('is_published', true)
                .order('schedule_date', { ascending: true });

            // Premium+ users see ALL courses, others see only their learning path
            if (user?.premium_type !== 'premium_plus' && user?.role !== 'admin') {
                query = query.eq('category', user?.learning_path);
            }

            const { data } = await query;

            if (data) setCourses(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading courses:', error);
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menyiapkan Kurikulum...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Header Stage */}
            <div className="flex flex-col items-start gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">
                        <GraduationCap className="w-4 h-4" />
                        Akses Kurikulum
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                        Katalog <br />
                        <span className="text-indigo-600">Terbuka</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium italic">Eksplorasi dan tingkatkan kompetensi Anda di jalur belajar ini.</p>
                </div>

                <div className="w-full relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari kurikulum atau materi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 focus:border-indigo-500/30 rounded-[30px] py-6 pl-16 pr-8 text-sm text-gray-900 transition-all outline-none focus:ring-[15px] focus:ring-indigo-500/5 shadow-sm hover:shadow-xl hover:bg-gray-50/50 uppercase font-black tracking-widest italic"
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                        >
                            <Link to={`/dashboard/courses/${course.id}`} className="group block h-full">
                                <div className="bg-white border border-gray-100 rounded-[50px] overflow-hidden h-full transition-all duration-700 hover:shadow-2xl hover:border-indigo-500/30 hover:-translate-y-2 relative group-hover:bg-white">
                                    {course.thumbnail_url ? (
                                        <div className="h-64 overflow-hidden relative">
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                            {course.is_free && (
                                                <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl italic">
                                                    Gratis ✨
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-64 bg-gray-50 flex items-center justify-center">
                                            <BookOpen size={48} className="text-gray-200 group-hover:text-indigo-200 transition-colors duration-700" />
                                        </div>
                                    )}

                                    <div className="p-10 space-y-6">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-4 py-1.5 text-[9px] font-black tracking-widest rounded-xl border transition-all ${course.category === user?.learning_path
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {course.category === 'fe' ? 'FRONTEND' : course.category === 'be' ? 'BACKEND' : course.category === 'fs' ? 'FULLSTACK' : 'OTHER'}_SECTOR
                                            </span>
                                            {course.category !== user?.learning_path && (
                                                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 text-[9px] font-black rounded-xl border border-amber-500/20 uppercase tracking-widest">
                                                    ✨ LINTAS_JALUR
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                {course.duration_hours || 0} JAM
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-all duration-500 line-clamp-2 uppercase italic tracking-tighter leading-tight">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium italic">
                                            {course.description}
                                        </p>

                                        <div className="pt-8 flex items-center justify-between border-t border-gray-50">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Lihat Materi Eksklusif</span>
                                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-600/20 transition-all transform group-hover:translate-x-1 duration-500">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-40 text-center bg-gray-50 rounded-[60px] border-2 border-dashed border-gray-100 group">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        >
                            <BookOpen size={80} className="text-gray-200 mx-auto mb-8 group-hover:text-indigo-200 transition-colors" />
                        </motion.div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase italic tracking-tighter">Data Tidak Ditemukan</h3>
                        <p className="text-gray-400 font-medium italic mb-10 max-w-md mx-auto">
                            {searchQuery
                                ? `Maaf, instruktur belum menyiapkan materi dengan kata kunci "${searchQuery}"`
                                : 'Maaf, kurikulum untuk jalur belajar Anda sedang offline.'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-10 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95"
                            >
                                Hapus Pencarian
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
