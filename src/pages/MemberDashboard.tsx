import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import LiveChat from '../components/LiveChat';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    ClipboardList,
    User,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronRight,
    Search,
    Settings,
    Crown
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

const MemberDashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarItems = [
        { id: 'overview', label: 'Terminal Utama', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'courses', label: 'Library Modul', icon: BookOpen, path: '/dashboard/courses' },
        { id: 'assignments', label: 'Proyek Tugas', icon: FileText, path: '/dashboard/assignments' },
        { id: 'questionnaires', label: 'Evaluasi Kuis', icon: ClipboardList, path: '/dashboard/questionnaires' },
        { id: 'premium', label: user?.is_premium ? 'Paket Premium' : 'Upgrade Akses', icon: user?.is_premium ? Crown : ShieldCheck, path: '/dashboard/premium' },
        { id: 'profile', label: 'Profil Member', icon: User, path: '/dashboard/profile' },
    ];

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] selection:bg-indigo-600 selection:text-white">
            {/* Mobile Navigation Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-6 py-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <img
                        src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                        alt="Kaze Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="font-black text-[11px] uppercase tracking-tighter italic leading-none text-gray-900">Kaze Developer</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 mt-1 italic">MEMBER_DASHBOARD</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-3 bg-gray-50 text-gray-900 rounded-2xl active:scale-90 transition-all shadow-inner"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Rail (Premium Desktop Version) */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[110px] bg-white border-r border-gray-100 flex-col items-center py-12 z-50 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)]">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    onClick={() => navigate('/')}
                    className="w-16 h-16 cursor-pointer mb-20 relative group"
                >
                    <div className="absolute inset-0 bg-indigo-600/5 blur-2xl rounded-full scale-150 group-hover:bg-indigo-600/10 transition-colors" />
                    <img
                        src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                        alt="Kaze Logo"
                        className="w-full h-full object-contain relative z-10 p-2"
                    />
                </motion.div>

                <div className="flex-1 flex flex-col gap-10">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`p-4.5 rounded-[22px] transition-all flex items-center justify-center relative group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20'
                                    : 'text-gray-300 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'animate-in zoom-in duration-500' : ''}`} />
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav-indicator"
                                        className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-600 rounded-l-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                    />
                                )}
                                <div className="absolute left-full ml-10 px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl opacity-0 translate-x-[-15px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50 shadow-2xl italic">
                                    {item.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto flex flex-col gap-8">
                    <button
                        onClick={handleSignOut}
                        className="p-4.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-[22px] transition-all group relative active:scale-90"
                    >
                        <LogOut className="w-6 h-6" />
                        <div className="absolute left-full ml-10 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl opacity-0 translate-x-[-15px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50 shadow-2xl italic">
                            Terminasi Sesi
                        </div>
                    </button>

                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate('/dashboard/profile')}
                        className={`w-14 h-14 rounded-[22px] flex items-center justify-center font-black text-sm overflow-hidden cursor-pointer shadow-xl border-4 transition-all ${user?.is_premium ? 'bg-indigo-50 border-white text-indigo-600 ring-2 ring-indigo-100' : 'bg-gray-50 border-white text-gray-400 shadow-inner'}`}
                    >
                        {user?.full_name?.charAt(0) || <User className="w-6 h-6" />}
                    </motion.div>
                </div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[70]"
                        />
                        <motion.aside
                            initial={{ x: -400 }}
                            animate={{ x: 0 }}
                            exit={{ x: -400 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white z-[80] p-10 flex flex-col shadow-[40px_0_100px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex items-center justify-between mb-16">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                                        alt="Kaze Logo"
                                        className="w-12 h-12 object-contain"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-black text-[12px] uppercase tracking-tighter italic leading-none text-gray-900">Kaze Developer</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 mt-1 italic">PROTOKOL_MEMBER</span>
                                    </div>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 active:scale-90 transition-all">
                                    <X size={22} />
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
                                            className={`flex items-center justify-between p-6 rounded-[30px] transition-all relative overflow-hidden group ${isActive
                                                ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 ring-8 ring-indigo-50'
                                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6 relative z-10">
                                                <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                                                <span className="font-black text-[11px] uppercase tracking-[0.2em] italic">{item.label}</span>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 transition-transform relative z-10 ${isActive ? 'translate-x-1' : 'opacity-20'}`} />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="p-6 bg-gray-50 rounded-[30px] border border-gray-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 italic">
                                        {user?.full_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-black text-[11px] uppercase tracking-widest text-gray-900 truncate leading-none">{user?.full_name}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 truncate">ID: {user?.id.slice(0, 12)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-center gap-4 p-6 bg-red-50 text-red-600 rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] active:scale-95 transition-all italic border border-red-100"
                                >
                                    <LogOut className="w-5 h-5" />
                                    TRANSMISI_LOGOUT
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Stage Area */}
            <main className="lg:pl-[110px] min-h-screen pt-[88px] lg:pt-0">
                {/* Desktop Top Header Bar */}
                <header className="hidden lg:block bg-white/60 backdrop-blur-2xl border-b border-gray-100/50 sticky top-0 z-40">
                    <div className="max-w-[1700px] mx-auto px-16 py-8 flex items-center justify-between">
                        <div className="flex items-center gap-16">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic leading-none">Terminal_Member</h1>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none italic">Sektor: {user?.learning_path === 'fe' ? 'Frontend' : user?.learning_path === 'be' ? 'Backend' : 'Fullstack'}</p>
                                    </div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] leading-none ml-2">ENV: PRODUCTION_v2.0</p>
                                </div>
                            </div>

                            {/* Search Command Center */}
                            <div className="relative group/search">
                                <div className="absolute inset-0 bg-indigo-600/5 rounded-2xl blur-xl group-focus-within/search:bg-indigo-600/10 transition-all opacity-0 group-hover/search:opacity-100" />
                                <div className="relative flex items-center">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-300 group-focus-within/search:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Dekripsi materi..."
                                        className="bg-gray-50/50 border-2 border-transparent rounded-2xl py-4 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest w-[320px] focus:w-[400px] focus:ring-0 focus:border-indigo-600/10 focus:bg-white transition-all shadow-inner placeholder:text-gray-300 italic"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white border border-gray-100 rounded-lg text-[8px] font-black text-gray-300 uppercase tracking-widest hidden group-focus-within/search:block">ENTER</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-4 border-r border-gray-100 pr-10">
                                <NotificationBell />
                                <button className="p-3 bg-gray-50 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90 group/settings">
                                    <Settings className="w-5.5 h-5.5 group-hover:rotate-45 transition-transform" />
                                </button>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none italic">{user?.full_name}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1.5 opacity-60">ID://{user?.id.slice(0, 12)}</p>
                                </div>
                                <div className={`relative px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] italic border-2 transition-all flex items-center gap-2.5 ${user?.is_premium
                                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)]'
                                    : 'bg-gray-50 text-gray-400 border-gray-100 shadow-inner'
                                    }`}>
                                    {user?.is_premium && <Crown className="w-3.5 h-3.5 animate-pulse" />}
                                    {user?.is_premium ? 'OTORITAS_PREMIUM' : 'AKSES_FREE'}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-3.5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 group relative border border-red-100"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <div className="absolute top-[calc(100%+20px)] right-0 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl opacity-0 translate-y-[-15px] group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none whitespace-nowrap z-50 shadow-2xl italic">
                                        TRANSMISI_LOGOUT
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-[1700px] mx-auto px-10 lg:px-20 py-16">
                    <Outlet />
                </div>
            </main>

            {/* Premium Dynamic Backdrops */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/20 blur-[280px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/10 blur-[280px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FAFAFF]" />
            </div>

            <LiveChat />
        </div>
    );
};

export default MemberDashboard;
