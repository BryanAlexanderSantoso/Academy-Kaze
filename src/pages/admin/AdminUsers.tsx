import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Users, Search, Ban, CheckCircle, Shield, Calendar, Mail, GraduationCap, Crown, FilterX, AlertCircle, ArrowLeft } from 'lucide-react';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    learning_path: string | null;
    is_premium: boolean;
    is_banned: boolean;
    created_at: string;
    role: string;
}

const AdminUsers: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'member' | 'admin'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to ban ${userName}?\n\nThey will not be able to access their account until unbanned.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_banned: true })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_banned: true } : user
            ));
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleUnbanUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_banned: false })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(user =>
                user.id === userId ? { ...user, is_banned: false } : user
            ));
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && !user.is_banned) ||
            (filterStatus === 'banned' && user.is_banned);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getLearningPathColor = (path: string | null) => {
        switch (path) {
            case 'fe': return 'blue';
            case 'be': return 'emerald';
            case 'fs': return 'violet';
            case 'seo': return 'amber';
            default: return 'gray';
        }
    };

    const getLearningPathLabel = (path: string | null) => {
        switch (path) {
            case 'fe': return 'Frontend';
            case 'be': return 'Backend';
            case 'fs': return 'Fullstack';
            case 'seo': return 'SEO';
            default: return 'Not Set';
        }
    };

    const stats = {
        total: users.length,
        active: users.filter(u => !u.is_banned).length,
        banned: users.filter(u => u.is_banned).length,
        premium: users.filter(u => u.is_premium).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Control Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-5 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-5">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Users className="w-6 h-6 text-indigo-600" />
                            User Management
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Registry</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</p>
                        <p className="text-sm font-medium text-gray-500">Active Users</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <Ban className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.banned}</p>
                        <p className="text-sm font-medium text-gray-500">Banned Users</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                                <Crown className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stats.premium}</p>
                        <p className="text-sm font-medium text-gray-500">Premium Users</p>
                    </motion.div>
                </div>

                {/* Filters Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all">
                                <option value="all">All Roles</option>
                                <option value="member">Members Only</option>
                                <option value="admin">Admins Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all">
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="banned">Banned Only</option>
                            </select>
                        </div>
                    </div>

                    {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
                        <div className="mt-4 flex items-center gap-2">
                            <button
                                onClick={() => { setSearchQuery(''); setFilterRole('all'); setFilterStatus('all'); }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FilterX className="w-4 h-4" />
                                Clear Filters
                            </button>
                            <span className="text-sm text-gray-500">
                                Showing {filteredUsers.length} of {users.length} users
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Users Grid */}
                <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * Math.min(index, 10) }}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">{user.full_name}</h3>
                                                {user.is_premium && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate">
                                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100">
                                                <Shield className="w-3.5 h-3.5" />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">
                                                <Users className="w-3.5 h-3.5" />
                                                Member
                                            </span>
                                        )}

                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-${getLearningPathColor(user.learning_path)}-50 text-${getLearningPathColor(user.learning_path)}-700 text-xs font-semibold rounded-lg border border-${getLearningPathColor(user.learning_path)}-100`}>
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            {getLearningPathLabel(user.learning_path)}
                                        </span>

                                        {user.is_banned ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
                                                <Ban className="w-3.5 h-3.5" />
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Active
                                            </span>
                                        )}

                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    {user.role !== 'admin' && (
                                        <div className="flex-shrink-0">
                                            {user.is_banned ? (
                                                <button
                                                    onClick={() => handleUnbanUser(user.id)}
                                                    className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                                                >
                                                    Unban User
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBanUser(user.id, user.full_name)}
                                                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                                                >
                                                    Ban User
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
                            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'No users have registered yet'}
                            </p>
                            {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setFilterRole('all'); setFilterStatus('all'); }}
                                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
