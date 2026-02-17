import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, ArrowLeft, Printer, CheckCircle2, User as UserIcon, X, Sparkles, ShieldCheck } from 'lucide-react';
import * as confetti from 'canvas-confetti';

const Certificate: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courseTitle, setCourseTitle] = useState('');
    const [studentName, setStudentName] = useState(user?.full_name || '');
    const [showNameInput, setShowNameInput] = useState(true);
    const [certificateCode] = useState(() => `KAZE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);
    const [issuedAt] = useState(new Date().toISOString());

    useEffect(() => {
        if (courseId) {
            loadCourseInfo();
        }
    }, [courseId]);

    const loadCourseInfo = async () => {
        try {
            const { data } = await supabase
                .from('courses')
                .select('title')
                .eq('id', courseId)
                .single();

            if (data) setCourseTitle(data.title);
        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = () => {
        if (!studentName.trim()) return;
        setShowNameInput(false);

        // Celebration!
        (confetti as any)({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4F46E5', '#F59E0B', '#10B981']
        });
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Initializing Interface...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">
            {/* Name Input Modal (Overlay) */}
            <AnimatePresence>
                {showNameInput && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md print:hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-3xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight uppercase tracking-tighter">Personalisasi Sertifikat</h3>
                                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                                    Silakan masukkan nama lengkap Anda yang ingin dicantumkan dalam sertifikat ini.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={studentName}
                                                onChange={(e) => setStudentName(e.target.value)}
                                                placeholder="Contoh: Bryan Santoso"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={!studentName.trim()}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        Hasilkan Sertifikat Sekarang
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto px-6">
                {/* Actions Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                            className="p-3 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-600 rounded-2xl transition-all shadow-sm active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 leading-tight">Sertifikat Kelulusan</h1>
                            <p className="text-gray-500 text-sm font-medium">Lulus dari kelas <span className="text-indigo-600 font-bold">{courseTitle}</span>.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!showNameInput && (
                            <button
                                onClick={() => setShowNameInput(true)}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm"
                            >
                                Ubah Nama
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                        >
                            <Printer className="w-4 h-4" />
                            Cetak / Simpan PDF
                        </button>
                    </div>
                </div>

                {/* The Certificate - Premium Design */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white shadow-2xl rounded-[40px] overflow-hidden border-[16px] border-double border-gray-100 print:shadow-none print:border-none print:m-0"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

                    <div className="p-12 md:p-20 relative z-10">
                        {/* Header Logos */}
                        <div className="flex justify-between items-start mb-16">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16">
                                    <img
                                        src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                                        alt="Kaze Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <p className="text-xl font-black tracking-tighter italic text-gray-900">KAZE FOR DEVELOPER</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Academy of Excellence</p>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col items-end">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border-2 border-amber-100 rotate-12 mb-2">
                                    <Award className="w-10 h-10" />
                                </div>
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Verified Alumnus</p>
                            </div>
                        </div>

                        {/* Certificate Body */}
                        <div className="text-center space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.5em] mb-4">Sertifikat Kelulusan</h2>
                                <p className="text-gray-500 font-medium italic">Sertifikat ini secara resmi diberikan kepada:</p>
                                <h3 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight py-4 border-y border-gray-50">
                                    {studentName || '................'}
                                </h3>
                            </div>

                            <div className="max-w-2xl mx-auto py-8">
                                <p className="text-lg text-gray-600 font-medium leading-relaxed italic">
                                    Telah menyelesaikan seluruh modul pembelajaran dengan prestasi luar biasa dan menunjukkan kompetensi teknis yang mendalam pada bidang:
                                </p>
                                <p className="text-3xl font-black text-indigo-900 mt-6 bg-indigo-50 inline-block px-10 py-3 rounded-full border border-indigo-100">
                                    {courseTitle || 'Course Integration'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Diberikan pada</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {new Date(issuedAt).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center border-2 border-gray-100 mb-2 relative">
                                        <ShieldCheck className="w-12 h-12 text-gray-200" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 border border-indigo-600/30 rounded-full animate-ping opacity-20" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full border-4 border-white">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Verified Secure</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">ID Sertifikat</p>
                                    <code className="text-[11px] font-black text-gray-900 bg-gray-50 px-3 py-1 rounded border border-gray-100">{certificateCode}</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Graphic */}
                    <div className="h-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500" />
                </motion.div>

                {/* Mobile Guard Notice */}
                <div className="mt-8 p-6 bg-white rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4 print:hidden">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Download className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-black text-gray-900 text-sm italic">PRO-TIP: CARA DOWNLOAD PDF</p>
                        <p className="text-gray-500 text-[11px] font-medium leading-normal uppercase tracking-wider">Klik tombol "Cetak" di atas, lalu ubah 'Tujuan' menjadi "Simpan sebagai PDF". Instan!</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden;
                    }
                    .print-hidden, .fixed, nav, footer {
                        display: none !important;
                    }
                    .min-h-screen {
                        min-height: 0 !important;
                        height: 100vh !important;
                        padding: 0 !important;
                    }
                    .max-w-5xl {
                        max-width: none !important;
                        width: 100vw !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* Force Certificate to fit exact landscape A4 ratio */
                    .relative.bg-white.shadow-2xl {
                        width: 100vw !important;
                        height: 100vh !important;
                        border-width: 12px !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                    }
                    .p-12, .md\\:p-20 {
                        padding: 2.5rem !important;
                    }
                    h3.text-5xl, h3.md\\:text-7xl {
                        font-size: 3.5rem !important;
                        padding: 1rem 0 !important;
                    }
                    .text-lg {
                        font-size: 1rem !important;
                    }
                    .text-3xl {
                        font-size: 1.5rem !important;
                    }
                    .pt-16 {
                        padding-top: 2rem !important;
                    }
                    .mb-16 {
                        margin-bottom: 2rem !important;
                    }
                    .mb-8 {
                        margin-bottom: 1rem !important;
                    }
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            `}</style>
        </div>
    );
};

export default Certificate;
