import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const sceneIn = { duration: 0.62, ease: EASE };
const sceneOut = { duration: 0.34, ease: [0.7, 0, 0.84, 0] as const };

const Thread = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 420 160" fill="none" aria-hidden="true">
    <motion.path
      d="M5 91 C45 28 86 146 126 78 C160 20 184 112 228 82 C276 49 292 139 331 88 C356 55 380 65 415 27"
      className="scribble"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.1, delay: 0.22, ease: EASE }}
    />
  </svg>
);

const BrandStamp = ({ dark = false }: { dark?: boolean }) => (
  <div className={`display flex items-center gap-[1.1vmin] text-[2.5vmin] font-extrabold tracking-[-.06em] ${dark ? 'text-[#f6f3e9]' : 'text-[#183e37]'}`}>
    <svg width="3.9vmin" height="3.2vmin" viewBox="0 0 52 42" fill="none" aria-hidden="true">
      <path d="M5 8.5C13 5 20 7 26 13v24C19 31 12 30 5 33V8.5Z" fill="#E47C61" />
      <path d="M47 8.5C39 5 32 7 26 13v24c7-6 14-7 21-4V8.5Z" fill={dark ? '#F6F3E9' : '#183E37'} />
      <path d="M26 13v24" stroke="#E7BD58" strokeWidth="2.4" />
    </svg>
    <span>studyloom</span>
  </div>
);

function Stage({ children, color, className = '' }: { children: ReactNode; color: string; className?: string }) {
  return (
    <motion.section
      className={`paper-grain absolute inset-0 overflow-hidden ${className}`}
      style={{ backgroundColor: color }}
      initial={{ opacity: 0, scale: 1.045, filter: 'blur(7px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.965, filter: 'blur(5px)' }}
      transition={sceneIn}
    >
      {children}
    </motion.section>
  );
}

export function SceneOne() {
  const scraps = [
    { x: '72%', y: '8%', r: 7, text: 'photosynthesis', w: '18vmin' },
    { x: '2%', y: '57%', r: -8, text: 'cellular energy', w: '20vmin' },
    { x: '78%', y: '65%', r: 5, text: 'chlorophyll', w: '15vmin' },
    { x: '24%', y: '78%', r: -4, text: 'light + water', w: '16vmin' },
  ];
  return (
    <Stage color="#183E37" className="text-[#f6f3e9]">
      <div className="absolute inset-[6%]">
        <div className="eyebrow absolute left-0 top-[1%] text-[#b7c9bd]">For the things you’re learning</div>
        {scraps.map((scrap, i) => (
          <motion.div
            key={scrap.text}
            className="lesson-paper scene-shadow absolute flex h-[10vmin] items-center justify-center rounded-[.7vmin] px-[1.7vmin] text-[1.6vmin] font-semibold text-[#6d766b]"
            style={{ left: scrap.x, top: scrap.y, width: scrap.w, rotate: scrap.r }}
            initial={{ opacity: 0, y: i % 2 ? 90 : -80, rotate: scrap.r + 16, scale: 0.72 }}
            animate={{ opacity: [1, 1, 0.45], y: [0, i % 2 ? 9 : -5, 0], rotate: [scrap.r, scrap.r - 3, scrap.r], scale: 1 }}
            transition={{ delay: 0.16 + i * 0.34, duration: 3.3, ease: EASE }}
          >
            <span className="font-mono text-[1.25vmin] uppercase tracking-[.08em]">{scrap.text}</span>
          </motion.div>
        ))}
        <motion.div
          className="display absolute left-[8%] top-[27%] z-10 text-[13.5vmin] font-extrabold leading-[.88] tracking-[-.08em] text-[#f6f3e9]"
          initial={{ opacity: 0, x: -65, skewX: -9 }}
          animate={{ opacity: 1, x: 0, skewX: 0 }}
          transition={{ ...sceneIn, delay: 0.15 }}
        >
          <div className="text-[5.1vmin] font-semibold leading-none tracking-[-.04em] text-[#d8dfd3]">A whole chapter?</div>
          <motion.div
            className="mt-[1.2vmin] text-[#f6f3e9]"
            animate={{ x: [0, 8, 0], color: ['#f6f3e9', '#e7bd58', '#f6f3e9'] }}
            transition={{ delay: 1.15, duration: 1.1, ease: EASE }}
          >
            TOO MUCH?
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute left-[5%] top-[48%] h-[20vmin] w-[52vmin]"
          initial={{ scale: 0.55, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.64, type: 'spring', stiffness: 270, damping: 19 }}
        >
          <Thread className="h-full w-full" />
        </motion.div>
        <motion.div className="absolute bottom-[2%] right-[1%]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.45, duration: 0.45 }}>
          <BrandStamp dark />
        </motion.div>
        <motion.div
          className="absolute right-[-4%] top-[22%] h-[48vmin] w-[48vmin] rounded-full border border-[#a8c3af]/25"
          animate={{ scale: [0.92, 1.07, 1.14], rotate: [0, 18, 32], opacity: [0.3, 0.7, 0.22] }}
          transition={{ duration: 4.1, ease: 'easeInOut' }}
        >
          <div className="absolute inset-[12%] rounded-full border border-[#a8c3af]/25" />
        </motion.div>
      </div>
    </Stage>
  );
}

export function SceneTwo() {
  return (
    <Stage color="#F6F3E9">
      <motion.div className="absolute inset-y-0 left-0 w-[31%] bg-[#183e37]" initial={{ x: '-100%' }} animate={{ x: 0 }} transition={sceneIn} />
      <div className="eyebrow absolute left-[6%] top-[9%] text-[#a9c4b5]">Make a start</div>
      <motion.div className="display absolute left-[6%] top-[22%] w-[25%] text-[6.3vmin] font-extrabold leading-[.98] text-[#f6f3e9]" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sceneIn, delay: 0.22 }}>
        Start with<br /><span className="text-[#e7bd58]">one thing.</span>
      </motion.div>
      <motion.div
        className="lesson-paper scene-shadow absolute left-[34%] top-[16%] flex h-[62%] w-[57%] flex-col justify-center rounded-[2.4vmin] px-[6.5vmin]"
        initial={{ rotateY: 18, rotateZ: 4, scale: 0.79, opacity: 0 }}
        animate={{ rotateY: 0, rotateZ: -1.5, scale: 1, opacity: 1 }}
        transition={{ ...sceneIn, delay: 0.24 }}
        style={{ transformPerspective: 1100 }}
      >
        <div className="eyebrow mb-[3vmin] text-[#7d9587]">A topic, a question, or the notes you already have</div>
        <motion.div className="relative overflow-hidden border-b-[.22vmin] border-[#d4d9cd] pb-[2.1vmin]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <motion.span
            className="display block whitespace-nowrap text-[4.5vmin] font-bold tracking-[-.055em] text-[#28443d]"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ delay: 0.62, duration: 1.04, ease: EASE }}
          >
            How do volcanoes form?
          </motion.span>
          <motion.span className="absolute bottom-[2.1vmin] right-0 h-[1.4vmin] w-[1.4vmin] rounded-full bg-[#e47c61]" animate={{ opacity: [1, 0, 1] }} transition={{ delay: 1, duration: 0.9, repeat: 2 }} />
        </motion.div>
        <div className="mt-[3vmin] flex items-center gap-[1.5vmin]">
          <motion.span className="h-[.2vmin] w-[8vmin] origin-left bg-[#e47c61]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.65, duration: 0.5 }} />
          <span className="eyebrow text-[#c07b60]">or paste a passage from your notes</span>
        </div>
        <motion.div className="mt-[3.1vmin] flex items-center gap-[1.3vmin] text-[2.3vmin] font-semibold text-[#597269]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.03, duration: 0.5 }}>
          <span className="grid h-[4.5vmin] w-[4.5vmin] place-items-center rounded-full bg-[#e7eee7] text-[2.2vmin] text-[#468171]">01</span>
          A clear place to begin
        </motion.div>
      </motion.div>
      <motion.div className="absolute bottom-[-9%] left-[41%] h-[18vmin] w-[55vmin]" initial={{ x: -120, opacity: 0 }} animate={{ x: [0, 26, 100], opacity: [1, 1, 0] }} transition={{ delay: 4.05, duration: 1.35, ease: EASE }}>
        <Thread className="h-full w-full" />
      </motion.div>
      <motion.div className="absolute right-[5%] top-[9%] h-[10vmin] w-[10vmin] rounded-full border-[.28vmin] border-[#e47c61]" initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.4, duration: 0.55, type: 'spring', stiffness: 250, damping: 17 }}>
        <span className="absolute left-1/2 top-1/2 h-[.2vmin] w-[6vmin] -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] bg-[#e47c61]" />
      </motion.div>
    </Stage>
  );
}

export function SceneThree() {
  const cards = [
    { n: '01', title: 'THE BIG IDEA', body: 'One clear starting point', x: '6%', y: '27%', rotate: -6, icon: '◒', color: '#e7bd58' },
    { n: '02', title: 'A VISUAL EXAMPLE', body: 'See how it connects', x: '37%', y: '13%', rotate: 4, icon: '✳', color: '#e47c61' },
    { n: '03', title: 'THE TAKEAWAY', body: 'Keep what matters', x: '67%', y: '36%', rotate: -3, icon: '↗', color: '#9abbaa' },
  ];
  return (
    <Stage color="#E8EEE5">
      <div className="eyebrow absolute left-[6%] top-[7%] text-[#638376]">A lesson, not another wall of text</div>
      <motion.h2 className="display absolute left-[6%] top-[13%] z-10 text-[7.2vmin] font-extrabold leading-none text-[#183e37]" initial={{ opacity: 0, x: -35 }} animate={{ opacity: 1, x: 0 }} transition={{ ...sceneIn, delay: 0.25 }}>
        Built in small scenes.
      </motion.h2>
      <motion.div className="absolute left-[7%] top-[56%] h-[24vmin] w-[82%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
        <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 220" fill="none" aria-hidden="true">
          <motion.path d="M0 118 C145 118 147 55 320 55 S468 178 606 126 S810 93 1000 112" stroke="#E47C61" strokeWidth="7" strokeLinecap="round" strokeDasharray="12 18" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.9, delay: 0.7, ease: EASE }} />
          {[70, 330, 640, 930].map((cx, i) => <motion.circle key={cx} cx={cx} cy={i === 1 ? 55 : i === 2 ? 126 : 112} r="10" fill="#E7BD58" initial={{ scale: 0 }} animate={{ scale: [1, 1.45, 1] }} transition={{ delay: 1.05 + i * 0.78, duration: 0.6, repeat: 1 }} />)}
        </svg>
      </motion.div>
      {cards.map((card, i) => (
        <motion.div
          key={card.n}
          className="lesson-paper scene-shadow absolute flex h-[30vmin] w-[24vmin] flex-col rounded-[1.2vmin] p-[2.2vmin]"
          style={{ left: card.x, top: card.y, rotate: card.rotate, transformPerspective: 900 }}
          initial={{ opacity: 0, scale: 0.56, y: 60, rotateY: 36 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0], rotateY: 0 }}
          transition={{ opacity: { delay: 0.5 + i * 0.62, duration: 0.36 }, scale: { delay: 0.5 + i * 0.62, duration: 0.6, type: 'spring', stiffness: 220, damping: 18 }, y: { delay: 1.2 + i * 0.6, duration: 2.7, repeat: Infinity, ease: 'easeInOut' }, rotateY: { delay: 0.5 + i * 0.62, duration: 0.72 } }}
        >
          <div className="eyebrow text-[#99a49a]">{card.n} / 03</div>
          <div className="display mt-[2vmin] text-[2.35vmin] font-extrabold leading-[1.05] text-[#26443b]">{card.title}</div>
          <motion.div className="my-auto grid h-[9vmin] w-[9vmin] place-items-center self-center rounded-full text-[5.2vmin] font-light text-[#183e37]" style={{ backgroundColor: `${card.color}55` }} animate={{ rotate: [0, 12, 0], scale: [0.96, 1.05, 0.96] }} transition={{ delay: 1 + i * 0.5, duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>{card.icon}</motion.div>
          <div className="text-[1.55vmin] font-medium text-[#77847b]">{card.body}</div>
          <motion.div className="absolute bottom-[1.1vmin] left-[2.2vmin] h-[.3vmin] bg-[#e47c61]" initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ delay: 1.45 + i * 0.65, duration: 0.6 }} />
        </motion.div>
      ))}
      <motion.div className="absolute right-[9%] top-[70%] h-[20vmin] w-[20vmin] rounded-full border-[.35vmin] border-[#e47c61]/75" initial={{ scale: 0 }} animate={{ scale: [0, 1, 1.5], opacity: [0, 0.85, 0] }} transition={{ delay: 4.22, duration: 1.16, ease: EASE }} />
    </Stage>
  );
}

export function SceneFour() {
  const labels = [
    { text: 'HEAT', top: '56%', left: '8%', delay: 1.55 },
    { text: 'MAGMA', top: '40%', left: '68%', delay: 2.15 },
    { text: 'ERUPTION', top: '20%', left: '61%', delay: 2.8 },
  ];
  return (
    <Stage color="#183E37" className="text-[#f6f3e9]">
      <div className="absolute inset-[5.5%]">
        <div className="eyebrow absolute left-0 top-0 text-[#a8c3af]">The idea, in motion</div>
        <motion.h2 className="display absolute left-[1%] top-[9%] z-10 text-[7.8vmin] font-extrabold leading-none tracking-[-.075em]" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...sceneIn, delay: 0.2 }}>Watch it click.</motion.h2>
        <motion.div className="lesson-paper scene-shadow absolute left-[23%] top-[22%] h-[68%] w-[54%] overflow-hidden rounded-[2vmin]" initial={{ opacity: 0, scale: 0.8, rotateX: 18 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ ...sceneIn, delay: 0.18 }} style={{ transformPerspective: 1000 }}>
          <div className="absolute inset-x-0 top-0 h-[15%] border-b border-[#dfe3d8] px-[3vmin] py-[1.6vmin]">
            <div className="eyebrow text-[#899a8b]">How a volcano forms</div>
          </div>
          <svg className="absolute left-[12%] top-[18%] h-[70%] w-[76%]" viewBox="0 0 500 300" fill="none" aria-label="Animated cutaway diagram of a volcano">
            <path d="M40 250 178 81l44 38 40-41 180 172H40Z" fill="#D5DCCF" />
            <path d="m118 250 94-119 31 25 17-19 104 113H118Z" fill="#A9BDAE" />
            <path d="M40 250h402" stroke="#6E8B7C" strokeWidth="8" strokeLinecap="round" />
            <path d="M80 231c70-26 109-4 158 0 60 5 96-22 151-14" stroke="#E7BD58" strokeWidth="8" strokeLinecap="round" />
            <motion.path d="M252 253c-3-37-17-67-3-92 12-20 20-39 11-69" stroke="#E47C61" strokeWidth="14" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.72, duration: 1.85, ease: EASE }} />
            <motion.path d="M257 83c-28-13-29-33-49-43m49 42c16-24 27-37 50-45m-50 48c-4-29-3-46 2-69" stroke="#E47C61" strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 2.1, duration: 0.55 }} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
              <motion.circle key={dot} cx={220 + (dot % 4) * 19} cy={45 - Math.floor(dot / 4) * 16} r="4" fill="#E7BD58" initial={{ opacity: 0, y: 18 }} animate={{ opacity: [0, 1, 0], y: [-5, -27] }} transition={{ delay: 2.55 + dot * 0.06, duration: 1.1, ease: 'easeOut' }} />
            ))}
          </svg>
          {labels.map((label) => (
            <motion.div key={label.text} className="eyebrow absolute rounded-full bg-[#e9efe7] px-[1.3vmin] py-[.8vmin] text-[#4e7060]" style={{ top: label.top, left: label.left }} initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: label.delay, duration: 0.32 }}>
              {label.text}
            </motion.div>
          ))}
          <motion.div className="absolute bottom-[5%] left-[7%] right-[7%] flex h-[7%] items-center gap-[.75vmin]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.1 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((line) => <motion.span key={line} className="h-full flex-1 rounded-full bg-[#7e9a8b]" animate={{ scaleY: [0.42, 1, 0.48], opacity: [0.48, 1, 0.55] }} transition={{ delay: line * 0.075, duration: 0.9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />)}
          </motion.div>
        </motion.div>
        <motion.div className="absolute bottom-[4%] left-[27%] w-[48%] rounded-[1.2vmin] border border-[#e7bd58]/55 bg-[#244c43] px-[2vmin] py-[1.35vmin] text-center" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.38, duration: 0.44 }}>
          <span className="eyebrow text-[#e7bd58]">Magma</span>
          <span className="ml-[1.2vmin] text-[1.85vmin] text-[#e7eee5]">melted rock beneath Earth’s surface</span>
        </motion.div>
        <motion.div className="absolute bottom-[-5%] left-[24%] h-[12vmin] w-[60vmin]" initial={{ x: 0, opacity: 1 }} animate={{ x: [0, 95, 140], opacity: [1, 1, 0] }} transition={{ delay: 4.15, duration: 1.18, ease: EASE }}>
          <Thread className="h-full w-full" />
        </motion.div>
        {labels.map((label) => <motion.span key={`rule-${label.text}`} className="absolute h-[.18vmin] origin-left bg-[#e7bd58]" style={{ top: `calc(${label.top} + 2vmin)`, left: label.left, width: '8vmin' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: label.delay + 0.18, duration: 0.35 }} />)}
      </div>
    </Stage>
  );
}

export function SceneFive() {
  const cards = [
    { text: 'Heat moves rock.', x: '5%', y: '27%', r: 5, delay: 0.72 },
    { text: 'Pressure builds.', x: '13%', y: '42%', r: -3, delay: 1.58 },
    { text: 'A vent releases it.', x: '2%', y: '58%', r: 3, delay: 2.42 },
  ];
  return (
    <Stage color="#E7BD58">
      <div className="absolute inset-[6%]">
        <div className="eyebrow absolute left-0 top-[2%] text-[#6f6b4d]">The part you’ll remember</div>
        <motion.h2 className="display absolute left-0 top-[20%] z-10 max-w-[42%] text-[8.4vmin] font-extrabold leading-[.92] text-[#183e37]" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ ...sceneIn, delay: 0.18 }}>
          Keep the<br />good part.
        </motion.h2>
        <motion.div className="absolute left-[1%] top-[57%] w-[35%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}>
          <div className="eyebrow text-[#7d7150]">Three ideas. No wall of text.</div>
          <motion.div className="mt-[2vmin] h-[.25vmin] origin-left bg-[#183e37]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.05, duration: 0.65 }} />
        </motion.div>
        <div className="absolute right-[0%] top-[10%] h-[79%] w-[58%]">
          {cards.map((card, i) => (
            <motion.div
              key={card.text}
              className="lesson-paper scene-shadow absolute flex h-[24%] w-[84%] items-center gap-[2vmin] rounded-[1.2vmin] px-[3vmin]"
              style={{ left: card.x, top: card.y, rotate: card.r }}
              initial={{ opacity: 0, x: 220, y: 60, rotate: card.r + 18, scale: 0.86 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: card.r, scale: 1 }}
              transition={{ delay: card.delay, duration: 0.68, type: 'spring', stiffness: 220, damping: 20 }}
            >
              <span className="display text-[3.2vmin] font-extrabold text-[#a4b9a8]">{String(i + 1).padStart(2, '0')}</span>
              <span className="display text-[3vmin] font-bold tracking-[-.04em] text-[#29463b]">{card.text}</span>
              <motion.svg className="ml-auto h-[6vmin] w-[6vmin] shrink-0" viewBox="0 0 60 60" fill="none" aria-hidden="true">
                <motion.path d="m12 31 12 12 25-27" stroke="#E47C61" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: card.delay + 0.54, duration: 0.44, ease: EASE }} />
              </motion.svg>
            </motion.div>
          ))}
          <motion.div className="eyebrow absolute bottom-[0%] right-[11%] rounded-full bg-[#183e37] px-[2vmin] py-[1.15vmin] text-[#f6f3e9]" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3.35, duration: 0.42, type: 'spring', stiffness: 230 }}>3 takeaways</motion.div>
        </div>
        <motion.svg className="absolute left-[45%] top-[18%] h-[70%] w-[46%]" viewBox="0 0 500 340" fill="none" aria-hidden="true">
          <motion.path d="M28 91c85-73 112 61 206 0s139 105 238 8" stroke="#E47C61" strokeWidth="7" strokeLinecap="round" strokeDasharray="13 16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 2.3, ease: EASE }} />
          <motion.circle cx="30" cy="91" r="11" fill="#183e37" animate={{ scale: [1, 1.4, 1] }} transition={{ delay: 1, duration: 1.2, repeat: Infinity }} />
        </motion.svg>
        <motion.div className="absolute right-[9%] top-[41%] h-[11vmin] w-[26vmin]" initial={{ scale: 0.5, opacity: 0, rotate: -18 }} animate={{ scale: [0.5, 1, 2.2], opacity: [0, 1, 0], rotate: [-18, 0, 11], x: [0, 0, -145], y: [0, 0, -70] }} transition={{ delay: 4.65, duration: 1.05, ease: EASE }}>
          <Thread className="h-full w-full" />
        </motion.div>
      </div>
    </Stage>
  );
}

export function SceneSix() {
  return (
    <Stage color="#F6F3E9">
      <motion.div className="absolute left-1/2 top-[34%] flex -translate-x-1/2 flex-col items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...sceneIn, delay: 0.12 }}>
        <motion.svg className="mb-[2.6vmin] h-[16vmin] w-[20vmin] overflow-visible" viewBox="0 0 240 170" fill="none" aria-hidden="true">
          <motion.path d="M25 36c42-12 74-5 95 23v86c-27-24-56-31-95-21V36Z" fill="#E47C61" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.34, duration: 0.75 }} />
          <motion.path d="M215 36c-42-12-74-5-95 23v86c27-24 56-31 95-21V36Z" fill="#183E37" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.55, duration: 0.75 }} />
          <motion.path d="M120 59v88" stroke="#E7BD58" strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.85, duration: 0.4 }} />
          <motion.path d="M18 151c37-12 72-6 102 16 32-22 67-28 102-16" stroke="#E47C61" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.02, duration: 0.55 }} />
        </motion.svg>
        <motion.div className="display text-[9vmin] font-extrabold leading-[.9] tracking-[-.075em] text-[#183e37]" initial={{ opacity: 0, y: 22, clipPath: 'inset(100% 0 0 0)' }} animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }} transition={{ delay: 1.12, duration: 0.62, ease: EASE }}>studyloom</motion.div>
        <motion.div className="display mt-[2.4vmin] text-[3.7vmin] font-semibold tracking-[-.045em] text-[#547267]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.65, duration: 0.48 }}>Make it make sense.</motion.div>
        <motion.div className="mt-[1.6vmin] text-[1.9vmin] font-medium tracking-[.02em] text-[#8a9488]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.08, duration: 0.42 }}>Animated lessons for the things you’re learning.</motion.div>
      </motion.div>
      <motion.div className="absolute left-[9%] top-[70%] h-[16vmin] w-[82%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <motion.svg className="h-full w-full" viewBox="0 0 1000 200" fill="none" aria-hidden="true">
          <motion.path d="M0 101 C165 24 175 166 335 95 S500 41 630 99 S821 145 1000 101" stroke="#E47C61" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 0 }} animate={{ pathLength: 1, pathOffset: [0, 0, 0.92] }} transition={{ pathLength: { delay: 0.18, duration: 1.25, ease: EASE }, pathOffset: { delay: 2.7, duration: 0.78, ease: EASE } }} />
          <motion.circle cx="1000" cy="101" r="8" fill="#E47C61" animate={{ scale: [1, 1.4, 1] }} transition={{ delay: 2.9, duration: 0.6, repeat: Infinity }} />
        </motion.svg>
      </motion.div>
      <motion.div className="absolute left-[3%] top-[12%] h-[20vmin] w-[20vmin] rounded-full border border-[#a8c3af]/40" animate={{ scale: [0.88, 1.05, 0.88], opacity: [0.15, 0.55, 0.15] }} transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="absolute inset-[16%] rounded-full border border-[#a8c3af]/50" />
      </motion.div>
    </Stage>
  );
}

