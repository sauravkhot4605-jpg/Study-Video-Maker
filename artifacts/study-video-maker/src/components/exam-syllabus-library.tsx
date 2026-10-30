import { useMemo, useState } from 'react';
import type { StudyLanguage, StudyLessonInput } from '@workspace/api-client-react';
import { ArrowRight, BookMarked, ChevronDown, ExternalLink, Info, LoaderCircle, Search, Sparkles, X } from 'lucide-react';
import { LESSON_LANGUAGES, languageLabel } from '@/lib/lesson-languages';
import { EXAM_SYLLABI, type SyllabusSelection } from '@/lib/syllabus/catalog';

type Duration = StudyLessonInput['duration'];

type Props = {
  onLearn: (selection: SyllabusSelection) => Promise<void>;
  busy: boolean;
  language: StudyLanguage;
  onLanguageChange: (language: StudyLanguage) => void;
  duration: Duration;
  onDurationChange: (duration: Duration) => void;
  error?: string;
};

const DURATIONS: { value: Duration; label: string; note: string }[] = [
  { value: 'short', label: 'Short', note: '3–4 min' },
  { value: 'standard', label: 'Standard', note: '6–8 min' },
  { value: 'detailed', label: 'Detailed', note: '10–12 min' },
];

const selectCls = 'h-11 w-full appearance-none rounded-xl border border-[#e5e3d9] bg-[#fcfbf8] pl-3 pr-9 text-sm font-semibold text-[#394d4b] outline-none transition focus:border-[#6ca293] focus:ring-4 focus:ring-[#176e5c]/[.07] disabled:cursor-not-allowed disabled:opacity-60';
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[.13em] text-[#77827d]';

export function ExamSyllabusLibrary({ onLearn, busy, language, onLanguageChange, duration, onDurationChange, error }: Props) {
  const [examId, setExamId] = useState(EXAM_SYLLABI[0].id);
  const [stageId, setStageId] = useState(EXAM_SYLLABI[0].stages[0].id);
  const [subjectId, setSubjectId] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const exam = EXAM_SYLLABI.find((e) => e.id === examId) ?? EXAM_SYLLABI[0];
  const stage = exam.stages.find((s) => s.id === stageId) ?? exam.stages[0];

  const totals = useMemo(() => {
    let subjects = 0, topics = 0;
    for (const e of EXAM_SYLLABI) for (const s of e.stages) { subjects += s.subjects.length; for (const sub of s.subjects) topics += sub.topics.length; }
    return { exams: EXAM_SYLLABI.length, subjects, topics };
  }, []);
  const examTopicCount = exam.stages.reduce((n, s) => n + s.subjects.reduce((m, sub) => m + sub.topics.length, 0), 0);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stage.subjects
      .filter((sub) => subjectId === 'all' || sub.id === subjectId)
      .map((sub) => ({ subject: sub, topics: sub.topics.filter((t) => !q || t.title.toLowerCase().includes(q) || sub.title.toLowerCase().includes(q)) }))
      .filter((g) => g.topics.length > 0);
  }, [stage, subjectId, query]);
  const matchCount = groups.reduce((n, g) => n + g.topics.length, 0);

  const selection: SyllabusSelection | null = useMemo(() => {
    if (!selectedKey) return null;
    const [sid, tid] = selectedKey.split('::');
    const sub = stage.subjects.find((s) => s.id === sid);
    const topic = sub?.topics.find((t) => t.id === tid);
    return sub && topic ? { exam, stage, subject: sub, topic } : null;
  }, [selectedKey, exam, stage]);

  const chooseExam = (id: string) => {
    const next = EXAM_SYLLABI.find((e) => e.id === id);
    if (!next || busy) return;
    setExamId(id); setStageId(next.stages[0].id); setSubjectId('all'); setSelectedKey(null); setQuery('');
  };
  const chooseStage = (id: string) => { setStageId(id); setSubjectId('all'); setSelectedKey(null); };
  const chooseSubject = (id: string) => {
    setSubjectId(id);
    if (selectedKey && id !== 'all' && !selectedKey.startsWith(`${id}::`)) setSelectedKey(null);
  };
  const resetFilters = () => { setQuery(''); setSubjectId('all'); };

  const create = () => { if (selection && !busy) void onLearn(selection); };
  const durationLabel = DURATIONS.find((d) => d.value === duration);

  return (
    <section className="mb-8 animate-rise rounded-[24px] border border-[#e7e2d7] bg-white p-5 shadow-[0_12px_35px_rgba(53,64,57,.045)] sm:p-7" aria-labelledby="syllabus-heading" data-testid="panel-exam-syllabus">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#438678]"><BookMarked size={14} /> Exam syllabus library</div>
          <h2 id="syllabus-heading" className="font-[Manrope] text-[22px] font-extrabold tracking-[-.04em] text-[#273b3d] sm:text-[25px]">Pick a topic, get a lesson video</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-[#7d8582]" data-testid="text-syllabus-summary">
            Core-topic study guide · {totals.exams} exams, {totals.subjects} subject groups, {totals.topics} curated topics. Not an exhaustive or live-verified official syllabus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose an exam">
        {EXAM_SYLLABI.map((e) => {
          const active = e.id === exam.id;
          return (
            <button key={e.id} type="button" onClick={() => chooseExam(e.id)} disabled={busy} aria-pressed={active}
              className={`rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${active ? 'border-[#78aa9c] bg-[#eff6f0] ring-1 ring-[#78aa9c]/50' : 'border-[#e5e3d9] bg-[#fcfbf8] hover:border-[#a8c7bd]'}`}
              data-testid={`button-exam-${e.id}`}>
              <span className={`block font-[Manrope] text-[15px] font-extrabold ${active ? 'text-[#176e5c]' : 'text-[#394d4b]'}`}>{e.title}</span>
              <span className="mt-0.5 block truncate text-[10.5px] text-[#7d8582]">{e.subtitle}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[12px] leading-5 text-[#65716c]"><span className="font-semibold text-[#3d5a54]">{exam.title}:</span> {exam.scope} <span className="text-[#8b938d]">({exam.stages.length} stages · {examTopicCount} topics here)</span></p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1.3fr]">
        <label className="block">
          <span className={labelCls}>Stage</span>
          <span className="relative block">
            <select value={stage.id} onChange={(ev) => chooseStage(ev.target.value)} className={selectCls} data-testid="select-syllabus-stage">
              {exam.stages.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#929b95]" />
          </span>
        </label>
        <label className="block">
          <span className={labelCls}>Subject</span>
          <span className="relative block">
            <select value={subjectId} onChange={(ev) => chooseSubject(ev.target.value)} className={selectCls} data-testid="select-syllabus-subject">
              <option value="all">All subjects ({stage.subjects.length})</option>
              {stage.subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#929b95]" />
          </span>
        </label>
        <label className="block">
          <span className={labelCls}>Search topics in {stage.title}</span>
          <span className="relative block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#559183]" />
            <input type="search" value={query} onChange={(ev) => setQuery(ev.target.value)} placeholder="e.g. interest, rivers, syllogisms"
              className="h-11 w-full rounded-xl border border-[#e5e3d9] bg-[#fcfbf8] pl-9 pr-3 text-sm text-[#394d4b] outline-none placeholder:text-[#a4aaa4] focus:border-[#6ca293] focus:ring-4 focus:ring-[#176e5c]/[.07]"
              data-testid="input-syllabus-search" />
          </span>
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#7d8582]">
        <span aria-live="polite" data-testid="text-syllabus-match-count">{matchCount} topic{matchCount === 1 ? '' : 's'} shown</span>
        {(query || subjectId !== 'all') && <button type="button" onClick={resetFilters} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[#438678] hover:bg-[#f0f5f0]" data-testid="button-syllabus-reset-filters"><X size={12} /> Clear filters</button>}
      </div>

      <div className="mt-2 max-h-[340px] overflow-y-auto rounded-2xl border border-[#ece9e0] bg-[#faf9f5] p-2" role="list" aria-label="Topics">
        {groups.length === 0 ? (
          <div className="px-4 py-8 text-center" data-testid="status-syllabus-empty">
            <p className="text-sm font-semibold text-[#3d5a54]">No topics match “{query.trim()}” in {stage.title}{subjectId !== 'all' ? ' for this subject' : ''}.</p>
            <p className="mt-1 text-[12px] text-[#7d8582]">Try a shorter word, another stage, or type your own topic in the lesson box above.</p>
            <button type="button" onClick={resetFilters} className="mt-3 rounded-lg border border-[#cfe0d4] bg-white px-3 py-1.5 text-xs font-bold text-[#317665] hover:bg-[#eef5ef]" data-testid="button-syllabus-reset-search">Reset search</button>
          </div>
        ) : groups.map((g) => (
          <div key={g.subject.id} className="mb-2 last:mb-0" role="listitem">
            <div className="sticky top-0 z-10 bg-[#faf9f5] px-2 py-1.5 text-[10.5px] font-bold uppercase tracking-[.12em] text-[#6c8780]">{g.subject.title}</div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {g.topics.map((t) => {
                const key = `${g.subject.id}::${t.id}`;
                const active = key === selectedKey;
                return (
                  <button key={key} type="button" onClick={() => setSelectedKey(key)} aria-pressed={active}
                    className={`rounded-xl border px-3 py-2 text-left text-[13px] leading-5 transition ${active ? 'border-[#78aa9c] bg-[#eff6f0] font-semibold text-[#176e5c]' : 'border-transparent bg-white text-[#4d5f5b] hover:border-[#cfe0d4]'}`}
                    data-testid={`button-syllabus-topic-${t.id}`}>
                    {t.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Lesson language</span>
          <span className="relative block">
            <select value={language} disabled={busy} onChange={(ev) => onLanguageChange(ev.target.value as StudyLanguage)} className={selectCls} data-testid="select-syllabus-language">
              {LESSON_LANGUAGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#929b95]" />
          </span>
        </label>
        <label className="block">
          <span className={labelCls}>Lesson length</span>
          <span className="relative block">
            <select value={duration} disabled={busy} onChange={(ev) => onDurationChange(ev.target.value as Duration)} className={selectCls} data-testid="select-syllabus-duration">
              {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label} · {d.note}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#929b95]" />
          </span>
        </label>
      </div>

      <div className="mt-4 rounded-2xl bg-[#e9efe8] p-4">
        {selection ? (
          <div data-testid="text-syllabus-selection">
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5c8a7e]">{selection.exam.title} · {selection.stage.title} · {selection.subject.title}</div>
            <div className="mt-1 font-[Manrope] text-[16px] font-extrabold tracking-[-.02em] text-[#263c3c]">{selection.topic.title}</div>
          </div>
        ) : <p className="text-[13px] text-[#5e7470]">Select a topic above to create its lesson.</p>}
        <p className="mt-1.5 text-[11.5px] text-[#5e7470]" data-testid="text-syllabus-settings">{languageLabel(language)} · {durationLabel?.label} ({durationLabel?.note})</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-5 text-[#70827a]">AI lesson generation and narration use credits, just like other lessons.</p>
          <button type="button" onClick={create} disabled={!selection || busy}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176e5c] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_15px_rgba(23,110,92,.17)] transition hover:bg-[#105b4b] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            data-testid="button-syllabus-create">
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />} Create video lesson <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        {busy && <p role="status" aria-live="polite" className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#3d7568]" data-testid="status-syllabus-generating"><LoaderCircle size={14} className="animate-spin" /> Creating your lesson video…</p>}
        {error && <p role="alert" className="mt-3 rounded-lg border border-[#f0c9b8] bg-[#fcefe8] px-3 py-2 text-xs font-semibold text-[#9a4b2c]" data-testid="error-syllabus-generation">{error}</p>}
      </div>

      <div className="mt-4 flex gap-2.5 text-[11px] leading-5 text-[#7d8582]">
        <Info size={14} className="mt-0.5 shrink-0 text-[#a68943]" />
        <p data-testid="text-syllabus-note">{exam.note}{' '}
          <a href={exam.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#317665] underline underline-offset-2" data-testid="link-syllabus-source">{exam.sourceLabel} <ExternalLink size={11} /></a>
        </p>
      </div>
    </section>
  );
}
