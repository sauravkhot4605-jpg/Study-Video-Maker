import { useEffect, useRef, useState } from 'react';
import type { StudyLesson } from '@workspace/api-client-react';
import { Download, LoaderCircle, Pause, Play, RotateCcw, Square, Video } from 'lucide-react';
import { HEIGHT, WIDTH, drawFrame, sceneDuration, scenePlan } from '@/components/lesson-canvas/renderer';
import { VISUAL_LABELS, resolveVisual } from '@/components/lesson-canvas/illustration';

type Props = {
  lesson: StudyLesson;
  sceneIndex: number;
  onSceneChange: (index: number) => void;
};

type Phase = 'idle' | 'preparing' | 'recording' | 'ready' | 'error' | 'unsupported';

export function LessonVideoPlayer({ lesson, sceneIndex, onSceneChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoUrlRef = useRef('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [recordedPlaying, setRecordedPlaying] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(true);

  // Internal timeline: the renderer reads these refs, never props directly.
  const shownIndexRef = useRef(sceneIndex);
  const sceneTimeRef = useRef(0);
  const playingRef = useRef(true);
  const recordingRef = useRef(false);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;
  playingRef.current = previewPlaying;

  // Manual navigation: restart the scene animation. During export, snap the UI back to the recorded scene.
  useEffect(() => {
    if (recordingRef.current) {
      if (sceneIndex !== shownIndexRef.current) onSceneChangeRef.current(shownIndexRef.current);
      return;
    }
    if (sceneIndex !== shownIndexRef.current) {
      shownIndexRef.current = sceneIndex;
      sceneTimeRef.current = 0;
    }
  }, [sceneIndex]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    let frame = 0;
    let last = performance.now();
    let lastProgress = -1;
    const tick = (now: number) => {
      // A queued animation frame may predate performance.now() on the first tick.
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      const scenes = lesson.scenes;
      if (playingRef.current || recordingRef.current) {
        sceneTimeRef.current += dt;
        const duration = sceneDuration(scenes[shownIndexRef.current] || scenes[0]);
        if (sceneTimeRef.current >= duration) {
          if (shownIndexRef.current < scenes.length - 1) {
            shownIndexRef.current += 1;
            sceneTimeRef.current = 0;
            onSceneChangeRef.current(shownIndexRef.current);
          } else if (recordingRef.current) {
            sceneTimeRef.current = duration;
            recordingRef.current = false;
            const recorder = recorderRef.current;
            if (recorder && recorder.state !== 'inactive') recorder.stop();
          } else {
            sceneTimeRef.current = duration;
            playingRef.current = false;
            setPreviewPlaying(false);
          }
        }
        if (recordingRef.current) {
          const before = scenes.slice(0, shownIndexRef.current).reduce((s, sc) => s + sceneDuration(sc), 0);
          const total = scenes.reduce((s, sc) => s + sceneDuration(sc), 0);
          const pct = Math.min(99, Math.floor(((before + sceneTimeRef.current) / total) * 100));
          if (pct !== lastProgress) { lastProgress = pct; setProgress(pct); }
        }
      }
      drawFrame(context, { lesson, sceneIndex: shownIndexRef.current, sceneTime: sceneTimeRef.current });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [lesson]);

  // Unmount cleanup only.
  useEffect(() => () => {
    recordingRef.current = false;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
  }, []);

  const togglePreview = () => {
    if (!previewPlaying) {
      const last = lesson.scenes.length - 1;
      if (shownIndexRef.current === last && sceneTimeRef.current >= sceneDuration(lesson.scenes[last])) sceneTimeRef.current = 0;
    }
    setPreviewPlaying((p) => !p);
  };

  const restartScene = () => { sceneTimeRef.current = 0; setPreviewPlaying(true); };

  const stopRecording = () => {
    recordingRef.current = false;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
  };

  const makeVideo = () => {
    setError('');
    setProgress(0);
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      setPhase('unsupported');
      return;
    }
    setPhase('preparing');
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('The animation surface is not ready. Please try again.');
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = canvas.captureStream(30);
      streamRef.current = stream;
      const preferred = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      const mimeType = preferred.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => {
        recordingRef.current = false;
        stream.getTracks().forEach((track) => track.stop());
        setError('The browser stopped the recording unexpectedly. Try recording again.');
        setPhase('error');
      };
      recorder.onstop = () => {
        recordingRef.current = false;
        stream.getTracks().forEach((track) => track.stop());
        if (recorderRef.current === recorder) recorderRef.current = null;
        if (chunks.length) {
          if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
          const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
          videoUrlRef.current = url;
          setVideoUrl(url);
          setProgress(100);
          setPhase('ready');
        } else {
          setError('No video data was captured. Please try again.');
          setPhase('error');
        }
      };
      // Drive the export timeline internally from scene 1.
      shownIndexRef.current = 0;
      sceneTimeRef.current = 0;
      onSceneChangeRef.current(0);
      recordingRef.current = true;
      recorder.start(250);
      setPhase('recording');
    } catch (cause) {
      recordingRef.current = false;
      setError(cause instanceof Error ? cause.message : 'The video could not be rendered. Please try again.');
      setPhase('error');
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleRecordedPlayback = async () => {
    const video = playbackRef.current;
    if (!video || !videoUrl) return;
    if (video.paused) {
      try { await video.play(); } catch { setError('Playback could not start. Press play again to continue.'); }
    } else video.pause();
  };

  const replay = () => {
    const video = playbackRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => setError('Playback could not start. Press play again to continue.'));
  };

  const currentScene = lesson.scenes[sceneIndex];
  const recording = phase === 'preparing' || phase === 'recording';
  const legacy = currentScene ? scenePlan(currentScene).legacy : false;
  const visual = resolveVisual(currentScene);
  const fileName = `${lesson.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'studyloom-lesson'}.webm`;

  return (
    <div className="lesson-video-shell mb-5 overflow-hidden rounded-[20px] bg-[#173c3a] text-white" data-testid="panel-lesson-video">
      <div className="relative aspect-video w-full overflow-hidden">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="absolute inset-0 h-full w-full" role="img" aria-label={`Animated diagram for scene ${sceneIndex + 1}: ${currentScene?.title}`} data-testid="canvas-lesson-video" />
        {!recording && (
          <button type="button" onClick={togglePreview} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-[#173c3a]/80 text-[#f4f2e8] backdrop-blur-sm transition hover:bg-[#1f4d4a] sm:bottom-auto sm:top-4" aria-label={previewPlaying ? 'Pause preview' : 'Play preview'} data-testid="button-preview-play-pause">
            {previewPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 bg-[#1b4441] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#c3d9ca]" data-testid="status-visual-mode">
        <span className="h-1.5 w-1.5 rounded-full bg-[#e7c568]" />
        Visual mode: {VISUAL_LABELS[visual.kind]}
      </div>
      {'notice' in visual && visual.notice && (
        <p className="border-t border-white/10 bg-[#4a3a33] px-4 py-2 text-[11px] leading-4 text-[#ffd0bd]" role="alert" data-testid="status-visual-notice">{visual.notice}</p>
      )}
      {legacy && (
        <p className="border-t border-white/10 bg-[#2a4a45] px-4 py-2 text-[11px] leading-4 text-[#f2d8a7]" data-testid="status-legacy-diagram">
          This lesson was saved before topic-specific animations. Showing generic steps from the scene title; create the lesson again for a tailored diagram.
        </p>
      )}
      <div className="flex flex-col gap-3 border-t border-white/10 bg-[#153734] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#f4f2e8]" data-testid="text-video-scene-title">{currentScene?.title}</p>
          <p className="mt-1 text-[11px] text-[#bbd0c5]">{recording ? 'Recording plays every scene in order. Navigation is paused.' : 'Silent preview with captions. Scenes advance on their own.'}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!recording && (
            <>
              <button type="button" onClick={togglePreview} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15" data-testid="button-preview-toggle">
                {previewPlaying ? <Pause size={15} /> : <Play size={15} />}{previewPlaying ? 'Pause' : 'Play'}
              </button>
              <button type="button" onClick={restartScene} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/15" aria-label="Restart scene animation" data-testid="button-restart-scene"><RotateCcw size={15} /></button>
            </>
          )}
          {phase === 'ready' && (
            <a href={videoUrl} download={fileName} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#e7c568] px-3 text-xs font-extrabold text-[#23413c] transition hover:bg-[#f0d77f]" data-testid="link-download-video"><Download size={15} /> Download</a>
          )}
          {!recording && (
            <button type="button" onClick={makeVideo} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${phase === 'ready' ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-[#e7c568] text-[#23413c] hover:bg-[#f0d77f]'}`} data-testid="button-create-video">
              <Video size={15} />
              {phase === 'ready' ? 'Render again' : phase === 'error' || phase === 'unsupported' ? 'Try video again' : 'Render lesson video'}
            </button>
          )}
          {recording && (
            <button type="button" onClick={stopRecording} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ef8968] px-4 text-xs font-extrabold text-[#352e28] transition hover:bg-[#f49a7e]" data-testid="button-stop-rendering"><Square size={13} /> Stop render</button>
          )}
        </div>
      </div>
      {recording && (
        <div className="border-t border-white/10 px-4 py-3 sm:px-5" role="status" aria-live="polite" data-testid="status-video-rendering">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-[#bed2c7]">
            <span className="flex items-center gap-2"><LoaderCircle size={12} className="animate-spin" /> Recording animated scenes and captions. Keep this tab visible.</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#e7c568] transition-[width] duration-200" style={{ width: `${Math.max(3, progress)}%` }} /></div>
        </div>
      )}
      {phase === 'ready' && (
        <div className="border-t border-white/10 p-3 sm:p-4">
          <video ref={playbackRef} src={videoUrl} controls playsInline onPlay={() => setRecordedPlaying(true)} onPause={() => setRecordedPlaying(false)} onEnded={() => setRecordedPlaying(false)} className="w-full rounded-xl bg-[#0e2624]" aria-label="Rendered animated lesson video with captions" data-testid="video-rendered-output" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] text-[#bed2c7]" data-testid="status-video-ready">Your captioned video is ready to play or download.</p>
            <div className="flex gap-2">
              <button type="button" onClick={toggleRecordedPlayback} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-[11px] font-bold text-white hover:bg-white/15" data-testid="button-video-play-pause">{recordedPlaying ? <Pause size={13} /> : <Play size={13} />}{recordedPlaying ? 'Pause' : 'Play'}</button>
              <button type="button" onClick={replay} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/15" aria-label="Replay video" data-testid="button-video-replay"><RotateCcw size={13} /></button>
            </div>
          </div>
        </div>
      )}
      {phase === 'unsupported' && <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-[#f2d8a7]" role="alert" data-testid="status-video-unsupported">Video recording is not supported in this browser. Try the latest Chrome, Edge, or Firefox to render a downloadable WebM.</p>}
      {phase === 'error' && <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-[#ffd0bd]" role="alert" data-testid="status-video-error">{error || 'Something interrupted video rendering. Please try again.'}</p>}
    </div>
  );
}
