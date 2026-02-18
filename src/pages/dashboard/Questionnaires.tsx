import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Questionnaire, QuestionnaireResponse } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { ClipboardList, Calendar, AlertCircle, Play, Eye, Clock, Award, Activity } from 'lucide-react';

const Questionnaires: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [responses, setResponses] = useState<Record<string, QuestionnaireResponse[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuestionnaires();
    }, []);

    const loadQuestionnaires = async () => {
        try {
            // Load published questionnaires
            const { data: qData } = await supabase
                .from('questionnaires')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (qData) {
                setQuestionnaires(qData);

                // Load responses for each questionnaire
                const { data: rData } = await supabase
                    .from('questionnaire_responses')
                    .select('*')
                    .eq('student_id', user?.id);

                if (rData) {
                    const responsesByQuestionnaire: Record<string, QuestionnaireResponse[]> = {};
                    rData.forEach(response => {
                        if (!responsesByQuestionnaire[response.questionnaire_id]) {
                            responsesByQuestionnaire[response.questionnaire_id] = [];
                        }
                        responsesByQuestionnaire[response.questionnaire_id].push(response);
                    });
                    setResponses(responsesByQuestionnaire);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading questionnaires:', error);
            setLoading(false);
        }
    };

    const getQuestionnaireStatus = (questionnaire: Questionnaire) => {
        const questionnaireResponses = responses[questionnaire.id] || [];
        const submittedResponses = questionnaireResponses.filter(r => r.submitted_at);
        const inProgressResponse = questionnaireResponses.find(r => !r.submitted_at);

        if (submittedResponses.length >= questionnaire.max_attempts) {
            return { status: 'completed', label: 'Selesai', color: 'green' };
        }

        if (inProgressResponse) {
            return { status: 'in_progress', label: 'Sedang Berjalan', color: 'blue' };
        }

        if (questionnaire.due_date && new Date(questionnaire.due_date) < new Date()) {
            if (!questionnaire.allow_late_submission) {
                return { status: 'overdue', label: 'Terlambat', color: 'red' };
            }
            return { status: 'late', label: 'Terlambat (Masih Diizinkan)', color: 'orange' };
        }

        return { status: 'available', label: 'Tersedia', color: 'gray' };
    };

    const getLatestResponse = (questionnaireId: string): QuestionnaireResponse | undefined => {
        const questionnaireResponses = responses[questionnaireId] || [];
        return questionnaireResponses
            .filter(r => r.submitted_at)
            .sort((a, b) => new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime())[0];
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menghubungkan Server Kuis...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            <div className="flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">
                    <ClipboardList className="w-4 h-4" />
                    Evaluasi Kompetensi
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                    Kuis & <br />
                    <span className="text-indigo-600">Survei</span>
                </h1>
                <p className="text-gray-400 text-lg font-medium italic">Uji pemahaman Anda melalui kuis teknis dan survei interaktif.</p>
            </div>

            {questionnaires.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {questionnaires.map((questionnaire, index) => {
                        const status = getQuestionnaireStatus(questionnaire);
                        const latestResponse = getLatestResponse(questionnaire.id);
                        const questionnaireResponses = responses[questionnaire.id] || [];
                        const attemptsUsed = questionnaireResponses.filter(r => r.submitted_at).length;

                        return (
                            <motion.div
                                key={questionnaire.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="bg-white border border-gray-100 rounded-[50px] p-10 hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-700 relative group flex flex-col justify-between"
                            >
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${status.color === 'green' ? 'bg-green-50 text-green-700 border-green-100' :
                                            status.color === 'blue' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                status.color === 'red' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    status.color === 'orange' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {status.label}
                                        </span>
                                        {questionnaire.time_limit_minutes && (
                                            <span className="px-4 py-1.5 text-[9px] font-black bg-purple-50 text-purple-700 rounded-xl border border-purple-100 flex items-center gap-1.5 uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                {questionnaire.time_limit_minutes} Menit
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter leading-tight mb-2">
                                            {questionnaire.title}
                                        </h3>
                                        {questionnaire.description && (
                                            <p className="text-gray-500 text-sm font-medium italic line-clamp-2">{questionnaire.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-[25px] border border-gray-100 space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pertanyaan</p>
                                            <p className="text-lg font-black text-gray-900 italic tracking-tighter">{questionnaire.questions_json?.length || 0} ITEMS</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-[25px] border border-gray-100 space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sisa Percobaan</p>
                                            <p className="text-lg font-black text-gray-900 italic tracking-tighter">{attemptsUsed} / {questionnaire.max_attempts}</p>
                                        </div>
                                    </div>

                                    {questionnaire.due_date && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <Calendar className="w-4 h-4" />
                                            Tenggat: {new Date(questionnaire.due_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 space-y-6">
                                    {/* Latest Score */}
                                    {latestResponse?.score !== undefined && (
                                        <div className="bg-indigo-600 p-6 rounded-[30px] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 rotate-12">
                                                <Award size={60} />
                                            </div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200">Skor Terakhir</p>
                                                    <p className="text-3xl font-black italic tracking-tighter">{latestResponse.score.toFixed(1)}%</p>
                                                </div>
                                                {latestResponse.feedback && (
                                                    <div className="max-w-[150px] text-right">
                                                        <p className="text-[8px] font-bold italic line-clamp-2 text-indigo-100 opacity-80">"{latestResponse.feedback}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        {status.status === 'completed' ? (
                                            <button
                                                onClick={() => navigate(`/dashboard/questionnaires/${questionnaire.id}/take`)}
                                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-5 rounded-[25px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-[0.3em] text-[10px]"
                                            >
                                                <Eye className="w-4 h-4" />
                                                LIHAT HASIL
                                            </button>
                                        ) : status.status === 'overdue' ? (
                                            <button disabled className="w-full bg-gray-100 text-gray-300 font-black py-5 rounded-[25px] flex items-center justify-center gap-3 opacity-50 cursor-not-allowed uppercase tracking-[0.3em] text-[10px]">
                                                <AlertCircle className="w-4 h-4" />
                                                WAKTU HABIS
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/dashboard/questionnaires/${questionnaire.id}/take`)}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                                            >
                                                <Play className="w-4 h-4" />
                                                {status.status === 'in_progress' ? 'LANJUTKAN' : 'MULAI UJIAN'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-[60px] p-40 text-center group">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    >
                        <ClipboardList size={80} className="text-gray-100 mx-auto mb-8 group-hover:text-indigo-100 transition-colors" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Server Kuis Offline</h3>
                    <p className="text-gray-400 font-medium italic mt-4 max-w-sm mx-auto">Kuis evaluasi akan muncul secara otomatis di sini saat instruktur telah merilis payload ujian baru.</p>
                </div>
            )}
        </div>
    );
};

export default Questionnaires;
