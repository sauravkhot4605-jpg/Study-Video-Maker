import { useEffect, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { LessonVideoPlayer } from '@/components/lesson-video-player';
import { useGenerateStudyLesson } from '@workspace/api-client-react';
import type { StudyLesson, StudyLessonInput } from '@workspace/api-client-react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
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
  { value: 'short', label: 'Quick', note: '3–4 min' },
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

function Home() {
  const [sourceType, setSourceType] = useState<SourceType>('topic');
  const [source, setSource] = useState('');
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('middle');
  const [duration, setDuration] = useState<Duration>('standard');
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>(readSavedLessons);
  const [lesson, setLesson] = useState<StudyLesson | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const generateLesson = useGenerateStudyLesson();

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
  const saveLesson = (newLesson: StudyLesson) => {
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const record: SavedLesson = { id: newId, lesson: newLesson, savedAt: new Date().toISOString() };
    setSavedLessons((current) => [record, ...current.filter((item) => item.lesson.title !== newLesson.title)].slice(0, 24));
    setActiveLessonId(newId);
  };

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (source.trim().length < 3) {
      setNotice('Add a little more detail so the lesson has somewhere to begin.');
      return;
    }
    setNotice('');
    try {
      const result = await generateLesson.mutateAsync({
        data: { source: source.trim(), sourceType, learnerLevel, duration },
      });
      setLesson(result);
      setSceneIndex(0);
      saveLesson(result);
    } catch {
      setNotice('We could not make that lesson just now. Please try again in a moment.');
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
    <div className="min-h-[100dvh] bg-[#f6f4ed] text-[#263444]">
      <header className="sticky top-0 z-30 border-b border-[#e8e4d9] bg-[#f8f6f0]/90 backdrop-blur-xl">
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

      <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 sm:pt-11">
        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-[#e7eee7] px-6 py-7 sm:px-10 sm:py-9">
          <div className="pointer-events-none absolute -right-8 -top-24 h-[300px] w-[300px] rounded-full border border-[#bfd2c5]/70 sm:right-[12%]">
            <div className="absolute inset-8 rounded-full border border-[#bfd2c5]/70" />
            <div className="absolute inset-16 rounded-full border border-[#bfd2c5]/60" />
            <span className="absolute right-10 top-12 h-3 w-3 rounded-full bg-[#e88966]" />
            <span className="absolute bottom-9 left-14 h-2.5 w-2.5 rounded-full bg-[#d9a941]" />
          </div>
          <div className="relative z-10 max-w-[720px] animate-rise">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.19em] text-[#437769]">
              <Sparkles size={14} /> Your personal lesson studio
            </div>
            <h1 className="font-[Manrope] text-[34px] font-extrabold leading-[1.08] tracking-[-.055em] text-[#263c3c] sm:text-[46px]">
              Big topic. Little steps.<br className="hidden sm:block" /> <span className="text-[#39806e]">A lesson that sticks.</span>
            </h1>
            <p className="mt-3 max-w-[540px] text-[14px] leading-6 text-[#5e7470] sm:text-[15px]">
              Turn what you’re studying into a clear, captioned explainer you can watch and come back to.
            </p>
          </div>
          <div className="absolute bottom-6 right-8 hidden items-end gap-2 opacity-70 sm:flex" aria-hidden="true">
            <span className="h-11 w-8 rounded-t-[16px] bg-[#d2a740]" />
            <span className="h-[68px] w-8 rounded-t-[16px] bg-[#76a69a]" />
            <span className="h-[52px] w-8 rounded-t-[16px] bg-[#e88966]" />
            <span className="h-[82px] w-8 rounded-t-[16px] bg-[#93b4a5]" />
            <span className="mb-1 ml-1 text-[10px] font-semibold uppercase tracking-[.13em] text-[#6c8780]">one idea at a time</span>
          </div>
        </section>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-9">
          <div className="min-w-0">
            {!lesson && !generateLesson.isPending && (
              <section className="animate-rise rounded-[24px] border border-[#e7e2d7] bg-white p-5 shadow-[0_12px_35px_rgba(53,64,57,.045)] sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#438678]">Start with what you have</div>
                    <h2 className="font-[Manrope] text-[23px] font-extrabold tracking-[-.04em] text-[#273b3d] sm:text-[26px]">What are we learning today?</h2>
                    <p className="mt-1.5 text-sm text-[#7d8582]">A topic, a question, or the notes you already have.</p>
                  </div>
                  <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f8f0da] text-[#be9133] sm:grid"><Lightbulb size={22} /></span>
                </div>
                <form onSubmit={handleGenerate}>
                  <div className="mb-3 inline-flex rounded-xl bg-[#f3f4ee] p-1" role="tablist" aria-label="Choose a lesson source">
                    <button type="button" onClick={() => setSourceType('topic')} role="tab" aria-selected={sourceType === 'topic'} className={`rounded-[9px] px-4 py-2 text-[13px] font-semibold transition ${sourceType === 'topic' ? 'bg-white text-[#176e5c] shadow-sm' : 'text-[#78827e] hover:text-[#354b47]'}`} data-testid="tab-topic">A topic</button>
                    <button type="button" onClick={() => setSourceType('text')} role="tab" aria-selected={sourceType === 'text'} className={`rounded-[9px] px-4 py-2 text-[13px] font-semibold transition ${sourceType === 'text' ? 'bg-white text-[#176e5c] shadow-sm' : 'text-[#78827e] hover:text-[#354b47]'}`} data-testid="tab-paste-text">Paste study text</button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={source}
                      onChange={(event) => setSource(event.target.value.slice(0, 12000))}
                      placeholder={sourceType === 'topic' ? 'For example: How do volcanoes form?' : 'Paste a passage from your notes or textbook…'}
                      rows={sourceType === 'topic' ? 3 : 6}
                      maxLength={12000}
                      className="w-full resize-y rounded-2xl border border-[#e6e3d9] bg-[#fcfbf8] px-4 py-4 text-[15px] leading-6 text-[#283e3e] outline-none transition placeholder:text-[#a4aaa4] focus:border-[#6ca293] focus:bg-white focus:ring-4 focus:ring-[#176e5c]/[.07]"
                      data-testid="input-lesson-source"
                      aria-label={sourceType === 'topic' ? 'Lesson topic' : 'Study text'}
                    />
                    {sourceType === 'text' && <div className="pointer-events-none absolute bottom-3 right-4 text-[10px] font-medium text-[#a3aaa5]">{source.length.toLocaleString()} / 12,000</div>}
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_1.35fr]">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[.13em] text-[#77827d]">Explain it for</span>
                      <span className="relative block">
                        <GraduationCap size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#559183]" />
                        <select value={learnerLevel} onChange={(event) => setLearnerLevel(event.target.value as LearnerLevel)} className="h-12 w-full appearance-none rounded-xl border border-[#e5e3d9] bg-[#fcfbf8] pl-10 pr-10 text-sm font-semibold text-[#394d4b] outline-none transition focus:border-[#6ca293] focus:ring-4 focus:ring-[#176e5c]/[.07]" data-testid="select-learner-level">
                          {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#929b95]" />
                      </span>
                    </label>
                    <fieldset>
                      <legend className="mb-2 text-[11px] font-bold uppercase tracking-[.13em] text-[#77827d]">Lesson length</legend>
                      <div className="grid grid-cols-3 gap-2">
                        {durations.map((item) => (
                          <button key={item.value} type="button" onClick={() => setDuration(item.value)} aria-pressed={duration === item.value} className={`rounded-xl border px-2 py-2.5 text-center transition ${duration === item.value ? 'border-[#78aa9c] bg-[#eff6f0] text-[#176e5c] ring-1 ring-[#78aa9c]/50' : 'border-[#e5e3d9] bg-[#fcfbf8] text-[#737d78] hover:border-[#a8c7bd]'}`} data-testid={`button-duration-${item.value}`}>
                            <span className="block text-[12px] font-bold">{item.label}</span>
                            <span className="mt-0.5 block text-[10px]">{item.note}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="mt-7 flex flex-col-reverse items-start justify-between gap-4 border-t border-[#efede6] pt-5 sm:flex-row sm:items-center">
                    <p className="flex items-center gap-2 text-[11px] leading-5 text-[#8b938d]"><LockKeyhole size={13} className="shrink-0 text-[#62998b]" /> Your notes stay yours. Nothing is saved until you make a lesson.</p>
                    <button type="submit" disabled={!source.trim()} className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#176e5c] px-5 py-3.5 text-sm font-bold text-white shadow-[0_7px_15px_rgba(23,110,92,.17)] transition hover:-translate-y-0.5 hover:bg-[#105b4b] hover:shadow-[0_10px_18px_rgba(23,110,92,.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:w-auto" data-testid="button-create-lesson">
                      <Sparkles size={16} /> Create lesson video <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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
              <section className="animate-rise overflow-hidden rounded-[24px] border border-[#e7e2d7] bg-white shadow-[0_12px_35px_rgba(53,64,57,.045)]" data-testid="panel-generated-lesson">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efede6] px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#478477]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#eaf3ee]"><Check size={15} /></span> Your video plan is ready</div>
                  <button onClick={startFresh} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#78827e] transition hover:bg-[#f5f4ef] hover:text-[#344844]" data-testid="button-start-another"><RotateCcw size={13} /> Start another</button>
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_285px]">
                  <div className="min-w-0 p-5 sm:p-7">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-[620px]">
                        <h2 className="font-[Manrope] text-[25px] font-extrabold leading-tight tracking-[-.045em] text-[#293c3d] sm:text-[30px]" data-testid="text-lesson-title">{lesson.title}</h2>
                        <p className="mt-2 text-[13px] leading-6 text-[#74807b]" data-testid="text-lesson-overview">{lesson.overview}</p>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f5f2e8] px-3 py-1.5 text-[11px] font-semibold text-[#81754e]"><Clock3 size={13} /> About {lesson.estimatedMinutes} min</span>
                    </div>

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
            <div className="rounded-[22px] border border-[#e7e2d7] bg-white p-5 shadow-[0_12px_35px_rgba(53,64,57,.04)]">
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
