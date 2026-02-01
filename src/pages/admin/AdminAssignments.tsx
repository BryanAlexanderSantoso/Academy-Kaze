import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Assignment } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Clock, CheckCircle, AlertCircle, ArrowLeft, Shield,
    LogOut, Plus, TrendingUp, Search, Filter, Mail, Users,
    ExternalLink, BookOpen, ChevronRight, MoreVertical, X,
    Award, BarChart2, Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminAssignments: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'graded' | 'overdue'>('all');
    const [gradingId, setGradingId] = useState<string | null>(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        const { data } = await supabase
            .from('assignments')
            .select(`
        *,
        student:profiles!assignments_student_id_fkey(id, full_name, email, learning_path),
        course:courses(id, title, category)
      `)
            .order('created_at', { ascending: false });

        if (data) setAssignments(data as Assignment[]);
        setLoading(false);
    };

    const handleGrade = async (assignmentId: string) => {
        const grade = parseInt(gradeForm.grade);
        if (isNaN(grade) || grade < 0 || grade > 100) {
            alert('Please enter a valid grade (0-100)');
            return;
        }

        const { error } = await supabase
            .from('assignments')
            .update({
                grade,
                feedback: gradeForm.feedback || null,
            })
            .eq('id', assignmentId);

        if (!error) {
            setGradingId(null);
            setGradeForm({ grade: '', feedback: '' });
            loadAssignments();
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('adminUser');
        setUser(null);
        navigate('/admin');
    };

    const filteredAssignments = assignments.filter((a) => {
        const matchesSearch =
            (a as any).student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a as any).course?.title?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'pending') return a.submission_link && !a.grade;
        if (filter === 'graded') return a.grade !== null;
        if (filter === 'overdue') {
            return !a.submission_link && a.due_date && new Date(a.due_date) < new Date();
        }
        return true;
    });

    const stats = {
        total: assignments.length,
        pending: assignments.filter((a) => a.submission_link && !a.grade).length,
        graded: assignments.filter((a) => a.grade !== null).length,
        revenue: assignments.filter((a) => a.grade !== null).length, // Just placeholder stat
        overdue: assignments.filter(
            (a) => !a.submission_link && a.due_date && new Date(a.due_date) < new Date()
        ).length,
    };

    const getPathBadge = (path: string | undefined) => {
        if (!path) return null;
        const colors = {
            fe: 'bg-indigo-50 text-indigo-600',
            be: 'bg-emerald-50 text-emerald-600',
            fs: 'bg-amber-50 text-amber-600',
        };
        const labels = { fe: 'Frontend', be: 'Backend', fs: 'Fullstack' };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${colors[path as keyof typeof colors]}`}>
                {labels[path as keyof typeof labels]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-4 text-gray-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Scanning Submissions...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-5 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Award className="w-6 h-6 text-indigo-600" />
                                Submissions Central
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Terminal</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-all" />
                            <input
                                type="text"
                                placeholder="Search submissions..."
                                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link to="/admin/assignments/create" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 group">
                            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                {/* Visual Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Pending Audit', count: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', bloom: 'bg-amber-500/10' },
                        { label: 'Validated', count: stats.graded, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', bloom: 'bg-emerald-500/10' },
                        { label: 'Overdue Task', count: stats.overdue, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', bloom: 'bg-rose-500/10' },
                        { label: 'Total Index', count: stats.total, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-50', bloom: 'bg-indigo-600/10' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card group hover:shadow-2xl transition-all duration-500 border-none relative overflow-hidden bg-white p-6"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bloom} blur-3xl group-hover:scale-150 transition-transform duration-700`} />
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="flex items-end justify-between relative z-10">
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">{stat.count}</span>
                                <ChevronRight className={`w-5 h-5 ${stat.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Deck */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="px-8 py-5 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <div className="p-1 bg-gray-50 rounded-2xl flex">
                                {(['all', 'pending', 'graded', 'overdue'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f
                                                ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/5 scale-105'
                                                : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Displaying {filteredAssignments.length} results</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student / Trace</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignment Module</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Timeline</th>
                                    <th className="px-8 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence mode="popLayout">
                                    {filteredAssignments.map((assignment, idx) => (
                                        <motion.tr
                                            key={assignment.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-gray-50/50 transition-all"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-indigo-300 font-bold shadow-sm group-hover:shadow-indigo-500/10 transition-all">
                                                        {(assignment as any).student?.full_name?.charAt(0) || <Users className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{(assignment as any).student?.full_name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Mail className="w-3 h-3 text-gray-300" />
                                                            <p className="text-[10px] font-medium text-gray-400">{(assignment as any).student?.email}</p>
                                                        </div>
                                                        <div className="mt-2">
                                                            {getPathBadge((assignment as any).student?.learning_path)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-sm font-black text-gray-900">{(assignment as any).course?.title}</span>
                                                    </div>
                                                    {assignment.submission_link && (
                                                        <a
                                                            href={assignment.submission_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 mt-3 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 w-max px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            Access Source
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'NO_LIMIT'}</span>
                                                    </div>
                                                    {assignment.grade !== null ? (
                                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl w-max border border-emerald-100">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Score: {assignment.grade}</span>
                                                        </div>
                                                    ) : assignment.submission_link ? (
                                                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl w-max border border-amber-100 animate-pulse">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Review</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl w-max border border-gray-100">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Incomplete</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {assignment.submission_link && !assignment.grade ? (
                                                    <button
                                                        onClick={() => setGradingId(assignment.id)}
                                                        className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                                                    >
                                                        Evaluate
                                                    </button>
                                                ) : assignment.grade !== null ? (
                                                    <button
                                                        onClick={() => {
                                                            setGradingId(assignment.id);
                                                            setGradeForm({
                                                                grade: assignment.grade?.toString() || '',
                                                                feedback: assignment.feedback || ''
                                                            });
                                                        }}
                                                        className="p-3 text-gray-300 hover:text-indigo-600 transition-all rounded-xl"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">No Action</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredAssignments.length === 0 && (
                        <div className="py-20 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6">
                                    <FileText className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">Cache Empty</h3>
                                <p className="text-sm text-gray-400">No submissions found for the selected filter.</p>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* Evaluation Modal */}
            <AnimatePresence>
                {gradingId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            onClick={() => setGradingId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-lg bg-white rounded-[48px] shadow-3xl overflow-hidden p-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Evaluate Task</h2>
                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest mt-1">Audit Protocol Phase 2</p>
                                </div>
                                <button
                                    onClick={() => setGradingId(null)}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Performance Score (0-100)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={gradeForm.grade}
                                            onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-[24px] p-6 text-4xl font-black text-indigo-600 focus:bg-white transition-all shadow-inner text-center outline-none"
                                            placeholder="--"
                                        />
                                        <Award className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-indigo-100 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Analytical Feedback</label>
                                    <textarea
                                        value={gradeForm.feedback}
                                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-[32px] p-8 text-sm font-medium focus:bg-white transition-all shadow-inner h-40 outline-none resize-none placeholder:text-gray-300"
                                        placeholder="Critique or celebrate the work..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setGradingId(null)}
                                        className="py-5 bg-white border-2 border-indigo-50 text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-[24px] transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={() => gradingId && handleGrade(gradingId)}
                                        className="py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[24px] shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:-translate-y-1"
                                    >
                                        Commit Record
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAssignments;
