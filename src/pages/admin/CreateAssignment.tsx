import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Profile, Course } from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
    Save,
    ArrowLeft,
    LogOut,
    Users,
    BookOpen,
    Zap,
    CheckCircle2,
    Search,
    UserPlus,
    Layout,
    Clock,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateAssignment: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Profile[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [coursesRes, studentsRes] = await Promise.all([
            supabase.from('courses').select('*').eq('is_published', true).order('title'),
            supabase.from('profiles').select('*').eq('role', 'member').order('full_name'),
        ]);

        if (coursesRes.data) setCourses(coursesRes.data);
        if (studentsRes.data) setStudents(studentsRes.data);
        setLoading(false);
    };

    const handleToggleStudent = (studentId: string) => {
        const newSet = new Set(selectedStudents);
        if (newSet.has(studentId)) {
            newSet.delete(studentId);
        } else {
            newSet.add(studentId);
        }
        setSelectedStudents(newSet);
    };

    const handleBulkSelect = (path: 'fe' | 'be' | 'fs' | 'all' | 'clear') => {
        if (path === 'clear') {
            setSelectedStudents(new Set());
            return;
        }

        if (path === 'all') {
            setSelectedStudents(new Set(students.map((s) => s.id)));
            return;
        }

        const filtered = students.filter((s) => s.learning_path === path);
        setSelectedStudents(new Set([...Array.from(selectedStudents), ...filtered.map((s) => s.id)]));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }

        if (selectedStudents.size === 0) {
            alert('Please select at least one student');
            return;
        }

        setSubmitting(true);

        const assignments = Array.from(selectedStudents).map((studentId) => ({
            student_id: studentId,
            course_id: selectedCourse,
            due_date: dueDate || null,
        }));

        const { error } = await supabase.from('assignments').insert(assignments);

        if (error) {
            alert('Error creating assignments: ' + error.message);
        } else {
            navigate('/admin/assignments');
        }

        setSubmitting(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('adminUser');
        setUser(null);
        navigate('/admin');
    };

    const getPathBadge = (path: string | null | undefined) => {
        if (!path) return null;
        const colors = {
            fe: 'bg-indigo-50 text-indigo-600',
            be: 'bg-emerald-50 text-emerald-600',
            fs: 'bg-amber-50 text-amber-600',
        };
        const labels = { fe: 'FE', be: 'BE', fs: 'FS' };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${colors[path as keyof typeof colors]}`}>
                {labels[path as keyof typeof labels]}
            </span>
        );
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <UserPlus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Operative Registry...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header Hub */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/admin/assignments')}
                                className="p-3.5 bg-gray-50 hover:bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3 uppercase italic">
                                    <Zap className="w-6 h-6 text-indigo-600" />
                                    Task Deployment
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation: Multi-Sync</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSignOut}
                                className="p-3.5 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-10 py-16">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Control Column */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="card bg-white border border-gray-100 rounded-[50px] p-10 sticky top-32 shadow-sm hover:shadow-2xl transition-all duration-700">
                                <h2 className="text-xl font-black text-gray-900 mb-10 flex items-center gap-4 uppercase italic">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                    Sync Parameters
                                </h2>

                                <div className="space-y-10">
                                    {/* Course Selection */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Knowledge Node</label>
                                        <div className="relative">
                                            <select
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-[28px] py-5 px-8 text-xs font-black uppercase tracking-widest focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner"
                                                required
                                            >
                                                <option value="" className="text-gray-400">SELECT_NODE_ID</option>
                                                {courses.map((course) => (
                                                    <option key={course.id} value={course.id} className="text-gray-900 font-black">
                                                        {course.title} ({course.category.toUpperCase()})
                                                    </option>
                                                ))}
                                            </select>
                                            <Layout className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                        </div>
                                        {courses.length === 0 && (
                                            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mt-2 animate-pulse">
                                                Zero active nodes in repository
                                            </p>
                                        )}
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deadline Sequence</label>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-[28px] py-5 px-8 text-[11px] font-black uppercase tracking-widest focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner"
                                            />
                                            <Clock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Operational Stats */}
                                    <div className="p-8 bg-indigo-50 rounded-[40px] space-y-4 border border-indigo-100/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Population</span>
                                            <span className="text-xl font-black text-indigo-600 tracking-tighter">{students.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Marked for Sync</span>
                                            <span className="text-3xl font-black text-indigo-700 tracking-tighter">
                                                {selectedStudents.size}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Deck */}
                                    <div className="space-y-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting || selectedStudents.size === 0 || !selectedCourse}
                                            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.25em] text-[10px] rounded-[30px] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                                        >
                                            {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                            Commit Deployment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/assignments')}
                                            className="w-full py-5 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-[30px] transition-all"
                                        >
                                            Abort Operation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Selection Column */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="card bg-white border border-gray-100 rounded-[60px] p-12 shadow-sm hover:shadow-2xl transition-all duration-700">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-5 uppercase italic">
                                        <Users className="w-8 h-8 text-indigo-600" />
                                        Operative Selection
                                    </h2>

                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="SCAN BY_NAME_OR_EMAIL..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-gray-50 border-none rounded-[20px] py-3.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all w-full md:w-80 shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Vector Filters */}
                                <div className="flex flex-wrap gap-3 mb-12 pb-10 border-b border-gray-50">
                                    {[
                                        { id: 'fe', label: 'Frontend Vector', bg: 'indigo' },
                                        { id: 'be', label: 'Backend Vector', bg: 'emerald' },
                                        { id: 'fs', label: 'Fullstack Synthesis', bg: 'amber' },
                                        { id: 'all', label: 'SELECT_ALL_OPERATIVES', bg: 'gray' },
                                        { id: 'clear', label: 'PURGE_SELECTION', bg: 'red' }
                                    ].map((bulk) => (
                                        <button
                                            key={bulk.id}
                                            type="button"
                                            onClick={() => handleBulkSelect(bulk.id as any)}
                                            className={`px-6 py-3 bg-${bulk.bg}-50 text-${bulk.bg}-600 hover:bg-${bulk.bg}-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95`}
                                        >
                                            {bulk.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Operative Grid */}
                                {filteredStudents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                                        {filteredStudents.map((student) => (
                                            <motion.label
                                                key={student.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`flex items-center gap-5 p-5 rounded-[32px] border-2 cursor-pointer transition-all duration-300 group ${selectedStudents.has(student.id)
                                                    ? 'border-indigo-600 bg-indigo-600 shadow-xl shadow-indigo-600/20'
                                                    : 'border-gray-50 hover:border-indigo-100 bg-white'
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.has(student.id)}
                                                        onChange={() => handleToggleStudent(student.id)}
                                                        className="hidden peer"
                                                    />
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedStudents.has(student.id)
                                                        ? 'bg-white border-white scale-110'
                                                        : 'bg-gray-50 border-gray-100'
                                                        }`}>
                                                        {selectedStudents.has(student.id) && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className={`font-black text-sm uppercase tracking-tight truncate ${selectedStudents.has(student.id) ? 'text-white' : 'text-gray-900'}`}>
                                                            {student.full_name}
                                                        </p>
                                                        {getPathBadge(student.learning_path)}
                                                    </div>
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedStudents.has(student.id) ? 'text-indigo-100' : 'text-gray-400'}`}>
                                                        {student.email}
                                                    </p>
                                                </div>

                                                {selectedStudents.has(student.id) && (
                                                    <motion.div
                                                        layoutId={`sparkle-${student.id}`}
                                                        className="p-2 bg-white/20 rounded-xl"
                                                    >
                                                        <Sparkles className="w-4 h-4 text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24">
                                        <div className="w-20 h-20 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                                            <Users className="w-10 h-10 text-gray-200" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase italic">Repository Empty</h3>
                                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Zero active operatives detected in current sector.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            {/* Studio Accents */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-1/4 -right-1/4 w-[60%] h-[60%] bg-indigo-100/30 blur-[200px] rounded-full" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[60%] h-[60%] bg-blue-100/20 blur-[200px] rounded-full" />
            </div>
        </div>
    );
};

export default CreateAssignment;
