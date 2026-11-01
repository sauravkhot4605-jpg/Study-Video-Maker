import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Newspaper, Search, Sparkles } from 'lucide-react';
import {
  CURRENT_AFFAIRS,
  type CurrentAffair,
  type CurrentAffairsCategory,
  type CurrentAffairsYear,
} from '@/lib/current-affairs';

type Props = {
  busy: boolean;
  onCreateLesson: (item: CurrentAffair) => void | Promise<void>;
};

const ITEMS_PER_SLIDE = 2;
const CATEGORIES: (CurrentAffairsCategory | 'All')[] = [
  'All',
  'Economy',
  'Polity & governance',
  'National security',
  'Science & technology',
  'Culture & heritage',
  'International relations',
  'Sports',
];

export function CurrentAffairsLibrary({ busy, onCreateLesson }: Props) {
  const [year, setYear] = useState<CurrentAffairsYear>(2026);
  const [category, setCategory] = useState<CurrentAffairsCategory | 'All'>('All');
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);

  const yearCounts = useMemo(() => ({
    2025: CURRENT_AFFAIRS.filter((item) => item.year === 2025).length,
    2026: CURRENT_AFFAIRS.filter((item) => item.year === 2026).length,
  }), []);
  const availableCategories = useMemo(
    () => CATEGORIES.filter((item) => item === 'All' || CURRENT_AFFAIRS.some((affair) => affair.year === year && affair.category === item)),
    [year],
  );
  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return CURRENT_AFFAIRS.filter((item) => item.year === year)
      .filter((item) => category === 'All' || item.category === category)
      .filter((item) => !search || `${item.title} ${item.summary} ${item.examAngle} ${item.category}`.toLowerCase().includes(search));
  }, [year, category, query]);
  const slideCount = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_SLIDE));
  const visibleItems = filteredItems.slice(slide * ITEMS_PER_SLIDE, (slide + 1) * ITEMS_PER_SLIDE);

  const chooseYear = (nextYear: CurrentAffairsYear) => {
    setYear(nextYear);
    setCategory('All');
    setSlide(0);
  };

  const chooseCategory = (nextCategory: CurrentAffairsCategory | 'All') => {
    setCategory(nextCategory);
    setSlide(0);
  };

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setSlide(0);
  };

  return (
    <section className="animate-rise overflow-hidden rounded-[26px] border border-[#e4e8e2] bg-white shadow-[0_16px_42px_rgba(47,57,94,.07)]" aria-labelledby="current-affairs-heading" data-testid="panel-current-affairs">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#173f3b] via-[#1c6258] to-[#32836b] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/15" aria-hidden="true">
          <div className="absolute inset-8 rounded-full border border-white/10" />
          <div className="absolute inset-16 rounded-full border border-white/10" />
        </div>
        <div className="relative z-10 max-w-[760px]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#d4f0df]">
            <Newspaper size={13} /> MPSC &amp; UPSC
          </div>
          <h2 id="current-affairs-heading" className="font-[Manrope] text-[27px] font-extrabold tracking-[-.045em] sm:text-[34px]">
            Current affairs, made clear
          </h2>
          <p className="mt-2 max-w-[620px] text-[12px] leading-5 text-white/75 sm:text-[14px] sm:leading-6">
            Key India and world events from 2025 and 2026, with short exam notes and links to original sources.
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-[#f0f2f7] p-1" role="tablist" aria-label="Current affairs year">
            {([2025, 2026] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={year === option}
                onClick={() => chooseYear(option)}
                className={`min-h-9 rounded-lg px-4 text-[12px] font-extrabold transition ${year === option ? 'bg-white text-[#216c5c] shadow-sm' : 'text-[#7b8582] hover:text-[#36594f]'}`}
                data-testid={`tab-current-affairs-${option}`}
              >
                {option} <span className="ml-1 text-[10px] opacity-65">{yearCounts[option]}</span>
              </button>
            ))}
          </div>

          <label className="relative block w-full sm:w-[250px]">
            <span className="sr-only">Search current affairs</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a09a]" />
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search events or subjects"
              className="h-10 w-full rounded-xl border border-[#e7e8e4] bg-[#fbfbf8] pl-9 pr-3 text-[12px] text-[#334642] outline-none transition placeholder:text-[#a2aaa5] focus:border-[#78aa9c] focus:ring-4 focus:ring-[#176e5c]/[.07]"
              data-testid="input-current-affairs-search"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by current affairs category">
          {availableCategories.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => chooseCategory(option)}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${category === option ? 'border-[#7aab9d] bg-[#edf5ef] text-[#276d5e]' : 'border-[#e8e9e3] bg-white text-[#77817c] hover:border-[#bdd1c8] hover:text-[#426b5f]'}`}
              data-testid={`filter-current-affairs-${option === 'All' ? 'all' : option.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-b border-[#eef0ea] pb-2.5 text-[10px] font-semibold text-[#909993]">
          <span>{filteredItems.length} selected highlights</span>
          <span>{year} · curated exam notes</span>
        </div>

        {visibleItems.length > 0 ? (
          <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-2">
            {visibleItems.map((item) => (
              <article key={item.id} className="flex min-h-[275px] flex-col rounded-[20px] border border-[#e8e9e3] bg-[#fffefa] p-4 sm:p-5" data-testid={`card-current-affair-${item.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#edf5ef] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#3c7868]">{item.category}</span>
                  <time className="text-[10px] font-semibold text-[#969e98]">{item.date}</time>
                </div>
                <h3 className="mt-3 font-[Manrope] text-[16px] font-extrabold leading-6 tracking-[-.025em] text-[#2d4440] sm:text-[17px]">{item.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.65] text-[#66736d]">{item.summary}</p>
                <div className="mt-3 rounded-xl bg-[#f3f3ed] px-3 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#7b887c]">For your exam</p>
                  <p className="mt-1 text-[10px] leading-[1.55] text-[#64716a]">{item.examAngle}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-[10px] font-bold text-[#647770] transition hover:bg-[#f0f4ef] hover:text-[#236b5c]" data-testid={`link-current-affair-source-${item.id}`}>
                    <ExternalLink size={12} /> Source
                  </a>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onCreateLesson(item)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#176e5c] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#105b4b] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]"
                    data-testid={`button-current-affair-lesson-${item.id}`}
                  >
                    <Sparkles size={12} /> {busy ? 'Creating…' : 'Make lesson video'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[#dfe4dc] bg-[#fafbf7] px-5 py-10 text-center" data-testid="empty-current-affairs">
            <p className="text-[13px] font-bold text-[#53645d]">No matching events</p>
            <p className="mt-1 text-[11px] text-[#87928a]">Try a different search or category.</p>
            <button type="button" onClick={() => { updateQuery(''); chooseCategory('All'); }} className="mt-3 text-[11px] font-bold text-[#287562] hover:underline">Clear filters</button>
          </div>
        )}

        {filteredItems.length > ITEMS_PER_SLIDE && (
          <div className="mt-4 flex items-center justify-between border-t border-[#eef0ea] pt-3" role="group" aria-label="Current affairs slides">
            <button
              type="button"
              onClick={() => setSlide((current) => Math.max(0, current - 1))}
              disabled={slide === 0}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold text-[#3d7568] transition hover:bg-[#f4f8f4] disabled:cursor-not-allowed disabled:opacity-40"
              data-testid="button-current-affairs-previous"
            >
              <ArrowLeft size={13} /> Previous
            </button>
            <span className="text-[10px] font-semibold text-[#89938e]" aria-live="polite" data-testid="text-current-affairs-slide">Slide {slide + 1} of {slideCount}</span>
            <button
              type="button"
              onClick={() => setSlide((current) => Math.min(slideCount - 1, current + 1))}
              disabled={slide >= slideCount - 1}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold text-[#3d7568] transition hover:bg-[#f4f8f4] disabled:cursor-not-allowed disabled:opacity-40"
              data-testid="button-current-affairs-next"
            >
              Next <ArrowRight size={13} />
            </button>
          </div>
        )}

        <p className="mt-3 text-[9px] leading-4 text-[#a0a8a0]">Selected exam-relevant highlights, not a complete news feed. Follow the linked original source for later updates.</p>
      </div>
    </section>
  );
}
