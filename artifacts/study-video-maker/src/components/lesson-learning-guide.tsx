import { useState, type ReactNode } from 'react';
import type { StudyLearningGuide } from '@workspace/api-client-react';
import { AlertTriangle, ChevronDown, Compass, Eye, EyeOff, Lightbulb, ListChecks, PencilLine, Route, Target } from 'lucide-react';

type SectionKey = 'objectives' | 'prerequisites' | 'why-it-works' | 'worked-example' | 'misconceptions' | 'practice';

function Section({
  id, testId, title, eyebrow, icon, open, onToggle, children, count,
}: {
  id: SectionKey; testId: string; title: string; eyebrow: string; icon: ReactNode;
  open: boolean; onToggle: () => void; children: ReactNode; count?: string;
}) {
  const panelId = `guide-panel-${id}`;
  return (
    <section className="rounded-2xl border border-[#ece9e0] bg-white" data-testid={testId}>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? 'Hide' : 'Show'} ${title}`}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-[#fbfaf6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176e5c]/[.12] sm:px-5"
          data-testid={`button-guide-${id}`}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#eaf3ee] text-[#418271]">{icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#7f8b86]">{eyebrow}</span>
            <span className="block font-[Manrope] text-[15px] font-extrabold tracking-[-.02em] text-[#344746]">{title}</span>
          </span>
          {count && <span className="hidden rounded-full bg-[#f5f2e8] px-2.5 py-1 text-[10px] font-bold text-[#81754e] sm:inline">{count}</span>}
          <ChevronDown size={17} className={`shrink-0 text-[#7d8a85] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      {open && (
        <div id={panelId} className="animate-rise border-t border-[#f0eee7] px-4 pb-5 pt-4 sm:px-5">
          {children}
        </div>
      )}
    </section>
  );
}

function PracticeCard({ q, index }: { q: StudyLearningGuide['practiceQuestions'][number]; index: number }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const n = index + 1;
  return (
    <li className="rounded-xl border border-[#ece9e0] bg-[#fcfbf8] p-4" data-testid={`card-practice-${index}`}>
      <div className="flex gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#176e5c] text-[10px] font-bold text-white">{n}</span>
        <p className="text-[14px] font-semibold leading-[1.7] text-[#2f4241]" data-testid={`text-practice-question-${index}`}>{q.question}</p>
      </div>
      <p className="mt-2 pl-9 text-[11px] leading-5 text-[#89938d]">Work it out on paper or in your head first.</p>
      <div className="mt-3 flex flex-wrap gap-2 pl-9">
        <button
          type="button"
          onClick={() => setShowHint((v) => !v)}
          aria-expanded={showHint}
          aria-controls={`practice-hint-${index}`}
          aria-label={`${showHint ? 'Hide' : 'Show'} hint for question ${n}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#f0dfb3] bg-[#fbf6e8] px-3 text-xs font-bold text-[#8c6d26] transition hover:bg-[#f7eed6]"
          data-testid={`button-practice-hint-${index}`}
        >
          <Lightbulb size={13} /> {showHint ? 'Hide hint' : 'Show hint'}
        </button>
        <button
          type="button"
          onClick={() => setShowAnswer((v) => !v)}
          aria-expanded={showAnswer}
          aria-controls={`practice-answer-${index}`}
          aria-label={`${showAnswer ? 'Hide' : 'Reveal'} answer for question ${n}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#cfe0d4] bg-[#f3f8f3] px-3 text-xs font-bold text-[#317665] transition hover:bg-[#eaf3eb]"
          data-testid={`button-practice-answer-${index}`}
        >
          {showAnswer ? <EyeOff size={13} /> : <Eye size={13} />} {showAnswer ? 'Hide answer' : 'Reveal answer'}
        </button>
      </div>
      {showHint && (
        <div id={`practice-hint-${index}`} className="animate-rise ml-9 mt-3 rounded-lg bg-[#fbf6e8] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a18545]">Hint</div>
          <p className="mt-1 text-[13px] leading-[1.7] text-[#5f5a45]" data-testid={`text-practice-hint-${index}`}>{q.hint}</p>
        </div>
      )}
      {showAnswer && (
        <div id={`practice-answer-${index}`} className="animate-rise ml-9 mt-3 rounded-lg border-l-[3px] border-[#5f9e8d] bg-[#f1f7f2] p-3">
          <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#478477]">Answer</div>
          <p className="mt-1 text-[14px] font-semibold leading-[1.7] text-[#2f4a43]" data-testid={`text-practice-answer-${index}`}>{q.answer}</p>
          <div className="mt-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#478477]">Why this is right</div>
          <p className="mt-1 text-[13px] leading-[1.75] text-[#5c6965]" data-testid={`text-practice-explanation-${index}`}>{q.explanation}</p>
        </div>
      )}
    </li>
  );
}

export function LessonLearningGuide({ guide }: { guide: StudyLearningGuide }) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    objectives: true,
    prerequisites: false,
    'why-it-works': true,
    'worked-example': false,
    misconceptions: false,
    practice: false,
  });
  const [showSolution, setShowSolution] = useState(false);
  const toggle = (key: SectionKey) => setOpen((s) => ({ ...s, [key]: !s[key] }));
  const allOpen = Object.values(open).every(Boolean);
  const setAll = (value: boolean) => setOpen({ objectives: value, prerequisites: value, 'why-it-works': value, 'worked-example': value, misconceptions: value, practice: value });
  const ex = guide.workedExample;

  return (
    <div className="mt-6 rounded-[22px] bg-[#f3f6f0] p-3 sm:p-4" data-testid="panel-learning-guide">
      <div className="flex flex-wrap items-end justify-between gap-3 px-2 pb-4 pt-2">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#478477]"><Compass size={13} /> Beyond the video</div>
          <h2 className="mt-1 font-[Manrope] text-[20px] font-extrabold tracking-[-.04em] text-[#293c3d]">Understand it, then try it</h2>
          <p className="mt-1 max-w-[520px] text-[12px] leading-5 text-[#74807b]">Why the idea works, one example reasoned step by step, and a few questions to check yourself.</p>
        </div>
        <button type="button" onClick={() => setAll(!allOpen)} className="rounded-lg px-2.5 py-2 text-xs font-semibold text-[#5c7a72] transition hover:bg-white" data-testid="button-guide-toggle-all">
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="space-y-2.5">
        <Section id="objectives" testId="section-learning-objectives" eyebrow="By the end" title="What you will be able to do" icon={<Target size={16} />} open={open.objectives} onToggle={() => toggle('objectives')} count={`${guide.learningObjectives.length} goals`}>
          <ul className="space-y-2.5">
            {guide.learningObjectives.map((item, i) => (
              <li key={`obj-${i}`} className="flex gap-3 text-[14px] leading-[1.7] text-[#4c5c58]" data-testid={`text-objective-${i}`}>
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5f9e8d]" />{item}
              </li>
            ))}
          </ul>
        </Section>

        {guide.prerequisites.length > 0 && (
          <Section id="prerequisites" testId="section-prerequisites" eyebrow="Quick refresher" title="Things worth remembering first" icon={<ListChecks size={16} />} open={open.prerequisites} onToggle={() => toggle('prerequisites')} count={`${guide.prerequisites.length}`}>
            <ul className="space-y-2">
              {guide.prerequisites.map((item, i) => (
                <li key={`pre-${i}`} className="rounded-xl bg-[#faf9f5] px-3.5 py-2.5 text-[13px] leading-[1.7] text-[#5c6965]" data-testid={`text-prerequisite-${i}`}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section id="why-it-works" testId="section-why-it-works" eyebrow="The reasoning" title="Why it works" icon={<Route size={16} />} open={open['why-it-works']} onToggle={() => toggle('why-it-works')}>
          <ol className="relative space-y-4 border-l-2 border-[#d9e7dd] pl-5">
            {guide.whyItWorks.map((item, i) => (
              <li key={`why-${i}`} className="relative" data-testid={`text-why-${i}`}>
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#5f9e8d]" />
                <p className="text-[14px] leading-[1.8] text-[#4c5c58]">{item}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="worked-example" testId="section-worked-example" eyebrow="Watch it in action" title="Worked example" icon={<PencilLine size={16} />} open={open['worked-example']} onToggle={() => toggle('worked-example')} count={`${ex.steps.length} steps`}>
          <div className="rounded-xl bg-[#fbf6e8] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#a18545]">The problem</div>
            <p className="mt-1 text-[14px] font-semibold leading-[1.7] text-[#4d4a39]" data-testid="text-worked-question">{ex.question}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSolution((v) => !v)}
            aria-expanded={showSolution}
            aria-controls="worked-solution"
            aria-label={`${showSolution ? 'Hide' : 'Show'} worked solution`}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#176e5c] px-4 text-xs font-bold text-white transition hover:bg-[#105b4b]"
            data-testid="button-worked-solution"
          >
            {showSolution ? <EyeOff size={14} /> : <Eye size={14} />} {showSolution ? 'Hide solution' : 'Try it first, then show solution'}
          </button>
          {showSolution && (
            <div id="worked-solution" className="animate-rise mt-4">
              <ol className="space-y-3">
                {ex.steps.map((step, i) => (
                  <li key={`step-${i}`} className="rounded-xl border border-[#ece9e0] p-3.5" data-testid={`item-worked-step-${i}`}>
                    <div className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#eaf3ee] text-[10px] font-bold text-[#418271]">{String(i + 1).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold leading-[1.7] text-[#344746]" data-testid={`text-worked-action-${i}`}>{step.action}</p>
                        <p className="mt-1.5 text-[13px] leading-[1.75] text-[#65716c]" data-testid={`text-worked-reason-${i}`}>
                          <span className="mr-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#478477]">Why</span>{step.reason}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-3 rounded-xl border-l-[3px] border-[#5f9e8d] bg-[#f1f7f2] p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#478477]">Answer</div>
                <p className="mt-1 text-[14px] font-semibold leading-[1.7] text-[#2f4a43]" data-testid="text-worked-answer">{ex.answer}</p>
              </div>
            </div>
          )}
        </Section>

        <Section id="misconceptions" testId="section-misconceptions" eyebrow="Watch out" title="Common mix-ups" icon={<AlertTriangle size={16} />} open={open.misconceptions} onToggle={() => toggle('misconceptions')} count={`${guide.misconceptions.length}`}>
          <ul className="space-y-3">
            {guide.misconceptions.map((m, i) => (
              <li key={`mis-${i}`} className="overflow-hidden rounded-xl border border-[#ece9e0]" data-testid={`item-misconception-${i}`}>
                <div className="bg-[#fcf1ec] px-3.5 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#b5684b]">It is tempting to think</div>
                  <p className="mt-1 text-[13px] leading-[1.7] text-[#6b4e43]" data-testid={`text-misconception-mistake-${i}`}>{m.mistake}</p>
                </div>
                <div className="px-3.5 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#478477]">What is actually true</div>
                  <p className="mt-1 text-[13px] leading-[1.75] text-[#4c5c58]" data-testid={`text-misconception-correction-${i}`}>{m.correction}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="practice" testId="section-practice-questions" eyebrow="Check yourself" title="Practice questions" icon={<PencilLine size={16} />} open={open.practice} onToggle={() => toggle('practice')} count={`${guide.practiceQuestions.length} questions`}>
          <p className="mb-3 text-[12px] leading-5 text-[#74807b]">Answers stay hidden until you ask. Compare your own reasoning with the explanation.</p>
          <ol className="space-y-3">
            {guide.practiceQuestions.map((q, i) => <PracticeCard key={`pq-${i}`} q={q} index={i} />)}
          </ol>
        </Section>
      </div>
    </div>
  );
}
