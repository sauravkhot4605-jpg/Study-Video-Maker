import type { StudyTeachingStep } from '@workspace/api-client-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = { steps: StudyTeachingStep[]; index: number; disabled: boolean; onSeek: (index: number) => void };

export function TeachingStepControls({ steps, index, disabled, onSeek }: Props) {
  const active = steps[Math.min(index, steps.length - 1)];
  if (!active) return null;
  return (
    <div className="border-t border-white/10 px-4 py-3 sm:px-5" data-testid="panel-teaching-steps">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#e7c568]">Learn one step at a time</p>
        <span className="text-[11px] text-[#bbd0c5]" data-testid="text-teaching-step-count">{index + 1} / {steps.length}</span>
      </div>
      <h4 className="mt-2 text-sm font-bold text-[#f4f2e8]" data-testid="text-teaching-step-title">{active.title}</h4>
      <p className="mt-1 text-xs leading-5 text-[#c3d9ca]" data-testid="text-teaching-step-detail">{active.detail}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onSeek(index - 1)} disabled={disabled || index === 0} aria-label="Previous explanation step" className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 disabled:opacity-30" data-testid="button-teaching-previous"><ChevronLeft size={16} /></button>
        {steps.map((step, i) => (
          <button key={i} type="button" disabled={disabled} onClick={() => onSeek(i)} aria-label={`Review step ${i + 1}: ${step.title}`} aria-current={i === index ? 'step' : undefined}
            className={`h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition disabled:opacity-30 ${i === index ? 'bg-[#e7c568] text-[#173c3a]' : 'border border-white/20 text-[#c3d9ca] hover:bg-white/10'}`} data-testid={`button-teaching-step-${i}`}>
            {i + 1}
          </button>
        ))}
        <button type="button" onClick={() => onSeek(index + 1)} disabled={disabled || index === steps.length - 1} aria-label="Next explanation step" className="grid h-9 w-9 place-items-center rounded-lg border border-white/20 disabled:opacity-30" data-testid="button-teaching-next"><ChevronRight size={16} /></button>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-[#bbd0c5]">Choose a step to pause and review. Press Play to continue from there.</p>
    </div>
  );
}
