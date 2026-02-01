import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Questionnaire, QuestionnaireResponse } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { ClipboardList, Calendar, CheckCircle, AlertCircle, Play, Eye, Clock, Award } from 'lucide-react';

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
            return { status: 'completed', label: 'Completed', color: 'green' };
        }

        if (inProgressResponse) {
            return { status: 'in_progress', label: 'In Progress', color: 'blue' };
        }

        if (questionnaire.due_date && new Date(questionnaire.due_date) < new Date()) {
            if (!questionnaire.allow_late_submission) {
                return { status: 'overdue', label: 'Overdue', color: 'red' };
            }
            return { status: 'late', label: 'Late Submission Allowed', color: 'orange' };
        }

        return { status: 'available', label: 'Available', color: 'gray' };
    };

    const getLatestResponse = (questionnaireId: string): QuestionnaireResponse | undefined => {
        const questionnaireResponses = responses[questionnaireId] || [];
        return questionnaireResponses
            .filter(r => r.submitted_at)
            .sort((a, b) => new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime())[0];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading questionnaires...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Questionnaires</h1>
                <p className="text-gray-600 mt-1">Complete quizzes and surveys from your instructor</p>
            </div>

            {questionnaires.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {questionnaires.map((questionnaire, index) => {
                        const status = getQuestionnaireStatus(questionnaire);
                        const latestResponse = getLatestResponse(questionnaire.id);
                        const questionnaireResponses = responses[questionnaire.id] || [];
                        const attemptsUsed = questionnaireResponses.filter(r => r.submitted_at).length;

                        return (
                            <motion.div
                                key={questionnaire.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {questionnaire.title}
                                        </h3>
                                        {questionnaire.description && (
                                            <p className="text-gray-600 text-sm mb-3">{questionnaire.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color === 'green' ? 'bg-green-100 text-green-800' :
                                                status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                    status.color === 'red' ? 'bg-red-100 text-red-800' :
                                                        status.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {status.label}
                                            </span>
                                            {questionnaire.time_limit_minutes && (
                                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {questionnaire.time_limit_minutes} min
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            {questionnaire.due_date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Due: {new Date(questionnaire.due_date).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <ClipboardList className="w-4 h-4" />
                                                {questionnaire.questions_json?.length || 0} questions
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Award className="w-4 h-4" />
                                                Attempts: {attemptsUsed} / {questionnaire.max_attempts}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Latest Score */}
                                {latestResponse?.score !== undefined && (
                                    <div className="bg-primary-50 p-3 rounded-lg mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-primary-600 font-medium">Latest Score</span>
                                            <span className="text-2xl font-bold text-primary-700">
                                                {latestResponse.score.toFixed(1)}%
                                            </span>
                                        </div>
                                        {latestResponse.feedback && (
                                            <p className="text-xs text-primary-600 mt-2">{latestResponse.feedback}</p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {status.status === 'completed' ? (
                                        <button
                                            onClick={() => navigate(`/dashboard/questionnaires/${questionnaire.id}/take`)}
                                            className="btn-secondary flex-1"
                                            disabled={attemptsUsed >= questionnaire.max_attempts}
                                        >
                                            <Eye className="w-5 h-5" />
                                            View Results
                                        </button>
                                    ) : status.status === 'overdue' ? (
                                        <button disabled className="btn-secondary flex-1 opacity-50 cursor-not-allowed">
                                            <AlertCircle className="w-5 h-5" />
                                            Overdue
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/dashboard/questionnaires/${questionnaire.id}/take`)}
                                            className="btn-primary flex-1"
                                        >
                                            <Play className="w-5 h-5" />
                                            {status.status === 'in_progress' ? 'Continue' : 'Start'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No questionnaires available
                    </h3>
                    <p className="text-gray-600">
                        Questionnaires will appear here when created by your instructor
                    </p>
                </div>
            )}
        </div>
    );
};

export default Questionnaires;
