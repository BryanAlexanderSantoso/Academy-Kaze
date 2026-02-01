import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Search, Book, Sparkles, ChevronRight, Activity } from 'lucide-react';

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
            const { data } = await supabase
                .from('courses')
                .select('*')
                .eq('category', user?.learning_path)
                .eq('is_published', true)
                .order('schedule_date', { ascending: true });

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
                    <Book className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Scanning Curriculum Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Massive Header */}
            <div className="relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            Curriculum_Nexus
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                            Course <br />
                            <span className="text-indigo-600">Manifest.</span>
                        </h1>
                    </div>

                    <div className="w-full md:w-96 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH_REGISTRY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-100 focus:border-indigo-500/50 rounded-[30px] py-6 pl-16 pr-8 text-sm font-black text-gray-900 transition-all shadow-sm focus:shadow-xl focus:shadow-indigo-500/5 placeholder:text-gray-200 uppercase tracking-widest outline-none"
                        />
                    </div>
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
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/dashboard/courses/${course.id}`} className="group block">
                                <div className="bg-white border border-gray-100 rounded-[50px] p-8 h-full transition-all duration-500 hover:shadow-3xl hover:border-indigo-600/20 hover:-translate-y-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {course.thumbnail_url ? (
                                        <div className="-mt-8 -mx-8 mb-8 h-64 overflow-hidden relative border-b border-gray-50">
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                                        </div>
                                    ) : (
                                        <div className="-mt-8 -mx-8 mb-8 h-64 bg-gray-50 flex items-center justify-center border-b border-gray-50">
                                            <BookOpen size={60} className="text-gray-100" />
                                        </div>
                                    )}

                                    <div className="relative z-10 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                {user?.learning_path?.toUpperCase()}_CORE
                                            </span>
                                            <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                {course.duration_hours || '??'}_HRS
                                            </span>
                                        </div>

                                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors leading-none">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed italic uppercase tracking-tight">
                                            {course.description}
                                        </p>

                                        <div className="pt-8 flex items-center justify-between border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active_Node</span>
                                            </div>
                                            <div className="w-12 h-12 bg-gray-50 rounded-[20px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-gray-50/50 rounded-[60px] border-4 border-dashed border-gray-100">
                        <Activity size={80} className="text-gray-100 mx-auto mb-8" />
                        <h3 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">No Nodes Located.</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">The curriculum manifest is currently empty for this sector.</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-10 px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl"
                            >
                                RESET_SEARCH
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
