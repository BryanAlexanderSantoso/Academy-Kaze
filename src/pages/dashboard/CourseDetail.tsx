import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Course, CourseChapter } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, CheckCircle, Lock, ShieldCheck, Upload, FileText, Link as LinkIcon, ChevronRight, Share2, Check, Activity, Star } from 'lucide-react';
import MarkdownContent from '../../components/MarkdownContent';

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
        // Must be sequential? Check if previous chapter is done
        const currentIndex = chapters.findIndex(c => c.id === selectedChapter.id);
        if (currentIndex > 0) {
          const prevChapter = chapters[currentIndex - 1];
          if (!progress.includes(prevChapter.id)) {
            alert('Eits! Selesaikan modul sebelumnya dulu ya supaya pemahamanmu sinkron.');
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

    // If chapter is a preview, it's ALWAYS unlocked
    if (chapter.is_preview) return false;

    // If course is marked as free, unlock everything for everyone
    if (course?.is_free) return false;

    // NEW: Primary check - If NOT premium at all, only first chapter is free
    if (!user?.is_premium) {
      if (chapters.length === 0) return false;
      const firstChapterIndex = Math.min(...chapters.map(c => c.order_index));
      return chapter.order_index > firstChapterIndex;
    }

    // If we get here, user IS premium.

    // Premium+ users can access ALL courses and ALL chapters
    if (user.premium_type === 'premium_plus') return false;

    // Regular Premium users (or those with missing type but is_premium: true)
    // They can access everything in their path.
    const userPath = (user.learning_path || '').toLowerCase().trim();
    const courseCat = (course?.category || '').toLowerCase().trim();

    if (!userPath || courseCat === userPath) {
      return false;
    }

    // For regular premium users on OTHER paths, we still only give them the first chapter
    const firstChapterIndex = Math.min(...chapters.map(c => c.order_index));
    return chapter.order_index > firstChapterIndex;
  };

  const isCrossPathCourse = () => {
    if (!user || !course) return false;
    if (user.role === 'admin') return false;
    if (user.premium_type === 'premium_plus') return false;
    if (course.is_free) return false;
    if (!user.learning_path) return false; // Not a cross path yet if no path selected
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
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
        </div>
        <p className="mt-6 text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Memuat Materi Kursus...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 text-center max-w-md">
          <BookOpen className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">KURSUS TIDAK TERSEDIA</h3>
          <p className="text-gray-500 mb-8">Maaf, materi yang Anda cari tidak tersedia di katalog kami.</p>
          <button onClick={() => navigate('/dashboard/courses')} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            Daftar Materi
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      {/* Header Stage */}
      <div className="relative h-[450px] rounded-[60px] overflow-hidden shadow-2xl">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-900" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute inset-0 p-12 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/courses')}
              className="flex items-center gap-3 text-white/90 hover:text-white transition-all bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 text-[10px] font-bold uppercase tracking-widest active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              KEMBALI
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-3 text-white/90 hover:text-white transition-all bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 text-[10px] font-bold uppercase tracking-widest active:scale-95 group"
            >
              {copied ? <Check className="w-4 h-4 text-green-400 animate-pulse" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Link Tersalin' : 'Bagikan'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-indigo-600 text-white text-[9px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                {course.category === 'fe' ? 'FRONTEND' : course.category === 'be' ? 'BACKEND' : course.category === 'seo' ? 'SEO' : 'FULLSTACK'}
              </span>
              {user?.is_premium && (
                <span className={`text-[9px] font-bold px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-xl ${user.premium_type === 'premium_plus' ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-500/20' : 'bg-indigo-500 text-white shadow-indigo-500/20'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.premium_type === 'premium_plus' ? 'Premium+' : 'Premium'}
                </span>
              )}
              {isCrossPathCourse() && user?.is_premium && user.premium_type === 'premium' && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-xl shadow-red-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  BUKAN JALUR BELAJAR ANDA
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-none uppercase tracking-tighter drop-shadow-2xl">{course.title}</h1>
              <div className="flex items-center gap-8 text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] ">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  {course.duration_hours || 0} JAM
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  {chapters.length} UNIT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Curriculum Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[50px] p-10 shadow-sm sticky top-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-gray-900 flex items-center gap-3 uppercase tracking-[0.2em] ">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Daftar Isi Kurikulum
              </h3>
              <div className="w-12 h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <motion.div
                  className="bg-indigo-600 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.length / chapters.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {chapters.length > 0 ? (
                chapters.map((chapter, idx) => {
                  const locked = isChapterLocked(chapter);
                  const active = selectedChapter?.id === chapter.id;
                  const completed = progress.includes(chapter.id);

                  return (
                    <button
                      key={chapter.id}
                      disabled={locked && !active}
                      onClick={() => setSelectedChapter(chapter)}
                      className={`w-full text-left p-6 rounded-[30px] border-2 transition-all flex items-center justify-between group relative overflow-hidden ${active
                        ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-600/5 ring-[10px] ring-indigo-600/5'
                        : locked
                          ? 'border-gray-50 bg-gray-50/50 opacity-40 cursor-not-allowed grayscale'
                          : 'border-transparent hover:border-indigo-100 hover:bg-gray-50/50'
                        }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs tracking-tighter transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white text-gray-300 border border-gray-100 group-hover:border-indigo-200 group-hover:text-indigo-600'}`}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-base font-bold uppercase tracking-tighter leading-none ${active ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {chapter.title}
                          </p>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-gray-400'}`}>
                            {chapter.material_type}
                          </p>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {locked ? (
                          <Lock className="w-4 h-4 text-gray-300" />
                        ) : completed ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <ChevronRight className={`w-5 h-5 transition-all ${active ? 'text-indigo-400 translate-x-1' : 'text-gray-200 group-hover:text-indigo-300 group-hover:translate-x-1'}`} />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10 space-y-4">
                  <Activity className="w-10 h-10 text-gray-100 mx-auto" />
                  <p className="text-gray-300 font-bold uppercase tracking-widest text-[9px] ">Modul belum tersedia...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="wait">
            {selectedChapter ? (
              isChapterLocked(selectedChapter) ? (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gray-900 rounded-[60px] p-16 text-center relative overflow-hidden shadow-2xl group"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <Lock size={240} className="text-white" />
                  </div>

                  <div className="max-w-md mx-auto relative z-10 space-y-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[35px] flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 animate-pulse">
                      <Lock className="w-10 h-10 text-white" />
                    </div>

                    {isCrossPathCourse() && user?.is_premium ? (
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h2 className="text-4xl font-bold text-white uppercase tracking-tighter leading-none">BUTUH PREMIUM+ ✨</h2>
                          <p className="text-gray-400 font-medium text-lg leading-relaxed">
                            Materi ini berada di luar jalur <span className="text-indigo-400 uppercase tracking-widest">{user.learning_path === 'fe' ? 'Frontend' : user.learning_path === 'be' ? 'Backend' : user.learning_path === 'seo' ? 'SEO' : 'Fullstack'}</span> Anda.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ">Upgrade Akses Multi-Sector</span>
                            <span className="text-3xl font-bold text-amber-400 tracking-tighter">Rp25.000</span>
                          </div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-left">Membuka seluruh library Kaza for Developer tanpa batasan sector teknologi secara permanen.</p>
                          <button
                            onClick={() => navigate('/dashboard/premium')}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-6 rounded-[30px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl shadow-amber-500/30 uppercase tracking-[0.3em] text-[10px]"
                          >
                            UPGRADE KE PREMIUM+
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <h2 className="text-4xl font-bold text-white uppercase tracking-tighter leading-none">AKSES TERKUNCI!</h2>
                          <p className="text-gray-400 font-medium text-lg leading-relaxed">
                            Materi selanjutnya memerlukan akses Premium untuk membukanya.
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 space-y-10">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-left group/tier">
                              <div className="flex items-center justify-between mb-4">
                                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                <span className="text-lg font-bold text-indigo-400 tracking-tighter">Rp12K</span>
                              </div>
                              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Premium_Access</p>
                            </div>
                            <div className="p-5 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-left group/tier">
                              <div className="flex items-center justify-between mb-4">
                                <Star className="w-5 h-5 text-amber-400" />
                                <span className="text-lg font-bold text-amber-400 tracking-tighter">Rp25K</span>
                              </div>
                              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Premium+_Override</p>
                            </div>
                          </div>

                          <div className="relative group/qris">
                            <img
                              src="/qris_payment.jpg"
                              alt="QRIS Payment"
                              className="w-full h-auto rounded-[30px] shadow-2xl border-4 border-white/10"
                            />
                            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full -z-10" />
                          </div>

                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                            Scan QRIS Bryan Dev via m-Banking atau E-Wallet untuk aktivasi instan akses belajar Anda.
                          </p>

                          <button
                            onClick={() => navigate('/dashboard/premium')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-[30px] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.3em] text-[10px]"
                          >
                            BUKA AKSES SEKARANG
                            <ChevronRight size={18} />
                          </button>
                        </div>

                        <button onClick={() => navigate('/dashboard/premium')} className="text-[9px] font-bold text-gray-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">
                          MENUNGGU PEMBAYARAN? <span className="underline underline-offset-4">CEK STATUS</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedChapter.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-gray-100 rounded-[60px] p-12 lg:p-16 shadow-sm relative overflow-hidden group/content"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12 group-hover/content:rotate-0 transition-transform duration-1000">
                    <Activity size={200} className="text-indigo-600" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-gray-100 pb-12">
                    <div className="space-y-4">
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 uppercase tracking-tighter leading-tight">{selectedChapter.title}</h2>
                      <div className="flex flex-wrap items-center gap-6">
                        {(selectedChapter.author_name || course.author_name) && (
                          <div className="flex items-center gap-3">
                            {(selectedChapter.author_image_url || course.author_image_url) ? (
                              <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                <img
                                  src={selectedChapter.author_image_url || course.author_image_url}
                                  alt={selectedChapter.author_name || course.author_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-inner">
                                {(selectedChapter.author_name || course.author_name || 'A').charAt(0)}
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r pr-6 border-gray-100">
                              Oleh: {selectedChapter.author_name || course.author_name}
                            </span>
                          </div>
                        )}
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">{selectedChapter.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleMarkComplete}
                      disabled={marking}
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${progress.includes(selectedChapter.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-900 text-white hover:bg-black'
                        } ${marking ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {marking ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className={`w-5 h-5 ${progress.includes(selectedChapter.id) ? 'animate-bounce' : ''}`} />
                      )}
                      {progress.includes(selectedChapter.id) ? 'SELESAI' : 'Tandai Selesai'}
                    </button>
                  </div>

                  {eligibleForCertificate && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-12 p-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[50px] text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group/cert"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover/cert:rotate-0 transition-transform duration-1000">
                        <ShieldCheck size={180} />
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="space-y-3 text-center md:text-left">
                          <h3 className="text-3xl font-bold tracking-tighter leading-none flex items-center justify-center md:justify-start gap-4 uppercase">
                            <span className="text-4xl">🎓</span> ANDA BERHASIL LULUS!
                          </h3>
                          <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em] ">
                            Selamat! Anda telah menyelesaikan seluruh materi dalam kursus ini.
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/dashboard/certificate/${id}`)}
                          className="w-full md:w-auto bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3"
                        >
                          Lihat Sertifikat
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Main Content Render */}
                  <div className="relative z-10">
                    {selectedChapter.content_body ? (
                      <MarkdownContent content={selectedChapter.content_body} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-40 text-gray-200">
                        <Activity className="w-24 h-24 mb-6 opacity-10 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] ">Memuat konten materi...</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Attachments */}
                  {selectedChapter.material_type === 'file' && selectedChapter.file_url && (
                    <div className="mt-20 p-10 bg-emerald-600 rounded-[50px] shadow-2xl shadow-emerald-600/20 relative overflow-hidden group/file">
                      <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover/file:rotate-0 transition-transform duration-1000">
                        <FileText size={180} />
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="flex items-center gap-8">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[30px] flex items-center justify-center text-white shadow-xl transition-transform group-hover/file:scale-110">
                            <FileText size={36} />
                          </div>
                          <div className="space-y-2">
                            <p className="font-bold text-white uppercase tracking-tighter text-3xl leading-none">LAMPIRAN MATERI</p>
                            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-[0.3em] ">File: {selectedChapter.file_name || 'Materi Pendukung'}</p>
                          </div>
                        </div>
                        <a
                          href={selectedChapter.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={selectedChapter.file_name || 'material'}
                          className="w-full md:w-auto px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          Unduh Materi
                          <Upload className="w-4 h-4 rotate-180" />
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedChapter.material_type === 'link' && selectedChapter.file_url && (
                    <div className="mt-20 p-10 bg-indigo-600 rounded-[50px] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group/link">
                      <div className="absolute top-0 right-0 p-8 opacity-10 transform scale-150 rotate-12 group-hover/link:rotate-0 transition-transform duration-1000">
                        <LinkIcon size={180} />
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="flex items-center gap-8">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[30px] flex items-center justify-center text-white shadow-xl transition-transform group-hover/link:scale-110">
                            <LinkIcon size={36} />
                          </div>
                          <div className="space-y-2">
                            <p className="font-bold text-white uppercase tracking-tighter text-3xl leading-none">LINK EKSTERNAL</p>
                            <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-[0.3em] ">Gateway: Materi Luar</p>
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
                          className="w-full md:w-auto px-8 py-4 bg-white text-indigo-600 hover:bg-indigo-50 font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                          Buka Link
                          <ChevronRight size={18} />
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            ) : (
              <div className="h-[600px] bg-gray-50/50 border-4 border-dashed border-gray-100 rounded-[60px] flex flex-col items-center justify-center gap-8 group">
                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                  <BookOpen className="w-10 h-10 text-gray-200 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] leading-relaxed">SILAKAN PILIH UNIT MODUL <br />UNTUK MEMULAI PEMBELAJARAN</h3>
                  <p className="text-[8px] font-bold text-gray-200 uppercase tracking-widest ">Pilih modul dari daftar isi kurikulum di samping...</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
