import { narrateStudyLesson, type StudyLesson } from '@workspace/api-client-react';

/** Session-only audio cache. No student text or generated audio is persisted. */
export class LessonNarration {
  readonly context: AudioContext;
  readonly output: MediaStreamAudioDestinationNode;
  private buffers: (AudioBuffer | undefined)[];
  private source: AudioBufferSourceNode | null = null;
  private controller: AbortController | null = null;
  private startedAt = 0;
  private offset = 0;
  private running = false;
  private disposed = false;

  constructor(private lesson: StudyLesson) {
    if (typeof AudioContext === 'undefined') {
      throw new Error('AI narration needs a browser with Web Audio support. Try Chrome, Edge, or Safari.');
    }
    this.context = new AudioContext();
    this.output = this.context.createMediaStreamDestination();
    this.buffers = new Array(lesson.scenes.length);
  }

  async unlock() {
    await this.context.resume();
    if (this.context.state !== 'running') throw new Error('Press Play again to allow audio in this browser.');
  }

  async prepare(onProgress: (ready: number, total: number) => void) {
    const controller = new AbortController();
    this.controller = controller;
    const signal = controller.signal;
    let next = 0;
    let ready = this.buffers.filter(Boolean).length;
    onProgress(ready, this.buffers.length);
    const worker = async () => {
      while (next < this.buffers.length) {
        const index = next++;
        if (this.buffers[index]) continue;
        const result = await narrateStudyLesson({ text: this.lesson.scenes[index].narration, language: this.lesson.language ?? 'en' }, { signal });
        if (signal.aborted || this.disposed) throw new DOMException('Cancelled', 'AbortError');
        if (!result.audioBase64) throw new Error('The AI returned no narration. Please try again.');
        const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
        const buffer = await this.context.decodeAudioData(bytes.buffer);
        if (signal.aborted || this.disposed) throw new DOMException('Cancelled', 'AbortError');
        if (!Number.isFinite(buffer.duration) || buffer.duration <= 0) {
          throw new Error('The narration audio could not be played. Please try again.');
        }
        this.buffers[index] = buffer;
        onProgress(++ready, this.buffers.length);
      }
    };
    try {
      await Promise.all([worker(), worker()]);
    } catch (error) {
      controller.abort();
      throw error;
    }
  }

  duration(index: number) {
    // A short tail preserves the final spoken word and the last visual frame.
    const buffer = this.buffers[index];
    return buffer ? buffer.duration + 0.25 : undefined;
  }

  play(index: number, offset = 0) {
    this.pause();
    const buffer = this.buffers[index];
    if (!buffer) throw new Error('Narration is not ready yet. Please try again.');
    this.offset = Math.max(0, offset);
    this.startedAt = this.context.currentTime;
    this.running = true;
    if (offset >= buffer.duration) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.connect(this.output);
    this.source = source;
    source.start(0, this.offset);
  }

  get time() {
    return this.offset + (this.running ? Math.max(0, this.context.currentTime - this.startedAt) : 0);
  }

  pause() {
    this.offset = this.time;
    this.running = false;
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }
    return this.offset;
  }

  cancelPreparation() { this.controller?.abort(); }

  dispose() {
    this.disposed = true;
    this.cancelPreparation();
    this.pause();
    this.output.stream.getTracks().forEach((track) => track.stop());
    void this.context.close();
  }
}
