import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { LessonVideoPlayer } from '@/components/lesson-video-player';
import { LessonLearningGuide } from '@/components/lesson-learning-guide';
import { LearnerIntentDialog } from '@/components/learner-intent-dialog';
import { ExamSyllabusLibrary } from '@/components/exam-syllabus-library';
import { buildSyllabusLessonSource, type SyllabusSelection } from '@/lib/syllabus/catalog';
import { useGenerateStudyLesson, useScanStudyText } from '@workspace/api-client-react';
import type { StudyLanguage, StudyLesson, StudyLessonInput } from '@workspace/api-client-react';
import { LESSON_LANGUAGES, languageLabel } from '@/lib/lesson-languages';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  GraduationCap,
  Layers3,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type SourceType = StudyLessonInput['sourceType'];
type LearnerLevel = StudyLessonInput['learnerLevel'];
type Duration = StudyLessonInput['duration'];
type SavedLesson = {
  id: string;
  lesson: StudyLesson;
  savedAt: string;
};

const STORAGE_KEY = 'studyloom-lessons-v1';

const levels: { value: LearnerLevel; label: string }[] = [
  { value: 'primary', label: 'Primary school' },
  { value: 'middle', label: 'Middle school' },
  { value: 'high', label: 'High school' },
  { value: 'college', label: 'College' },
  { value: 'adult', label: 'Adult learner' },
];

const durations: { value: Duration; label: string; note: string }[] = [
  { value: 'short', label: 'Quick', note: 'Fastest · 3–4 min' },
  { value: 'standard', label: 'Balanced', note: '6–8 min' },
  { value: 'detailed', label: 'In depth', note: '10–12 min' },
];

function readSavedLessons(): SavedLesson[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function prepareScanImage(file: File): Promise<{ imageBase64: string; mimeType: 'image/jpeg' }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose a photo or image file to scan.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('This photo is too large. Take a closer picture or choose a smaller image.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const maxEdge = 2000;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the photo. Try another image.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const compressed = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('This photo could not be prepared. Try another image.')),
        'image/jpeg',
        0.82,
      );
    });
    if (compressed.size > 2_500_000) {
      throw new Error('This photo is still too large. Take a closer picture of one section and try again.');
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('This photo could not be read.'));
      reader.onerror = () => reject(new Error('This photo could not be read.'));
      reader.readAsDataURL(compressed);
    });
    const imageBase64 = dataUrl.split(',')[1];
    if (!imageBase64) throw new Error('This photo could not be prepared. Try another image.');
    return { imageBase64, mimeType: 'image/jpeg' };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function Home() {
  const [sourceType, setSourceType] = useState<SourceType>('topic');
  const [source, setSource] = useState('');
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('middle');
  const [duration, setDuration] = useState<Duration>('short');
  const [language, setLanguage] = useState<StudyLanguage>('en');
  const [intentDraft, setIntentDraft] = useState<StudyLessonInput | null>(null);
  const [intentError, setIntentError] = useState('');
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>(readSavedLessons);
  const [lesson, setLesson] = useState<StudyLesson | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const [syllabusError, setSyllabusError] = useState('');
  const generationLock = useRef(false);
  const scrollToGeneratedLesson = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const generateLesson = useGenerateStudyLesson();
  const scanStudyText = useScanStudyText();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLessons));
    } catch {
      setNotice('This browser could not save your lesson history.');
    }
  }, [savedLessons]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const currentScene = lesson?.scenes[sceneIndex];
  const handleScanPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setNotice('');
    setIsScanning(true);
    try {
      const image = await prepareScanImage(file);
      const result = await scanStudyText.mutateAsync({ data: image });
      const extractedText = result.text.trim();
      if (!extractedText) {
        setNotice('No readable text found. Try a clearer, brighter photo.');
        return;
      }
      setSourceType('text');
      setSource(extractedText.slice(0, 12000));
      setNotice('Text scanned. Review it above, then create your lesson video.');
    } catch (cause) {
      const errorData = cause && typeof cause === 'object' && 'data' in cause
        ? (cause as { data?: { error?: unknown } }).data
        : undefined;
      setNotice(
        typeof errorData?.error === 'string'
          ? errorData.error
          : cause instanceof Error
            ? cause.message
            : 'We could not read that photo. Try a clear, well-lit picture.',
      );
    } finally {
      setIsScanning(false);
    }
  };

  const saveLesson = (newLesson: StudyLesson) => {
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const record: SavedLesson = { id: newId, lesson: newLesson, savedAt: new Date().toISOString() };
    setSavedLessons((current) => [record, ...current.filter((item) => item.lesson.title !== newLesson.title)].slice(0, 24));
    setActiveLessonId(newId);
  };

  const createLesson = async (data: StudyLessonInput) => {
    if (generationLock.current) return;
    generationLock.current = true;
    setNotice('');
    setSyllabusError('');
    setLesson(null);
    setActiveLessonId(null);
    try {
      const result = await generateLesson.mutateAsync({ data });
      scrollToGeneratedLesson.current = true;
      setLesson(result);
      setSceneIndex(0);
      saveLesson(result);
    } finally {
      generationLock.current = false;
    }
  };

  useEffect(() => {
    if (lesson && scrollToGeneratedLesson.current) {
      scrollToGeneratedLesson.current = false;
      document.querySelector('[data-testid="panel-generated-lesson"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [lesson]);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (source.trim().length < 3) {
      setNotice('Add a little more detail so the lesson has somewhere to begin.');
      return;
    }
    setNotice('');
    setIntentError('');
    setIntentDraft({ source: source.trim(), sourceType, learnerLevel, duration, language });
  };

  const handleSyllabusLearn = async (selection: SyllabusSelection) => {
    setIntentError('');
    setIntentDraft({
        source: buildSyllabusLessonSource(selection),
        sourceType: 'topic',
        learnerLevel: 'adult',
        duration,
        language,
    });
  };

  const confirmLearningPlan = async (data: StudyLessonInput) => {
    setIntentDraft(null);
    setIntentError('');
    try {
      await createLesson(data);
    } catch {
      setNotice('We could not create your lesson. Your learning plan is kept here so you can retry.');
      setIntentError('The lesson could not be created. Your choices and approved plan are kept; you can retry without rebuilding the plan.');
      setIntentDraft(data);
    }
  };

  const openSavedLesson = (record: SavedLesson) => {
    setLesson(record.lesson);
    setActiveLessonId(record.id);
    setSceneIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeSavedLesson = (event: MouseEvent, id: string) => {
    event.stopPropagation();
    setSavedLessons((current) => current.filter((item) => item.id !== id));
    if (activeLessonId === id) {
      setLesson(null);
      setActiveLessonId(null);
    }
  };

  const startFresh = () => {
    setLesson(null);
    setActiveLessonId(null);
    setSceneIndex(0);
  };

  const advanceScene = (direction: number) => {
    if (!lesson) return;
    setSceneIndex((index) => (index + direction + lesson.scenes.length) % lesson.scenes.length);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4f5fa] text-[#263444]">
      {intentDraft && <LearnerIntentDialog input={intentDraft} initialError={intentError} onCancel={() => setIntentDraft(null)} onConfirm={confirmLearningPlan} />}
      <header className="sticky top-0 z-30 border-b border-[#e5e7f0] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <button onClick={startFresh} className="flex items-center gap-3 text-left" data-testid="button-home">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#176e5c] text-white shadow-[0_5px_13px_rgba(23,110,92,.18)]">
              <BookOpen size={20} strokeWidth={2.3} />
            </span>
            <span>
              <span className="block font-[Manrope] text-[19px] font-extrabold leading-none tracking-[-.04em]">studyloom</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.16em] text-[#7f8b8b]">Make it make sense</span>
            </span>
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-[#e7e4da] bg-white/70 px-3.5 py-2 text-xs font-medium text-[#667373] sm:flex">
            <LockKeyhole size={13} className="text-[#438678]" />
            Saved only on this device
          </div>
          <button onClick={startFresh} className="flex items-center gap-2 rounded-full bg-[#176e5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#105b4b] active:scale-[.98]" data-testid="button-new-lesson">
            <Plus size={16} /> <span className="hidden sm:inline">New lesson</span><span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#284b61] bg-gradient-to-br from-[#15283f] via-[#18545d] to-[#287968] px-6 py-8 shadow-[0_22px_55px_rgba(35,61,84,.18)] sm:mb-9 sm:rounded-[34px] sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-8 -top-24 h-[300px] w-[300px] rounded-full border border-[#a8dbd1]/25 sm:right-[12%]">
            <div className="absolute inset-8 rounded-full border border-[#a8dbd1]/25" />
            <div className="absolute inset-16 rounded-full border border-[#a8dbd1]/20" />
            <span className="absolute right-10 top-12 h-3 w-3 rounded-full bg-[#ff9878] shadow-[0_0_25px_rgba(255,152,120,.6)]" />
            <span className="absolute bottom-9 left-14 h-2.5 w-2.5 rounded-full bg-[#ffd477] shadow-[0_0_22px_rgba(255,212,119,.6)]" />
          </div>
          <div className="relative z-10 max-w-[720px] animate-rise">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[#bde9d9]">
              <Sparkles size={13} /> Your personal lesson studio
            </div>
            <h1 className="font-[Manrope] text-[36px] font-extrabold leading-[1.05] tracking-[-.055em] text-white sm:text-[52px]">
              Big topic. Little steps.<br className="hidden sm:block" /> <span className="text-[#ffd477]">A lesson that sticks.</span>
            </h1>
            <p className="mt-4 max-w-[540px] text-[14px] leading-6 text-white/75 sm:text-[15px]">
              Clear, animated lessons from topics, notes and exam subjects—made for you.
            </p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Lesson features">
              {['Animated scenes', 'AI voice', 'Practice questions'].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/[.08] px-3 py-1.5 text-[10px] font-semibold tracking-[.02em] text-white/85">{item}</span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-7 right-8 hidden items-end gap-2 opacity-90 sm:flex" aria-hidden="true">
            <span className="h-11 w-8 rounded-t-[16px] bg-[#ffd477] shadow-[0_8px_26px_rgba(255,212,119,.2)]" />
            <span className="h-[68px] w-8 rounded-t-[16px] bg-[#8de0c4] shadow-[0_8px_26px_rgba(141,224,196,.16)]" />
            <span className="h-[52px] w-8 rounded-t-[16px] bg-[#ff9878] shadow-[0_8px_26px_rgba(255,152,120,.18)]" />
            <span className="h-[82px] w-8 rounded-t-[16px] bg-[#8da3ff] shadow-[0_8px_26px_rgba(141,163,255,.2)]" />
            <span className="mb-1 ml-1 text-[10px] font-semibold uppercase tracking-[.13em] text-[#d6e8e1]">one idea at a time</span>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-9">
          <div className="min-w-0">
            {!lesson && !generateLesson.isPending && (
              <section className="animate-rise rounded-[26px] border border-white bg-white p-5 shadow-[0_20px_55px_rgba(47,57,94,.09)] ring-1 ring-[#e8e9f2] sm:p-8" data-testid="panel-start-lesson">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#6263c7]">Make it yours · step 1</div>
                    <h2 className="font-[Manrope] text-[23px] font-extrabold tracking-[-.045em] text-[#202b46] sm:text-[28px]">What are we learning today?</h2>
                    <p className="mt-1.5 text-sm leading-6 text-[#69738a]">A topic, a question or the notes that aren’t clicking yet.</p>
                  </div>
                  <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff1d2] to-[#fce0d3] text-[#d08053] shadow-sm sm:grid"><Lightbulb size={22} /></span>
                </div>
                <form onSubmit={handleGenerate}>
                  <div className="mb-3 inline-flex rounded-xl bg-[#f1f1fa] p-1" role="tablist" aria-label="Choose a lesson source">
                    <button type="button" onClick={() => setSourceType('topic')} role="tab" aria-selected={sourceType === 'topic'} className={`rounded-[9px] px-4 py-2 text-[13px] font-semibold transition ${sourceType === 'topic' ? 'bg-white text-[#4f52ac] shadow-[0_2px_8px_rgba(50,52,110,.12)]' : 'text-[#778099] hover:text-[#36425e]'}`} data-testid="tab-topic">A topic</button>
                    <button type="button" onClick={() => setSourceType('text')} role="tab" aria-selected={sourceType === 'text'} className={`rounded-[9px] px-4 py-2 text-[13px] font-semibold transition ${sourceType === 'text' ? 'bg-white text-[#4f52ac] shadow-[0_2px_8px_rgba(50,52,110,.12)]' : 'text-[#778099] hover:text-[#36425e]'}`} data-testid="tab-paste-text">Paste study text</button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={source}
                      onChange={(event) => setSource(event.target.value.slice(0, 12000))}
                      placeholder={sourceType === 'topic' ? 'For example: How do volcanoes form?' : 'Paste a passage from your notes or textbook…'}
                      rows={sourceType === 'topic' ? 3 : 6}
                      maxLength={12000}
                      className="w-full resize-y rounded-2xl border border-[#e3e5f0] bg-[#f8f8fc] px-4 py-4 text-[15px] leading-6 text-[#26314e] outline-none transition placeholder:text-[#979db2] focus:border-[#6d70cf] focus:bg-white focus:ring-4 focus:ring-[#686bd1]/[.12]"
                      data-testid="input-lesson-source"
                      aria-label={sourceType === 'topic' ? 'Lesson topic' : 'Study text'}
                    />
                    {sourceType === 'text' && <div className="pointer-events-none absolute bottom-3 right-4 text-[10px] font-medium text-[#a3aaa5]">{source.length.toLocaleString()} / 12,000</div>}
                  </div>

                  <input
                    ref={scanInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleScanPhoto}
                    hidden
                    aria-label="Choose a study page photo"
                    data-testid="input-scan-photo"
                  />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => scanInputRef.current?.click()}
                      disabled={isScanning}
                      className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#edddd0] bg-[#fff8f2] px-3.5 py-2 text-xs font-bold text-[#ab6343] transition hover:border-[#e8c6ae] hover:bg-[#fff1e6] disabled:cursor-wait disabled:opacity-70"
                      data-testid="button-scan-photo"
                    >
                      {isScanning ? <LoaderCircle size={15} className="animate-spin" /> : <Camera size={15} />}
                      {isScanning ? 'Reading your page…' : 'Scan a page with your camera'}
                    </button>
                    <p className="text-[11px] leading-5 text-[#89938d]">
                      Take a photo or choose an image. We’ll extract the text for you to review; the photo isn’t saved.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1.35fr]">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.13em] text-[#6f7891]">School / study stage</span>
                      <span className="relative block">
                        <GraduationCap size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#559183]" />
                        <select value={learnerLevel} onChange={(event) => setLearnerLevel(event.target.value as LearnerLevel)} className="h-12 w-full appearance-none rounded-xl border border-[#e5e3d9] bg-[#fcfbf8] pl-10 pr-10 text-sm font-semibold text-[#394d4b] outline-none transition focus:border-[#6ca293] focus:ring-4 focus:ring-[#176e5c]/[.07]" data-testid="select-learner-level">
                          {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#929b95]" />
                      </span>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.13em] text-[#77827d]">Lesson language</span>
                      <select value={language} onChange={(event) => setLanguage(event.target.value as StudyLanguage)} className="h-12 w-full rounded-xl border border-[#e2e5ef] bg-[#f8f8fc] px-3 text-sm font-semibold text-[#34405c] outline-none focus:border-[#6d70cf] focus:ring-4 focus:ring-[#686bd1]/[.1]" data-testid="select-lesson-language">
                        {LESSON_LANGUAGES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <span className="mt-1.5 block text-[11px] leading-4 text-[#77827d]">Lesson text, captions, and AI voice. Your source can be in another language.</span>
                    </label>
                    <fieldset className="sm:col-span-2">
                      <legend className="mb-2 text-[11px] font-bold uppercase tracking-[.13em] text-[#77827d]">Lesson length</legend>
                      <div className="grid grid-cols-3 gap-2">
                        {durations.map((item) => (
                          <button key={item.value} type="button" onClick={() => setDuration(item.value)} aria-pressed={duration === item.value} className={`rounded-xl border px-2 py-2.5 text-center transition ${duration === item.value ? 'border-[#7476d6] bg-[#f0efff] text-[#4748a7] ring-2 ring-[#7476d6]/20' : 'border-[#e3e5ef] bg-[#f8f8fc] text-[#778099] hover:border-[#b9b9e7] hover:bg-white'}`} data-testid={`button-duration-${item.value}`}>
                            <span className="block text-[12px] font-bold">{item.label}</span>
                            <span className="mt-0.5 block text-[10px]">{item.note}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="mt-7 flex flex-col-reverse items-start justify-between gap-4 border-t border-[#efede6] pt-5 sm:flex-row sm:items-center">
                    <p className="flex items-center gap-2 text-[11px] leading-5 text-[#78829a]"><LockKeyhole size={13} className="shrink-0 text-[#6969c9]" /> Your notes stay yours. Nothing is saved until you make a lesson.</p>
                    <button type="submit" disabled={!source.trim() || isScanning} className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#355db8] via-[#5165c9] to-[#735bc2] px-5 py-3.5 text-sm font-bold text-white shadow-[0_9px_22px_rgba(77,87,177,.23)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_27px_rgba(77,87,177,.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#735bc2]/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:w-auto" data-testid="button-create-lesson">
                      <Sparkles size={16} /> Personalize my lesson <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </form>
              </section>
            )}

            {generateLesson.isPending && (
              <section className="animate-rise overflow-hidden rounded-[24px] border border-[#e7e2d7] bg-white p-6 shadow-[0_12px_35px_rgba(53,64,57,.045)] sm:p-9" aria-live="polite" data-testid="status-generating">
                <div className="grid gap-8 sm:grid-cols-[1fr_230px] sm:items-center">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#438678]"><Sparkles size={14} /> Building your lesson</div>
                    <h2 className="font-[Manrope] text-2xl font-extrabold tracking-[-.04em] text-[#263c3c]">Finding the thread that ties it all together.</h2>
                    <p className="mt-2 text-sm leading-6 text-[#788480]">We’re shaping your material into small, connected scenes. This usually takes a few seconds.</p>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#5c8a7e]"><LoaderCircle size={15} className="animate-spin" /> Thinking through the tricky bits</div>
                  </div>
                  <div className="space-y-3">
                    {[100, 77, 88, 55].map((width, i) => <div key={i} className="h-3 animate-pulse rounded-full bg-[#edf0e9]" style={{ width: `${width}%`, animationDelay: `${i * 120}ms` }} />)}
                    <div className="mt-5 h-20 rounded-2xl bg-[#f6f1df] animate-pulse" />
                  </div>
                </div>
              </section>
            )}

            {lesson && currentScene && (
              <section lang={lesson.language ?? 'en'} className="animate-rise overflow-hidden rounded-[24px] border border-[#e7e2d7] bg-white shadow-[0_12px_35px_rgba(53,64,57,.045)]" data-testid="panel-generated-lesson">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efede6] px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#478477]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#eaf3ee]"><Check size={15} /></span> Your video plan is ready</div>
                  <button onClick={startFresh} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#78827e] transition hover:bg-[#f5f4ef] hover:text-[#344844]" data-testid="button-start-another"><RotateCcw size={13} /> Start another</button>
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_285px]">
                  <div className="min-w-0 p-5 sm:p-7">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-[620px]">
                        <h2 className="font-[Manrope] text-[25px] font-extrabold leading-tight tracking-[-.045em] text-[#293c3d] sm:text-[30px]" data-testid="text-lesson-title">{lesson.title}</h2>
                        <p className="mt-1 text-xs font-semibold text-[#478477]" data-testid="text-lesson-language">Lesson language: {languageLabel(lesson.language)}</p>
                        <p className="mt-2 text-[13px] leading-6 text-[#74807b]" data-testid="text-lesson-overview">{lesson.overview}</p>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f5f2e8] px-3 py-1.5 text-[11px] font-semibold text-[#81754e]"><Clock3 size={13} /> About {lesson.estimatedMinutes} min</span>
                    </div>

                    {lesson.learningPlan && (
                      <details className="mb-4 rounded-xl border border-[#dce7dc] bg-[#f3f7f0] p-4 text-[13px] leading-6 text-[#52695d]" data-testid="panel-confirmed-learning-plan">
                        <summary className="cursor-pointer font-bold text-[#176e5c]">Your agreed learning plan</summary>
                        <h3 className="mt-3 font-bold">{lesson.learningPlan.topic}</h3>
                        <p className="mt-2">{lesson.learningPlan.startingPoint}</p>
                        <p className="mt-2">{lesson.learningPlan.teachingApproach}</p>
                        <ul className="mt-2 list-disc pl-5">{lesson.learningPlan.objectives.map((objective, i) => <li key={i}>{objective}</li>)}</ul>
                        <p className="mt-2 border-t border-[#dce7dc] pt-2">{lesson.learningPlan.scopeBoundary}</p>
                      </details>
                    )}
                    <LessonVideoPlayer
                      key={activeLessonId || lesson.title}
                      lesson={lesson}
                      sceneIndex={sceneIndex}
                      onSceneChange={setSceneIndex}
                    />

                    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-[#f8f7f2] px-3 py-2.5">
                      <span className="text-[11px] font-semibold text-[#697872]" aria-live="polite">Scene {sceneIndex + 1} of {lesson.scenes.length}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => advanceScene(-1)} aria-label="Previous scene" className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e3d9] bg-white text-[#48625b] transition hover:bg-[#edf3ee]" data-testid="button-previous-scene"><ArrowLeft size={15} /></button>
                        <button onClick={() => advanceScene(1)} aria-label="Next scene" className="grid h-9 w-9 place-items-center rounded-full bg-[#176e5c] text-white transition hover:bg-[#105b4b]" data-testid="button-next-scene"><ArrowRight size={15} /></button>
                      </div>
                    </div>

                    {currentScene.keyTerm && (
                      <div className="mt-4 flex gap-3 rounded-2xl border border-[#f0dfb3] bg-[#fbf6e8] p-4">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f3e7c8] text-[#a9822d]"><Lightbulb size={16} /></span>
                        <div><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a18545]">A word to keep</div><div className="mt-0.5 text-[14px] font-bold text-[#4d4a39]" data-testid="text-key-term">{currentScene.keyTerm}</div><p className="mt-1 text-[12px] leading-5 text-[#77715e]" data-testid="text-key-term-definition">{currentScene.keyTermDefinition}</p></div>
                      </div>
                    )}

                    <div className="mt-5 rounded-2xl border border-[#ece9e0] p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="font-[Manrope] text-[14px] font-extrabold tracking-[-.02em] text-[#344746]">The story, in words</h3>
                        <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 text-[10px] font-bold text-[#568477]">Scene {sceneIndex + 1} of {lesson.scenes.length}</span>
                      </div>
                      <p key={`narration-${sceneIndex}`} className="animate-rise text-[13px] leading-[1.8] text-[#65716c]" data-testid="text-scene-narration">{currentScene.narration}</p>
                    </div>
                    {lesson.learningGuide && <LessonLearningGuide key={activeLessonId || lesson.title} guide={lesson.learningGuide} />}
                  </div>

                  <aside className="border-t border-[#efede6] bg-[#faf9f5] p-5 lg:border-l lg:border-t-0 sm:p-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#77847d]"><Layers3 size={14} className="text-[#559183]" /> What you’ll remember</div>
                    <h3 className="mt-2 font-[Manrope] text-[17px] font-extrabold tracking-[-.035em] text-[#344746]">Key takeaways</h3>
                    <ol className="mt-4 space-y-3">
                      {lesson.keyTakeaways.map((takeaway, index) => (
                        <li key={`${takeaway}-${index}`} className="flex gap-3 rounded-xl bg-white p-3.5 shadow-[0_2px_8px_rgba(53,64,57,.035)]" data-testid={`item-takeaway-${index + 1}`}>
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#eaf3ee] text-[10px] font-bold text-[#418271]">{String(index + 1).padStart(2, '0')}</span>
                          <span className="text-[12px] leading-[1.65] text-[#5c6965]">{takeaway}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-6 rounded-2xl bg-[#e9efe8] p-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#3d7568]"><BookOpen size={15} /> Keep the curious going</div>
                      <p className="mt-1.5 text-[11px] leading-5 text-[#70827a]">Move through each scene at your own pace. The little details are where it clicks.</p>
                    </div>
                  </aside>
                </div>
              </section>
            )}

            {!lesson && !generateLesson.isPending && (
              <div className="mt-5 flex items-center gap-3 px-1 text-[11px] leading-5 text-[#8a938d]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f1ead6] text-[#a68943]"><CircleHelp size={15} /></span>
                <span>Not sure where to start? Try a question you’ve been meaning to ask, or paste the paragraph that isn’t clicking.</span>
              </div>
            )}
          </div>

          <aside className="animate-rise lg:sticky lg:top-[96px]" style={{ animationDelay: '80ms' }}>
            <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_18px_42px_rgba(47,57,94,.07)] ring-1 ring-[#e9eaf2]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8b938d]">Your little library</div>
                  <h2 className="mt-1 font-[Manrope] text-[18px] font-extrabold tracking-[-.035em] text-[#2c4040]">Recent lessons</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf3ee] text-[#518879]"><BookOpen size={17} /></span>
              </div>

              {savedLessons.length > 0 ? (
                <>
                  <div className="mt-4 flex items-center justify-between border-b border-[#f0eee8] pb-2 text-[10px] font-semibold text-[#a1a69e]">
                    <span>{savedLessons.length} saved {savedLessons.length === 1 ? 'lesson' : 'lessons'}</span>
                    <span className="flex items-center gap-1"><LockKeyhole size={10} /> This device</span>
                  </div>
                  <div className="lesson-scroll mt-2 max-h-[480px] space-y-1 overflow-y-auto pr-1">
                    {savedLessons.map((record) => (
                      <div key={record.id} className={`group flex items-center gap-1 rounded-xl pr-1 transition ${activeLessonId === record.id ? 'bg-[#edf4ef]' : 'hover:bg-[#f7f7f2]'}`}>
                        <button onClick={() => openSavedLesson(record)} className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-3 text-left" data-testid={`button-open-lesson-${record.id}`}>
                          <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${activeLessonId === record.id ? 'bg-[#d7e8dd] text-[#377766]' : 'bg-[#f4f0e3] text-[#ac8b37]'}`}><Play size={13} fill="currentColor" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-bold leading-5 text-[#465653]">{record.lesson.title}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#9aa19a]"><Clock3 size={10} /> {record.lesson.estimatedMinutes} min <span className="text-[#c1c4bc]">·</span> {new Date(record.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </span>
                        </button>
                        <button aria-label={`Remove ${record.lesson.title}`} onClick={(event) => removeSavedLesson(event, record.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#adb2ac] opacity-0 transition hover:bg-[#f8e9e3] hover:text-[#bd6f57] group-hover:opacity-100 group-focus-within:opacity-100" data-testid={`button-delete-lesson-${record.id}`}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl bg-[#f8f7f2] px-4 py-6 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-[15px] border border-[#e9e6db] bg-white text-[#a1ad9f]"><BookOpen size={18} /></span>
                  <h3 className="mt-3 text-[12px] font-bold text-[#53615c]">A shelf with room to grow</h3>
                  <p className="mx-auto mt-1.5 max-w-[210px] text-[11px] leading-5 text-[#929a94]">Your lessons will live here, ready whenever you need a refresher.</p>
                  {!lesson && <button onClick={() => document.querySelector<HTMLTextAreaElement>('[data-testid="input-lesson-source"]')?.focus()} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#438678] transition hover:text-[#176e5c]" data-testid="button-first-lesson"><Plus size={13} /> Make your first lesson <ArrowDown size={12} /></button>}
                </div>
              )}

              {savedLessons.length > 0 && <p className="mt-4 border-t border-[#f0eee8] pt-3 text-[10px] leading-4 text-[#9ba19b]">Saved in this browser only. Clear your browser data and they’ll be gone.</p>}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e7e3d8] bg-[#f0eee5] p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#a4873d]"><Lightbulb size={15} /></span>
              <p className="pt-0.5 text-[11px] leading-[1.6] text-[#7c8075]"><strong className="font-bold text-[#606c61]">A good study trick:</strong> Watch once for the big picture, then again to catch what you missed.</p>
            </div>
          </aside>
        </div>

        <section className="mt-12 border-t border-[#e3e5ef] pt-9 sm:mt-16 sm:pt-11" aria-labelledby="exam-library-heading">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#6567bf]">Choose a guided path</p>
            <h2 id="exam-library-heading" className="mt-1 font-[Manrope] text-[23px] font-extrabold tracking-[-.045em] text-[#202b46] sm:text-[28px]">Explore an exam syllabus</h2>
            <p className="mt-1.5 text-sm leading-6 text-[#69738a]">Start with a curated topic from your exam preparation.</p>
          </div>
          <ExamSyllabusLibrary
            onLearn={handleSyllabusLearn}
            busy={generateLesson.isPending}
            language={language}
            onLanguageChange={setLanguage}
            duration={duration}
            onDurationChange={setDuration}
            error={syllabusError}
          />
        </section>
      </main>

      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 items-start gap-3 rounded-2xl border border-[#ecd9c9] bg-[#fffaf3] px-4 py-3.5 text-[13px] text-[#795c47] shadow-[0_14px_35px_rgba(53,64,57,.16)]" data-testid="status-notice">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#d58a62]" /> <span className="flex-1">{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss message" className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[#9a826f] hover:bg-[#f6ece0]" data-testid="button-dismiss-notice"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
