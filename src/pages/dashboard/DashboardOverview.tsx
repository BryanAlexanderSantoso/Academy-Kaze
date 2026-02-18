import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Course, Assignment } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Trophy, Calendar, ArrowRight, Clock, Activity, Zap, Target, Rocket, ChevronRight, Layout, Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Helper function to get learning path name in Indonesian
const getLearningPathName = (path: string | null | undefined): string => {
    switch (path) {
        case 'fe': return 'Frontend Engineer';
        case 'be': return 'Backend Engineer';
        case 'fs': return 'Fullstack Developer';
        case 'seo': return 'SEO Specialist';
        default: return 'Inisialisasi Jalur';
    }
};

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
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse italic">Menghubungkan Terminal Utama...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-20">
            {/* Welcome Premium Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gray-900 rounded-[60px] p-12 lg:p-20 text-white overflow-hidden shadow-2xl shadow-indigo-900/10 group"
            >
                {/* Dynamic Background Effects */}
                <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-br from-indigo-600 to-purple-600 opacity-20 blur-[150px] -translate-y-1/2 translate-x-1/4 group-hover:opacity-30 transition-opacity duration-1000" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600 opacity-10 blur-[120px] group-hover:opacity-20 transition-opacity duration-1000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 italic">
                            <Rocket className="w-4 h-4 animate-bounce" />
                            SESI_TERHUBUNG_KE_NODE_PUSAT
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85]">
                                Halo, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.full_name.split(' ')[0]}!</span>
                            </h1>
                            <p className="text-gray-400 text-xl font-medium leading-relaxed max-w-sm italic">
                                Sektor <span className="text-white font-bold">{getLearningPathName(user?.learning_path)}</span> siap untuk dieksekusi hari ini.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/dashboard/courses')}
                                className="px-10 py-5 bg-white text-gray-900 font-black text-[11px] rounded-2xl uppercase tracking-[0.2em] italic hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-2xl"
                            >
                                LANJUTKAN_MODUL
                                <ChevronRight size={18} />
                            </button>
                            {user?.is_premium && (
                                <div className="px-6 py-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Crown className="w-5 h-5 text-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">OTORITAS_PREMIUM_AKTIF</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col items-end gap-10">
                        <div className="relative inline-flex items-center justify-center p-10 bg-white/5 backdrop-blur-xl rounded-[60px] border border-white/10 shadow-2xl">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    className="text-white/5"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="76"
                                    cx="80"
                                    cy="80"
                                />
                                <motion.circle
                                    className="text-indigo-400"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 76}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 76 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 76 * (1 - 0.12) }} // Mock 12%
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="76"
                                    cx="80"
                                    cy="80"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-black tracking-tighter italic">12%</span>
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none mt-2">Sinkronisasi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tactical Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { label: 'MODUL_DIBUKA', value: stats.completedCourses, icon: BookOpen, color: 'indigo', sub: 'Materi Tersedia', unit: 'Unit' },
                    { label: 'ANTREAN_LOG_TUGAS', value: stats.pendingAssignments, icon: Activity, color: 'purple', sub: 'Menunggu Verifikasi', unit: 'Item' },
                    { label: 'SKOR_PERFORMA', value: stats.averageGrade, icon: Target, color: 'amber', sub: 'Rata-rata Akurasi', unit: '%' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="group bg-white border border-gray-100 p-10 rounded-[50px] shadow-sm hover:shadow-2xl hover:border-indigo-600/20 transition-all duration-700 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-10 opacity-5 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000 text-indigo-600`}>
                            <stat.icon size={100} />
                        </div>
                        <div className="space-y-12 relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full bg-indigo-500 animate-pulse`} />
                                {stat.label}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-black tracking-tighter text-gray-900 italic leading-none">{stat.value}</span>
                                    <span className="text-lg font-black text-gray-300 uppercase italic tracking-widest">{stat.unit}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">STABLE_CONNECTION</div>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">{stat.sub}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left: Curriculum Terminal */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                                <Layout className="w-7 h-7 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Library Mobul</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    TRANSMISI_KURIKULUM_HARI_INI
                                </p>
                            </div>
                        </div>
                        <Link to="/dashboard/courses" className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-[10px] font-black text-gray-400 hover:text-gray-900 rounded-[22px] transition-all uppercase tracking-[0.2em] flex items-center gap-4 italic border border-gray-100 shadow-inner">
                            TERMINAL_LENGKAP <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {courses.length > 0 ? (
                        <div className="space-y-8">
                            {courses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="group bg-white border border-gray-100 rounded-[50px] p-10 hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.1)] hover:border-indigo-600/20 transition-all duration-700 cursor-pointer overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 rotate-12">
                                        <BookOpen size={200} className="text-indigo-600" />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-12 relative z-10">
                                        <div className="w-full md:w-72 h-48 rounded-[40px] overflow-hidden bg-gray-50 flex-shrink-0 border-4 border-white shadow-xl transition-transform group-hover:scale-[1.03] duration-700">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <BookOpen size={50} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-2 space-y-6">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100 italic">
                                                    SEKTOR_{course.category?.toUpperCase()}
                                                </span>
                                                <span className="flex items-center gap-2.5 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">
                                                    <Clock className="w-4 h-4 text-indigo-400" />
                                                    DURASI: {course.duration_hours || 'N/A'} JAM
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors leading-none">
                                                    {course.title}
                                                </h3>
                                                <p className="text-base text-gray-500 font-medium line-clamp-2 leading-relaxed italic pr-12">
                                                    {course.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className={`w-10 h-10 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-400 shadow-sm transition-transform group-hover:translate-x-${i}`}>
                                                                {i}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest ml-4 italic">UNIT_MODUL_TERVALIDASI</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                                                    className="px-10 py-4 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[22px] hover:bg-black transition-all shadow-2xl shadow-gray-900/10 active:scale-95 flex items-center gap-4 italic"
                                                >
                                                    INITIALIZE_MISSION <ArrowRight className="w-5 h-5 text-indigo-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border-4 border-dashed border-gray-50 rounded-[60px] p-24 text-center group">
                            <BookOpen size={80} className="text-gray-100 mx-auto mb-10 transition-transform group-hover:scale-110 duration-700" />
                            <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">REPOSI_KOSONG</h3>
                            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] mt-4 italic">NODE KURIKULUM UNTUK SEKTOR INI SEDANG DALAM PROSES DEKRIPSI.</p>
                        </div>
                    )}
                </div>

                {/* Right: Operational Grid */}
                <div className="space-y-12">
                    <section className="bg-white border border-gray-100 rounded-[50px] p-12 shadow-sm relative overflow-hidden group/status mb-10">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 opacity-0 group-hover/status:opacity-5 blur-[80px] transition-all duration-1000 -translate-y-1/2 translate-x-1/2" />

                        <div className="space-y-12 relative z-10">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic flex items-center gap-4 border-b border-gray-50 pb-8">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                MATRIKS_OTORITAS
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Level Otoritas Belajar</span>
                                    <div className={`p-8 rounded-[35px] border-2 transition-all overflow-hidden relative group/tier ${user?.is_premium ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/20' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
                                        <div className="relative z-10 flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center gap-4 ${user?.is_premium ? 'text-white' : 'text-gray-400'}`}>
                                                    {user?.is_premium ? <Crown className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
                                                    <span className="text-xl font-black uppercase italic tracking-tighter leading-none">{user?.is_premium ? 'PREMIUM_MEMBER' : 'FREE_ACCESS'}</span>
                                                </div>
                                            </div>

                                            {user?.is_premium && (
                                                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-2xl border border-white/10">
                                                    <Clock className="w-4 h-4 text-indigo-300" />
                                                    <span className="text-[9px] font-black text-indigo-100 uppercase tracking-[0.2em] italic">
                                                        {user.premium_until ? (
                                                            (() => {
                                                                const expiry = new Date(user.premium_until);
                                                                const diff = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                                return diff > 0 ? `${diff} HARI OTORITAS TERSEDIA` : 'KADALUWARSA';
                                                            })()
                                                        ) : 'AKSES_LIFETIME_AKTIF'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Unit Kerja Aktif</span>
                                    <div className="p-8 bg-gray-50/50 rounded-[35px] border-2 border-gray-100 shadow-inner group/path hover:border-indigo-100 transition-all">
                                        <span className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none group-hover/path:text-indigo-600 transition-colors">
                                            {getLearningPathName(user?.learning_path)}
                                        </span>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-4 italic opacity-0 group-hover/path:opacity-100 transition-all">TARGET_PATH_V1.2</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!user?.is_premium && (
                            <button
                                onClick={() => navigate('/dashboard/premium')}
                                className="w-full mt-12 bg-gray-900 hover:bg-black text-white px-10 py-6 rounded-[30px] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-gray-900/20 active:scale-95 flex items-center justify-center gap-4 italic"
                            >
                                <Zap className="w-5 h-5 text-indigo-400" />
                                REQUEST_UPGRADE_AKSES
                            </button>
                        )}
                    </section>

                    <section className="bg-gray-900 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl group/logs">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 opacity-20 blur-[100px] group-hover/logs:opacity-30 transition-opacity duration-1000" />

                        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8 relative z-10">
                            <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] italic flex items-center gap-4">
                                <Calendar className="w-5 h-5" />
                                Log_Protokol_Terakhir
                            </h3>
                            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-[0.3em] rounded-lg">OPERATIONAL</div>
                        </div>

                        {assignments.length > 0 ? (
                            <div className="space-y-6 relative z-10">
                                {assignments.slice(0, 3).map((assignment, i) => (
                                    <motion.div
                                        key={assignment.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="flex items-center gap-6 p-8 bg-white/5 rounded-[35px] border border-white/5 group/entry cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-500"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400 shadow-2xl group-hover/entry:scale-110 group-hover/entry:rotate-6 transition-all duration-500">
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <p className="text-sm font-black text-white truncate uppercase italic tracking-tight group-hover/entry:text-indigo-400 transition-colors">{assignment.course?.title}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] italic">LOG_ENTRY: TRANSMIT_PAYLOAD</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center opacity-20 space-y-6">
                                <Activity size={50} className="mx-auto animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">BELUM_ADA_AKTIVITAS_TERDETEKSI</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
