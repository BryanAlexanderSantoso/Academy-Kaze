import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    FileText,
    ClipboardList,
    User,
    LogOut,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';

const MemberDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarItems = [
        { id: 'overview', label: 'Command Hub', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'courses', label: 'Curriculum', icon: BookOpen, path: '/dashboard/courses' },
        { id: 'assignments', label: 'Task Console', icon: FileText, path: '/dashboard/assignments' },
        { id: 'questionnaires', label: 'Diagnostics', icon: ClipboardList, path: '/dashboard/questionnaires' },
        { id: 'premium', label: user?.is_premium ? 'Premium Link' : 'Upgrade Link', icon: ShieldCheck, path: '/dashboard/premium' },
        { id: 'profile', label: 'User Profile', icon: User, path: '/dashboard/profile' },
    ];

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Mobile Header (Sticky) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tighter italic">Command Hub</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSignOut}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2.5 bg-gray-100 text-gray-900 rounded-xl active:scale-95"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Rail (Desktop) */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-32 bg-white border-r border-gray-100 flex-col items-center py-10 z-50">
                <div
                    onClick={() => navigate('/')}
                    className="w-16 h-16 bg-gray-900 rounded-[22px] flex items-center justify-center mb-16 shadow-xl shadow-gray-900/10 cursor-pointer group"
                >
                    <GraduationCap className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>

                <div className="flex-1 flex flex-col gap-10">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`p-4 rounded-[20px] transition-all flex items-center justify-center relative group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                    : 'text-gray-300 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-7 h-7" />
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-l-full"
                                    />
                                )}
                                <div className="absolute left-full ml-6 px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto flex flex-col gap-8">
                    <button
                        onClick={handleSignOut}
                        className="p-4 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-[20px] transition-all group relative"
                    >
                        <LogOut className="w-7 h-7" />
                        <div className="absolute left-full ml-6 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
                            TERMINATE_SESSION
                        </div>
                    </button>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm overflow-hidden group hover:scale-110 transition-transform cursor-pointer">
                        {user?.full_name?.charAt(0) || <User className="w-5 h-5" />}
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer (Animations) */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 p-8 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-black text-sm uppercase tracking-tighter italic">Command Hub</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-50 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                navigate(item.path);
                                                setSidebarOpen(false);
                                            }}
                                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="mt-auto flex items-center gap-4 p-5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                            >
                                <LogOut className="w-5 h-5" />
                                TERMINATE_SESSION
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Stage */}
            <main className="lg:pl-32 min-h-screen pt-[72px] lg:pt-0 pl-0">
                {/* Header Context (Desktop Hidden for mobile if redundant) */}
                <header className="hidden lg:block bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-[1600px] mx-auto px-10 py-7 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="hidden lg:block">
                                <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase italic">Command Central</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Sector_{user?.learning_path?.toUpperCase() || 'NULL'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{user?.full_name}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Operative ID: {user?.id.slice(0, 8)}</p>
                            </div>
                            <div className="h-10 w-[1px] bg-gray-100" />
                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${user?.is_premium
                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>
                                    {user?.is_premium ? 'PREMIUM_UPLINK' : 'FREE_TIER'}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-3.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 group relative"
                                    title="Terminate Session"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <div className="absolute top-full right-0 mt-3 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none whitespace-nowrap z-50">
                                        TERMINATE_SESSION
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Sub-Stage Output */}
                <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12">
                    <Outlet />
                </div>
            </main>

            {/* Studio Accents */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-1/4 -right-1/4 w-[60%] h-[60%] bg-indigo-100/30 blur-[200px] rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] bg-blue-100/20 blur-[200px] rounded-full" />
            </div>
        </div>
    );
};

export default MemberDashboard;
