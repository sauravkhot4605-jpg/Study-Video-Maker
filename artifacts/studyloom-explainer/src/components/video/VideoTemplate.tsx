import { useEffect, useRef, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { VideoCanvas, VideoPausedContext, type VideoAspectRatio, useVideoAudio, useVideoPlayer } from '@/lib/video';
import { SceneFive, SceneFour, SceneOne, SceneSix, SceneThree, SceneTwo } from './StudyScenes';

export const SCENE_DURATIONS = {
  overwhelm: 4800,
  startingPoint: 5400,
  scenes: 5400,
  livingLesson: 5400,
  takeaways: 5400,
  lockup: 3600,
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';
const SCENE_COMPONENTS: Record<string, ComponentType> = {
  overwhelm: SceneOne,
  startingPoint: SceneTwo,
  scenes: SceneThree,
  livingLesson: SceneFour,
  takeaways: SceneFive,
  lockup: SceneSix,
};
const SCENE_START_SECONDS: Record<string, number> = {
  overwhelm: 0,
  startingPoint: 4.8,
  scenes: 10.2,
  livingLesson: 15.6,
  takeaways: 21,
  lockup: 26.4,
};
type AudioPlayback = { currentTime: number; volume: number; pause: () => void; play: () => Promise<void> };

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop, paused });
  const { muted: workspaceMuted, paused: workspacePaused } = useVideoAudio();
  const audioRef = useRef<AudioPlayback | null>(null);
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const CurrentScene = SCENE_COMPONENTS[baseSceneKey] ?? SceneOne;
  const audioIsPaused = paused || workspacePaused;
  const audioIsMuted = muted || workspaceMuted;

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = SCENE_START_SECONDS[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - target) > 0.18) audio.currentTime = target;
  }, [currentSceneKey, baseSceneKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioIsPaused) {
      audio.pause();
      return;
    }
    audio.volume = 0.46;
    audio.play().catch(() => {});
  }, [audioIsPaused, audioIsMuted]);

  return (
    <VideoCanvas
      aspectRatio={VIDEO_ASPECT_RATIO}
      className="studyloom-film"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.006, 1.012, 1.018, 1.024, 1.03], rotate: [0, -.16, .12, -.12, .1, 0] }}
        transition={{ duration: 30, ease: 'linear' }}
        style={{ transformOrigin: 'center center' }}
      >
        <VideoPausedContext.Provider value={audioIsPaused}>
          <AnimatePresence mode="sync" initial={false}>
            <CurrentScene key={currentSceneKey} />
          </AnimatePresence>
        </VideoPausedContext.Provider>
      </motion.div>
      <audio
        ref={(node) => { audioRef.current = node as unknown as AudioPlayback | null; }}
        src={`${import.meta.env.BASE_URL}audio/bg_music.wav`}
        preload="auto"
        autoPlay
        muted={audioIsMuted}
        aria-hidden="true"
      />
    </VideoCanvas>
  );
}
