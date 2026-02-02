import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Course, Assignment } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Trophy, Calendar, ArrowRight, Clock, Activity, Zap, Target, Rocket, ChevronRight, Layout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardOverview: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [stats, setStats] = useState({
        completedCourses: 0,
        pendingAssignments: 0,
        averageGrade: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            // Fetch courses for user's learning path
            const { data: coursesData } = await supabase
                .from('courses')
                .select('*')
                .eq('category', user?.learning_path)
                .eq('is_published', true)
                .order('schedule_date', { ascending: true })
                .limit(3);

            // Fetch user assignments
            const { data: assignmentsData } = await supabase
                .from('assignments')
                .select(`
          *,
          course:courses(title, category)
        `)
                .eq('student_id', user?.id)
                .order('created_at', { ascending: false });

            if (coursesData) setCourses(coursesData);
            if (assignmentsData) {
                setAssignments(assignmentsData);

                const graded = assignmentsData.filter(a => a.grade !== null);
                const avgGrade = graded.length > 0
                    ? graded.reduce((acc, a) => acc + (a.grade || 0), 0) / graded.length
                    : 0;

                setStats({
                    completedCourses: coursesData?.length || 0,
                    pendingAssignments: assignmentsData.filter(a => a.grade === null).length,
                    averageGrade: Math.round(avgGrade),
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Command Hub...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            {/* Welcome Matrix */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gray-900 rounded-[50px] p-12 lg:p-16 text-white overflow-hidden shadow-2xl shadow-gray-900/20"
            >
                <div className="absolute top-0 right-0 w-[50%] h-full bg-indigo-600 opacity-20 blur-[150px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-600 opacity-10 blur-[100px]" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                            <Rocket className="w-3.5 h-3.5" />
                            Session_Initialized
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                            Welcome back, <br />
                            <span className="text-indigo-400">{user?.full_name.split(' ')[0]}!</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-sm italic">
                            Your trajectory is set to <span className="text-white">{user?.learning_path === 'fe' ? 'Frontend' : user?.learning_path === 'be' ? 'Backend' : 'Fullstack'}</span> mastery. Continue the curriculum.
                        </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-4 text-center lg:text-right">
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle
                                    className="text-white/5"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="80"
                                    cx="96"
                                    cy="96"
                                />
                                <motion.circle
                                    className="text-indigo-500"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 80}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - 0.12) }} // Mock 12% progress
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="80"
                                    cx="96"
                                    cy="96"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-black tracking-tighter italic">12%</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Global Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Available Nodes', value: stats.completedCourses, icon: BookOpen, color: 'indigo', sub: 'Curriculum Items' },
                    { label: 'Task Backlog', value: stats.pendingAssignments, icon: Activity, color: 'emerald', sub: 'Awaiting Validation' },
                    { label: 'Neural Alpha', value: stats.averageGrade, icon: Target, color: 'amber', sub: 'Performance Mean' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="group bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-${stat.color}-600`}>
                            <stat.icon size={80} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">{stat.label}</h3>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-4xl font-black tracking-tighter text-gray-900">{stat.value}</span>
                            <div className={`px-2 py-0.5 bg-${stat.color}-50 text-${stat.color}-600 rounded text-[9px] font-black uppercase tracking-widest mb-2`}>Sync_Active</div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left: Curriculum Console */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Layout className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Curriculum Pipeline</h2>
                        </div>
                        <Link to="/dashboard/courses" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-black text-gray-500 hover:text-gray-900 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2">
                            DATA_LOG <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {courses.length > 0 ? (
                        <div className="space-y-6">
                            {courses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="group bg-white border border-gray-100 rounded-[40px] p-8 hover:shadow-2xl hover:border-indigo-600/20 transition-all duration-500 cursor-pointer overflow-hidden relative"
                                >
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="w-full md:w-56 h-40 rounded-[30px] overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                    <BookOpen size={40} className="text-gray-200" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-2">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                                                    {course.category?.toUpperCase()}_SECTOR
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    LOAD: {course.duration_hours || 'N/A'}H
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2 leading-relaxed italic">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-8 h-8 rounded-full border-[3px] border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-400">
                                                                {i}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest ml-2">12_MODULES_SYNCED</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                                    className="px-8 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95 flex items-center gap-3"
                                                >
                                                    RESUME_MISSION <ArrowRight className="w-4 h-4 text-indigo-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[50px] p-20 text-center">
                            <BookOpen size={60} className="text-gray-100 mx-auto mb-8" />
                            <h3 className="text-2xl font-black text-gray-900 uppercase italic">Repository Empty</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">Curriculum nodes for this sector are currently offline.</p>
                        </div>
                    )}
                </div>

                {/* Right: Operational Status */}
                <div className="space-y-12">
                    <section className="bg-white border border-gray-100 rounded-[50px] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Operative Status
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div className="flex flex-col gap-2 p-6 bg-gray-50 rounded-[30px] border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Authentication Level</span>
                                <div className="flex flex-col items-start gap-2">
                                    <div className="flex items-center justify-between w-full">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${user?.is_premium ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                            {user?.is_premium ? 'PREMIUM_CORE' : 'FREE_TIER'}
                                        </span>
                                        {!user?.is_premium && (
                                            <Link to="/dashboard/premium" className="text-indigo-600 font-black text-[9px] uppercase tracking-widest border-b border-indigo-200">Request_Uplink</Link>
                                        )}
                                    </div>
                                    {user?.is_premium && (
                                        <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${user.premium_until ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {user.premium_until ? <Clock className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                            {(() => {
                                                if (!user.premium_until) return 'LIFETIME ACCESS';
                                                const today = new Date();
                                                const expiry = new Date(user.premium_until);
                                                if (expiry < today) return 'EXPIRED';
                                                const diffTime = expiry.getTime() - today.getTime();
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                return `${diffDays} DAYS REMAINING`;
                                            })()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 p-6 bg-gray-50 rounded-[30px] border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Specialization</span>
                                <span className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">
                                    {user?.learning_path === 'fe' ? 'Frontend' : user?.learning_path === 'be' ? 'Backend' : 'Fullstack'}_DEV
                                </span>
                            </div>
                        </div>
                        {!user?.is_premium && (
                            <button
                                onClick={() => navigate('/dashboard/premium')}
                                className="w-full mt-10 bg-gray-900 hover:bg-black text-white px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-gray-900/10 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Zap className="w-4 h-4 text-indigo-400" />
                                ESCALATE_AUTHORIZATION
                            </button>
                        )}
                    </section>

                    <section className="bg-gray-900 rounded-[50px] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-20 blur-[60px]" />
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <Calendar className="w-4 h-4" />
                            Last Sync Records
                        </h3>
                        {assignments.length > 0 ? (
                            <div className="space-y-4">
                                {assignments.slice(0, 3).map((assignment, i) => (
                                    <motion.div
                                        key={assignment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="flex items-center gap-5 p-5 bg-white/5 rounded-[24px] border border-white/10 group cursor-pointer hover:bg-white/10 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-white truncate uppercase tracking-tight italic">{assignment.course?.title}</p>
                                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">LOG_TYPE: TASK_SUBMIT</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center opacity-30">
                                <Activity size={32} className="mx-auto mb-4" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Zero_Aktivitas_Log</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
