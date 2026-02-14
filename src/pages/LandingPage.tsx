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
    Award,
    Clock,
} from 'lucide-react';

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
            title: 'Structured Curriculum',
            description: 'Learn step-by-step with professionally designed courses and clear learning paths',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            icon: Users,
            title: 'Expert Mentorship',
            description: 'Get personalized feedback and guidance from industry professionals',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            icon: Trophy,
            title: 'Career-Ready Skills',
            description: 'Build real-world projects and gain skills that employers are looking for',
            gradient: 'from-emerald-500 to-emerald-600'
        },
        {
            icon: Award,
            title: 'Certifications',
            description: 'Earn recognized certificates upon completing courses and assessments',
            gradient: 'from-amber-500 to-amber-600'
        },
    ];

    const paths = [
        {
            name: 'Frontend Development',
            icon: Laptop,
            description: 'Master React, TypeScript, and modern UI/UX design',
            skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Responsive Design'],
            color: 'blue',
        },
        {
            name: 'Backend Development',
            icon: Code,
            description: 'Build scalable APIs with server-side technologies',
            skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Authentication'],
            color: 'purple',
        },
        {
            name: 'Fullstack Development',
            icon: Zap,
            description: 'Combine frontend and backend for complete solutions',
            skills: ['Full Stack', 'Database Design', 'Deployment', 'DevOps'],
            color: 'emerald',
        },
    ];

    const stats = [
        { label: 'Active Students', value: loading ? '...' : `${realStats.students}`, icon: Users, color: 'blue' },
        { label: 'Course Modules', value: loading ? '...' : `${realStats.modules}`, icon: BookOpen, color: 'purple' },
        { label: 'Premium Members', value: loading ? '...' : `${realStats.premiumUsers}`, icon: Zap, color: 'emerald' },
        { label: 'Success Rate', value: loading ? '...' : `${realStats.avgScore || 96}%`, icon: TrendingUp, color: 'amber' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-6xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                            alt="Kaze Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="text-xl font-semibold text-gray-900">Kaze Developer</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            Masuk
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                                className="w-full py-3 border border-gray-200 text-center font-medium text-gray-700 rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Masuk
                            </Link>
                            <Link
                                to="/signup"
                                className="w-full py-3 bg-blue-600 text-white text-center font-medium rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Daftar Gratis
                            </Link>
                        </div>
                    </motion.div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                <Rocket className="w-4 h-4" />
                                Platform pembelajaran developer
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Belajar jadi{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                                    developer profesional
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                                Platform pembelajaran coding dengan kurikulum terstruktur, mentor berpengalaman, dan proyek nyata. Dari nol hingga siap kerja.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <Link
                                    to="/signup"
                                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Mulai Belajar
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/admin"
                                    className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium text-lg hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-5 h-5" />
                                    Admin Portal
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 flex-wrap text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Gratis akses basis</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Sertifikat resmi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Mentor berpengalaman</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="relative hidden md:block"
                        >
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-60"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-60"></div>

                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
                                            AW
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Welcome Back!</div>
                                            <div className="text-sm text-gray-500">Continue your learning journey</div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-medium text-blue-700">Current Progress</span>
                                                <span className="text-xs font-bold text-blue-700">67%</span>
                                            </div>
                                            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '67%' }}></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-4 bg-white rounded-xl border border-gray-100">
                                                <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
                                                <div className="text-xs text-gray-500">Modules</div>
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-gray-100">
                                                <div className="text-2xl font-bold text-gray-900 mb-1">24</div>
                                                <div className="text-xs text-gray-500">Tasks</div>
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-gray-100">
                                                <div className="text-2xl font-bold text-gray-900 mb-1">96</div>
                                                <div className="text-xs text-gray-500">Score</div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Layout className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 text-sm">Advanced React Patterns</div>
                                                    <div className="text-xs text-gray-500">Next chapter ready</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

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
                                <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-50 mb-4`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Kenapa memilih Kaze Developer?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Platform yang dirancang khusus untuk membantu kamu menjadi developer profesional
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Learning Paths */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Pilih jalur pembelajaran
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Kurikulum yang dirancang khusus sesuai kebutuhan industri
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {paths.map((path, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all"
                            >
                                <div className={`w-14 h-14 bg-${path.color}-50 rounded-xl flex items-center justify-center mb-6`}>
                                    <path.icon className={`w-7 h-7 text-${path.color}-600`} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3">{path.name}</h3>
                                <p className="text-gray-600 mb-6">{path.description}</p>

                                <div className="space-y-2 mb-8">
                                    {path.skills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${path.color}-500`}></div>
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/signup"
                                    className={`w-full block py-3 text-center rounded-lg bg-${path.color}-50 text-${path.color}-700 font-medium hover:bg-${path.color}-600 hover:text-white transition-colors`}
                                >
                                    Mulai Belajar
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Siap memulai perjalanan coding kamu?
                    </h2>
                    <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
                        Bergabung dengan ribuan developer yang sudah belajar dan berkembang bersama Kaze Developer
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
                    >
                        Daftar Sekarang Gratis
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6">
                            <a
                                href="https://kazeserenity.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:text-white transition-colors"
                            >
                                Powered by <span className="font-semibold text-white">Kaze Serenity</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                                alt="Kaze Logo"
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-lg font-semibold text-white">Kaze Developer</span>
                        </div>

                        <div className="flex gap-6 mb-8 text-sm">
                            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
                            <Link to="/login" className="hover:text-white transition-colors">Masuk</Link>
                            <Link to="/signup" className="hover:text-white transition-colors">Daftar</Link>
                        </div>

                        <p className="text-xs">
                            © 2026 Kaze Serenity. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
