import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { User, Mail, Code2, Save, TrendingUp } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, setUser } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user?.id)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setUser({ ...user!, full_name: data.full_name });
                setMessage('Profile updated successfully!');
            }
        } catch (error: any) {
            setMessage('Error updating profile: ' + error.message);
        }

        setSaving(false);
    };

    const getPathInfo = () => {
        switch (user?.learning_path) {
            case 'fe':
                return {
                    name: 'Frontend Development',
                    color: 'primary',
                    description: 'HTML, CSS, JavaScript, React',
                };
            case 'be':
                return {
                    name: 'Backend Development',
                    color: 'backend',
                    description: 'Node.js, Databases, APIs',
                };
            case 'fs':
                return {
                    name: 'Fullstack Development',
                    color: 'fullstack',
                    description: 'Frontend + Backend',
                };
            case 'seo':
                return {
                    name: 'SEO Specialist',
                    color: 'amber',
                    description: 'Technical SEO, Content Strategy, Analytics',
                };
            default:
                return { name: 'Not Selected', color: 'gray', description: '' };
        }
    };

    const pathInfo = getPathInfo();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>

            {/* Profile Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex items-center gap-6 mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold ${pathInfo.color === 'primary' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                        pathInfo.color === 'backend' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                            pathInfo.color === 'fullstack' ? 'bg-gradient-to-br from-violet-500 to-violet-700' :
                                pathInfo.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                                    'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}>
                        {(user?.full_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                        <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${pathInfo.color === 'primary' ? 'bg-blue-100 text-blue-700' :
                            pathInfo.color === 'backend' ? 'bg-emerald-100 text-emerald-700' :
                                pathInfo.color === 'fullstack' ? 'bg-violet-100 text-violet-700' :
                                    pathInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                            {pathInfo.name}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Code2 className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Learning Path</h3>
                        </div>
                        <p className="text-sm text-gray-600">{pathInfo.description}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Progress</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">0%</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Status</h3>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                {user?.is_premium ? 'PREMIUM ACCESS' : 'FREE TIER'}
                                {user?.is_premium && (
                                    <span className="text-[10px] bg-yellow-400 text-black px-1.5 rounded font-black">PRO</span>
                                )}
                            </p>
                            {user?.is_premium && (
                                <p className={`text-xs font-bold mt-1 ${user.premium_until ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {(() => {
                                        if (!user.premium_until) return 'Lifetime Access';
                                        const today = new Date();
                                        const expiry = new Date(user.premium_until);
                                        if (expiry < today) return 'Expired';
                                        const diffTime = expiry.getTime() - today.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        return `${diffDays} days remaining`;
                                    })()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Edit Profile Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Full Name - Editable */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-field pl-11"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    {/* Email - Read Only */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="email"
                                value={user?.email}
                                className="input-field pl-11 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                                disabled
                                readOnly
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                            Email address cannot be modified
                        </p>
                    </div>

                    {/* Learning Path - Read Only */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Learning Path
                        </label>
                        <div className="relative">
                            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input
                                type="text"
                                value={pathInfo.name}
                                className="input-field pl-11 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                                disabled
                                readOnly
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                            Contact administrator to change your learning path
                        </p>
                    </div>

                    {message && (
                        <div
                            className={`p-3 rounded-lg text-sm ${message.includes('Error')
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving || fullName === user?.full_name}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
