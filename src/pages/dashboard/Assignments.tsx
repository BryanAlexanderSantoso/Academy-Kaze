import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Assignment } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon, Send, CheckCircle, Clock } from 'lucide-react';

const Assignments: React.FC = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [submissionLinks, setSubmissionLinks] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (user) loadAssignments();
    }, [user]);

    const loadAssignments = async () => {
        try {
            const { data } = await supabase
                .from('assignments')
                .select(`
          *,
          course:courses(title, category, description)
        `)
                .eq('student_id', user?.id)
                .order('created_at', { ascending: false });

            if (data) setAssignments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (assignmentId: string) => {
        const link = submissionLinks[assignmentId];
        if (!link) return;

        setSubmitting(assignmentId);
        try {
            const { error } = await supabase
                .from('assignments')
                .update({
                    submission_link: link,
                    submitted_at: new Date().toISOString(),
                })
                .eq('id', assignmentId);

            if (!error) {
                await loadAssignments();
                setSubmissionLinks((prev) => ({ ...prev, [assignmentId]: '' }));
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
        }
        setSubmitting(null);
    };

    const getStatusBadge = (assignment: Assignment) => {
        const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

        if (assignment.grade !== null) {
            return (
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Graded: {assignment.grade}/100</span>
                </div>
            );
        }
        if (assignment.submitted_at) {
            return (
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-medium">Pending Review</span>
                </div>
            );
        }
        if (isOverdue) {
            return (
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">Overdue</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Not Submitted</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
                <p className="text-gray-600 mt-1">Submit your work and track your grades</p>
            </div>

            {assignments.length > 0 ? (
                <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {assignment.course?.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{assignment.course?.description}</p>
                                    {assignment.due_date && (
                                        <p className={`text-sm mt-2 flex items-center gap-1 ${new Date(assignment.due_date) < new Date() && !assignment.submitted_at
                                                ? 'text-red-600 font-medium'
                                                : 'text-gray-500'
                                            }`}>
                                            <Clock className="w-4 h-4" />
                                            Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {new Date(assignment.due_date) < new Date() && !assignment.submitted_at && ' - OVERDUE!'}
                                        </p>
                                    )}
                                </div>
                                {getStatusBadge(assignment)}
                            </div>

                            {assignment.grade !== null && assignment.feedback && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2">Instructor Feedback</h4>
                                    <p className="text-blue-800 text-sm">{assignment.feedback}</p>
                                </div>
                            )}

                            {assignment.submission_link && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Your Submission:</p>
                                    <a
                                        href={assignment.submission_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                        {assignment.submission_link}
                                    </a>
                                    {assignment.submitted_at && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Submitted on {new Date(assignment.submitted_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {assignment.grade === null && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {assignment.submission_link ? 'Update Submission Link' : 'Submission Link'}
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                placeholder="https://github.com/your-repo or Google Drive link"
                                                value={submissionLinks[assignment.id] || ''}
                                                onChange={(e) =>
                                                    setSubmissionLinks((prev) => ({
                                                        ...prev,
                                                        [assignment.id]: e.target.value,
                                                    }))
                                                }
                                                className="input-field pl-11"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSubmit(assignment.id)}
                                            disabled={
                                                !submissionLinks[assignment.id] || submitting === assignment.id
                                            }
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            {submitting === assignment.id
                                                ? 'Submitting...'
                                                : assignment.submission_link
                                                    ? 'Update'
                                                    : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
                    <p className="text-gray-600">Assignments will appear here when created by your instructor</p>
                </div>
            )}
        </div>
    );
};

export default Assignments;
