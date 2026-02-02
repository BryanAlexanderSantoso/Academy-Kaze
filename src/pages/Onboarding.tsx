import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateLearningPath } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, CheckCircle2,
    Sparkles, ShieldCheck, Laptop, Database, Globe,
    BookOpen, FileText, ClipboardList,
    ChevronRight, Rocket, Target
} from 'lucide-react';

const learningPaths = [
    {
        id: 'fe' as const,
        title: 'Frontend Master',
        description: 'Architect immersive user interfaces. Master React, Motion, and Global Design Systems.',
        icon: Laptop,
        color: 'indigo',
        accent: 'from-indigo-500 to-blue-600',
    },
    {
        id: 'be' as const,
        title: 'Backend Core',
        description: 'Engineer industrial-grade systems. Master Node.js, Distributed Databases, and Security.',
        icon: Database,
        color: 'emerald',
        accent: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'fs' as const,
        title: 'Fullstack Elite',
        description: 'Complete technical mastery. Orchestrate complex applications from pixel to database.',
        icon: Globe,
        color: 'amber',
        accent: 'from-amber-500 to-orange-600',
    },
];

const tutorialSteps = [
    {
        title: "The Kaze Nucleus",
        subtitle: "Synchronizing Your Learning Experience",
        description: "Welcome to Kaze For Developer. You are entering a mission-critical learning environment designed to transform you into an industry-grade software architect.",
        icon: Sparkles,
        color: "indigo",
        tag: "System_Initialize"
    },
    {
        title: "Curriculum Engine",
        subtitle: "Knowledge Node Acquisition",
        description: "Your dashboard serves as the central command. Navigate through high-fidelity courses divided into tactical chapters, each building towards technical mastery.",
        icon: BookOpen,
        color: "blue",
        tag: "Data_Harvesting"
    },
    {
        title: "Validation Terminal",
        subtitle: "Mission Critical Assignments",
        description: "Every module concludes with a performance validation. Submit your code to the Command Center for expert review and architectural feedback.",
        icon: FileText,
        color: "emerald",
        tag: "Proof_Of_Concept"
    },
    {
        title: "Neural Assessments",
        subtitle: "Synchronized Diagnostics",
        description: "Test your theoretical synchronization via diagnostic questionnaires. Secure your proficiency score to unlock advanced curriculum nodes.",
        icon: ClipboardList,
        color: "amber",
        tag: "Logic_Verification"
    },
    {
        title: "Premium Uplink",
        subtitle: "Unrestricted Data Access",
        description: "Upgrade your authorization to Premium to unlock exclusive repositories, direct mentor uplinks, and verified certification logs.",
        icon: ShieldCheck,
        color: "purple",
        tag: "Access_Escalation"
    }
];

const Onboarding: React.FC = () => {
    const [stage, setStage] = useState<'tutorial' | 'path'>('tutorial');
    const [tutorialStep, setTutorialStep] = useState(0);
    const [selectedPath, setSelectedPath] = useState<'fe' | 'be' | 'fs' | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const currentTutorial = tutorialSteps[tutorialStep];
    const TutorialIcon = currentTutorial.icon;

    const handleNextTutorial = () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            setTutorialStep(tutorialStep + 1);
        } else {
            setStage('path');
        }
    };

    const handleContinue = async () => {
        if (!selectedPath || !user) return;

        setLoading(true);
        const { data, error } = await updateLearningPath(user.id, selectedPath);

        if (!error && data) {
            setUser({
                ...user,
                learning_path: selectedPath,
            });
            navigate('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-100">
            {/* Architectural Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-50 blur-[150px] rounded-full" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-50 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-[1400px] w-full relative z-10">
                <AnimatePresence mode="wait">
                    {stage === 'tutorial' ? (
                        <motion.div
                            key={`step-${tutorialStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                        >
                            <div className="space-y-10 order-2 lg:order-1">
                                <div className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]"
                                    >
                                        <TutorialIcon className="w-4 h-4" />
                                        {currentTutorial.tag}
                                    </motion.div>
                                    <div className="space-y-4">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">{currentTutorial.subtitle}</h2>
                                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">
                                            {currentTutorial.title.split(' ').map((word, i) => (
                                                <span key={i} className={i === 1 ? "text-indigo-600" : ""}>{word} </span>
                                            ))}
                                        </h1>
                                    </div>
                                    <p className="text-gray-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                        {currentTutorial.description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-8">
                                    <button
                                        onClick={handleNextTutorial}
                                        className="group relative bg-gray-900 text-white px-12 py-6 rounded-[30px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-gray-900/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4 w-full sm:w-auto"
                                    >
                                        {tutorialStep === tutorialSteps.length - 1 ? 'AUTHORIZE_CHOICE' : 'NEXT_SEQUENCE'}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <div className="flex gap-2">
                                        {tutorialSteps.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 transition-all duration-500 rounded-full ${i === tutorialStep ? 'w-12 bg-indigo-600' : 'w-4 bg-gray-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 flex justify-center">
                                <motion.div
                                    className="relative"
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-white border border-gray-100 rounded-[80px] shadow-3xl flex items-center justify-center relative group">
                                        <div className="absolute inset-0 bg-indigo-600/5 rounded-[80px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <TutorialIcon
                                            size={120}
                                            strokeWidth={1.5}
                                            className="text-indigo-600 transform group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Abstract UI Elements */}
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white border border-gray-50 rounded-[40px] shadow-xl p-6 hidden md:flex flex-col justify-between">
                                            <div className="w-full h-2 bg-gray-100 rounded-full animate-pulse" />
                                            <div className="w-2/3 h-2 bg-gray-100 rounded-full animate-pulse delay-75" />
                                            <div className="flex justify-end">
                                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                    <Target className="w-4 h-4 text-indigo-400" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white border border-gray-50 rounded-[40px] shadow-xl p-6 hidden md:flex flex-col justify-between">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                            </div>
                                            <div className="w-full h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                                                <div className="w-12 h-1 bg-gray-200 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selection-stage"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <div className="mb-20">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10"
                                >
                                    <Rocket className="w-4 h-4" />
                                    Final_Authorization
                                </motion.div>
                                <h1 className="text-7xl md:text-9xl font-black text-gray-900 mb-8 tracking-tighter uppercase italic leading-none">
                                    Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Trajectory.</span>
                                </h1>
                                <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
                                    Choose the specialization that will define your professional legacy within Kaze For Developer.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 max-w-6xl mx-auto">
                                {learningPaths.map((path, idx) => {
                                    const Icon = path.icon;
                                    const isSelected = selectedPath === path.id;

                                    return (
                                        <motion.button
                                            key={path.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * idx }}
                                            onClick={() => setSelectedPath(path.id)}
                                            className={`group relative p-12 rounded-[60px] text-left transition-all duration-500 overflow-hidden ${isSelected
                                                ? 'bg-white border-indigo-600 shadow-3xl scale-105 ring-[12px] ring-indigo-500/5'
                                                : 'bg-white border-gray-100 hover:border-indigo-200 shadow-xl'
                                                } border-[3px]`}
                                        >
                                            <div className={`w-20 h-20 rounded-[30px] bg-gradient-to-br ${path.accent} flex items-center justify-center mb-10 shadow-xl shadow-current/20 group-hover:scale-110 transition-transform duration-500 relative z-10`}>
                                                <Icon className="w-10 h-10 text-white" />
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase flex items-center gap-3 italic">
                                                    {path.title}
                                                    {isSelected && <CheckCircle2 className="w-7 h-7 text-indigo-600" />}
                                                </h3>
                                                <p className="text-gray-500 font-bold text-sm leading-relaxed uppercase tracking-tight">{path.description}</p>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl animate-pulse" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col items-center gap-8"
                            >
                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedPath || loading}
                                    className="group relative bg-gray-900 text-white px-16 py-8 rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-3xl shadow-gray-900/20 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-4">
                                        {loading ? 'CALIBRATING_SYTEM...' : 'INITIALIZE_COMMAND_CENTER'}
                                        {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                                    </span>
                                </button>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Awaiting link establishment
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Side Labels */}
            <div className="fixed top-1/2 left-10 -translate-y-1/2 hidden 2xl:block opacity-10">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[1em] rotate-180" style={{ writingMode: 'vertical-rl' }}>FORGE_PROTOCOL_V.4.2</p>
            </div>
            <div className="fixed top-1/2 right-10 -translate-y-1/2 hidden 2xl:block opacity-10">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[1em]" style={{ writingMode: 'vertical-rl' }}>KAZE_FOR_DEVELOPER</p>
            </div>
        </div>
    );
};

export default Onboarding;
