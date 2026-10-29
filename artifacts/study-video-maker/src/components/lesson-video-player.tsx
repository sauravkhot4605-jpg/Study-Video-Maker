import { useEffect, useRef, useState } from 'react';
import type { StudyLesson } from '@workspace/api-client-react';
import { Download, LoaderCircle, Pause, Play, RotateCcw, Video } from 'lucide-react';

type Props = {
  lesson: StudyLesson;
  sceneIndex: number;
  onSceneChange: (index: number) => void;
};

type Phase = 'idle' | 'preparing' | 'recording' | 'ready' | 'error' | 'unsupported';

const WIDTH = 1280;
const HEIGHT = 720;

function drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/);
  let line = '';
  let lineNumber = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + lineNumber * lineHeight);
      lineNumber += 1;
      line = word;
      if (lineNumber >= maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (line && lineNumber < maxLines) context.fillText(line, x, y + lineNumber * lineHeight);
}

export function LessonVideoPlayer({ lesson, sceneIndex, onSceneChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const captureStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const timelineTimerRef = useRef<number>(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [recordedPlaying, setRecordedPlaying] = useState(false);
  const sceneIndexRef = useRef(sceneIndex);
  sceneIndexRef.current = sceneIndex;

  const sceneDurations = lesson.scenes.map((scene) => {
    const wordCount = scene.narration.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(5, Math.min(45, wordCount / 2.5));
  });
  const totalDuration = sceneDurations.reduce((sum, duration) => sum + duration, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let active = true;
    const draw = (timestamp: number) => {
      if (!active) return;
      const scene = lesson.scenes[sceneIndexRef.current] || lesson.scenes[0];
      const t = timestamp / 1000;
      const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
      gradient.addColorStop(0, '#173c3a');
      gradient.addColorStop(1, '#285956');
      context.fillStyle = gradient;
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.save();
      context.globalAlpha = 0.13;
      context.strokeStyle = '#d9e7d7';
      context.lineWidth = 2;
      for (let ring = 0; ring < 4; ring += 1) {
        context.beginPath();
        context.arc(1070, 350, 90 + ring * 58 + Math.sin(t * 1.2 + ring) * 8, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      const drift = Math.sin(t * 1.25) * 18;
      context.fillStyle = '#e7c568';
      context.beginPath();
      context.arc(1015 + drift, 258, 45 + Math.sin(t * 1.7) * 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#ef8968';
      context.beginPath();
      context.arc(1110 - drift * 0.55, 390, 27 + Math.cos(t * 1.4) * 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#9dc0ad';
      context.beginPath();
      context.roundRect(935, 450 + Math.sin(t) * 10, 225, 18, 9);
      context.fill();

      context.fillStyle = '#c3d9ca';
      context.font = '700 17px "DM Sans", sans-serif';
      context.letterSpacing = '3px';
      context.fillText(`STUDYLOOM  /  SCENE ${String(sceneIndexRef.current + 1).padStart(2, '0')}`, 82, 88);
      context.fillStyle = '#f4f2e8';
      context.font = '800 54px Manrope, sans-serif';
      context.letterSpacing = '-1px';
      drawText(context, scene?.title || lesson.title, 82, 190, 760, 66, 2);
      context.fillStyle = '#d0e0d8';
      context.font = '400 25px "DM Sans", sans-serif';
      context.letterSpacing = '0px';
      drawText(context, scene?.visualCue || '', 84, 335, 760, 40, 3);
      if (scene?.keyTerm) {
        context.fillStyle = '#e7c568';
        context.font = '700 17px "DM Sans", sans-serif';
        context.fillText('KEY IDEA', 84, 545);
        context.fillStyle = '#f4f2e8';
        context.font = '700 30px Manrope, sans-serif';
        context.fillText(scene.keyTerm.slice(0, 46), 84, 585);
      }
      const excerpt = scene?.narration || lesson.overview;
      context.fillStyle = '#aec8bc';
      context.font = '400 16px "DM Sans", sans-serif';
      drawText(context, excerpt, 84, 645, 930, 23, 2);
      const progressX = 82;
      const progressY = 680;
      context.fillStyle = 'rgba(255,255,255,.2)';
      context.fillRect(progressX, progressY, 1110, 4);
      context.fillStyle = '#e7c568';
      context.fillRect(progressX, progressY, 1110 * ((sceneIndexRef.current + 1) / lesson.scenes.length), 4);
      animationFrameRef.current = window.requestAnimationFrame(draw);
    };
    animationFrameRef.current = window.requestAnimationFrame(draw);
    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [lesson]);

  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.onerror = null;
      recorder.stop();
    }
    captureStreamRef.current?.getTracks().forEach((track) => track.stop());
    window.clearTimeout(timelineTimerRef.current);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const stopRecording = () => {
    window.clearTimeout(timelineTimerRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
  };

  const makeVideo = async () => {
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
      const canvasStream = canvas.captureStream(30);
      captureStreamRef.current = canvasStream;
      const preferred = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      const mimeType = preferred.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        setError('The browser stopped the recording unexpectedly. Try recording again.');
        setPhase('error');
        window.clearTimeout(timelineTimerRef.current);
        canvasStream.getTracks().forEach((track) => track.stop());
      };
      recorder.onstop = () => {
        window.clearTimeout(timelineTimerRef.current);
        canvasStream.getTracks().forEach((track) => track.stop());
        if (chunks.length) {
          const result = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
          if (videoUrl) URL.revokeObjectURL(videoUrl);
          setVideoUrl(URL.createObjectURL(result));
          setProgress(100);
          setPhase('ready');
        } else {
          setError('No video data was captured. Please try again.');
          setPhase('error');
        }
      };
      const sceneStarts: number[] = [];
      let cursor = 0;
      sceneDurations.forEach((duration) => {
        sceneStarts.push(cursor);
        cursor += duration;
      });
      const startedAt = performance.now();
      const updateTimeline = () => {
        if (recorder.state !== 'recording') return;
        const elapsed = (performance.now() - startedAt) / 1000;
        if (elapsed >= totalDuration) {
          setProgress(100);
          onSceneChange(lesson.scenes.length - 1);
          stopRecording();
          return;
        }
        const nextIndex = sceneStarts.reduce((index, start, candidate) => elapsed >= start ? candidate : index, 0);
        onSceneChange(nextIndex);
        setProgress(Math.min(99, Math.round((elapsed / totalDuration) * 100)));
        timelineTimerRef.current = window.setTimeout(updateTimeline, 120);
      };
      recorder.start(250);
      setPhase('recording');
      onSceneChange(0);
      updateTimeline();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The video could not be rendered. Please try again.';
      setError(message);
      setPhase('error');
      captureStreamRef.current?.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleRecordedPlayback = async () => {
    const video = playbackRef.current;
    if (!video || !videoUrl) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setError('Playback could not start. Press play again to continue.');
      }
    } else video.pause();
  };

  const replay = () => {
    if (playbackRef.current) {
      playbackRef.current.currentTime = 0;
      playbackRef.current.play().then(() => setRecordedPlaying(true)).catch(() => setError('Playback could not start. Press play again to continue.'));
    }
  };

  const currentScene = lesson.scenes[sceneIndex];
  const recording = phase === 'preparing' || phase === 'recording';
  return (
    <div className="lesson-video-shell mb-5 overflow-hidden rounded-[20px] bg-[#173c3a] text-white" data-testid="panel-lesson-video">
      <div className="relative aspect-video w-full overflow-hidden">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="absolute inset-0 h-full w-full object-cover" role="img" aria-label={`Animated lesson scene ${sceneIndex + 1}: ${currentScene?.title}`} data-testid="canvas-lesson-video" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-[#173c3a]/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#d4e7dc] backdrop-blur-sm sm:left-6 sm:top-6">
          <span className={`h-2 w-2 rounded-full ${phase === 'recording' ? 'animate-pulse bg-[#ef8968]' : 'bg-[#e7c568]'}`} />
          {phase === 'recording' ? 'Rendering video' : `Scene ${String(sceneIndex + 1).padStart(2, '0')} / ${String(lesson.scenes.length).padStart(2, '0')}`}
        </div>
        {sceneIndex > 0 && (
          <div className="absolute bottom-4 left-4 max-w-[70%] rounded-xl border border-white/15 bg-[#173c3a]/75 px-3 py-2 text-[11px] leading-4 text-[#d5e2db] backdrop-blur-sm sm:bottom-6 sm:left-6 sm:px-4 sm:py-3">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.14em] text-[#e7c568]">Now exploring</span>
            {currentScene?.visualCue}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-white/10 bg-[#153734] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#f4f2e8]" data-testid="text-video-scene-title">{currentScene?.title}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#bbd0c5]">{currentScene?.narration}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {phase === 'ready' && (
            <>
              <button type="button" onClick={toggleRecordedPlayback} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15" data-testid="button-video-play-pause">
                {recordedPlaying ? <Pause size={15} /> : <Play size={15} />}
                {recordedPlaying ? 'Pause' : 'Play'}
              </button>
              <button type="button" onClick={replay} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/15" aria-label="Replay video" data-testid="button-video-replay"><RotateCcw size={15} /></button>
              <a href={videoUrl} download={`${lesson.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'studyloom-lesson'}.webm`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#e7c568] px-3 text-xs font-extrabold text-[#23413c] transition hover:bg-[#f0d77f]" data-testid="link-download-video">
                <Download size={15} /> Download
              </a>
            </>
          )}
          {phase !== 'ready' && phase !== 'recording' && (
            <button type="button" onClick={makeVideo} disabled={recording} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#e7c568] px-4 py-2 text-xs font-extrabold text-[#23413c] transition hover:bg-[#f0d77f] disabled:cursor-wait disabled:opacity-70" data-testid="button-create-video">
              {recording ? <LoaderCircle size={15} className="animate-spin" /> : <Video size={15} />}
              {phase === 'error' ? 'Try video again' : phase === 'unsupported' ? 'Try again' : 'Render lesson video'}
            </button>
          )}
          {phase === 'recording' && (
            <button type="button" onClick={stopRecording} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#ef8968] px-4 text-xs font-extrabold text-[#352e28] transition hover:bg-[#f49a7e]" data-testid="button-stop-rendering"><Pause size={15} /> Stop render</button>
          )}
        </div>
      </div>
      {recording && (
        <div className="border-t border-white/10 px-4 pb-4 sm:px-5" role="status" aria-live="polite" data-testid="status-video-rendering">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-[#bed2c7]">
            <span>{phase === 'preparing' ? 'Preparing the animation…' : 'Recording animated scenes and captions…'}</span>
            <span>{phase === 'preparing' ? '—' : `${progress}%`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#e7c568] transition-[width] duration-200" style={{ width: `${phase === 'preparing' ? 7 : progress}%` }} /></div>
        </div>
      )}
      {phase === 'ready' && (
        <div className="border-t border-white/10 p-3 sm:p-4">
          <video ref={playbackRef} src={videoUrl} controls playsInline onPlay={() => setRecordedPlaying(true)} onPause={() => setRecordedPlaying(false)} onEnded={() => setRecordedPlaying(false)} className="w-full rounded-xl bg-black" aria-label="Rendered animated lesson video with captions" data-testid="video-rendered-output" />
          <p className="mt-2 text-[10px] text-[#bed2c7]" data-testid="status-video-ready">Your captioned video is ready to play or download.</p>
        </div>
      )}
      {phase === 'unsupported' && <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-[#f2d8a7]" role="alert" data-testid="status-video-unsupported">Video recording is not supported in this browser. Try the latest Chrome, Edge, or Firefox to render a downloadable WebM.</p>}
      {phase === 'error' && <p className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-[#ffd0bd]" role="alert" data-testid="status-video-error">{error || 'Something interrupted video rendering. Please try again.'}</p>}
    </div>
  );
}
