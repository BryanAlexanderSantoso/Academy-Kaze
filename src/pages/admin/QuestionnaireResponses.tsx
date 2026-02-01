import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Questionnaire, QuestionnaireResponse, Profile } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Users, CheckCircle, Clock, Award,
    TrendingUp, Download, Filter, Search, Star,
    BookOpen, ChevronRight, Layout, Mail, Calendar,
    FileText, Zap, BarChart2, Shield, X, Maximize2
} from 'lucide-react';

const QuestionnaireResponses: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
    const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
    const [students, setStudents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'submitted' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            // Load questionnaire
            const { data: qData } = await supabase
                .from('questionnaires')
                .select('*')
                .eq('id', id)
                .single();

            if (qData) setQuestionnaire(qData);

            // Load responses with student info
            const { data: rData } = await supabase
                .from('questionnaire_responses')
                .select(`
                    *,
                    student:profiles!questionnaire_responses_student_id_fkey(*)
                `)
                .eq('questionnaire_id', id);

            if (rData) setResponses(rData);

            // Load all targeted students
            if (qData) {
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'member');

                if (qData.target_student_ids && qData.target_student_ids.length > 0) {
                    query = query.in('id', qData.target_student_ids);
                } else if (qData.target_learning_paths) {
                    query = query.in('learning_path', qData.target_learning_paths);
                }

                const { data: sData } = await query;
                if (sData) setStudents(sData);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const gradeResponse = async (responseId: string, score: number, feedback: string) => {
        try {
            const { error } = await supabase
                .from('questionnaire_responses')
                .update({
                    score,
                    feedback,
                    is_graded: true,
                    graded_at: new Date().toISOString()
                })
                .eq('id', responseId);

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Error grading response:', error);
        }
    };

    const calculateAutoScore = (response: QuestionnaireResponse): number => {
        if (!questionnaire) return 0;

        let totalScore = 0;
        let maxScore = 0;

        questionnaire.questions_json.forEach((question) => {
            const points = question.points || 0;
            maxScore += points;

            const answer = response.answers_json[question.id];
            if (!answer) return;

            // Auto-grade multiple choice and checkbox
            if (question.type === 'multiple_choice' && question.options) {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && answer === correctOption.id) {
                    totalScore += points;
                }
            } else if (question.type === 'checkbox' && question.options) {
                const correctIds = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
                const selectedIds = Array.isArray(answer) ? answer : [];
                const isCorrect = correctIds.length === selectedIds.length &&
                    correctIds.every(id => selectedIds.includes(id));
                if (isCorrect) {
                    totalScore += points;
                }
            }
        });

        return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    };

    const getSubmissionRate = () => {
        const submitted = responses.filter(r => r.submitted_at).length;
        return students.length > 0 ? (submitted / students.length) * 100 : 0;
    };

    const getAverageScore = () => {
        const gradedResponses = responses.filter(r => r.is_graded && r.score !== undefined);
        if (gradedResponses.length === 0) return 0;
        const total = gradedResponses.reduce((sum, r) => sum + (r.score || 0), 0);
        return total / gradedResponses.length;
    };

    const getAverageTimeSpent = () => {
        const submittedResponses = responses.filter(r => r.submitted_at && r.time_spent_seconds);
        if (submittedResponses.length === 0) return 0;
        const total = submittedResponses.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0);
        return Math.round(total / submittedResponses.length / 60); // Convert to minutes
    };

    const filteredResponses = responses.filter(r => {
        if (filter === 'submitted' && !r.submitted_at) return false;
        if (filter === 'pending' && r.submitted_at) return false;
        if (searchTerm && r.student) {
            return r.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.student.email.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    const exportToCSV = () => {
        if (!questionnaire) return;

        const headers = ['Student Name', 'Email', 'Submitted At', 'Score', 'Time Spent (min)', 'Graded'];
        const rows = responses
            .filter(r => r.submitted_at)
            .map(r => [
                r.student?.full_name || '',
                r.student?.email || '',
                r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '',
                r.score?.toFixed(2) || 'N/A',
                r.time_spent_seconds ? Math.round(r.time_spent_seconds / 60).toString() : 'N/A',
                r.is_graded ? 'Yes' : 'No'
            ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${questionnaire.title}_responses.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <BarChart2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Aggregating Audit Intelligence...</p>
            </div>
        );
    }

    if (!questionnaire) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                        <Shield className="w-10 h-10 text-red-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase italic">Null Reference</h3>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Target assessment module not found in repository.</p>
                    <button onClick={() => navigate('/admin/questionnaires')} className="mt-10 btn-primary px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                        Return to Control
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            {/* Header Area */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/admin/questionnaires')}
                                className="p-3.5 bg-gray-50 hover:bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter flex items-center gap-4 uppercase italic">
                                    <BarChart2 className="w-7 h-7 text-indigo-600" />
                                    {questionnaire.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Terminal / Insight View</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={exportToCSV} className="flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10 transition-all active:scale-95">
                            <Download className="w-4 h-4" />
                            Export CSV Repository
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 mt-12 space-y-12">
                {/* Tactical Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Transmission Rate', value: `${getSubmissionRate().toFixed(0)}%`, sub: `${responses.filter(r => r.submitted_at).length} / ${students.length}`, icon: Users, color: 'indigo' },
                        { label: 'Performance Mean', value: `${getAverageScore().toFixed(1)}%`, sub: `${responses.filter(r => r.is_graded).length} Validated`, icon: Award, color: 'emerald' },
                        { label: 'Latency Period', value: `${getAverageTimeSpent()}m`, sub: 'Per Submission', icon: Clock, color: 'amber' },
                        { label: 'Record Count', value: responses.filter(r => r.submitted_at).length, sub: 'Submitted', icon: CheckCircle, color: 'fullstack' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden relative"
                        >
                            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700`} />
                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className={`p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="relative">
                                <div className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Deck */}
                <div className="card bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SCAN_OPERATIVE_IDENTITY..."
                            className="w-full bg-gray-50 border-none rounded-[24px] py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex bg-gray-50 p-1.5 rounded-[24px]">
                        {(['all', 'submitted', 'pending'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest rounded-[20px] transition-all ${filter === f
                                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Operative Response Matrix */}
                <div className="space-y-6">
                    {filteredResponses.length === 0 ? (
                        <div className="card bg-white border-dashed border-2 py-32 text-center rounded-[50px]">
                            <Users className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-900 uppercase italic">No Matches Detected</h3>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Zero records found matching current query.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredResponses.map((response, idx) => (
                                <motion.div
                                    key={response.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="card bg-white border border-gray-100 rounded-[50px] p-10 shadow-sm hover:shadow-2xl transition-all duration-700"
                                >
                                    <div className="flex flex-col lg:flex-row gap-12">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                                <div className="w-14 h-14 bg-indigo-50 rounded-[28px] flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner border border-indigo-100/50">
                                                    {response.student?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2">
                                                        {response.student?.full_name}
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-3 h-3 text-gray-300" />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{response.student?.email}</span>
                                                    </div>
                                                </div>
                                                <div className="ml-auto flex gap-2">
                                                    {response.submitted_at ? (
                                                        <span className="px-5 py-2 text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">SUBMITTED</span>
                                                    ) : (
                                                        <span className="px-5 py-2 text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 rounded-full border border-amber-100">SYNCHRONIZING</span>
                                                    )}
                                                    {response.is_graded && (
                                                        <span className="px-5 py-2 text-[8px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/20">VALIDATED</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 pb-10 border-b border-gray-50">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> Timestamp
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-600">{response.submitted_at ? new Date(response.submitted_at).toLocaleString() : 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                        <Clock className="w-3 h-3" /> Latency
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-600">{response.time_spent_seconds ? `${Math.round(response.time_spent_seconds / 60)} minutes` : 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                                        <Zap className="w-3 h-3 text-indigo-500" /> Performance
                                                    </p>
                                                    <p className="text-[10px] font-black text-indigo-600">{response.score !== undefined ? `${response.score.toFixed(1)}%` : 'PENDING_AUDIT'}</p>
                                                </div>
                                            </div>

                                            {/* Data Payload Preview */}
                                            {response.submitted_at && (
                                                <div className="space-y-6">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Transmission Payload Preview</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                        {questionnaire.questions_json.map((question, idx) => {
                                                            const answer = response.answers_json[question.id];
                                                            if (!answer) return null;

                                                            return (
                                                                <div key={question.id} className="group/item">
                                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mb-2 group-hover/item:text-indigo-600 transition-colors">
                                                                        MODULE_{idx + 1}: {question.question}
                                                                    </p>
                                                                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-inner group-hover/item:bg-white transition-all">
                                                                        <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                                                                            {question.type === 'multiple_choice' || question.type === 'checkbox' ? (
                                                                                Array.isArray(answer) ? (
                                                                                    answer.map(id => {
                                                                                        const opt = question.options?.find(o => o.id === id);
                                                                                        return opt?.text;
                                                                                    }).join(', ')
                                                                                ) : (
                                                                                    question.options?.find(o => o.id === answer)?.text || answer
                                                                                )
                                                                            ) : (
                                                                                answer.toString()
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Feedback Vector */}
                                            {response.feedback && (
                                                <div className="mt-10 p-8 bg-indigo-50/50 border border-indigo-100 rounded-[32px] relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                                        <FileText className="w-12 h-12 text-indigo-600" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Audit Intelligence Feedback</p>
                                                    <p className="text-sm font-bold text-indigo-900 leading-relaxed italic relative z-10">"{response.feedback}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assessment Interface */}
                                        {response.submitted_at && !response.is_graded && (
                                            <div className="lg:w-96 flex-shrink-0">
                                                <GradeForm
                                                    responseId={response.id}
                                                    autoScore={calculateAutoScore(response)}
                                                    onGrade={gradeResponse}
                                                />
                                            </div>
                                        )}
                                        {response.is_graded && (
                                            <div className="lg:w-96 flex-shrink-0 flex items-center justify-center border-l border-gray-50 pl-12 italic">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                                                        <CheckCircle className="w-8 h-8 text-indigo-600" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RECORD_LOCKED</p>
                                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Validation Verified</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

// Tactical Grade Interface
const GradeForm: React.FC<{
    responseId: string;
    autoScore: number;
    onGrade: (responseId: string, score: number, feedback: string) => void;
}> = ({ responseId, autoScore, onGrade }) => {
    const [score, setScore] = useState(autoScore);
    const [feedback, setFeedback] = useState('');
    const [showForm, setShowForm] = useState(false);

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="w-full h-full flex flex-col items-center justify-center gap-6 p-10 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-[40px] border-2 border-indigo-100 border-dashed hover:border-indigo-600 transition-all group active:scale-95"
            >
                <div className="w-20 h-20 bg-white group-hover:bg-white/20 rounded-[30px] flex items-center justify-center shadow-lg transition-colors">
                    <Star className="w-10 h-10 group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <div>
                    <p className="text-xl font-black uppercase italic tracking-tighter">Initiate Audit</p>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1 text-center">Protocol Phase 3</p>
                </div>
            </button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[40px] border-2 border-indigo-600 shadow-2xl shadow-indigo-600/10 h-full flex flex-col"
        >
            <h4 className="text-xl font-black text-gray-900 mb-8 uppercase italic flex items-center justify-between">
                Validation Console
                <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-900 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </h4>

            <div className="space-y-10 flex-1">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Performance Score (0-100)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(parseFloat(e.target.value))}
                            className="w-full bg-gray-50 border-none rounded-[28px] py-6 px-10 text-4xl font-black text-indigo-600 focus:bg-white transition-all shadow-inner outline-none text-center"
                            min="0"
                            max="100"
                            step="0.1"
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-gray-300 pointer-events-none">%</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Intelligence Synthesis (Feedback)</label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-[32px] p-8 text-sm font-bold text-gray-700 focus:bg-white transition-all shadow-inner h-40 outline-none resize-none placeholder:text-gray-300 italic"
                        placeholder="Encapsulate insights for the operative..."
                    />
                </div>

                <div className="space-y-4 pt-4">
                    <button
                        onClick={() => {
                            onGrade(responseId, score, feedback);
                            setShowForm(false);
                        }}
                        className="w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[30px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
                    >
                        COMMIT_RECORD_TO_REPOSITORY
                    </button>
                    <button
                        onClick={() => setShowForm(false)}
                        className="w-full py-5 text-[10px] font-black text-gray-300 hover:text-gray-900 uppercase tracking-widest transition-colors"
                    >
                        Abort Assessment
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default QuestionnaireResponses;
