import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  School, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Check
} from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  isSupabaseConfigured 
} from '../utils/supabaseClient';
import { filterPhilippineSchools, type PhilippineSchool } from '../data/philippineSchools';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  
  // Touched state for realtime validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const schoolInputRef = useRef<HTMLInputElement>(null);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Close school dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        schoolDropdownRef.current && 
        !schoolDropdownRef.current.contains(e.target as Node) &&
        schoolInputRef.current &&
        !schoolInputRef.current.contains(e.target as Node)
      ) {
        setIsSchoolDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Philippine schools matching input
  const schoolSuggestions = useMemo(() => {
    return filterPhilippineSchools(school);
  }, [school]);

  // ==================== VALIDATIONS ====================

  // 1. Name validation (letters, spaces, periods, hyphens; min 3 chars)
  const isNameValid = useMemo(() => {
    const trimmed = fullName.trim();
    if (trimmed.length < 3) return false;
    return /^[a-zA-Z\u00C0-\u00FF\s\.\-']{3,60}$/.test(trimmed);
  }, [fullName]);

  // 2. Email validation
  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }, [email]);

  // 3. Password strength & dynamic suggestion calculation
  const passwordStats = useMemo(() => {
    const minLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 0;
    if (minLength) score++;
    if (hasNumber) score++;
    if (hasUpper && hasLower) score++;
    if (hasSpecial) score++;

    let suggestion = '';
    if (!password) {
      suggestion = 'Must be at least 8 characters with numbers and letters.';
    } else if (!minLength) {
      suggestion = `Add ${8 - password.length} more character${8 - password.length > 1 ? 's' : ''}.`;
    } else if (!hasNumber) {
      suggestion = '💡 Tip: Add at least one number (0-9).';
    } else if (!hasUpper) {
      suggestion = '💡 Tip: Add an uppercase letter (A-Z).';
    } else if (!hasSpecial) {
      suggestion = '💡 Tip: Add a symbol like ! or # for stronger security.';
    } else {
      suggestion = '✓ Strong & secure password!';
    }

    return {
      minLength,
      hasNumber,
      hasUpper,
      hasSpecial,
      score, // 0 to 4
      suggestion,
      isValid: minLength,
    };
  }, [password]);

  if (!isOpen) return null;

  // Generator: Suggest a random strong memorable password
  const handleGenerateStrongPassword = () => {
    const prefixes = ['Arki', 'Studio', 'Draft', 'Pillar', 'Scale', 'Beam', 'Elevation'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const symbols = ['!', '#', '@', '$'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const generated = `${prefix}#${num}${sym}`;
    setPassword(generated);
    setShowPassword(true);
    setTouched(prev => ({ ...prev, password: true }));
  };

  const handleSelectSchool = (s: PhilippineSchool) => {
    setSchool(s.name);
    setIsSchoolDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Trigger all validations
    setTouched({ name: true, email: true, password: true });

    if (tab === 'signup') {
      if (!isNameValid) {
        setErrorMessage('Please enter a valid full name (minimum 3 characters, letters only).');
        return;
      }
      if (!isEmailValid) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!passwordStats.isValid) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
    } else {
      if (!isEmailValid) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        const { data, error } = await signInWithEmail(email.trim(), password);
        if (error) {
          throw new Error(error.message || 'Invalid email or password.');
        }
        setSuccessMessage('Successfully signed in to Arkiteki Studio!');
        if (data?.user) {
          onAuthSuccess(data.user);
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const { data, error } = await signUpWithEmail(email.trim(), password, {
          fullName: fullName.trim(),
          school: school.trim() || 'Architecture School',
          targetExamYear: 'ALE Reviewee',
        });
        if (error) {
          throw new Error(error.message || 'Could not create account.');
        }
        setSuccessMessage(
          isSupabaseConfigured
            ? 'Account created! You are now logged in and synced to the cloud.'
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
        <div className="px-6 pt-5 pb-3 border-b border-[#E8E4DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2C6E49]/10 border border-[#2C6E49]/20 flex items-center justify-center text-[#2C6E49]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-stone-900 m-0 font-serif">
                {tab === 'login' ? 'Welcome Back to Arkiteki' : 'Create Student Account'}
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
        <div className="p-1.5 mx-6 mt-3 bg-white border border-[#E8E4DC] rounded-2xl flex items-center gap-1 shadow-xs">
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
        </div>

        {/* Supabase status indicator banner */}
        <div className="px-6 pt-2.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EAE5D9]/50 border border-[#E8E4DC] text-[11px] text-stone-600">
            <Database className="w-3.5 h-3.5 text-[#2C6E49] shrink-0" />
            <span className="truncate">
              {isSupabaseConfigured
                ? 'Supabase Cloud Database Connected'
                : 'Local Mode Ready (Data safely persisted in browser)'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 pt-3">
          {tab === 'signup' && (
            <>
              {/* Full Name field with validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-stone-700">
                    Full Name / Reviewer Handle <span className="text-rose-500">*</span>
                  </label>
                  {touched.name && isNameValid && (
                    <span className="text-[10px] text-[#2C6E49] font-medium flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid Name
                    </span>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (!touched.name) setTouched(prev => ({ ...prev, name: true }));
                    }}
                    placeholder="e.g. Joshua Miguel Bunyi"
                    className={`w-full bg-white border rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none transition ${
                      touched.name && !isNameValid
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                        : 'border-[#E8E4DC] focus:border-[#2C6E49]'
                    }`}
                  />
                </div>
                {touched.name && !isNameValid && (
                  <p className="text-[10px] text-rose-600 m-0 pt-1">
                    Please enter at least 3 letters (letters, spaces, and periods only).
                  </p>
                )}
              </div>

              {/* Philippine School / University Autocomplete */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                    <span>Architecture School / University</span>
                    <span className="text-[10px] text-stone-400 font-normal">(Philippines)</span>
                  </label>
                </div>
                <div className="relative">
                  <School className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={schoolInputRef}
                    type="text"
                    value={school}
                    onFocus={() => setIsSchoolDropdownOpen(true)}
                    onChange={(e) => {
                      setSchool(e.target.value);
                      setIsSchoolDropdownOpen(true);
                    }}
                    placeholder="Type school name e.g. TIP, UST, Mapúa, UP..."
                    className="w-full bg-white border border-[#E8E4DC] focus:border-[#2C6E49] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none transition"
                  />
                </div>

                {/* Autocomplete suggestions dropdown */}
                {isSchoolDropdownOpen && schoolSuggestions.length > 0 && (
                  <div 
                    ref={schoolDropdownRef}
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#DDD8CE] rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-[#F0ECE1] scrollbar-thin"
                  >
                    {schoolSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSchool(s)}
                        className="w-full text-left px-3 py-2 hover:bg-[#FAF8F5] transition flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-stone-800 group-hover:text-[#2C6E49] truncate m-0">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate m-0">
                            {s.campus ? `${s.campus} • ` : ''}{s.region}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                          {s.shortName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Email Address with real-time validation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-stone-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              {touched.email && isEmailValid && (
                <span className="text-[10px] text-[#2C6E49] font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Valid Email
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!touched.email) setTouched(prev => ({ ...prev, email: true }));
                }}
                placeholder="architect@student.edu.ph"
                className={`w-full bg-white border rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none transition ${
                  touched.email && !isEmailValid
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-[#E8E4DC] focus:border-[#2C6E49]'
                }`}
              />
            </div>
            {touched.email && !isEmailValid && (
              <p className="text-[10px] text-rose-600 m-0 pt-1">
                Please enter a valid email address (e.g. name@domain.com).
              </p>
            )}
          </div>

          {/* Password with dynamic suggestions & strength indicator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-stone-700">
                Password <span className="text-rose-500">*</span>
              </label>
              {tab === 'signup' && (
                <button
                  type="button"
                  onClick={handleGenerateStrongPassword}
                  className="text-[10px] text-[#2C6E49] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Suggest Strong Password</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
                }}
                placeholder="••••••••"
                className={`w-full bg-white border rounded-xl pl-9 pr-9 py-2 text-xs text-stone-800 focus:outline-none transition ${
                  tab === 'signup' && touched.password && !passwordStats.isValid
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-[#E8E4DC] focus:border-[#2C6E49]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Dynamic Password Strength Indicator (Sign Up only) */}
            {tab === 'signup' && password && (
              <div className="pt-2 space-y-1.5">
                {/* Visual score bar */}
                <div className="flex gap-1 h-1">
                  <div className={`flex-1 rounded-full transition-all ${
                    passwordStats.score >= 1 ? (passwordStats.score === 1 ? 'bg-rose-500' : passwordStats.score === 2 ? 'bg-amber-500' : 'bg-[#2C6E49]') : 'bg-stone-200'
                  }`} />
                  <div className={`flex-1 rounded-full transition-all ${
                    passwordStats.score >= 2 ? (passwordStats.score === 2 ? 'bg-amber-500' : 'bg-[#2C6E49]') : 'bg-stone-200'
                  }`} />
                  <div className={`flex-1 rounded-full transition-all ${
                    passwordStats.score >= 3 ? 'bg-[#2C6E49]' : 'bg-stone-200'
                  }`} />
                  <div className={`flex-1 rounded-full transition-all ${
                    passwordStats.score >= 4 ? 'bg-[#1B4332]' : 'bg-stone-200'
                  }`} />
                </div>

                {/* Dynamic Suggestion Hint */}
                <p className={`text-[10px] m-0 font-medium ${
                  passwordStats.score >= 3 ? 'text-[#2C6E49]' : passwordStats.score === 2 ? 'text-amber-700' : 'text-stone-600'
                }`}>
                  {passwordStats.suggestion}
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-1.5">
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

          <div className="text-center pt-1">
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
