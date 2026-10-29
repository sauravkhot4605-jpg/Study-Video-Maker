import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown, ChevronUp, Pause, Play, Repeat, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from './useSceneControls';

const SCENE_DETAILS: Record<string, { title: string; filePath: string }> = {
  overwhelm: { title: 'Too much?', filePath: 'src/components/video/StudyScenes.tsx' },
  startingPoint: { title: 'Start with one thing', filePath: 'src/components/video/StudyScenes.tsx' },
  scenes: { title: 'Built in small scenes', filePath: 'src/components/video/StudyScenes.tsx' },
  livingLesson: { title: 'Watch it click', filePath: 'src/components/video/StudyScenes.tsx' },
  takeaways: { title: 'Keep the good part', filePath: 'src/components/video/StudyScenes.tsx' },
  lockup: { title: 'Make it make sense', filePath: 'src/components/video/StudyScenes.tsx' },
};

type BrowserWindow = {
  self?: unknown;
  top?: unknown;
  parent?: { postMessage: (message: unknown, target: string) => void };
};

function announceSceneSelection(index: number, sceneKeys: string[]) {
  const browserWindow = (globalThis as unknown as { window?: BrowserWindow }).window;
  const key = sceneKeys[index];
  const details = SCENE_DETAILS[key];
  if (!browserWindow?.parent || !details?.filePath) return;
  browserWindow.parent.postMessage({
    type: 'REPLIT_VIDEO_SCENE_SELECTED',
    payload: {
      sceneIndex: index,
      sceneCount: sceneKeys.length,
      sceneTitle: details.title || key,
      filePath: details.filePath,
      lineNumber: 1,
    },
  }, '*');
}

const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

function PlaybackStatus({
  sceneKeys, activeIndex, activeDuration, activeStartTime, totalDuration, tick, paused, onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  activeStartTime: number;
  totalDuration: number;
  tick: number;
  paused: boolean;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedBaseRef = useRef(0);
  useEffect(() => {
    setElapsed(0);
    elapsedBaseRef.current = 0;
  }, [tick]);
  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const interval = setInterval(() => setElapsed(elapsedBaseRef.current + (Date.now() - startedAt)), 60);
    return () => {
      clearInterval(interval);
      elapsedBaseRef.current += Date.now() - startedAt;
    };
  }, [tick, paused]);

  const progress = activeDuration > 0 ? Math.min(1, elapsed / activeDuration) : 0;
  const totalElapsed = Math.min(totalDuration, activeStartTime + Math.min(elapsed, activeDuration));
  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-[.6vmin]">
        {sceneKeys.map((key, index) => (
          <button
            key={key}
            type="button"
            onClick={() => onJumpTo(index)}
            className="group relative h-[1.3vmin] min-h-[10px] flex-1 overflow-hidden rounded-full bg-white/20 transition-[height] hover:h-[1.7vmin]"
            aria-label={`Jump to scene ${index + 1}`}
            aria-current={activeIndex === index ? 'true' : undefined}
          >
            <span className="absolute inset-y-0 left-0 rounded-full bg-[#e7bd58]" style={{ width: `${activeIndex === index ? progress * 100 : activeIndex > index ? 100 : 0}%` }} />
          </button>
        ))}
      </div>
      <div className="min-w-[4ch] text-right font-mono text-[1.45vmin] tabular-nums text-[#e9eee8]/75">{activeIndex + 1}/{sceneKeys.length}</div>
      <div className="min-w-[10ch] text-right font-mono text-[1.42vmin] tabular-nums text-[#e9eee8]/85" role="timer" aria-label={`Playback time ${formatTime(totalElapsed)} of ${formatTime(totalDuration)}`}>
        {formatTime(totalElapsed)} / {formatTime(totalDuration)}
      </div>
    </>
  );
}

function ControlBar({
  visible, collapsed, locked, paused, muted, sceneKeys, activeIndex, activeDuration,
  activeStartTime, totalDuration, tick, onTogglePause, onToggleLock, onToggleMute,
  onJumpTo, onToggleCollapsed,
}: {
  visible: boolean;
  collapsed: boolean;
  locked: boolean;
  paused: boolean;
  muted: boolean;
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  activeStartTime: number;
  totalDuration: number;
  tick: number;
  onTogglePause: () => void;
  onToggleLock: () => void;
  onToggleMute: () => void;
  onJumpTo: (index: number) => void;
  onToggleCollapsed: () => void;
}) {
  const buttonClass = 'grid h-[5.5vmin] w-[5.5vmin] min-h-[36px] min-w-[36px] shrink-0 place-items-center rounded-[1vmin] text-[#f6f3e9]/78 transition-colors hover:bg-white/10 hover:text-white';
  return (
    <div className={`flex items-center gap-[1.1vmin] border-t border-white/10 bg-[#12342f]/95 px-[2vmin] py-[1.1vmin] backdrop-blur-xl transition-all duration-200 ease-out ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'}`} aria-hidden={!visible}>
      <button type="button" onClick={onTogglePause} className={buttonClass} title={paused ? 'Play' : 'Pause'} aria-label={paused ? 'Play' : 'Pause'}>
        {paused ? <Play size="2.7vmin" fill="currentColor" /> : <Pause size="2.7vmin" fill="currentColor" />}
      </button>
      <button type="button" onClick={onToggleLock} className={`${buttonClass} ${locked ? 'bg-white/15 text-[#e7bd58]' : ''}`} title={locked ? 'Loop current scene: on' : 'Loop current scene: off'} aria-label={locked ? 'Loop current scene: on' : 'Loop current scene: off'} aria-pressed={locked}>
        <Repeat size="2.5vmin" />
      </button>
      <button type="button" onClick={onToggleMute} className={buttonClass} title={muted ? 'Unmute' : 'Mute'} aria-label={muted ? 'Unmute' : 'Mute'}>
        {muted ? <VolumeX size="2.5vmin" /> : <Volume2 size="2.5vmin" />}
      </button>
      <div className="mx-[.3vmin] h-[3.3vmin] w-px shrink-0 bg-white/15" aria-hidden="true" />
      <PlaybackStatus
        sceneKeys={sceneKeys}
        activeIndex={activeIndex}
        activeDuration={activeDuration}
        activeStartTime={activeStartTime}
        totalDuration={totalDuration}
        tick={tick}
        paused={paused}
        onJumpTo={onJumpTo}
      />
      <button type="button" onClick={onToggleCollapsed} className={buttonClass} title={collapsed ? 'Show controls' : 'Hide controls'} aria-label={collapsed ? 'Show controls' : 'Hide controls'} aria-expanded={!collapsed}>
        {collapsed ? <ChevronUp size="2.8vmin" /> : <ChevronDown size="2.8vmin" />}
      </button>
    </div>
  );
}

export default function VideoWithControls() {
  const browserWindow = (globalThis as unknown as { window?: BrowserWindow }).window;
  const isIframed = !!browserWindow && browserWindow.self !== browserWindow.top;
  const controls = useSceneControls(SCENE_DURATIONS);
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);
  const sensorRef = useRef<{ contains: (target: unknown) => boolean } | null>(null);
  const {
    sceneKeys, activeIndex, locked, paused, mountKey, tick, durations, activeDuration,
    activeStartTime, totalDuration, onSceneChange, jumpTo, toggleLock, togglePause,
  } = controls;

  const handleJumpTo = useCallback((index: number) => {
    jumpTo(index);
    announceSceneSelection(index, sceneKeys);
  }, [jumpTo, sceneKeys]);

  useEffect(() => {
    if (!paused) return;
    const browserDocument = (globalThis as unknown as { document?: { getAnimations: () => Array<{ playState: string; pause: () => void; play: () => void }> } }).document;
    const frozen = browserDocument?.getAnimations().filter((animation) => animation.playState === 'running') ?? [];
    frozen.forEach((animation) => animation.pause());
    return () => frozen.forEach((animation) => animation.play());
  }, [paused]);

  const handlePointerEnter = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setHovering(true);
  }, []);
  const handlePointerLeave = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setHovering(false);
  }, []);
  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' && collapsed) setTapPinned(true);
  }, [collapsed]);
  const handleToggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      if (!current) { setHovering(false); setTapPinned(false); }
      return !current;
    });
  }, []);

  useEffect(() => {
    if (!(collapsed && tapPinned)) return;
    const browserDocument = (globalThis as unknown as { document?: { addEventListener: (type: string, callback: (event: { pointerType: string; target: unknown }) => void) => void; removeEventListener: (type: string, callback: (event: { pointerType: string; target: unknown }) => void) => void } }).document;
    if (!browserDocument) return;
    const onOutsidePointer = (event: { pointerType: string; target: unknown }) => {
      if (event.pointerType === 'mouse') return;
      if (sensorRef.current && !sensorRef.current.contains(event.target)) setTapPinned(false);
    };
    browserDocument.addEventListener('pointerdown', onOutsidePointer);
    return () => browserDocument.removeEventListener('pointerdown', onOutsidePointer);
  }, [collapsed, tapPinned]);

  if (!isIframed) return <VideoTemplate />;
  const visible = !collapsed || hovering || tapPinned;
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#12342f]">
      <VideoTemplate
        key={mountKey}
        durations={durations}
        loop
        paused={paused}
        muted={muted}
        onSceneChange={onSceneChange}
      />
      <div
        ref={(node) => { sensorRef.current = node as unknown as { contains: (target: unknown) => boolean } | null; }}
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col justify-end"
        style={{ height: '25%' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <div className="w-full flex-1" aria-hidden="true" />
        <ControlBar
          visible={visible}
          collapsed={collapsed}
          locked={locked}
          paused={paused}
          muted={muted}
          sceneKeys={sceneKeys}
          activeIndex={activeIndex}
          activeDuration={activeDuration}
          activeStartTime={activeStartTime}
          totalDuration={totalDuration}
          tick={tick}
          onTogglePause={togglePause}
          onToggleLock={toggleLock}
          onToggleMute={() => setMuted((current) => !current)}
          onJumpTo={handleJumpTo}
          onToggleCollapsed={handleToggleCollapsed}
        />
      </div>
    </div>
  );
}
