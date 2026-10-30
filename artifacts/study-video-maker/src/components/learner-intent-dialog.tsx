import { useRef, useState } from 'react';
import { usePlanStudyLesson } from '@workspace/api-client-react';
import type {
  StudyLearningPlan,
  StudyLearningProfile,
  StudyLearningProfileGoal,
  StudyLearningProfileKnowledge,
  StudyLessonInput,
} from '@workspace/api-client-react';
import { ArrowRight, Check, ChevronDown, Compass, LoaderCircle, PencilLine, RotateCcw, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

type Props = {
  input: StudyLessonInput;
  initialError?: string;
  onCancel: () => void;
  onConfirm: (input: StudyLessonInput) => Promise<void>;
};

const GOALS: { value: StudyLearningProfileGoal; label: string }[] = [
  { value: 'foundations', label: 'Start from basics' },
  { value: 'clarify', label: 'Understand a difficult part' },
  { value: 'exam', label: 'Prepare for exam questions' },
  { value: 'application', label: 'Use it to solve problems' },
];

const KNOWLEDGE: { value: StudyLearningProfileKnowledge; label: string }[] = [
  { value: 'new', label: 'New to this topic' },
  { value: 'some', label: 'Know the basics' },
  { value: 'confident', label: 'Comfortable with the basics' },
];

const MAX_TEXT = 1500;
const MAX_ANSWER = 650;
const MAX_CLARIFICATION = 2000;

const fieldLabel = 'mb-2 block text-[11px] font-bold uppercase tracking-[.13em] text-[#77827d]';
const control = 'w-full rounded-xl border border-[#e5e3d9] bg-[#fcfbf8] text-sm text-[#394d4b] outline-none transition focus:border-[#6ca293] focus:bg-white focus:ring-4 focus:ring-[#176e5c]/[.07] disabled:opacity-60';

function errorMessage(cause: unknown): string {
  const data = cause && typeof cause === 'object' && 'data' in cause ? (cause as { data?: { error?: unknown } }).data : undefined;
  if (typeof data?.error === 'string') return data.error;
  return 'We could not build a learning plan just now. Your answers are kept — please try again.';
}

function combineClarification(history: string, question: string, answer: string): string {
  const entry = `Q: ${question.trim()}\nA: ${answer.trim()}`;
  const combined = history ? `${history}\n\n${entry}` : entry;
  // Keep the most recent context if it overflows.
  return combined.length > MAX_CLARIFICATION ? combined.slice(combined.length - MAX_CLARIFICATION) : combined;
}

export function LearnerIntentDialog({ input, initialError, onCancel, onConfirm }: Props) {
  const [goal, setGoal] = useState<StudyLearningProfileGoal | ''>(input.learningProfile?.goal ?? '');
  const [knowledge, setKnowledge] = useState<StudyLearningProfileKnowledge | ''>(input.learningProfile?.knowledge ?? '');
  const [focus, setFocus] = useState(input.learningProfile?.focus ?? '');
  const [known, setKnown] = useState(input.learningProfile?.known ?? '');
  const [plan, setPlan] = useState<StudyLearningPlan | null>(input.learningProfile && input.confirmedPlan && !input.confirmedPlan.needsClarification ? input.confirmedPlan : null);
  const [history, setHistory] = useState(input.clarification ?? '');
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [confirming, setConfirming] = useState(false);
  const confirmLock = useRef(false);
  const planRequestId = useRef(0);
  const planLesson = usePlanStudyLesson();

  const pending = planLesson.isPending;
  const busy = pending || confirming;
  const stage: 'needs' | 'clarify' | 'ready' = !plan ? 'needs' : plan.needsClarification ? 'clarify' : 'ready';

  const invalidate = () => {
    planRequestId.current += 1;
    setPlan(null);
    setHistory('');
    setAnswer('');
    setAnswerError('');
    setError('');
  };

  const buildProfile = (): StudyLearningProfile | null => {
    if (!goal || !knowledge) return null;
    const profile: StudyLearningProfile = { goal, knowledge };
    if (focus.trim()) profile.focus = focus.trim().slice(0, MAX_TEXT);
    if (known.trim()) profile.known = known.trim().slice(0, MAX_TEXT);
    return profile;
  };

  const requestPlan = async (clarification: string) => {
    const learningProfile = buildProfile();
    if (!learningProfile || pending) return;
    setError('');
    const requestId = ++planRequestId.current;
    try {
      const result = await planLesson.mutateAsync({
        data: { ...input, learningProfile, clarification, confirmedPlan: undefined },
      });
      if (requestId !== planRequestId.current) return;
      setHistory(clarification);
      setAnswer('');
      setPlan(result);
    } catch (cause) {
      if (requestId !== planRequestId.current) return;
      setError(errorMessage(cause));
    }
  };

  const handleBuild = () => {
    if (!goal || !knowledge) return;
    void requestPlan('');
  };

  const handleUpdate = () => {
    if (!plan?.needsClarification) return;
    if (!answer.trim()) {
      setAnswerError('Add a short answer so the plan can be updated.');
      return;
    }
    setAnswerError('');
    void requestPlan(combineClarification(history, plan.clarifyingQuestion ?? '', answer));
  };

  const handleConfirm = async () => {
    const learningProfile = buildProfile();
    if (!plan || plan.needsClarification || plan.interpretations.length !== 1 || !learningProfile || confirmLock.current) return;
    confirmLock.current = true;
    setConfirming(true);
    setError('');
    try {
      await onConfirm({
        ...input,
        learningProfile,
        clarification: history,
        confirmedPlan: plan,
      });
    } catch {
      setError('We could not start this lesson. Your plan is still here — please try again.');
    } finally {
      confirmLock.current = false;
      setConfirming(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !confirming) onCancel(); }}>
      <DialogContent
        className="max-h-[85dvh] w-[calc(100vw-24px)] max-w-[560px] gap-0 overflow-y-auto rounded-[24px] border-[#e7e2d7] bg-[#fbfaf5] p-0 text-[#263444] shadow-[0_24px_60px_rgba(38,52,68,.18)] sm:rounded-[24px]"
        data-testid="dialog-learner-intent"
      >
        <div className="border-b border-[#ece8dd] bg-[#e7eee7] px-5 pb-5 pt-6 sm:px-7">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#437769]">
            <Compass size={14} /> Before we teach
          </div>
          <DialogTitle className="pr-6 font-[Manrope] text-[22px] font-extrabold leading-tight tracking-[-.04em] text-[#263c3c]">
            {stage === 'ready' ? 'Does this plan fit you?' : stage === 'clarify' ? 'One quick question' : 'Tell us where you are'}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-[13px] leading-5 text-[#5e7470]">
            Your study stage sets the tone, not what you already know. A short AI planning step shapes the lesson — nothing is generated until you confirm.
          </DialogDescription>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-7">
          {stage === 'needs' && (
            <>
              <label className="block">
                <span className={fieldLabel}>What do you want from this lesson? <span className="text-[#c0613f]">*</span></span>
                <span className="relative block">
                  <select
                    required
                    aria-required="true"
                    value={goal}
                    disabled={pending}
                    onChange={(e) => { setGoal(e.target.value as StudyLearningProfileGoal); invalidate(); }}
                    className={`${control} h-12 appearance-none pl-3.5 pr-10 font-semibold`}
                    data-testid="select-learning-goal"
                  >
                    <option value="" disabled>Choose a goal…</option>
                    {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#929b95]" />
                </span>
              </label>

              <label className="block">
                <span className={fieldLabel}>How well do you know this topic? <span className="text-[#c0613f]">*</span></span>
                <span className="relative block">
                  <select
                    required
                    aria-required="true"
                    value={knowledge}
                    disabled={pending}
                    onChange={(e) => { setKnowledge(e.target.value as StudyLearningProfileKnowledge); invalidate(); }}
                    className={`${control} h-12 appearance-none pl-3.5 pr-10 font-semibold`}
                    data-testid="select-topic-knowledge"
                  >
                    <option value="" disabled>Choose your starting point…</option>
                    {KNOWLEDGE.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#929b95]" />
                </span>
              </label>

              <label className="block">
                <span className={fieldLabel}>Anything specific? <span className="normal-case tracking-normal font-medium text-[#9aa29d]">optional</span></span>
                <textarea
                  value={focus}
                  disabled={pending}
                  maxLength={MAX_TEXT}
                  rows={3}
                  onChange={(e) => { setFocus(e.target.value.slice(0, MAX_TEXT)); invalidate(); }}
                  placeholder="What do you want to be able to do, or what confuses you?"
                  className={`${control} resize-y px-3.5 py-3 leading-6 placeholder:text-[#a4aaa4]`}
                  data-testid="input-learning-focus"
                />
                <span className="mt-1 block text-right text-[10px] text-[#a3aaa5]">{focus.length} / {MAX_TEXT}</span>
              </label>

              <label className="block">
                <span className={fieldLabel}>What do you already understand? <span className="normal-case tracking-normal font-medium text-[#9aa29d]">optional</span></span>
                <textarea
                  value={known}
                  disabled={pending}
                  maxLength={MAX_TEXT}
                  rows={3}
                  onChange={(e) => { setKnown(e.target.value.slice(0, MAX_TEXT)); invalidate(); }}
                  placeholder="What makes sense already, and where do you get stuck?"
                  className={`${control} resize-y px-3.5 py-3 leading-6 placeholder:text-[#a4aaa4]`}
                  data-testid="input-prior-knowledge"
                />
                <span className="mt-1 block text-right text-[10px] text-[#a3aaa5]">{known.length} / {MAX_TEXT}</span>
              </label>
            </>
          )}

          {stage === 'clarify' && plan && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#f0dfb3] bg-[#fbf6e8] p-4 text-[14px] font-semibold leading-6 text-[#4d4a39]" data-testid="text-clarifying-question">
                {plan.clarifyingQuestion || 'Could you say a little more about what you need?'}
              </div>
              <label className="block">
                <span className={fieldLabel}>Your answer <span className="text-[#c0613f]">*</span></span>
                <textarea
                  value={answer}
                  disabled={pending}
                  maxLength={MAX_ANSWER}
                  rows={3}
                  aria-invalid={!!answerError}
                  onChange={(e) => { setAnswer(e.target.value.slice(0, MAX_ANSWER)); setAnswerError(''); }}
                  className={`${control} resize-y px-3.5 py-3 leading-6`}
                  data-testid="input-plan-clarification"
                />
                <span className="mt-1 flex justify-between text-[10px]">
                  <span className="text-[#b5553a]" role="alert">{answerError}</span>
                  <span className="text-[#a3aaa5]">{answer.length} / {MAX_ANSWER}</span>
                </span>
              </label>
            </div>
          )}

          {stage === 'ready' && plan && (
            <div className="animate-rise space-y-4" data-testid="panel-learning-plan">
              <div>
                <div className={fieldLabel}>We understood the topic as</div>
                <p className="font-[Manrope] text-[18px] font-extrabold tracking-[-.03em] text-[#273b3d]" data-testid="text-plan-topic">{plan.topic}</p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(53,64,57,.04)]">
                  <div className={fieldLabel}>Starting point</div>
                  <p className="text-[13px] leading-6 text-[#5e6d68]" data-testid="text-plan-starting-point">{plan.startingPoint}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(53,64,57,.04)]">
                  <div className={fieldLabel}>How we’ll teach it</div>
                  <p className="text-[13px] leading-6 text-[#5e6d68]" data-testid="text-plan-approach">{plan.teachingApproach}</p>
                </div>
              </div>
              {plan.objectives.length > 0 && (
                <div>
                  <div className={fieldLabel}>By the end you should be able to</div>
                  <ul className="space-y-2">
                    {plan.objectives.map((objective, i) => (
                      <li key={`${objective}-${i}`} className="flex gap-2.5 text-[13px] leading-5 text-[#43544f]" data-testid={`text-plan-objective-${i + 1}`}>
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eaf3ee] text-[#176e5c]"><Check size={12} /></span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-2xl border border-dashed border-[#cfdcd3] px-4 py-3">
                <div className={fieldLabel}>Scope</div>
                <p className="text-[12px] leading-5 text-[#6b7873]" data-testid="text-plan-scope">{plan.scopeBoundary}</p>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-[#f1cdbf] bg-[#fcf0eb] px-3.5 py-3 text-[12px] leading-5 text-[#9c4a30]" data-testid="text-plan-error">
              {error}
            </div>
          )}

          <p className="flex items-center gap-2 text-[11px] leading-5 text-[#89938d]">
            <Sparkles size={13} className="shrink-0 text-[#62998b]" />
            Planning uses AI. Your lesson isn’t created until you confirm the plan.
          </p>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#ece8dd] bg-[#fbfaf5]/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
          {stage === 'needs' ? (
            <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl px-4 py-3 text-sm font-semibold text-[#6f7b76] transition hover:bg-[#f0eee6] disabled:opacity-50" data-testid="button-cancel-learner-intent">
              Cancel
            </button>
          ) : (
            <button type="button" onClick={invalidate} disabled={busy} className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-[#5c6e68] transition hover:bg-[#f0eee6] disabled:opacity-50" data-testid="button-edit-learning-needs">
              <PencilLine size={14} /> Edit learning needs
            </button>
          )}

          {stage === 'needs' && (
            <button type="button" onClick={handleBuild} disabled={!goal || !knowledge || pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176e5c] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_15px_rgba(23,110,92,.17)] transition hover:bg-[#105b4b] disabled:cursor-not-allowed disabled:opacity-45" data-testid="button-build-learning-plan">
              {pending ? <LoaderCircle size={15} className="animate-spin" /> : error ? <RotateCcw size={15} /> : <Compass size={15} />}
              {pending ? 'Building plan…' : error ? 'Try again' : 'Build learning plan'}
            </button>
          )}
          {stage === 'clarify' && (
            <button type="button" onClick={handleUpdate} disabled={pending || !answer.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176e5c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#105b4b] disabled:cursor-not-allowed disabled:opacity-45" data-testid="button-update-learning-plan">
              {pending ? <LoaderCircle size={15} className="animate-spin" /> : <RotateCcw size={15} />}
              {pending ? 'Updating plan…' : 'Update plan'}
            </button>
          )}
          {stage === 'ready' && (
            <button type="button" onClick={() => void handleConfirm()} disabled={busy} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#176e5c] px-5 py-3 text-sm font-bold text-white shadow-[0_7px_15px_rgba(23,110,92,.17)] transition hover:bg-[#105b4b] disabled:cursor-wait disabled:opacity-60" data-testid="button-confirm-learning-plan">
              {confirming ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Yes, create this lesson
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
