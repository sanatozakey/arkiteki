import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  School, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  isSupabaseConfigured 
} from '../utils/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [targetExamYear, setTargetExamYear] = useState('June 2026 ALE');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
          throw new Error(error.message || 'Invalid email or password.');
        }
        setSuccessMessage('Successfully signed in!');
        if (data?.user) {
          onAuthSuccess(data.user);
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const { data, error } = await signUpWithEmail(email, password, {
          fullName,
          school,
          targetExamYear,
        });
        if (error) {
          throw new Error(error.message || 'Could not create account.');
        }
        setSuccessMessage(
          isSupabaseConfigured
            ? 'Account created! Check your inbox or proceed to study.'
            : 'Account registered locally! You can now save your quizzes and prompts.'
        );
        if (data?.user) {
          onAuthSuccess(data.user);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E8E4DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C6E49]/10 border border-[#2C6E49]/20 flex items-center justify-center text-[#2C6E49]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 m-0 font-serif">
                {tab === 'login' ? 'Welcome Back to Arkiteki' : 'Join the Arkiteki Studio'}
              </h3>
              <p className="text-[11px] text-stone-500 m-0">
                {tab === 'login' 
                  ? 'Access your saved review decks and prompt history' 
                  : 'Sync your Philippine Licensure progress to the cloud'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#EAE5D9]/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-2 mx-6 mt-4 bg-white border border-[#E8E4DC] rounded-2xl flex items-center gap-1 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
              tab === 'login'
                ? 'bg-[#2C6E49] text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
              tab === 'signup'
                ? 'bg-[#2C6E49] text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Supabase status indicator banner */}
        <div className="px-6 pt-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EAE5D9]/40 border border-[#E8E4DC] text-[11px] text-stone-600">
            <Database className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
            <span className="truncate">
              {isSupabaseConfigured
                ? 'Supabase Cloud Database Connected'
                : 'Supabase Cloud Ready (Works offline / demo mode until keys added)'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {tab === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Full Name / Reviewer Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ar. Maria Santos"
                    className="w-full bg-white border border-[#E8E4DC] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Architecture School
                  </label>
                  <div className="relative">
                    <School className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="e.g. UST, UP, Mapúa"
                      className="w-full bg-white border border-[#E8E4DC] rounded-xl pl-8 pr-2.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Target Board Exam
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={targetExamYear}
                      onChange={(e) => setTargetExamYear(e.target.value)}
                      placeholder="e.g. June 2026 ALE"
                      className="w-full bg-white border border-[#E8E4DC] rounded-xl pl-8 pr-2.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@student.edu.ph"
                className="w-full bg-white border border-[#E8E4DC] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#E8E4DC] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#2C6E49]"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2C6E49] hover:bg-[#23583a] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-[#2C6E49]/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In to Studio' : 'Create Student Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-stone-400 m-0">
              {tab === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setTab(tab === 'login' ? 'signup' : 'login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-[#2C6E49] font-semibold hover:underline cursor-pointer"
              >
                {tab === 'login' ? 'Create one here' : 'Sign in'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
