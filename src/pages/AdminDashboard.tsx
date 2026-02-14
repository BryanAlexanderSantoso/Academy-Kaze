import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Profile, Assignment } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    LogOut,
    CheckSquare,
    ClipboardList,
    LayoutDashboard,
    Search,
    Bell,
    Settings,
    Activity,
    Zap,
    Crown,
    Plus,
    Monitor,
    ChevronRight,
    Terminal,
    MessageCircle
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        pendingAssignments: 0,
        avgProgress: 0,
    });
    const [students, setStudents] = useState<Profile[]>([]);
    const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Fetch students
            const { data: studentsData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'member')
                .order('created_at', { ascending: false });

            // Fetch courses
            const { data: coursesData } = await supabase
                .from('courses')
                .select('*');

            // Fetch assignments
            const { data: assignmentsData } = await supabase
                .from('assignments')
                .select(`
          *,
          student:profiles(full_name, email),
          course:courses(title)
        `)
                .order('created_at', { ascending: false })
                .limit(10);

            if (studentsData) {
                setStudents(studentsData);
                const avgProgress =
                    studentsData.reduce((acc, s) => acc + s.progress_percentage, 0) /
                    studentsData.length;

                setStats({
                    totalStudents: studentsData.length,
                    totalCourses: coursesData?.length || 0,
                    pendingAssignments:
                        assignmentsData?.filter((a) => a.grade === null).length || 0,
                    avgProgress: Math.round(avgProgress || 0),
                });
            }

            if (assignmentsData) {
                setRecentAssignments(assignmentsData);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('adminUser');
        setUser(null);
        navigate('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 overflow-hidden flex items-center justify-center">
                        <img
                            src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                            alt="Kaze Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Command Center...</p>
            </div>
        );
    }

    const quickActions = [
        { title: 'New Course', icon: Plus, link: '/admin/courses/new', color: 'indigo' },
        { title: 'Curriculum', icon: BookOpen, link: '/admin/courses', color: 'blue' },
        { title: 'Submissions', icon: CheckSquare, link: '/admin/assignments', color: 'emerald' },
        { title: 'New Task', icon: Zap, link: '/admin/assignments/create', color: 'amber' },
        { title: 'Verifications', icon: Crown, link: '/admin/premium', color: 'yellow' },
        { title: 'Assessments', icon: ClipboardList, link: '/admin/questionnaires', color: 'purple' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar Rail */}
            <div className="fixed left-0 top-0 bottom-0 w-24 bg-white border-r border-gray-100 flex flex-col items-center py-10 z-50 shadow-sm">
                <div
                    onClick={() => navigate('/')}
                    className="w-14 h-14 flex items-center justify-center mb-16 cursor-pointer group overflow-hidden"
                >
                    <img
                        src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                        alt="Kaze Logo"
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                </div>

                <div className="flex-1 flex flex-col gap-10">
                    <button className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                        <LayoutDashboard className="w-6 h-6" />
                    </button>
                    <button onClick={() => navigate('/admin/users')} className="p-3.5 text-gray-300 hover:text-indigo-600 transition-all hover:bg-gray-50 rounded-2xl" title="User Management">
                        <Users className="w-6 h-6" />
                    </button>
                    <button onClick={() => navigate('/admin/support')} className="p-3.5 text-gray-300 hover:text-indigo-600 transition-all hover:bg-gray-50 rounded-2xl" title="Live Support">
                        <MessageCircle className="w-6 h-6" />
                    </button>
                    <button onClick={() => navigate('/admin/courses')} className="p-3.5 text-gray-300 hover:text-indigo-600 transition-all hover:bg-gray-50 rounded-2xl">
                        <BookOpen className="w-6 h-6" />
                    </button>
                    <button onClick={() => navigate('/admin/assignments')} className="p-3.5 text-gray-300 hover:text-indigo-600 transition-all hover:bg-gray-50 rounded-2xl">
                        <CheckSquare className="w-6 h-6" />
                    </button>
                    <button onClick={() => navigate('/admin/premium')} className="p-3.5 text-gray-300 hover:text-indigo-600 transition-all hover:bg-gray-50 rounded-2xl">
                        <Crown className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-auto flex flex-col gap-8">
                    <button onClick={() => navigate('/admin/settings')} className="p-3.5 text-gray-300 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-2xl">
                        <Settings className="w-6 h-6" />
                    </button>
                    <button onClick={handleSignOut} className="p-3.5 text-red-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="pl-24">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-[1600px] mx-auto px-10 py-7 flex items-center justify-between">
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-1">Kaze For Developer</h2>
                            <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic">Intelligence Oversight</h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative group hidden lg:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search operatives or courses..."
                                    className="bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all w-80 shadow-inner placeholder:text-gray-400"
                                />
                            </div>
                            <button className="p-3.5 bg-gray-100 rounded-2xl relative text-gray-400 hover:text-indigo-600 hover:bg-white transition-all hover:shadow-sm">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-indigo-600 rounded-full animate-pulse border-2 border-white" />
                            </button>
                            <div className="h-10 w-[1px] bg-gray-100" />
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">Chief Admin</p>
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Root Privileges</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-[1px] shadow-lg shadow-indigo-500/10">
                                    <div className="w-full h-full rounded-[15px] bg-white flex items-center justify-center font-black text-indigo-600">AD</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1600px] mx-auto px-10 py-12">
                    {/* Visual Stats Intelligence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {[
                            { label: 'Active Operatives', value: stats.totalStudents, icon: Users, sub: 'Member Base', color: 'indigo' },
                            { label: 'Knowledge Base', value: stats.totalCourses, icon: BookOpen, sub: 'Curriculum Nodes', color: 'blue' },
                            { label: 'Pending Validations', value: stats.pendingAssignments, icon: Activity, sub: 'Neural Review', color: 'emerald' },
                            { label: 'Path Efficiency', value: `${stats.avgProgress}%`, icon: Zap, sub: 'Aggregate Gain', color: 'amber' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative bg-white border border-gray-100 hover:border-indigo-500/20 rounded-[40px] p-8 transition-all duration-500 shadow-sm hover:shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <stat.icon className={`w-14 h-14 text-${stat.color}-600 opacity-5`} />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">{stat.label}</h3>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-5xl font-black tracking-tighter text-gray-900">{stat.value}</span>
                                    <div className="mb-2 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">+4.2%</div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Deployment Hub */}
                        <div className="lg:col-span-8 space-y-16">
                            <section>
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-4 italic uppercase text-gray-900">
                                        <Monitor className="w-7 h-7 text-indigo-600" />
                                        Deployment Nexus
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {quickActions.map((action, i) => (
                                        <Link
                                            key={i}
                                            to={action.link}
                                            className="group relative bg-white border border-gray-100 hover:border-indigo-600/30 rounded-[32px] p-7 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between mb-8">
                                                <div className={`p-4 bg-${action.color}-50 rounded-2xl group-hover:scale-110 transition-transform`}>
                                                    <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-1" />
                                            </div>
                                            <p className="font-black text-sm uppercase tracking-[0.1em] text-gray-900 mb-1">{action.title}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Execute Routine</p>

                                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full blur-2xl group-hover:bg-indigo-50 transition-all duration-700" />
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-4 italic uppercase text-gray-900">
                                        <Activity className="w-7 h-7 text-indigo-600" />
                                        Live Feed Pipeline
                                    </h2>
                                    <Link to="/admin/assignments" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-black text-gray-500 hover:text-gray-900 rounded-xl transition-all uppercase tracking-widest">
                                        Data Log
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {recentAssignments.slice(0, 5).map((assignment, i) => (
                                        <motion.div
                                            key={assignment.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group flex items-center gap-7 p-6 bg-white border border-gray-100 hover:border-indigo-600/20 rounded-[32px] transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                {assignment.grade ? assignment.grade : <Zap className="w-6 h-6 animate-pulse" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-black text-base uppercase tracking-tight truncate text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{assignment.course?.title}</h3>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-[8px] font-black text-gray-400 rounded uppercase tracking-widest">LOG_CH</span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic truncate overflow-visible">Operative {assignment.student?.full_name}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 leading-none">Status</p>
                                                {assignment.grade !== null ? (
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">VALIDATED</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded animate-pulse">PENDING_SYNC</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Operative Registry (Right Sidebar) */}
                        <div className="lg:col-span-4 space-y-16">
                            <section>
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-4 italic uppercase text-gray-900">
                                        <Users className="w-7 h-7 text-indigo-600" />
                                        Operative Registry
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {students.slice(0, 6).map((student, i) => (
                                        <motion.div
                                            key={student.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group p-6 bg-white border border-gray-100 rounded-[35px] hover:border-indigo-600/20 transition-all shadow-sm hover:shadow-xl"
                                        >
                                            <div className="flex items-center gap-5 mb-5">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                                    {student.full_name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-gray-900 group-hover:text-indigo-600 transition-colors">{student.full_name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{student.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-1 bg-indigo-50 px-1.5 py-0.5 rounded">{student.learning_path || 'NULL'}</p>
                                                    <Crown className={`w-3.5 h-3.5 ml-auto transition-colors ${student.is_premium ? 'text-yellow-500' : 'text-gray-200'}`} />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                    <span>Sync Progress</span>
                                                    <span className="text-gray-900 font-black">{student.progress_percentage}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${student.progress_percentage}%` }}
                                                        className="h-full bg-indigo-600 rounded-full shadow-lg"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <button className="w-full mt-8 py-5 bg-white border border-gray-100 hover:bg-gray-50 text-[10px] font-black text-gray-400 hover:text-gray-900 rounded-[28px] transition-all uppercase tracking-[0.3em] shadow-sm">
                                    Enlarge Master Registry
                                </button>
                            </section>

                            {/* Subsystem Monitoring */}
                            <section className="bg-indigo-600 p-10 rounded-[50px] shadow-2xl shadow-indigo-600/30 overflow-hidden relative">
                                <Terminal className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-5" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-8 flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                    Subsystem Integrity
                                </h3>
                                <div className="space-y-5 font-mono text-[11px] text-white">
                                    <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-2xl">
                                        <span className="opacity-60 uppercase font-black tracking-widest">Database Uplink</span>
                                        <span className="font-black">STABLE</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-2xl">
                                        <span className="opacity-60 uppercase font-black tracking-widest">Neural Cluster</span>
                                        <span className="font-black tracking-tighter">OPTIMAL_98.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-2xl">
                                        <span className="opacity-60 uppercase font-black tracking-widest">Security Core</span>
                                        <span className="font-black text-emerald-300">SHIELDED</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-2xl">
                                        <span className="opacity-60 uppercase font-black tracking-widest">Encryption Load</span>
                                        <span className="font-black">0.02ms_LAT</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            {/* Aesthetic Studio Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-1/4 -right-1/4 w-[60%] h-[60%] bg-indigo-100/30 blur-[200px] rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] bg-blue-100/20 blur-[200px] rounded-full" />
            </div>
        </div>
    );
};

export default AdminDashboard;
