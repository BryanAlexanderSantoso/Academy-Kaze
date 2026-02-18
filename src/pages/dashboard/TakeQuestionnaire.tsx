import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Questionnaire, Question, QuestionnaireResponse } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Send, Clock, AlertCircle,
    CheckCircle, Star, Activity, Layout
} from 'lucide-react';

const TakeQuestionnaire: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
    const [existingResponse, setExistingResponse] = useState<QuestionnaireResponse | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (id) loadQuestionnaire();
    }, [id]);

    useEffect(() => {
        // Timer for time-limited questionnaires
        if (questionnaire?.time_limit_minutes && timeRemaining !== null) {
            const interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev === null || prev <= 0) {
                        handleSubmit(true); // Auto-submit when time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [questionnaire, timeRemaining]);

    const loadQuestionnaire = async () => {
        try {
            const { data: qData } = await supabase
                .from('questionnaires')
                .select('*')
                .eq('id', id)
                .eq('is_published', true)
                .single();

            if (!qData) {
                alert('Kuis tidak ditemukan atau tidak tersedia');
                navigate('/dashboard/questionnaires');
                return;
            }

            setQuestionnaire(qData);
            setStartTime(Date.now());

            // Check for existing response
            const { data: rData } = await supabase
                .from('questionnaire_responses')
                .select('*')
                .eq('questionnaire_id', id)
                .eq('student_id', user?.id)
                .order('attempt_number', { ascending: false })
                .limit(1)
                .single();

            if (rData) {
                setExistingResponse(rData);
                if (rData.submitted_at) {
                    // Already submitted
                    if (qData.max_attempts <= rData.attempt_number) {
                        setShowResults(true);
                    } else {
                        // Can retake
                        setAnswers({});
                    }
                } else {
                    // Resume in-progress attempt
                    setAnswers(rData.answers_json || {});
                }
            }

            // Initialize timer
            if (qData.time_limit_minutes) {
                setTimeRemaining(qData.time_limit_minutes * 60);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading questionnaire:', error);
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));

        // Auto-save progress
        saveProgress({ ...answers, [questionId]: value });
    };

    const saveProgress = async (currentAnswers: Record<string, any>) => {
        if (!questionnaire || !user) return;

        try {
            if (existingResponse && !existingResponse.submitted_at) {
                // Update existing in-progress response
                await supabase
                    .from('questionnaire_responses')
                    .update({ answers_json: currentAnswers })
                    .eq('id', existingResponse.id);
            } else if (!existingResponse) {
                // Create new response
                const { data } = await supabase
                    .from('questionnaire_responses')
                    .insert({
                        questionnaire_id: questionnaire.id,
                        student_id: user.id,
                        answers_json: currentAnswers,
                        attempt_number: 1
                    })
                    .select()
                    .single();

                if (data) setExistingResponse(data);
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const handleSubmit = async (autoSubmit: boolean = false) => {
        if (!questionnaire || !user) return;

        // Validate required questions
        const unanswered = questionnaire.questions_json.filter(
            q => q.required && !answers[q.id]
        );

        if (!autoSubmit && unanswered.length > 0) {
            alert(`Mohon jawab semua pertanyaan wajib. ${unanswered.length} pertanyaan tersisa.`);
            return;
        }

        setSubmitting(true);

        try {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            const attemptNumber = existingResponse ? existingResponse.attempt_number : 1;

            if (existingResponse && !existingResponse.submitted_at) {
                // Update existing response
                await supabase
                    .from('questionnaire_responses')
                    .update({
                        answers_json: answers,
                        submitted_at: new Date().toISOString(),
                        time_spent_seconds: timeSpent
                    })
                    .eq('id', existingResponse.id);
            } else {
                // Create new response
                await supabase
                    .from('questionnaire_responses')
                    .insert({
                        questionnaire_id: questionnaire.id,
                        student_id: user.id,
                        answers_json: answers,
                        submitted_at: new Date().toISOString(),
                        time_spent_seconds: timeSpent,
                        attempt_number: attemptNumber
                    });
            }

            setShowResults(true);
        } catch (error) {
            console.error('Error submitting questionnaire:', error);
            alert('Gagal mengirim jawaban. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const isQuestionAnswered = (question: Question): boolean => {
        const answer = answers[question.id];
        if (answer === undefined || answer === null || answer === '') return false;
        if (Array.isArray(answer) && answer.length === 0) return false;
        return true;
    };

    const getProgress = (): number => {
        const answered = questionnaire?.questions_json.filter(q => isQuestionAnswered(q)).length || 0;
        const total = questionnaire?.questions_json.length || 1;
        return (answered / total) * 100;
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menyiapkan Payload Ujian...</p>
            </div>
        );
    }

    if (!questionnaire) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 text-center max-w-md">
                    <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Kuis Tidak Tersedia</h3>
                    <p className="text-gray-500 italic mb-8">Payload kuis ini tidak ditemukan atau telah didekripsi oleh sistem.</p>
                    <button onClick={() => navigate('/dashboard/questionnaires')} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30">
                        KEMBALI KE TERMINAL
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[150px] rounded-full transform -translate-y-1/2" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white p-12 rounded-[60px] shadow-2xl text-center max-w-md relative z-10 border border-white/20"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase italic tracking-tighter leading-none">MISI SELESAI!</h2>
                    <p className="text-gray-500 italic mb-10 leading-relaxed font-medium">
                        Jawaban Anda telah terenkripsi dan dicatat ke dalam database pusat. {questionnaire.show_correct_answers
                            ? 'Anda dapat meninjau hasilnya di terminal.'
                            : 'Instruktur akan segera meninjau dan memberikan skor performa untuk kiriman ini.'}
                    </p>
                    {existingResponse?.score !== undefined && (
                        <div className="bg-indigo-600 p-8 rounded-[40px] mb-10 text-white shadow-2xl shadow-indigo-600/20">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-2">Skor Performa Akhir</p>
                            <p className="text-5xl font-black italic tracking-tighter leading-none">
                                {existingResponse.score.toFixed(1)}%
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/dashboard/questionnaires')}
                        className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-gray-900/10 uppercase tracking-[0.3em] text-[10px]"
                    >
                        KE TERMINAL UTAMA
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questionnaire.questions_json[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-white">
            {/* Nav Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[60]">
                <div className="max-w-5xl mx-auto px-10 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/dashboard/questionnaires')}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 border border-gray-100 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-lg font-black text-gray-900 uppercase italic tracking-tighter leading-none">{questionnaire.title}</h1>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Ujian Aktif: Pertanyaan {currentQuestionIndex + 1} dari {questionnaire.questions_json.length}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${timeRemaining < 300
                                    ? 'bg-red-50 text-red-600 border-red-100 animate-pulse shadow-lg shadow-red-500/10'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                    <Clock className="w-5 h-5" />
                                    <span className="font-black italic tracking-tight text-lg">{formatTime(timeRemaining)}</span>
                                </div>
                            )}
                            <div className="w-48 h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                <motion.div
                                    className="bg-indigo-600 h-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getProgress()}%` }}
                                    transition={{ duration: 0.6, ease: "circOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Stage */}
            <div className="max-w-4xl mx-auto px-10 py-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white p-12 rounded-[60px] border border-gray-100 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Layout size={180} className="text-indigo-600" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 italic">
                                        Q{currentQuestionIndex + 1}_SECTOR
                                    </span>
                                    {currentQuestion.required && (
                                        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest italic">
                                            <AlertCircle className="w-4 h-4" />
                                            Mandatory
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter">
                                    {currentQuestion.question}
                                </h1>
                                {currentQuestion.description && (
                                    <p className="text-gray-500 font-medium italic text-lg leading-relaxed">{currentQuestion.description}</p>
                                )}
                            </div>

                            {/* Answer Interface */}
                            <div className="space-y-4">
                                {currentQuestion.type === 'multiple_choice' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQuestion.options?.map((option) => (
                                            <label
                                                key={option.id}
                                                className={`flex items-center gap-5 p-6 border-2 rounded-[30px] cursor-pointer transition-all duration-500 group relative overflow-hidden ${answers[currentQuestion.id] === option.id
                                                    ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-600/5'
                                                    : 'border-gray-50 hover:border-indigo-200 hover:bg-gray-50/50'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestion.id] === option.id
                                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                                    : 'border-gray-200 group-hover:border-indigo-400'
                                                    }`}>
                                                    {answers[currentQuestion.id] === option.id && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                                                </div>
                                                <span className="text-lg font-black uppercase italic tracking-tighter text-gray-900 leading-none">{option.text}</span>
                                                <input
                                                    type="radio"
                                                    name={currentQuestion.id}
                                                    value={option.id}
                                                    checked={answers[currentQuestion.id] === option.id}
                                                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                                    className="hidden"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.type === 'checkbox' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQuestion.options?.map((option) => {
                                            const selectedOptions = answers[currentQuestion.id] || [];
                                            const isChecked = selectedOptions.includes(option.id);

                                            return (
                                                <label
                                                    key={option.id}
                                                    className={`flex items-center gap-5 p-6 border-2 rounded-[30px] cursor-pointer transition-all duration-500 group relative overflow-hidden ${isChecked
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-600/5'
                                                        : 'border-gray-50 hover:border-indigo-200 hover:bg-gray-50/50'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isChecked
                                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                                        : 'border-gray-200 group-hover:border-indigo-400'
                                                        }`}>
                                                        {isChecked && <CheckCircle className="w-5 h-5 text-white" />}
                                                    </div>
                                                    <span className="text-lg font-black uppercase italic tracking-tighter text-gray-900 leading-none">{option.text}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newSelection = e.target.checked
                                                                ? [...selectedOptions, option.id]
                                                                : selectedOptions.filter((id: string) => id !== option.id);
                                                            handleAnswer(currentQuestion.id, newSelection);
                                                        }}
                                                        className="hidden"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {currentQuestion.type === 'short_answer' && (
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-50 focus:border-indigo-600/30 rounded-[30px] py-8 px-10 text-xl font-black uppercase italic tracking-tighter text-gray-900 transition-all outline-none focus:ring-[15px] focus:ring-indigo-600/5 placeholder:text-gray-200"
                                            placeholder="STATUS: MASUKKAN DATA INPUT..."
                                        />
                                    </div>
                                )}

                                {currentQuestion.type === 'long_answer' && (
                                    <div className="relative group">
                                        <textarea
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-50 focus:border-indigo-600/30 rounded-[40px] py-10 px-10 text-xl font-black uppercase italic tracking-tighter text-gray-900 transition-all outline-none focus:ring-[20px] focus:ring-indigo-600/5 min-h-[300px] placeholder:text-gray-200 leading-relaxed"
                                            placeholder="STATUS: MASUKKAN DATA DESKRIPSI LENGKAP..."
                                        />
                                    </div>
                                )}

                                {currentQuestion.type === 'rating' && (
                                    <div className="flex gap-6 justify-center py-10 bg-gray-50 rounded-[40px] border border-gray-100 shadow-inner">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => handleAnswer(currentQuestion.id, rating)}
                                                className="transition-all transform hover:scale-125 group/star"
                                            >
                                                <Star
                                                    className={`w-20 h-20 transition-all duration-500 ${answers[currentQuestion.id] >= rating
                                                        ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                                        : 'text-gray-200'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion.type === 'linear_scale' && (
                                    <div className="py-10 px-10 bg-gray-50 rounded-[40px] border border-gray-100 shadow-inner">
                                        <div className="flex items-center justify-between mb-10 px-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{currentQuestion.minLabel || 'Batas Bawah'}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{currentQuestion.maxLabel || 'Batas Atas'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 justify-center">
                                            {Array.from(
                                                { length: (currentQuestion.maxValue || 5) - (currentQuestion.minValue || 1) + 1 },
                                                (_, i) => (currentQuestion.minValue || 1) + i
                                            ).map((value) => (
                                                <button
                                                    key={value}
                                                    onClick={() => handleAnswer(currentQuestion.id, value)}
                                                    className={`w-16 h-16 rounded-[22px] font-black text-xl italic tracking-tighter transition-all transform hover:scale-110 ${answers[currentQuestion.id] === value
                                                        ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-125'
                                                        : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-300 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-16 pb-20">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        PREVIOUS_PATCH
                    </button>

                    <div className="flex gap-4">
                        {currentQuestionIndex < questionnaire.questions_json.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="p-5 bg-indigo-600 text-white rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95 group"
                            >
                                NEXT_UPDATE
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="p-5 bg-emerald-600 text-white rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 hover:-translate-y-1 active:scale-95 group"
                            >
                                {submitting ? 'TERMINATING...' : 'ENCRYPT_&_SEND'}
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Terminal Navigator */}
                <div className="mt-8 bg-gray-50 p-10 rounded-[50px] border border-gray-100">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                        <Activity className="w-4 h-4" />
                        Peta Sektor Pertanyaan
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {questionnaire.questions_json.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`w-14 h-14 rounded-2xl font-black text-sm italic tracking-tighter transition-all transform hover:scale-110 ${idx === currentQuestionIndex
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-110'
                                    : isQuestionAnswered(q)
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-white text-gray-300 border border-gray-100 hover:border-indigo-200 hover:text-indigo-400'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeQuestionnaire;
