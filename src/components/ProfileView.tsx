import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles,
  GraduationCap, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Download, 
  RotateCcw, 
  Wand2, 
  Copy, 
  Check, 
  Camera, 
  School, 
  ShieldCheck, 
  Trash2, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { filterPhilippineSchools } from '../data/philippineSchools';
import { generateQuizPdf, generateFlashcardsPdf } from '../utils/pdfGenerator';
import { ALE_REVIEW_DECKS } from '../data/quizDecks';
import type { 
  UserProfileData, 
  QuizAttemptRecord, 
  PromptHistoryItem, 
  QuizDeck, 
  AppTab 
} from '../types';

interface ProfileViewProps {
  user: any;
  apiKey: string;
  currentModel: string;
  onNavigateTab: (tab: AppTab) => void;
  onLoadPromptToStudio?: (promptText: string) => void;
  onLoadDeckToQuiz?: (deck: QuizDeck) => void;
  onOpenConnectModal: () => void;
  onModelUpdated: (newModel: string) => void;
}

const AVATAR_PRESETS = [
  { id: 'classic', icon: '🏛️', label: 'Classical / Civic' },
  { id: 'drafting', icon: '📐', label: 'Technical Drafting' },
  { id: 'tropical', icon: '🌿', label: 'Tropical & Biophilic' },
  { id: 'skyscraper', icon: '🏗️', label: 'Structural & High-Rise' },
  { id: 'sketch', icon: '✏️', label: 'Concept Ideation' },
  { id: 'vernacular', icon: '⛩️', label: 'Vernacular Heritage' },
  { id: 'render', icon: '🎨', label: 'Visualization' },
  { id: 'ruler', icon: '📏', label: 'Urban Planning' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  apiKey,
  currentModel,
  onNavigateTab,
  onLoadPromptToStudio,
  onLoadDeckToQuiz,
  onOpenConnectModal,
  onModelUpdated,
}) => {
  // 1. Profile State
  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_user_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Profile read error', e);
    }
    return {
      id: user?.id || (apiKey ? 'gemini-linked-studio' : 'guest-studio'),
      email: user?.email || (apiKey ? 'gemini.studio@arkiteki.ph' : 'student@arkiteki.ph'),
      fullName: user?.user_metadata?.fullName || 'Ar. Studio Scholar',
      school: user?.user_metadata?.school || 'University of Santo Tomas (UST)',
      avatarIcon: '🏛️',
      targetExamYear: 'ALE June 2026 (PRC Board)',
      bio: 'Filipino architecture student & reviewee preparing for the PRC Licensure Examination.',
      isGeminiLinked: Boolean(apiKey),
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.fullName);
  const [editSchool, setEditSchool] = useState(profile.school);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editTargetExam, setEditTargetExam] = useState(profile.targetExamYear || 'ALE June 2026 (PRC Board)');
  const [editAvatarIcon, setEditAvatarIcon] = useState(profile.avatarIcon || '🏛️');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl || '');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // 2. Quiz History Compilation State
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_quiz_history');
      if (stored) return JSON.parse(stored);
    } catch {
      // return default seed
    }
    // Initial welcome attempt seed if empty
    return [
      {
        id: 'qa-initial-1',
        deckId: 'deck-nbcp',
        deckTitle: 'National Building Code (PD 1096)',
        score: 5,
        totalQuestions: 6,
        percentage: 83,
        passed: true,
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      },
      {
        id: 'qa-initial-2',
        deckId: 'deck-bp344',
        deckTitle: 'Accessibility Law (BP 344)',
        score: 4,
        totalQuestions: 4,
        percentage: 100,
        passed: true,
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      },
    ];
  });

  // 3. Prompt Improver History State
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('arkiteki_prompt_history');
      if (stored) return JSON.parse(stored);
    } catch {
      // return empty
    }
    return [
      {
        id: 'ph-seed-1',
        originalInput: 'modern city hall with stairs, grand public plaza, and tropical breezeway in the philippines',
        enhancedOutput: 'A two-point perspective architectural photograph of a modern tropical city hall in the Philippines. Deep 2.5-meter cantilevered eaves, exposed board-formed concrete pilotis, and operable narra timber louvers aligned with the Amihan (northeast) prevailing wind path. Captured with a 24mm tilt-shift lens at eye-level, strictly vertical columns, warm late afternoon sunlight, ArchDaily publication standard.',
        category: 'Civic / City Hall',
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
      },
    ];
  });

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // 4. ALE Exam Countdown Timer (Target: June 12, 2026 8:00 AM PHT)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-06-12T08:00:00+08:00').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save profile changes
  const handleSaveProfile = () => {
    const updated: UserProfileData = {
      ...profile,
      fullName: editName.trim() || 'Ar. Studio Scholar',
      school: editSchool.trim() || 'University of Santo Tomas (UST)',
      bio: editBio.trim(),
      targetExamYear: editTargetExam,
      avatarIcon: editAvatarIcon,
      avatarUrl: editAvatarUrl,
      isGeminiLinked: Boolean(apiKey),
    };

    setProfile(updated);
    try {
      localStorage.setItem('arkiteki_user_profile', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save profile', e);
    }

    setIsEditingProfile(false);
    setSaveSuccess(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#2C6E49', '#3B7A57'],
    });
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Avatar Image Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Autocomplete Philippine schools
  const schoolSuggestions = useMemo(() => {
    return filterPhilippineSchools(editSchool);
  }, [editSchool]);

  // Close school dropdown when clicking outside
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

  // Calculate Quiz Statistics
  const stats = useMemo(() => {
    const totalTaken = quizHistory.length;
    if (totalTaken === 0) {
      return { totalTaken: 0, passedCount: 0, passingRate: 0, avgScore: 0, totalQuestions: 0 };
    }

    const passedCount = quizHistory.filter((q) => q.passed).length;
    const passingRate = Math.round((passedCount / totalTaken) * 100);
    const sumPercentage = quizHistory.reduce((acc, q) => acc + q.percentage, 0);
    const avgScore = Math.round(sumPercentage / totalTaken);
    const totalQuestions = quizHistory.reduce((acc, q) => acc + q.totalQuestions, 0);

    return { totalTaken, passedCount, passingRate, avgScore, totalQuestions };
  }, [quizHistory]);

  // Retake quiz handler
  const handleRetakeQuiz = (deckTitle: string, deckId: string) => {
    const foundDeck = ALE_REVIEW_DECKS.find((d) => d.id === deckId || d.title === deckTitle);
    if (foundDeck && onLoadDeckToQuiz) {
      onLoadDeckToQuiz(foundDeck);
    }
    onNavigateTab('quiz');
  };

  // Download PDF from quiz attempt
  const handleDownloadAttemptPdf = (attempt: QuizAttemptRecord) => {
    const foundDeck = ALE_REVIEW_DECKS.find((d) => d.id === attempt.deckId || d.title === attempt.deckTitle);
    if (foundDeck) {
      generateQuizPdf(foundDeck);
    } else {
      // Create ad-hoc deck structure for PDF
      const fallbackDeck: QuizDeck = {
        id: attempt.deckId,
        title: attempt.deckTitle,
        subject: 'Philippine Architecture Licensure Review',
        description: `Official Reviewer for ${attempt.deckTitle}`,
        badge: 'PRC Board Reviewer',
        questionCount: attempt.totalQuestions,
        questions: ALE_REVIEW_DECKS[0].questions,
        flashcards: ALE_REVIEW_DECKS[0].flashcards,
      };
      generateQuizPdf(fallbackDeck);
    }
  };

  // Download Flashcards PDF
  const handleDownloadFlashcardsPdf = (attempt: QuizAttemptRecord) => {
    const foundDeck = ALE_REVIEW_DECKS.find((d) => d.id === attempt.deckId || d.title === attempt.deckTitle);
    generateFlashcardsPdf(foundDeck || ALE_REVIEW_DECKS[0]);
  };

  // Copy Prompt
  const handleCopyPrompt = (item: PromptHistoryItem) => {
    navigator.clipboard.writeText(item.enhancedOutput);
    setCopiedPromptId(item.id);
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#2C6E49', '#C85A32'],
    });
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Delete Prompt History Item
  const handleDeletePromptItem = (id: string) => {
    const updated = promptHistory.filter((p) => p.id !== id);
    setPromptHistory(updated);
    try {
      localStorage.setItem('arkiteki_prompt_history', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* 1. Header Profile Banner */}
      <div className="bg-white border border-[#E8E4DC] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Soft decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#2C6E49]/10 via-[#FAF8F5] to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar Display */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-[#FAF8F5] border-2 border-[#2C6E49]/20 shadow-sm flex items-center justify-center text-4xl overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{profile.avatarIcon || '🏛️'}</span>
                )}
              </div>

              {isEditingProfile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2 bg-[#2C6E49] text-white rounded-xl shadow-md hover:bg-[#1B4332] transition cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 m-0">
                  {profile.fullName}
                </h2>
                {apiKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1B4332] border border-[#2C6E49]/20">
                    <CheckCircle2 className="w-3 h-3 text-[#2C6E49]" />
                    <span>Gemini Connected ({currentModel.replace('gemini-', '')})</span>
                  </span>
                ) : (
                  <button
                    onClick={onOpenConnectModal}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer"
                  >
                    <span>Link Gemini Account</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-[#2C6E49]" />
                  <span className="font-medium text-stone-800">{profile.school}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profile.targetExamYear}</span>
                </span>
              </div>

              <p className="text-xs text-stone-500 max-w-lg leading-relaxed pt-1">
                {profile.bio || 'Architectural design & PRC Licensure Exam preparation studio.'}
              </p>
            </div>
          </div>

          {/* Edit Profile Button / Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!isEditingProfile ? (
              <button
                onClick={() => {
                  setEditName(profile.fullName);
                  setEditSchool(profile.school);
                  setEditBio(profile.bio || '');
                  setEditTargetExam(profile.targetExamYear || 'ALE June 2026 (PRC Board)');
                  setEditAvatarIcon(profile.avatarIcon || '🏛️');
                  setEditAvatarUrl(profile.avatarUrl || '');
                  setIsEditingProfile(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E4DC] hover:border-[#2C6E49] text-stone-700 hover:text-[#1B4332] transition shadow-xs cursor-pointer"
              >
                Edit Studio Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-[#2C6E49] font-bold animate-fade-in mr-1">
                    ✓ Saved!
                  </span>
                )}
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2C6E49] text-white hover:bg-[#1B4332] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form Accordion */}
        {isEditingProfile && (
          <div className="mt-6 pt-6 border-t border-[#F0ECE1] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Architect / Student Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Ar. Nichole Ramos"
                className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] text-stone-800 focus:outline-none focus:border-[#2C6E49]"
              />
            </div>

            {/* School Autocomplete */}
            <div className="relative">
              <label className="block font-semibold text-stone-700 mb-1">Architecture School (Philippines)</label>
              <input
                ref={schoolInputRef}
                type="text"
                value={editSchool}
                onChange={(e) => {
                  setEditSchool(e.target.value);
                  setIsSchoolDropdownOpen(true);
                }}
                onFocus={() => setIsSchoolDropdownOpen(true)}
                placeholder="e.g. University of Santo Tomas (UST)"
                className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] text-stone-800 focus:outline-none focus:border-[#2C6E49]"
              />

              {isSchoolDropdownOpen && schoolSuggestions.length > 0 && (
                <div
                  ref={schoolDropdownRef}
                  className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E8E4DC] rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  {schoolSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setEditSchool(s.name);
                        setIsSchoolDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#FAF8F5] transition text-xs border-b border-stone-100 last:border-b-0 cursor-pointer"
                    >
                      <div className="font-semibold text-stone-900">{s.name}</div>
                      <div className="text-[10px] text-stone-500">
                        {s.campus ? `${s.campus} • ` : ''}
                        {s.region}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target Board Exam Focus */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Target Licensure Exam</label>
              <select
                value={editTargetExam}
                onChange={(e) => setEditTargetExam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] text-stone-800 focus:outline-none focus:border-[#2C6E49] cursor-pointer"
              >
                <option value="ALE June 2026 (PRC Board)">ALE June 2026 (PRC Board)</option>
                <option value="ALE January 2027 (PRC Board)">ALE January 2027 (PRC Board)</option>
                <option value="Undergraduate Architecture Student">Undergraduate Architecture Student</option>
                <option value="Master's / Post-Graduate Review">Master's / Post-Graduate Review</option>
                <option value="Practicing Architect / Continuous Learning">Practicing Architect / Continuous Learning</option>
              </select>
            </div>

            {/* Avatar Icon Selector */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Choose Icon Preset</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setEditAvatarIcon(p.icon);
                      setEditAvatarUrl(''); // clear custom image if selecting preset
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border transition cursor-pointer ${
                      editAvatarIcon === p.icon && !editAvatarUrl
                        ? 'border-[#2C6E49] bg-emerald-50 scale-105'
                        : 'border-[#E8E4DC] bg-white hover:bg-stone-50'
                    }`}
                    title={p.label}
                  >
                    {p.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio Statement */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Short Design / Review Statement</label>
              <input
                type="text"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="e.g. Aspiring Filipino Architect focused on tropical sustainable civic design."
                className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] text-stone-800 focus:outline-none focus:border-[#2C6E49]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Licensure Countdown & Daily Code Wisdom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PRC ALE Board Exam Countdown */}
        <div className="bg-gradient-to-br from-[#1B4332] to-[#2C6E49] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>PRC Board Exam Countdown</span>
            </div>
            <h3 className="text-lg font-bold font-serif m-0">ALE Licensure 2026</h3>
            <p className="text-xs text-emerald-100/80">
              Philippine Licensure Examination for Architects • Professional Regulation Commission
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 my-5 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-bold font-mono">{timeLeft.days}</div>
              <div className="text-[10px] text-emerald-200 uppercase font-medium">Days</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-bold font-mono">{timeLeft.hours}</div>
              <div className="text-[10px] text-emerald-200 uppercase font-medium">Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-bold font-mono">{timeLeft.minutes}</div>
              <div className="text-[10px] text-emerald-200 uppercase font-medium">Mins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/10">
              <div className="text-xl sm:text-2xl font-bold font-mono">{timeLeft.seconds}</div>
              <div className="text-[10px] text-emerald-200 uppercase font-medium">Secs</div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('quiz')}
            className="w-full py-2.5 rounded-xl bg-white text-[#1B4332] hover:bg-emerald-50 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Start Daily 15-Item ALE Drill</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Philippine Building Laws Mastery Meters */}
        <div className="md:col-span-2 bg-white border border-[#E8E4DC] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 m-0">Philippine Code Mastery Tracker</h3>
                <p className="text-xs text-stone-500">Based on your practice exams and reviewer drills</p>
              </div>
              <span className="text-xs font-bold text-[#2C6E49] px-2.5 py-1 rounded-full bg-emerald-50 border border-[#2C6E49]/20">
                {stats.passingRate}% Overall Passing Rate
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* PD 1096 */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>PD 1096 • National Building Code (NBCP)</span>
                  <span className="font-bold text-[#2C6E49]">85% Ready</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#2C6E49] rounded-full transition-all duration-500" style={{ width: '85%' }} />
                </div>
              </div>

              {/* BP 344 */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>BP 344 • Accessibility Law & Universal Design</span>
                  <span className="font-bold text-[#2C6E49]">100% Mastered</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#3B7A57] rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>

              {/* RA 9514 */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>RA 9514 • Fire Code of the Philippines (2019 RIRR)</span>
                  <span className="font-bold text-[#C85A32]">70% In Progress</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-[#C85A32] rounded-full transition-all duration-500" style={{ width: '70%' }} />
                </div>
              </div>

              {/* SPP 201-209 */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>SPP 201-209 • Standards of Professional Practice</span>
                  <span className="font-bold text-stone-600">75% Competent</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-stone-500 rounded-full transition-all duration-500" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500">
            <span>Official passing mark for PRC Architecture Licensure is 70% with no grade below 50%.</span>
            <button
              onClick={() => onNavigateTab('calculator')}
              className="text-[#2C6E49] hover:underline font-semibold cursor-pointer"
            >
              Verify Code Dimensions in Calculator →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Compilations of Quizzes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 m-0 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#2C6E49]" />
              <span>Compilation of Quizzes & Licensure Exams</span>
            </h3>
            <p className="text-xs text-stone-500">
              Track scores, review correct law rationales, or re-download official PDF reviewers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-xl bg-white border border-[#E8E4DC] text-stone-600 font-medium">
              {stats.totalTaken} Decks Taken • {stats.totalQuestions} Questions Answered
            </span>
            {quizHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all saved quiz history?')) {
                    setQuizHistory([]);
                    localStorage.removeItem('arkiteki_quiz_history');
                  }
                }}
                className="text-[11px] text-stone-400 hover:text-rose-600 transition cursor-pointer px-2 py-1"
                title="Clear quiz history"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => onNavigateTab('quiz')}
              className="px-3.5 py-1.5 rounded-xl bg-[#2C6E49] text-white hover:bg-[#1B4332] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>+ Take New Quiz</span>
            </button>
          </div>
        </div>

        {/* Quiz List */}
        {quizHistory.length === 0 ? (
          <div className="bg-white border border-[#E8E4DC] rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">No quizzes completed yet</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Test your knowledge on PD 1096, BP 344, and RA 9514 or upload your own school notes to generate custom drills.
            </p>
            <button
              onClick={() => onNavigateTab('quiz')}
              className="px-4 py-2 rounded-xl bg-[#2C6E49] text-white text-xs font-semibold hover:bg-[#1B4332] transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Go to Exam Quizzes Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizHistory.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white border border-[#E8E4DC] hover:border-[#2C6E49]/40 rounded-2xl p-5 shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2C6E49] bg-emerald-50 px-2 py-0.5 rounded-full border border-[#2C6E49]/20">
                        {attempt.deckId.includes('nbcp')
                          ? 'PD 1096'
                          : attempt.deckId.includes('bp344')
                          ? 'BP 344'
                          : 'ALE Reviewer'}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">{attempt.deckTitle}</h4>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-mono ${
                          attempt.passed ? 'text-[#2C6E49]' : 'text-[#C85A32]'
                        }`}
                      >
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">
                        {attempt.percentage}% • {attempt.passed ? 'Passed (ALE Standard)' : 'Needs Review'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Completed {new Date(attempt.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions: Retake, Download Exam PDF, Download Flashcards PDF */}
                <div className="pt-3 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleRetakeQuiz(attempt.deckTitle, attempt.deckId)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#1B4332] hover:bg-emerald-50 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake Quiz</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadAttemptPdf(attempt)}
                      className="px-2.5 py-1 text-xs font-medium bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#E8E4DC] text-stone-700 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Download Official PRC ALE Exam Sheet PDF"
                    >
                      <Download className="w-3 h-3 text-[#2C6E49]" />
                      <span>Exam PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadFlashcardsPdf(attempt)}
                      className="px-2.5 py-1 text-xs font-medium bg-[#FAF8F5] hover:bg-[#F3EFE6] border border-[#E8E4DC] text-stone-700 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Download Printable Study Flashcards PDF"
                    >
                      <Download className="w-3 h-3 text-[#C85A32]" />
                      <span>Flashcards PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Prompt Improver & 3D Render History ("Chat History") */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 m-0 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-[#C85A32]" />
              <span>Prompt Improver & Render Plate History</span>
            </h3>
            <p className="text-xs text-stone-500">
              Browse previous architectural prompts, critiques, and in-app studio visualization renders
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('improver')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#C85A32] text-stone-700 hover:text-[#C85A32] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>+ New Architectural Prompt</span>
          </button>
        </div>

        {promptHistory.length === 0 ? (
          <div className="bg-white border border-[#E8E4DC] rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C85A32] mx-auto flex items-center justify-center">
              <Wand2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">No prompt plates generated yet</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Use the Prompt Improver to elevate rough studio sketches into photorealistic ArchDaily-grade prompts and direct renders.
            </p>
            <button
              onClick={() => onNavigateTab('improver')}
              className="px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#A74421] transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Open Prompt Improver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {promptHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8E4DC] rounded-2xl p-5 shadow-xs hover:border-[#C85A32]/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#C85A32] border border-amber-200">
                        {item.category || 'Architectural Plate'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 italic mt-1">
                      <strong className="text-stone-700 not-italic">Input: </strong>
                      "{item.originalInput}"
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed font-mono bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DC] mt-2">
                      {item.enhancedOutput}
                    </p>
                  </div>

                  {/* If an image was rendered */}
                  {item.imageUrl && (
                    <div className="w-28 h-20 rounded-xl overflow-hidden border border-[#E8E4DC] shrink-0 bg-stone-100 shadow-xs">
                      <img
                        src={item.imageUrl}
                        alt="Render preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onLoadPromptToStudio) {
                          onLoadPromptToStudio(item.enhancedOutput);
                        }
                        onNavigateTab('improver');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#2C6E49] text-stone-700 hover:text-[#1B4332] font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#2C6E49]" />
                      <span>Iterate in Studio</span>
                    </button>

                    <button
                      onClick={() => handleCopyPrompt(item)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DC] hover:border-stone-400 text-stone-600 hover:text-stone-900 font-medium transition cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedPromptId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2C6E49]" />
                          <span className="text-[#2C6E49]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeletePromptItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Studio Account & Settings Card */}
      <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600">
        <div className="space-y-1">
          <div className="font-bold text-stone-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2C6E49]" />
            <span>Arkiteki Studio Sync & Gemini Model Configuration</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Current Model: <strong>{currentModel}</strong> • Licensure Knowledge Engine: <strong>Offline & Online Hybrid</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentModel}
            onChange={(e) => onModelUpdated(e.target.value)}
            className="text-xs font-semibold bg-white border border-[#E8E4DC] hover:border-[#2C6E49] rounded-xl px-3 py-2 text-stone-800 focus:outline-none cursor-pointer"
            title="Switch Active Gemini AI Model"
          >
            <option value="gemini-3.8-flash">⚡ Gemini 3.8 Flash (Latest)</option>
            <option value="gemini-2.0-flash">⚡ Gemini 2.0 Flash</option>
            <option value="gemini-3.5-flash-lite">⚡ Gemini 3.5 Flash-Lite</option>
            <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (Deep Reasoning)</option>
          </select>
          <button
            onClick={onOpenConnectModal}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] hover:border-[#2C6E49] text-stone-700 hover:text-[#1B4332] font-semibold transition cursor-pointer"
          >
            Manage API Key
          </button>
        </div>
      </div>
    </div>
  );
};
