import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Questionnaire, Question, QuestionnaireResponse } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Send, Clock, AlertCircle,
    CheckCircle, Star
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
                alert('Questionnaire not found or not available');
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
            alert(`Please answer all required questions. ${unanswered.length} question(s) remaining.`);
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
            alert('Failed to submit questionnaire. Please try again.');
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
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading questionnaire...</p>
                </div>
            </div>
        );
    }

    if (!questionnaire) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="card text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Questionnaire Not Available</h3>
                    <p className="text-gray-600 mb-4">This questionnaire is not available or has been removed.</p>
                    <button onClick={() => navigate('/dashboard/questionnaires')} className="btn-primary">
                        Back to Questionnaires
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card text-center max-w-md"
                >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted Successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        Your response has been recorded. {questionnaire.show_correct_answers
                            ? 'You can review your answers below.'
                            : 'Your instructor will review and grade your submission.'}
                    </p>
                    {existingResponse?.score !== undefined && (
                        <div className="bg-primary-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-primary-600 font-medium mb-1">Your Score</p>
                            <p className="text-3xl font-bold text-primary-700">
                                {existingResponse.score.toFixed(1)}%
                            </p>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/dashboard/questionnaires')}
                        className="btn-primary w-full"
                    >
                        Back to Questionnaires
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questionnaire.questions_json[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => navigate('/dashboard/questionnaires')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Exit
                        </button>
                        <div className="flex items-center gap-4">
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-2 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    <Clock className="w-5 h-5" />
                                    <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                                </div>
                            )}
                            <div className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of {questionnaire.questions_json.length}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="bg-primary-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgress()}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="card"
                    >
                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-2">
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                    Q{currentQuestionIndex + 1}
                                </span>
                                {currentQuestion.required && (
                                    <span className="text-red-500 text-sm">* Required</span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {currentQuestion.question}
                            </h2>
                            {currentQuestion.description && (
                                <p className="text-gray-600">{currentQuestion.description}</p>
                            )}
                        </div>

                        {/* Answer Input */}
                        <div className="space-y-3">
                            {currentQuestion.type === 'multiple_choice' && (
                                <div className="space-y-2">
                                    {currentQuestion.options?.map((option) => (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion.id] === option.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name={currentQuestion.id}
                                                value={option.id}
                                                checked={answers[currentQuestion.id] === option.id}
                                                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                                className="w-5 h-5"
                                            />
                                            <span className="text-gray-900">{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'checkbox' && (
                                <div className="space-y-2">
                                    {currentQuestion.options?.map((option) => {
                                        const selectedOptions = answers[currentQuestion.id] || [];
                                        const isChecked = selectedOptions.includes(option.id);

                                        return (
                                            <label
                                                key={option.id}
                                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${isChecked
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-primary-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newSelection = e.target.checked
                                                            ? [...selectedOptions, option.id]
                                                            : selectedOptions.filter((id: string) => id !== option.id);
                                                        handleAnswer(currentQuestion.id, newSelection);
                                                    }}
                                                    className="w-5 h-5"
                                                />
                                                <span className="text-gray-900">{option.text}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {currentQuestion.type === 'short_answer' && (
                                <input
                                    type="text"
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                    className="input"
                                    placeholder="Your answer..."
                                />
                            )}

                            {currentQuestion.type === 'long_answer' && (
                                <textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                    className="input"
                                    rows={6}
                                    placeholder="Your answer..."
                                />
                            )}

                            {currentQuestion.type === 'rating' && (
                                <div className="flex gap-2 justify-center py-4">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => handleAnswer(currentQuestion.id, rating)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-12 h-12 ${answers[currentQuestion.id] >= rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'linear_scale' && (
                                <div className="py-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">{currentQuestion.minLabel}</span>
                                        <span className="text-sm text-gray-600">{currentQuestion.maxLabel}</span>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        {Array.from(
                                            { length: (currentQuestion.maxValue || 5) - (currentQuestion.minValue || 1) + 1 },
                                            (_, i) => (currentQuestion.minValue || 1) + i
                                        ).map((value) => (
                                            <button
                                                key={value}
                                                onClick={() => handleAnswer(currentQuestion.id, value)}
                                                className={`w-12 h-12 rounded-full font-bold transition-all ${answers[currentQuestion.id] === value
                                                    ? 'bg-primary-600 text-white scale-110'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Previous
                    </button>

                    {currentQuestionIndex < questionnaire.questions_json.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="btn-primary"
                        >
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="btn-primary"
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                            <Send className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Question Navigator */}
                <div className="mt-8 card">
                    <h3 className="font-medium text-gray-900 mb-3">Questions</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {questionnaire.questions_json.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`aspect-square rounded-lg font-medium transition-all ${idx === currentQuestionIndex
                                    ? 'bg-primary-600 text-white'
                                    : isQuestionAnswered(q)
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
