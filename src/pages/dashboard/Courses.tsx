import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Search, Book, GraduationCap, ChevronRight } from 'lucide-react';

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
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Book className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
                </div>
                <p className="mt-6 text-gray-500 font-medium">Loading courses...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg text-blue-600 text-sm font-semibold mb-3">
                        <GraduationCap className="w-4 h-4" />
                        My Courses
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        Available Courses
                    </h1>
                    <p className="text-gray-600">Explore and enroll in courses for your learning path</p>
                </div>

                <div className="w-full md:w-80 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/dashboard/courses/${course.id}`} className="group block">
                                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
                                    {course.thumbnail_url ? (
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                                            <BookOpen size={48} className="text-gray-300" />
                                        </div>
                                    )}

                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                                                {user?.learning_path?.toUpperCase()}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                {course.duration_hours || 0} hours
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                            {course.description}
                                        </p>

                                        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                                            <span className="text-xs font-medium text-gray-500">View course</span>
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery
                                ? `No courses match your search "${searchQuery}"`
                                : 'No courses are currently available for your learning path'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
