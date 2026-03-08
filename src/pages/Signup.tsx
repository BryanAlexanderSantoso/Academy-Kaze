import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User,
  Zap, AlertCircle,
  UserPlus, Shield, Fingerprint, Activity
} from 'lucide-react';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.signUp(email, password, fullName);
      navigate('/onboarding');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await api.auth.signInWithGoogle();
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      await api.auth.signInWithFacebook();
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-indigo-100">
      {/* Architectural Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-50 blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-50 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[60px] border border-gray-100 shadow-3xl relative z-10 overflow-hidden"
      >
        {/* Left Side: Visual Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gray-50/50 relative overflow-hidden border-r border-gray-100">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 overflow-hidden flex items-center justify-center">
                <img
                  src="https://ik.imagekit.io/psdoxljjy/logo-removebg-preview.png?updatedAt=1748393870807"
                  alt="Kaze Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tighter uppercase ">Kaze For Developer</h2>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Learning Platform</p>
              </div>
            </div>

            <div className="space-y-10">
              <h1 className="text-7xl font-bold text-gray-900 leading-[0.9] tracking-tighter uppercase ">
                JOIN OUR <br />
                <span className="text-indigo-600">PLATFORM.</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm ">
                Start your learning journey with expert mentorship and structured curriculum designed for career success.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-6">
            <div className="flex items-center gap-6 p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Learning Quality</p>
                <p className="text-xl font-bold text-gray-900 tracking-tighter uppercase">Professional</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-8 bg-white rounded-[40px] shadow-sm border border-gray-100 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Instructor Review</p>
                <p className="text-xl font-bold text-gray-900 tracking-tighter uppercase">Expert Guided</p>
              </div>
            </div>
          </div>

          {/* Decorative Background Icon */}
          <Fingerprint className="absolute -bottom-20 -left-20 w-80 h-80 text-indigo-600/5 rotate-12" />
        </div>

        {/* Right Side: Signup Form */}
        <div className="p-10 md:p-20 flex flex-col justify-center bg-white">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-8">
              <Activity className="w-3.5 h-3.5" />
              New Account Registration
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2 tracking-tighter uppercase ">Create Account</h3>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-tight">Register to start your learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
              <div className="relative group/input">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-bold text-gray-900 transition-all shadow-inner placeholder:text-gray-200 uppercase tracking-widest"
                  placeholder="Alexander Kaze"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-bold text-gray-900 transition-all shadow-inner placeholder:text-gray-200"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/input:text-indigo-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-none focus:ring-0 focus:bg-white rounded-[30px] py-6 pl-16 pr-8 text-sm font-bold text-gray-900 transition-all shadow-inner placeholder:text-gray-200"
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest ml-6">Minimum 6 characters</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-4 px-6 py-4 bg-red-50 border border-red-100 rounded-[20px] text-red-600 text-xs font-bold uppercase tracking-widest"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold uppercase tracking-[0.3em] py-6 rounded-[30px] shadow-2xl shadow-gray-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden text-[10px] mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                {!loading && <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-bold uppercase tracking-widest">Or register with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold uppercase tracking-[0.2em] py-5 rounded-[30px] shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3 text-[10px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold uppercase tracking-[0.2em] py-5 rounded-[30px] shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3 text-[10px]"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition-colors border-b-2 border-indigo-100 hover:border-indigo-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Aesthetic Accents */}
      <div className="fixed top-1/2 left-10 -translate-y-1/2 hidden 2xl:block opacity-5">
        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-[1em] rotate-180" style={{ writingMode: 'vertical-rl' }}>KAZE DEVELOPER</p>
      </div>
    </div>
  );
};

export default Signup;
