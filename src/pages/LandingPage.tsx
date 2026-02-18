import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Course, CourseChapter } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Users,
    Code,
    Laptop,
    Shield,
    ArrowRight,
    CheckCircle,
    Zap,
    TrendingUp,
    Rocket,
    Layout,
    Trophy,
    Menu,
    X,
    Award,
    Eye,
    Clock,
    Lock
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedChapters, setSelectedChapters] = useState<CourseChapter[]>([]);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [realStats, setRealStats] = useState({
        students: 0,
        modules: 0,
        premiumUsers: 0,
        avgScore: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Stats
                const { count: studentCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'member');

                const { count: moduleCount } = await supabase
                    .from('course_chapters')
                    .select('*', { count: 'exact', head: true });

                const { count: premiumCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_premium', true);

                const { data: grades } = await supabase
                    .from('assignments')
                    .select('grade')
                    .not('grade', 'is', null);

                let avg = 0;
                if (grades && grades.length > 0) {
                    const sum = grades.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                    avg = Math.round(sum / grades.length);
                }

                setRealStats({
                    students: studentCount || 0,
                    modules: moduleCount || 0,
                    premiumUsers: premiumCount || 0,
                    avgScore: avg || 0
                });

                // Fetch published courses for showcase
                const { data: courseData } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('is_published', true)
                    .order('created_at', { ascending: false });

                if (courseData) setCourses(courseData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchChapters = async (courseId: string) => {
        setLoadingChapters(true);
        const { data } = await supabase
            .from('course_chapters')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index');

        if (data) setSelectedChapters(data);
        setLoadingChapters(false);
    };

    const handleCourseClick = (course: Course) => {
        setSelectedCourse(course);
        fetchChapters(course.id);
    };

    const features = [
        {
            icon: BookOpen,
            title: 'Kurikulum Terstruktur',
            description: 'Belajar langkah demi langkah dengan kursus yang dirancang profesional dan jalur belajar yang jelas',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            icon: Users,
            title: 'Mentoring Ahli',
            description: 'Dapatkan masukan dan bimbingan langsung dari profesional industri',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            icon: Trophy,
            title: 'Siap Karir',
            description: 'Bangun proyek dunia nyata dan asah skill yang dicari perusahaan',
            gradient: 'from-emerald-500 to-emerald-600'
        },
        {
            icon: Award,
            title: 'Sertifikasi Resmi',
            description: 'Dapatkan sertifikat yang diakui setelah menyelesaikan kursus dan penilaian',
            gradient: 'from-amber-500 to-amber-600'
        },
    ];

    const stats = [
        { label: 'Siswa Aktif', value: loading ? '...' : `${realStats.students}`, icon: Users, color: 'blue' },
        { label: 'Modul Kursus', value: loading ? '...' : `${realStats.modules}`, icon: BookOpen, color: 'purple' },
        { label: 'Member Premium', value: loading ? '...' : `${realStats.premiumUsers}`, icon: Zap, color: 'emerald' },
        { label: 'Tingkat Kelulusan', value: loading ? '...' : `${realStats.avgScore || 96}%`, icon: TrendingUp, color: 'amber' },
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
            {/* Header */}
            <header className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-6xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                            alt="Kaze Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="text-xl font-black italic tracking-tighter text-gray-900 uppercase">Kaze Developer</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-5 py-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            Masuk
                        </Link>
                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            Daftar Gratis
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="md:hidden border-t border-gray-100 bg-white"
                    >
                        <div className="p-6 flex flex-col gap-3">
                            <Link
                                to="/login"
                                className="w-full py-4 border border-gray-100 text-center font-bold uppercase tracking-widest text-gray-700 rounded-2xl"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Masuk
                            </Link>
                            <Link
                                to="/signup"
                                className="w-full py-4 bg-blue-600 text-white text-center font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Daftar Gratis
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                                <Rocket className="w-4 h-4" />
                                Inisialisasi Karir Developer
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter italic uppercase">
                                Belajar Menjadi{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Developer Pro
                                </span>
                            </h1>

                            <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                                Platform belajar coding dengan kurikulum terstruktur, mentor berpengalaman, dan proyek nyata. Dari nol hingga siap kerja di industri global.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 mb-12">
                                <Link
                                    to="/signup"
                                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    Mulai Belajar
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/admin"
                                    className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:border-gray-300 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                                >
                                    <Shield className="w-5 h-5" />
                                    Admin Portal
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 flex-wrap text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Akses Gratis Basis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Sertifikat Resmi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span>Mentor Berpengalaman</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Visual Dashboard Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative hidden md:block"
                        >
                            <div className="bg-white rounded-[48px] shadow-2xl shadow-blue-500/10 border border-gray-100 p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] opacity-60"></div>
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px] opacity-60"></div>

                                <div className="relative space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-600/20">
                                            KD
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 uppercase italic tracking-tighter text-xl">Dasbor Member</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selamat Datang Operatif</div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Kemajuan Kursus</span>
                                                <span className="text-sm font-black text-blue-600">67%</span>
                                            </div>
                                            <div className="h-3 bg-white rounded-full overflow-hidden shadow-sm">
                                                <motion.div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '67%' }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                ></motion.div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-6 bg-white rounded-3xl border border-gray-50 shadow-sm text-center">
                                                <div className="text-2xl font-black text-gray-900 mb-1 tracking-tighter">12</div>
                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Modul</div>
                                            </div>
                                            <div className="p-6 bg-white rounded-3xl border border-gray-50 shadow-sm text-center">
                                                <div className="text-2xl font-black text-gray-900 mb-1 tracking-tighter">24</div>
                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Tugas</div>
                                            </div>
                                            <div className="p-6 bg-white rounded-3xl border border-gray-50 shadow-sm text-center">
                                                <div className="text-2xl font-black text-gray-900 mb-1 tracking-tighter">96</div>
                                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Skor</div>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center gap-5">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <Layout className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-black text-gray-900 text-xs uppercase tracking-tight">Pola React Lanjutan</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Lanjutkan ke Modul 03</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Courses Showcase Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                                <Zap className="w-4 h-4" />
                                Katalog Manifest
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase underline decoration-indigo-200 decoration-8 underline-offset-[12px]">
                                Jelajahi Pengetahuan
                            </h2>
                        </div>
                        <p className="text-gray-400 font-bold max-w-md md:text-right uppercase tracking-[0.1em] text-[10px] leading-relaxed">
                            Pilih modul pembelajaran Anda. Anda dapat melihat syllabus materi sebelum memutuskan untuk bergabung.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                onClick={() => handleCourseClick(course)}
                                className="group bg-white border border-gray-100 rounded-[40px] p-8 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                        <Eye className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        {course.category === 'fe' ? <Laptop className="w-7 h-7 text-indigo-600" /> :
                                            course.category === 'be' ? <Code className="w-7 h-7 text-indigo-600" /> :
                                                <Zap className="w-7 h-7 text-indigo-600" />}
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{course.category === 'fe' ? 'Frontend' : course.category === 'be' ? 'Backend' : 'Fullstack'}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Clock className="w-3 h-3 text-gray-300" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{course.duration_hours || '0'} Jam Akses</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed mb-8">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 italic uppercase">
                                            {(course.author_name || 'K').charAt(0)}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.author_name || 'Kaze Admin'}</span>
                                    </div>
                                    <div className="px-4 py-2 bg-gray-50 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                                        Lihat Silabus
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Syllabus Modal */}
            <AnimatePresence>
                {selectedCourse && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCourse(null)}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-[40px] shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">Syllabus Manifest</span>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter shrink-0">{selectedCourse.title}</h2>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operatif harus Masuk untuk mengakses payload unit</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all hover:text-gray-900"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-gray-50/50">
                                {loadingChapters ? (
                                    <div className="py-20 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mendekripsi Struktur Modul...</p>
                                    </div>
                                ) : selectedChapters.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Belum ada modul yang terdaftar dalam manifest ini.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedChapters.map((chapter, index) => (
                                            <div
                                                key={chapter.id}
                                                className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between gap-6 hover:border-indigo-500/30 transition-all group shadow-sm"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 uppercase italic tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">{chapter.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{chapter.material_type} module</span>
                                                            <div className="flex items-center gap-1">
                                                                <Lock className="w-3 h-3 text-red-300" />
                                                                <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">Terkunci</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="px-6 py-2.5 bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    Buka
                                                    <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center md:text-left">
                                    <p className="text-gray-900 font-black uppercase italic tracking-tight">Siap untuk Inisialisasi?</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Daftar sekarang untuk membuka akses payload penuh.</p>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <Link
                                        to="/signup"
                                        className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all text-center"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="flex-1 md:flex-none px-8 py-4 bg-gray-50 text-gray-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-gray-100 transition-all text-center"
                                    >
                                        Masuk
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className={`inline-flex p-4 rounded-2xl bg-${stat.color}-50 mb-5`}>
                                    <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                                </div>
                                <div className="text-4xl font-black text-gray-900 mb-2 tracking-tighter italic">{stat.value}</div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 md:py-32 bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                            Sistem Utama
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase mb-6">
                            Keunggulan Operatif
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                            Platform yang dirancang khusus dengan arsitektur premium untuk membantu Anda bertransformasi menjadi developer industri tingkat atas.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-[40px] p-10 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-gray-100 group"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-4 uppercase italic tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed font-medium">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-8 py-20 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[60px] text-center relative overflow-hidden shadow-2xl shadow-indigo-900/40">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] opacity-40"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px] opacity-40"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter italic uppercase">
                            Siap Memulai Inisialisasi?
                        </h2>
                        <p className="text-lg text-indigo-100/70 mb-12 max-w-2xl mx-auto font-medium">
                            Bergabung dengan ribuan operatif yang telah meningkatkan basis pengetahuan mereka bersama Kaze Developer.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-4 px-12 py-6 bg-white text-indigo-900 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-50 transition-all shadow-2xl active:scale-95"
                        >
                            Daftar Sekarang Gratis
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-20">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-8">
                            <a
                                href="https://kazeserenity.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 px-6 py-2 rounded-full"
                            >
                                Powered by <span className="text-gray-900">Kaze Serenity</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-4 mb-10">
                            <img
                                src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                                alt="Kaze Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <span className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Kaze Developer</span>
                        </div>

                        <div className="flex gap-10 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            <Link to="/" className="hover:text-indigo-600 transition-colors">Beranda</Link>
                            <Link to="/login" className="hover:text-indigo-600 transition-colors">Masuk</Link>
                            <Link to="/signup" className="hover:text-indigo-600 transition-colors">Daftar</Link>
                        </div>

                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            © 2026 Kaze Serenity. Hak Cipta Dilindungi.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
