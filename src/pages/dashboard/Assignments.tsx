import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Assignment } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon, Send, CheckCircle, Clock, AlertCircle, Activity } from 'lucide-react';

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
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Dinilai: {assignment.grade}/100</span>
                </div>
            );
        }
        if (assignment.submitted_at) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl border border-yellow-100 shadow-sm">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Menunggu Pemeriksaan</span>
                </div>
            );
        }
        if (isOverdue) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terlambat</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 italic">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Belum Dikirim</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menghubungkan Terminal Tugas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16">
            <div className="flex flex-col items-start gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 italic">
                    <FileText className="w-4 h-4" />
                    Manajemen Tugas
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                    Log <br />
                    <span className="text-indigo-600">Penugasan</span>
                </h1>
                <p className="text-gray-400 text-lg font-medium italic">Kirimkan hasil karya Anda dan pantau evaluasi instruktur secara real-time.</p>
            </div>

            {assignments.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    {assignments.map((assignment, index) => (
                        <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="bg-white border border-gray-100 rounded-[50px] p-10 hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-700 relative group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(assignment)}
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic group-hover:text-indigo-300 transition-colors">ID_ASSIGNMENT_{assignment.id.slice(0, 8)}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors">
                                        {assignment.course?.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium italic leading-relaxed max-w-2xl">{assignment.course?.description}</p>
                                    {assignment.due_date && (
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${new Date(assignment.due_date) < new Date() && !assignment.submitted_at
                                            ? 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-500/10'
                                            : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            <Clock className="w-3.5 h-3.5" />
                                            Tenggat: {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {new Date(assignment.due_date) < new Date() && !assignment.submitted_at && ' - TERLAMBAT!'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4 min-w-[300px]">
                                    {assignment.grade === null && (
                                        <div className="space-y-4">
                                            <div className="relative group/input">
                                                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-indigo-600 transition-colors" />
                                                <input
                                                    type="url"
                                                    placeholder="Link GitHub, Google Drive, atau Figma..."
                                                    value={submissionLinks[assignment.id] || ''}
                                                    onChange={(e) =>
                                                        setSubmissionLinks((prev) => ({
                                                            ...prev,
                                                            [assignment.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full bg-gray-50 border-none rounded-[25px] py-5 pl-16 pr-8 text-[11px] font-black uppercase tracking-widest focus:ring-[12px] focus:ring-indigo-500/5 focus:bg-white transition-all shadow-inner italic"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSubmit(assignment.id)}
                                                disabled={
                                                    !submissionLinks[assignment.id] || submitting === assignment.id
                                                }
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white font-black py-5 rounded-[25px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                                            >
                                                {submitting === assignment.id ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                {submitting === assignment.id
                                                    ? 'MENGIRIM...'
                                                    : assignment.submission_link
                                                        ? 'PERBARUI KIRIMAN'
                                                        : 'KIRIM TUGAS'}
                                            </button>
                                        </div>
                                    )}

                                    {assignment.submission_link && (
                                        <div className="p-6 bg-gray-50 rounded-[30px] border border-gray-100 shadow-inner group-hover:bg-white transition-colors duration-700">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Data Kiriman Anda:</p>
                                            <a
                                                href={assignment.submission_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 truncate"
                                            >
                                                <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                                {assignment.submission_link}
                                            </a>
                                            {assignment.submitted_at && (
                                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-3">
                                                    Dikirim pada {new Date(assignment.submitted_at).toLocaleDateString('id-ID')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {assignment.grade !== null && assignment.feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-10 p-8 bg-indigo-600 rounded-[35px] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group/feedback"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover/feedback:scale-175 group-hover/feedback:rotate-0 transition-transform duration-700">
                                        <Trophy size={80} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-3 flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5" />
                                        Evaluasi Instruktur
                                    </h4>
                                    <p className="text-lg font-medium italic leading-relaxed relative z-10">{assignment.feedback}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-[60px] p-40 text-center group">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    >
                        <FileText size={80} className="text-gray-100 mx-auto mb-8 group-hover:text-indigo-100 transition-colors" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Log Tugas Kosong</h3>
                    <p className="text-gray-400 font-medium italic mt-4 max-w-sm mx-auto">Tugas akan muncul secara otomatis di sini saat instruktur telah merilisnya untuk Anda.</p>
                </div>
            )}
        </div>
    );
};

export default Assignments;
