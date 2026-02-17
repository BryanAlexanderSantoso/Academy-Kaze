import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Course, CourseChapter } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, CheckCircle, Lock, ShieldCheck, Upload, FileText, Link as LinkIcon, ChevronRight, Share2, Copy, Check } from 'lucide-react';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<CourseChapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<CourseChapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<string[]>([]);
    const [marking, setMarking] = useState(false);
    const [eligibleForCertificate, setEligibleForCertificate] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) loadCourseData();
    }, [id]);

    const loadCourseData = async () => {
        try {
            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();

            if (courseData) {
                setCourse(courseData);

                // Load chapters
                const { data: chaptersData } = await supabase
                    .from('course_chapters')
                    .select('*')
                    .eq('course_id', id)
                    .order('order_index', { ascending: true });

                if (chaptersData) {
                    setChapters(chaptersData);
                    setSelectedChapter(chaptersData[0] || null);

                    // Load user progress
                    if (user) {
                        const { data: progressData } = await supabase
                            .from('chapter_progress')
                            .select('chapter_id')
                            .eq('user_id', user.id)
                            .eq('course_id', id);

                        if (progressData) {
                            setProgress(progressData.map(p => p.chapter_id));
                        }
                    }
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading course data:', error);
            setLoading(false);
        }
    };

    const checkCertificateEligibility = (currentProgress: string[], allChapters: CourseChapter[]) => {
        if (!user?.is_premium || allChapters.length === 0) return;
        const allCompleted = allChapters.every(c => currentProgress.includes(c.id));
        setEligibleForCertificate(allCompleted);
    };

    useEffect(() => {
        if (chapters.length > 0) {
            checkCertificateEligibility(progress, chapters);
        }
    }, [progress, chapters]);

    const handleMarkComplete = async () => {
        if (!selectedChapter || !user || marking) return;

        const isCompleted = progress.includes(selectedChapter.id);
        setMarking(true);

        try {
            if (isCompleted) {
                // Optionally allow unmarking, but usually better to keep it
                const { error } = await supabase
                    .from('chapter_progress')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('chapter_id', selectedChapter.id);

                if (!error) {
                    const newProgress = progress.filter(id => id !== selectedChapter.id);
                    setProgress(newProgress);
                }
            } else {
                // Must be sequential? Let's check if previous chapter is done
                const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
                if (currentIndex > 0) {
                    const prevChapter = chapters[currentIndex - 1];
                    if (!progress.includes(prevChapter.id)) {
                        alert('Waduh! Selesaikan bab sebelumnya dulu ya biar ilmunya nggak loncat-loncat.');
                        setMarking(false);
                        return;
                    }
                }

                const { error } = await supabase
                    .from('chapter_progress')
                    .insert([{
                        user_id: user.id,
                        course_id: id,
                        chapter_id: selectedChapter.id
                    }]);

                if (!error) {
                    const newProgress = [...progress, selectedChapter.id];
                    setProgress(newProgress);
                }
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        } finally {
            setMarking(false);
        }
    };

    const isChapterLocked = (chapter: CourseChapter) => {
        if (user?.role === 'admin') return false;

        // Premium+ users can access ALL courses and ALL chapters
        if (user?.is_premium && user?.premium_type === 'premium_plus') return false;

        // Regular Premium users can only access courses that match their learning path
        if (user?.is_premium && user?.premium_type === 'premium') {
            // If the course category matches the user's learning path, unlock all chapters
            if (course && course.category === user.learning_path) return false;
            // If course doesn't match their learning path, lock all except first chapter
            const firstChapterIndex = Math.min(...chapters.map(c => c.order_index));
            return chapter.order_index > firstChapterIndex;
        }

        // Free users: only first chapter is free
        const firstChapterIndex = Math.min(...chapters.map(c => c.order_index));
        return chapter.order_index > firstChapterIndex;
    };

    // Check if this course is outside the user's learning path (for Premium users)
    const isCrossPathCourse = () => {
        if (!user || !course) return false;
        if (user.role === 'admin') return false;
        if (user.premium_type === 'premium_plus') return false;
        return course.category !== user.learning_path;
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="card text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
                <button onClick={() => navigate('/dashboard/courses')} className="btn-primary mt-4">
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header with Background */}
            <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-900" />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard/courses')}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                            {copied ? 'Link Copied!' : 'Share Course'}
                        </button>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {course.category === 'fe' ? 'Frontend' : course.category === 'be' ? 'Backend' : 'Fullstack'}
                                </span>
                                {user?.is_premium && (
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${user.premium_type === 'premium_plus' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' : 'bg-yellow-500 text-black'}`}>
                                        <ShieldCheck className="w-3 h-3" />
                                        {user.premium_type === 'premium_plus' ? 'PREMIUM+ ACCESS' : 'PREMIUM ACCESS'}
                                    </span>
                                )}
                                {isCrossPathCourse() && user?.is_premium && user.premium_type === 'premium' && (
                                    <span className="bg-red-500/80 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        BEDA LEARNING PATH
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-black text-white mb-2 leading-tight">{course.title}</h1>
                            <div className="flex items-center gap-6 text-white/80 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {course.duration_hours || 0} Hours
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {chapters.length} Chapters
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar: Chapters Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="card sticky top-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary-600" />
                            Curriculum
                        </h3>
                        <div className="space-y-2">
                            {chapters.length > 0 ? (
                                chapters.map((chapter) => {
                                    const locked = isChapterLocked(chapter);
                                    const active = selectedChapter?.id === chapter.id;

                                    return (
                                        <button
                                            key={chapter.id}
                                            disabled={locked && !active}
                                            onClick={() => setSelectedChapter(chapter)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${active
                                                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                                                : locked
                                                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {chapter.order_index + 1}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${active ? 'text-primary-700' : 'text-gray-900'}`}>
                                                        {chapter.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {chapter.material_type.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                            {locked && <Lock className="w-4 h-4 text-gray-400" />}
                                            {!locked && progress.includes(chapter.id) && (
                                                <CheckCircle className="w-5 h-5 text-green-500 fill-green-50" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 italic p-4">No chapters added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedChapter ? (
                            isChapterLocked(selectedChapter) ? (
                                <motion.div
                                    key="locked"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card bg-gradient-to-b from-gray-900 to-black text-white p-12 text-center"
                                >
                                    <div className="max-w-md mx-auto">
                                        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow transition-transform hover:scale-110">
                                            <Lock className="w-10 h-10 text-black" />
                                        </div>

                                        {isCrossPathCourse() && user?.is_premium ? (
                                            <>
                                                <h2 className="text-3xl font-black mb-4">BUTUH PREMIUM+ ✨</h2>
                                                <p className="text-gray-400 mb-8 leading-relaxed">
                                                    Materi ini ada di learning path <b className="text-amber-400">{course?.category === 'fe' ? 'Frontend' : course?.category === 'be' ? 'Backend' : 'Fullstack'}</b>,
                                                    sedangkan kamu di learning path <b className="text-indigo-400">{user.learning_path === 'fe' ? 'Frontend' : user.learning_path === 'be' ? 'Backend' : 'Fullstack'}</b>.
                                                    Upgrade ke <span className="text-amber-400 font-black">Premium+</span> untuk akses lintas learning path!
                                                </p>

                                                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-amber-500/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-gray-400">Upgrade ke Premium+</span>
                                                        <span className="text-2xl font-black text-amber-400">Rp 25.000</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Akses semua materi di semua learning path, selamanya!</p>
                                                </div>

                                                <button
                                                    onClick={() => navigate('/dashboard/premium')}
                                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-amber-500/30"
                                                >
                                                    <Upload className="w-5 h-5" />
                                                    UPGRADE KE PREMIUM+
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h2 className="text-3xl font-black mb-4">MODE KIKIR ACTIVATED!</h2>
                                                <p className="text-gray-400 mb-8 leading-relaxed">
                                                    Waduh, materi selanjutnya dikunci nih! Biaya server mahal bosqu.
                                                    Yuk bayar dikit aja buat lanjut belajar sepuasnya sampai mahir!
                                                </p>

                                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                                                    <div className="text-left space-y-3 mb-4">
                                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                                                                <span className="text-sm text-gray-300">Premium</span>
                                                            </div>
                                                            <span className="text-lg font-black text-indigo-400">Rp 12.000</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-amber-400">✨</span>
                                                                <span className="text-sm text-amber-300 font-bold">Premium+</span>
                                                            </div>
                                                            <span className="text-lg font-black text-amber-400">Rp 25.000</span>
                                                        </div>
                                                    </div>
                                                    <img
                                                        src="/qris_payment.jpg"
                                                        alt="QRIS Payment"
                                                        className="w-full h-auto rounded-lg mb-4 shadow-2xl"
                                                    />
                                                    <p className="text-xs text-gray-500 bg-black/30 p-2 rounded">
                                                        Scan QRIS di atas dengan m-Banking, GOPAY, OVO, atau Dana Anda.
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => navigate('/dashboard/premium')}
                                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-primary-600/30"
                                                >
                                                    <Upload className="w-5 h-5" />
                                                    UPGRADE SEKARANG
                                                </button>
                                            </>
                                        )}

                                        <p className="mt-6 text-sm text-gray-500">
                                            Sudah bayar? <span className="text-primary-400 font-bold hover:underline cursor-pointer" onClick={() => navigate('/dashboard/premium')}>Cek status pembayaran</span>
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={selectedChapter.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="card"
                                >
                                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">{selectedChapter.title}</h2>
                                            <p className="text-gray-500 text-sm mt-1">{selectedChapter.description}</p>
                                        </div>
                                        <button
                                            onClick={handleMarkComplete}
                                            disabled={marking}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${progress.includes(selectedChapter.id)
                                                ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                } ${marking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {marking ? (
                                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <CheckCircle className={`w-5 h-5 ${progress.includes(selectedChapter.id) ? 'fill-current' : ''}`} />
                                            )}
                                            {progress.includes(selectedChapter.id) ? 'Selesai' : 'Tandai Selesai'}
                                        </button>
                                    </div>

                                    {eligibleForCertificate && (
                                        <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white shadow-xl shadow-amber-500/20">
                                            <div className="flex items-center justify-between gap-6">
                                                <div>
                                                    <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                                                        <span>🎓</span> GRADUATIONS UNLOCKED!
                                                    </h3>
                                                    <p className="text-white/80 text-sm font-medium">
                                                        Selamat! Kamu telah menyelesaikan seluruh materi di kelas ini secara tuntas.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/dashboard/certificate/${id}`)}
                                                    className="bg-white text-orange-600 font-black px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider flex-shrink-0"
                                                >
                                                    Klaim Sertifikat
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="prose max-w-none prose-headings:font-black prose-p:text-gray-600 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded">
                                        {selectedChapter.content_body ? (
                                            <div dangerouslySetInnerHTML={{ __html: selectedChapter.content_body }} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                                                <p>Materi sedang dipersiapkan oleh instructor.</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedChapter.material_type === 'file' && selectedChapter.file_url && (
                                        <div className="mt-12 p-8 bg-emerald-50 rounded-[35px] border-2 border-emerald-100 flex items-center justify-between group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    <FileText size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-emerald-900 uppercase tracking-tighter text-lg">Download Payload</p>
                                                    <p className="text-sm text-emerald-600/70 font-bold uppercase tracking-widest">{selectedChapter.file_name || 'Resource Module'}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={selectedChapter.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={selectedChapter.file_name || 'material'}
                                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-[20px] shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <Upload className="w-4 h-4 rotate-180" />
                                                Decrypt & Open
                                            </a>
                                        </div>
                                    )}

                                    {selectedChapter.material_type === 'link' && selectedChapter.file_url && (
                                        <div className="mt-12 p-8 bg-indigo-50 rounded-[35px] border-2 border-indigo-100 flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white rounded-[22px] flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    <LinkIcon size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-indigo-900 uppercase tracking-tighter text-lg">External Resource</p>
                                                    <p className="text-sm text-indigo-600/70 font-bold uppercase tracking-widest">Connect to neural network</p>
                                                </div>
                                            </div>
                                            <a
                                                href={(() => {
                                                    const url = selectedChapter.file_url?.trim();
                                                    if (!url) return '#';
                                                    return url.startsWith('http://') || url.startsWith('https://')
                                                        ? url
                                                        : `https://${url}`;
                                                })()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-[20px] shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                Launch Module
                                                <ChevronRight className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        ) : (
                            <div className="card text-center py-40 bg-gray-50 border-dashed border-2 border-gray-200 mt-0">
                                <BookOpen className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-400">PILIH BAB UNTUK MEMULAI</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseDetail;

