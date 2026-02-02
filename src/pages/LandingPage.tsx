import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Code,
    Laptop,
    Shield,
    ArrowRight,
    CheckCircle,
    Zap,
    Target,
    TrendingUp,
    Activity,
    Rocket,
    Layout,
    Trophy,
    Menu,
    X,
} from 'lucide-react';

const DashboardPreview = () => {
    // ... (DashboardPreview content remains the same)
    return (
        <div className="bg-gray-50 p-4 md:p-6 rounded-3xl overflow-hidden h-full relative">
            {/* ... */}
            <div className="space-y-4 md:space-y-6 lg:space-y-8 relative z-10 w-full">
                {/* ... */}
                {/* Welcome Matrix Card */}
                <div className="relative bg-gray-900 rounded-[2rem] md:rounded-[40px] p-6 md:p-10 text-white overflow-hidden shadow-2xl shadow-indigo-900/20">
                    {/* ... */}
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-indigo-600 opacity-20 blur-[120px] -translate-y-1/2 translate-x-1/4" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                                <Rocket className="w-3 h-3" />
                                Session_Active
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                                Welcome, <br />
                                <span className="text-indigo-400">Alex!</span>
                            </h2>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed italic">
                                Learning path set to <span className="text-white">Fullstack Mastery</span>.
                            </p>
                        </div>

                        <div className="flex justify-start md:justify-end">
                            <div className="relative inline-flex items-center justify-center scale-75 md:scale-90 origin-left md:origin-right">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                    <circle className="text-indigo-500" strokeWidth="8" strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - 0.24)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-2xl font-black tracking-tighter italic">24%</span>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Global Sync</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Grid */}
                <div className="grid grid-cols-3 gap-3 md:gap-5">
                    {[
                        { label: 'Nodes', value: '08', icon: BookOpen, color: 'indigo' },
                        { label: 'Tasks', value: '12', icon: Activity, color: 'emerald' },
                        { label: 'Score', value: '98', icon: Target, color: 'amber' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border border-gray-100 p-4 md:p-5 rounded-[24px] shadow-sm relative overflow-hidden">
                            <stat.icon size={40} className={`absolute -right-2 -top-2 opacity-5 text-${stat.color}-600`} />
                            <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{stat.label}</h3>
                            <div className="flex items-end gap-2">
                                <span className="text-xl md:text-2xl font-black tracking-tighter text-gray-900">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Curriculum Item Preview */}
                <div className="bg-white border border-gray-100 rounded-[24px] md:rounded-[30px] p-4 md:p-6 shadow-sm flex items-center gap-4 md:gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Layout className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-md">Current Module</span>
                        <h4 className="text-lg font-black text-gray-900 tracking-tighter uppercase italic mt-1">Advanced React Patterns</h4>
                        <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-indigo-500 w-2/3 rounded-full"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [realStats, setRealStats] = useState({
        students: 0,
        modules: 0,
        premiumUsers: 0,
        avgScore: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Members Count
                const { count: studentCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'member');

                // 2. Modules (Chapters) Count
                const { count: moduleCount } = await supabase
                    .from('course_chapters')
                    .select('*', { count: 'exact', head: true });

                // 3. Premium Users
                const { count: premiumCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_premium', true);

                // 4. Success Rate (Avg Assignment Grade)
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
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const features = [
        {
            icon: BookOpen,
            title: 'Structured Learning',
            description: 'Organized courses with chapters, materials, and progress tracking',
            color: 'indigo',
        },
        {
            icon: Users,
            title: 'Personal Mentoring',
            description: 'Direct feedback and grading from experienced instructors',
            color: 'violet',
        },
        {
            icon: Code,
            title: 'Real Projects',
            description: 'Build actual applications with hands-on assignments',
            color: 'emerald',
        },
        {
            icon: Trophy,
            title: 'Gamified Progress',
            description: 'Earn achievements and track your stats',
            color: 'amber',
        },
    ];

    const paths = [
        {
            name: 'Frontend Development',
            icon: Laptop,
            description: 'Master React, TypeScript, and modern UI/UX',
            skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
            color: 'indigo',
            badge: 'POPULAR'
        },
        {
            name: 'Backend Development',
            icon: Code,
            description: 'Build robust APIs and server-side applications',
            skills: ['Node.js', 'PostgreSQL', 'Supabase', 'REST APIs'],
            color: 'violet',
            badge: 'ESSENTIAL'
        },
        {
            name: 'Fullstack Development',
            icon: Zap,
            description: 'Combine frontend and backend expertise',
            skills: ['Full Stack', 'Database Design', 'Deployment', 'DevOps'],
            color: 'emerald',
            badge: 'PREMIUM'
        },
    ];

    const stats = [
        { label: 'Active Students', value: loading ? '...' : `${realStats.students}+`, icon: Users },
        { label: 'Course Modules', value: loading ? '...' : `${realStats.modules}+`, icon: BookOpen },
        { label: 'Premium Members', value: loading ? '...' : `${realStats.premiumUsers}+`, icon: Zap },
        { label: 'Avg. Success Rate', value: loading ? '...' : `${realStats.avgScore || 96}%`, icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 font-sans">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <span className="font-black italic text-xl">K</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Kaze<span className="font-light">Developer</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all hover:shadow-xl hover:shadow-gray-900/20 active:scale-95 flex items-center gap-2"
                        >
                            Get Started <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 bg-gray-50 rounded-lg active:scale-95"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-100 bg-white shadow-xl overflow-hidden"
                    >
                        <div className="p-6 flex flex-col gap-4">
                            <Link
                                to="/login"
                                className="w-full py-4 rounded-xl border border-gray-200 text-center font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-widest text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="w-full py-4 rounded-xl bg-indigo-600 text-white text-center font-bold shadow-lg shadow-indigo-500/30 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-50 rounded-bl-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-violet-50 rounded-tr-[100px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 border border-indigo-100">
                                <Zap className="w-3 h-3 fill-current" />
                                Next_Gen Learning Platform
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-6 md:mb-8 leading-[0.95] tracking-tight">
                                Code Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
                                    Future Reality
                                </span>.
                            </h1>

                            <p className="text-lg md:text-xl text-gray-500 mb-8 md:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                                Master modern development. From logic to deployment, we provide the structured path, expert mentorship, and real-world projects you need.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-12 justify-center lg:justify-start">
                                <Link
                                    to="/signup"
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-2xl hover:shadow-indigo-600/30 flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/admin"
                                    className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    Admin Access
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm font-semibold text-gray-500 justify-center lg:justify-start flex-wrap">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Certificated</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Mentorship</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Career Ready</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interactive App Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative perspective-[2000px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[40px] rotate-3 opacity-20 blur-3xl" />

                            {/* The Frame */}
                            <div className="relative bg-gray-900 rounded-[24px] md:rounded-[32px] p-2 shadow-2xl border-4 border-gray-900 aspect-[3/4] sm:aspect-[4/3] md:aspect-auto md:h-[600px] overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
                                {/* Browser Chrome */}
                                <div className="bg-gray-900 px-4 py-3 flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    </div>
                                    <div className="flex-1 bg-gray-800 rounded-lg px-4 py-1.5 flex items-center justify-center">
                                        <div className="flex items-center gap-2 opacity-50">
                                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                            <span className="text-[10px] text-gray-300 font-mono">kaze.dev/dashboard</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="bg-white rounded-[24px] h-full overflow-hidden relative">
                                    <DashboardPreview />
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Learning Velocity</div>
                                        <div className="text-lg font-black text-gray-900">+128%</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Glass Effect */}
            <section className="py-8 md:py-12 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center group"
                            >
                                <div className="mb-4 inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-all">
                                    <stat.icon className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />
                                </div>
                                <div className="text-3xl lg:text-5xl font-black mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-12 md:mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight"
                        >
                            Engineered for <span className="text-indigo-600">Growth</span>
                        </motion.h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Our platform combines industry-standard tools with gamified learning to keep you engaged and progressing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                            >
                                <div className={`w-14 h-14 bg-${feature.color}-50 rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Paths Section - Card Design */}
            <section className="py-16 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                                Choose Your <span className="text-indigo-600">Trajectory</span>
                            </h2>
                            <p className="text-xl text-gray-500">
                                Specialized tracks designed to take you from novice to professional.
                            </p>
                        </div>
                        <Link to="/signup" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                            View Full Curriculum <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {paths.map((path, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-gray-100 hover:border-indigo-600 transition-all hover:shadow-2xl hover:shadow-indigo-600/10"
                            >
                                <div className={`absolute top-0 right-0 px-6 py-2 bg-${path.color}-50 rounded-bl-[30px] rounded-tr-[30px]`}>
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-${path.color}-600`}>
                                        {path.badge}
                                    </span>
                                </div>

                                <div className={`w-16 h-16 bg-${path.color}-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <path.icon className={`w-8 h-8 text-${path.color}-600`} />
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-4">{path.name}</h3>
                                <p className="text-gray-500 mb-8 font-medium">{path.description}</p>

                                <div className="space-y-3 mb-10">
                                    {path.skills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm">
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${path.color}-500`} />
                                            <span className="text-gray-600 font-medium">{skill}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/signup"
                                    className={`w-full block py-4 text-center rounded-2xl bg-${path.color}-50 text-${path.color}-700 font-bold hover:bg-${path.color}-600 hover:text-white transition-all`}
                                >
                                    Select Path
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center">
                        <div className="mb-8 flex justify-center">
                            <a
                                href="https://kazeserenity.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-indigo-400 transition-colors">Under the auspices of</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Kaze Serenity</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                <span className="font-bold italic">K</span>
                            </div>
                            <span className="text-xl font-bold text-white">Kaze<span className="font-light text-gray-400">Developer</span></span>
                        </div>

                        <div className="flex gap-8 text-sm text-gray-400 font-medium mb-12">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
                            <Link to="/signup" className="hover:text-white transition-colors">Register</Link>
                        </div>

                        <p className="text-xs text-gray-600 font-medium">
                            © 2026 Kaze Serenity. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

