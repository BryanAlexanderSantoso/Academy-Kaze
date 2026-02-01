import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Award,
    Code,
    Laptop,
    Shield,
    ArrowRight,
    CheckCircle,
    Zap,
    Target,
    TrendingUp,
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const features = [
        {
            icon: BookOpen,
            title: 'Structured Learning',
            description: 'Organized courses with chapters, materials, and progress tracking',
            color: 'primary',
        },
        {
            icon: Users,
            title: 'Personal Mentoring',
            description: 'Direct feedback and grading from experienced instructors',
            color: 'backend',
        },
        {
            icon: Code,
            title: 'Real Projects',
            description: 'Build actual applications with hands-on assignments',
            color: 'fullstack',
        },
        {
            icon: Award,
            title: 'Track Progress',
            description: 'Monitor your advancement with detailed analytics',
            color: 'primary',
        },
    ];

    const paths = [
        {
            name: 'Frontend Development',
            icon: Laptop,
            description: 'Master React, TypeScript, and modern UI/UX',
            skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
            color: 'primary',
        },
        {
            name: 'Backend Development',
            icon: Code,
            description: 'Build robust APIs and server-side applications',
            skills: ['Node.js', 'PostgreSQL', 'Supabase', 'REST APIs'],
            color: 'backend',
        },
        {
            name: 'Fullstack Development',
            icon: Zap,
            description: 'Combine frontend and backend expertise',
            skills: ['Full Stack', 'Database Design', 'Deployment', 'DevOps'],
            color: 'fullstack',
        },
    ];

    const stats = [
        { label: 'Active Students', value: '100+', icon: Users },
        { label: 'Courses Available', value: '20+', icon: BookOpen },
        { label: 'Projects Built', value: '500+', icon: Code },
        { label: 'Success Rate', value: '95%', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                                Kaze For Developers
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-backend-50/30"></div>

                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
                                <Zap className="w-4 h-4" />
                                <span>Modern Development Education</span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Master Coding with{' '}
                                <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                                    Expert Guidance
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Learn frontend, backend, or fullstack development through structured courses,
                                real projects, and personalized mentorship.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <Link
                                    to="/signup"
                                    className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Start Learning
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/admin"
                                    className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:border-primary-600 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-5 h-5" />
                                    Admin Portal
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span>Free to start</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: App Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600 to-backend-600 rounded-3xl opacity-20 blur-2xl"></div>

                            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                                {/* Browser Bar */}
                                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 ml-2">
                                        kaze-developer.app/dashboard
                                    </div>
                                </div>

                                {/* App Screenshot/Preview */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2"></div>
                                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="w-10 h-10 bg-primary-600 rounded-full"></div>
                                        </div>

                                        {/* Stats Cards */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-6 w-12 bg-primary-600 rounded"></div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Course List */}
                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                            <div className="h-5 w-24 bg-gray-300 rounded mb-4"></div>
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-12 h-12 bg-primary-600 rounded-lg"></div>
                                                        <div className="flex-1">
                                                            <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                                                            <div className="h-3 w-48 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
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
            <section className="py-16 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4"
                        >
                            <Target className="w-4 h-4" />
                            <span>Why Choose Kaze</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                        >
                            Everything You Need to Succeed
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Comprehensive tools and resources to accelerate your development journey
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                            >
                                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Learning Paths Section */}
            <section className="py-20 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                        >
                            Choose Your Learning Path
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-xl text-gray-600"
                        >
                            Specialized tracks designed for your career goals
                        </motion.p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {paths.map((path, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-primary-600"
                            >
                                <div className={`w-16 h-16 bg-${path.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                                    <path.icon className={`w-8 h-8 text-${path.color}-600`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{path.name}</h3>
                                <p className="text-gray-600 mb-6">{path.description}</p>
                                <div className="space-y-2">
                                    {path.skills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className={`w-4 h-4 text-${path.color}-600`} />
                                            <span className="text-gray-700">{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 lg:p-16 text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                                Join hundreds of students learning to build modern web applications
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all group"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                <Code className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">Kaze For Developers</span>
                        </div>
                        <p className="text-sm">
                            © 2026 Kaze For Developers. Built with ❤️ for aspiring developers.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
