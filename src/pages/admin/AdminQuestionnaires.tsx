import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Question, QuestionType, QuestionOption, Profile } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, GripVertical, Save, Eye, Calendar,
    CheckSquare, List, Type, AlignLeft, Star, BarChart3,
    Users, Target, Clock, Settings, ArrowLeft, Copy,
    ChevronRight, Search, Layout, FileText, Send, Sparkles,
    Filter, MoreVertical, CheckCircle, AlertCircle, X,
    Maximize2, Monitor, Database, Shield
} from 'lucide-react';

const AdminQuestionnaires: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'create' | 'manage'>('manage');
    const [questionnaires, setQuestionnaires] = useState<any[]>([]);
    const [students, setStudents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [targetLearningPaths, setTargetLearningPaths] = useState<('fe' | 'be' | 'fs')[]>(['fe', 'be', 'fs']);
    const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState('');
    const [allowLateSubmission, setAllowLateSubmission] = useState(true);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [maxAttempts, setMaxAttempts] = useState(1);
    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>();
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [questionnairesRes, studentsRes] = await Promise.all([
                supabase
                    .from('questionnaires')
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'member')
            ]);

            if (questionnairesRes.data) setQuestionnaires(questionnairesRes.data);
            if (studentsRes.data) setStudents(studentsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const addQuestion = (type: QuestionType) => {
        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            type,
            question: '',
            required: true,
            points: 1,
            options: type === 'multiple_choice' || type === 'checkbox'
                ? [
                    { id: `opt_${Date.now()}_1`, text: '', isCorrect: false },
                    { id: `opt_${Date.now()}_2`, text: '', isCorrect: false }
                ]
                : undefined,
            minValue: type === 'linear_scale' ? 1 : undefined,
            maxValue: type === 'linear_scale' ? 5 : undefined,
            minLabel: type === 'linear_scale' ? 'Strongly Disagree' : undefined,
            maxLabel: type === 'linear_scale' ? 'Strongly Agree' : undefined,
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addOption = (questionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: [...q.options, { id: `opt_${Date.now()}`, text: '', isCorrect: false }]
                };
            }
            return q;
        }));
    };

    const updateOption = (questionId: string, optionId: string, updates: Partial<QuestionOption>) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: q.options.map(opt => opt.id === optionId ? { ...opt, ...updates } : opt)
                };
            }
            return q;
        }));
    };

    const deleteOption = (questionId: string, optionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: q.options.filter(opt => opt.id !== optionId)
                };
            }
            return q;
        }));
    };

    const duplicateQuestion = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const duplicated = {
                ...question,
                id: `q_${Date.now()}`,
                options: question.options?.map(opt => ({ ...opt, id: `opt_${Date.now()}_${Math.random()}` }))
            };
            const index = questions.findIndex(q => q.id === questionId);
            const newQuestions = [...questions];
            newQuestions.splice(index + 1, 0, duplicated);
            setQuestions(newQuestions);
        }
    };

    const saveQuestionnaire = async (publish: boolean = false) => {
        if (!title.trim() || questions.length === 0) {
            alert('Harap isi judul dan tambahkan minimal satu pertanyaan!');
            return;
        }

        try {
            const { error } = await supabase.from('questionnaires').insert({
                title,
                description,
                questions_json: questions,
                target_learning_paths: targetLearningPaths,
                target_student_ids: targetStudentIds.length > 0 ? targetStudentIds : null,
                due_date: dueDate || null,
                allow_late_submission: allowLateSubmission,
                show_correct_answers: showCorrectAnswers,
                max_attempts: maxAttempts,
                time_limit_minutes: timeLimitMinutes || null,
                is_published: publish,
                created_by: user?.id
            });

            if (error) throw error;

            alert(`Quiz ${publish ? 'diterbitkan' : 'disimpan sebagai draft'} berhasil!`);
            resetForm();
            loadData();
            setActiveTab('manage');
        } catch (error) {
            console.error('Error saving questionnaire:', error);
            alert('Gagal menyimpan quiz.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setQuestions([]);
        setTargetLearningPaths(['fe', 'be', 'fs']);
        setTargetStudentIds([]);
        setDueDate('');
        setAllowLateSubmission(true);
        setShowCorrectAnswers(false);
        setMaxAttempts(1);
        setTimeLimitMinutes(undefined);
        setIsPublished(false);
    };

    const deleteQuestionnaire = async (id: string) => {
        if (!confirm('Hapus quiz ini? Anda tidak bisa mengembalikannya.')) return;

        try {
            const { error } = await supabase.from('questionnaires').delete().eq('id', id);
            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error deleting questionnaire:', error);
        }
    };

    const togglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('questionnaires')
                .update({ is_published: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error toggling publish status:', error);
        }
    };

    const getQuestionTypeIcon = (type: QuestionType) => {
        switch (type) {
            case 'multiple_choice': return <CheckSquare className="w-5 h-5" />;
            case 'checkbox': return <List className="w-5 h-5" />;
            case 'short_answer': return <Type className="w-5 h-5" />;
            case 'long_answer': return <AlignLeft className="w-5 h-5" />;
            case 'rating': return <Star className="w-5 h-5" />;
            case 'linear_scale': return <BarChart3 className="w-5 h-5" />;
        }
    };

    const getQuestionTypeName = (type: QuestionType) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const filteredQuestionnaires = questionnaires.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-4 text-gray-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Knowledge Base...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Command Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-5 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <Layout className="w-6 h-6 text-indigo-600" />
                                Assessment Forge
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Studio</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'manage'
                                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Database className="w-3.5 h-3.5" />
                                Database
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'create'
                                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5" />
                                Forge New
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                {activeTab === 'manage' ? (
                    <div className="space-y-8">
                        {/* Search & Actions */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Quizzes..."
                                    className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Inventory Grid */}
                        {filteredQuestionnaires.length === 0 ? (
                            <div className="card py-32 text-center border-dashed border-2 bg-gray-50/50">
                                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">No Data Found</h3>
                                <p className="text-gray-400 max-w-xs mx-auto mb-8">Start your journey by creating a new diagnostic assessment for your students.</p>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className="btn-primary py-4 px-10 rounded-2xl font-black tracking-widest text-xs shadow-2xl shadow-indigo-600/30"
                                >
                                    OPEN FORGE STUDIO
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredQuestionnaires.map((q, idx) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="card group hover:shadow-2xl transition-all duration-500 border-none relative overflow-hidden bg-white p-0 flex flex-col"
                                        >
                                            {/* Top Banner */}
                                            <div className={`h-2 w-full ${q.is_published ? 'bg-indigo-500' : 'bg-gray-200'}`} />

                                            <div className="p-8 flex flex-col flex-1">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex gap-2">
                                                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${q.is_published
                                                                ? 'bg-indigo-50 text-indigo-600'
                                                                : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                            {q.is_published ? 'Live' : 'Draft'}
                                                        </span>
                                                        <span className="px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full bg-gray-50 text-gray-400">
                                                            ID: {q.id.slice(0, 5)}
                                                        </span>
                                                    </div>
                                                    <button className="text-gray-300 hover:text-gray-900 transition-colors">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{q.title}</h3>
                                                <p className="text-xs text-gray-400 font-medium mb-8 line-clamp-2 leading-relaxed italic">{q.description || 'No description provided.'}</p>

                                                <div className="space-y-4 mb-8">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                        <span className="flex items-center gap-2">
                                                            <List className="w-3.5 h-3.5" />
                                                            {q.questions_json?.length || 0} Questions
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {q.target_learning_paths?.length || 0} Paths
                                                        </span>
                                                    </div>
                                                    {q.due_date && (
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Deadline: {new Date(q.due_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                                                    <button
                                                        onClick={() => navigate(`/admin/questionnaires/${q.id}/responses`)}
                                                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-900/10 active:scale-95"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Audits
                                                    </button>
                                                    <button
                                                        onClick={() => togglePublish(q.id, q.is_published)}
                                                        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${q.is_published
                                                                ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                                                                : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'
                                                            }`}
                                                    >
                                                        {q.is_published ? 'Unlist' : 'Deploy'}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => deleteQuestionnaire(q.id)}
                                                className="absolute bottom-0 right-0 p-3 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all rounded-tl-2xl active:bg-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-32">
                        {/* Build Area */}
                        <div className="lg:col-span-3 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card bg-white p-10 rounded-[40px] shadow-2xl shadow-indigo-500/5 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Monitor className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Project Identity</h2>
                                </div>
                                <div className="space-y-6 relative">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Quiz Header</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[24px] p-6 text-xl font-black placeholder:text-gray-200 transition-all shadow-inner"
                                            placeholder="Enter project title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Brief Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[24px] p-6 text-sm font-medium placeholder:text-gray-200 transition-all h-32 outline-none resize-none shadow-inner"
                                            placeholder="Provide context for the students..."
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        Assessment Matrix
                                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{questions.length}</span>
                                    </h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addQuestion('multiple_choice')}
                                            className="p-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 transition-all shadow-sm active:scale-90"
                                            title="Add Quick Choice"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {questions.length === 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {(['multiple_choice', 'checkbox', 'short_answer', 'long_answer', 'rating', 'linear_scale'] as QuestionType[]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => addQuestion(type)}
                                                className="group card p-8 border-none bg-white hover:bg-indigo-600 hover:scale-105 transition-all duration-300 text-center flex flex-col items-center gap-4 cursor-pointer shadow-xl shadow-indigo-500/5"
                                            >
                                                <div className="w-14 h-14 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-600 group-hover:bg-white transition-colors">
                                                    {getQuestionTypeIcon(type)}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{getQuestionTypeName(type)}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <AnimatePresence mode="popLayout">
                                            {questions.map((question, index) => (
                                                <motion.div
                                                    key={question.id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                    className="card p-0 bg-white border-none shadow-xl shadow-indigo-500/5 group"
                                                >
                                                    <div className="flex h-full">
                                                        <div className="w-2 bg-indigo-100 group-hover:bg-indigo-600 transition-all" />
                                                        <div className="flex-1 p-8">
                                                            <div className="flex items-start gap-6">
                                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                                    <GripVertical className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-6">
                                                                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                                                            {getQuestionTypeIcon(question.type)}
                                                                        </div>
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Question #{index + 1} — {getQuestionTypeName(question.type)}</span>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <input
                                                                            type="text"
                                                                            value={question.question}
                                                                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                                                            className="w-full bg-gray-50/50 border-none rounded-2xl p-5 text-lg font-black focus:bg-white transition-all shadow-inner placeholder:text-gray-200"
                                                                            placeholder="Define your question..."
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={question.description || ''}
                                                                            onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                                                                            className="w-full bg-gray-50/50 border-none rounded-xl p-4 text-xs font-medium focus:bg-white transition-all shadow-inner placeholder:text-gray-200 italic"
                                                                            placeholder="Add optional hint or breakdown..."
                                                                        />

                                                                        {/* Options Studio */}
                                                                        {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                                                                            <div className="mt-8 space-y-3 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 border-dashed">
                                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Response Matrix</p>
                                                                                {question.options?.map((option, optIndex) => (
                                                                                    <div key={option.id} className="flex items-center gap-3 group/opt">
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                if (question.type === 'multiple_choice') {
                                                                                                    const updatedOptions = question.options?.map(opt => ({
                                                                                                        ...opt,
                                                                                                        isCorrect: opt.id === option.id
                                                                                                    }));
                                                                                                    updateQuestion(question.id, { options: updatedOptions });
                                                                                                } else {
                                                                                                    updateOption(question.id, option.id, { isCorrect: !option.isCorrect });
                                                                                                }
                                                                                            }}
                                                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${option.isCorrect
                                                                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 rotate-0'
                                                                                                    : 'bg-white text-gray-200 hover:text-gray-900 border border-gray-100'
                                                                                                }`}
                                                                                        >
                                                                                            {option.isCorrect ? <CheckCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                                                        </button>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={option.text}
                                                                                            onChange={(e) => updateOption(question.id, option.id, { text: e.target.value })}
                                                                                            className={`flex-1 bg-white rounded-xl px-5 py-4 text-sm font-bold border-2 transition-all outline-none ${option.isCorrect ? 'border-green-500/20 text-green-700' : 'border-transparent text-gray-700 focus:border-indigo-500/10'
                                                                                                }`}
                                                                                            placeholder={`Variant ${optIndex + 1}`}
                                                                                        />
                                                                                        <button
                                                                                            onClick={() => deleteOption(question.id, option.id)}
                                                                                            className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/opt:opacity-100"
                                                                                        >
                                                                                            <X className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                                <button
                                                                                    onClick={() => addOption(question.id)}
                                                                                    className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-[10px] font-black text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
                                                                                >
                                                                                    <Plus className="w-4 h-4" />
                                                                                    Inject New Option
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* Advanced Meta */}
                                                                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
                                                                            <div className="flex items-center gap-8">
                                                                                <label className="flex items-center gap-3 cursor-pointer group/req">
                                                                                    <div className={`w-10 h-6 rounded-full transition-all relative ${question.required ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${question.required ? 'left-5' : 'left-1'}`} />
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            className="hidden"
                                                                                            checked={question.required}
                                                                                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                                                                        />
                                                                                    </div>
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/req:text-gray-900">Required</span>
                                                                                </label>
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Score Payload:</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={question.points}
                                                                                        onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                                                                                        className="w-16 bg-gray-50 border-none rounded-lg p-2 text-center text-xs font-black text-indigo-600"
                                                                                        min="0"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={() => duplicateQuestion(question.id)}
                                                                                    className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all"
                                                                                    title="Replicate"
                                                                                >
                                                                                    <Copy className="w-4 h-4" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => deleteQuestion(question.id)}
                                                                                    className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                                                    title="Purge"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <div className="pt-4">
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        addQuestion(e.target.value as QuestionType);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-[24px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all outline-none appearance-none cursor-pointer text-center"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>+ APPEND NEW ASSESSMENT MODULE</option>
                                                <option value="multiple_choice" className="text-gray-900">Choice Matrix</option>
                                                <option value="checkbox" className="text-gray-900">Multi-Select Array</option>
                                                <option value="short_answer" className="text-gray-900">Text Snippet</option>
                                                <option value="long_answer" className="text-gray-900">Long-form Input</option>
                                                <option value="rating" className="text-gray-900">Rating Vector</option>
                                                <option value="linear_scale" className="text-gray-900">Linear progression</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Control Deck */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="card bg-white p-8 rounded-[40px] shadow-xl shadow-indigo-500/5 sticky top-32"
                            >
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-indigo-600" />
                                            Targeting
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(['fe', 'be', 'fs'] as const).map((path) => (
                                                <button
                                                    key={path}
                                                    onClick={() => {
                                                        if (targetLearningPaths.includes(path)) {
                                                            setTargetLearningPaths(targetLearningPaths.filter(p => p !== path));
                                                        } else {
                                                            setTargetLearningPaths([...targetLearningPaths, path]);
                                                        }
                                                    }}
                                                    className={`px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between border-2 ${targetLearningPaths.includes(path)
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20'
                                                            : 'bg-white text-gray-400 border-gray-50 hover:border-indigo-100 uppercase'
                                                        }`}
                                                >
                                                    {path === 'fe' ? 'Frontend' : path === 'be' ? 'Backend' : 'Fullstack'}
                                                    {targetLearningPaths.includes(path) && <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-indigo-600" />
                                            Parameters
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Deadline Sequence</label>
                                                <input
                                                    type="datetime-local"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-black focus:bg-white transition-all outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Limit (min)</label>
                                                    <input
                                                        type="number"
                                                        value={timeLimitMinutes || ''}
                                                        onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-black text-center"
                                                        placeholder="∞"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Attempts</label>
                                                    <input
                                                        type="number"
                                                        value={maxAttempts}
                                                        onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                                                        className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-black text-center"
                                                        min="1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6">
                                        <button
                                            onClick={() => saveQuestionnaire(true)}
                                            className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                                        >
                                            <Send className="w-4 h-4" />
                                            Finalize & Deploy
                                        </button>
                                        <button
                                            onClick={() => saveQuestionnaire(false)}
                                            className="w-full py-5 bg-white border-2 border-indigo-50 text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Save className="w-4 h-4" />
                                            Archive Draft
                                        </button>
                                        <button
                                            onClick={resetForm}
                                            className="w-full py-3 text-[8px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            Purge Form Buffer
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminQuestionnaires;
