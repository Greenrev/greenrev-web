"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_RATE = 16_000;
const BARS = 28;
export const MAX_SECONDS = 90;

export type RecorderState = "idle" | "recording" | "processing";

/** 16-bit PCM mono WAV — a format every speech model accepts, unlike the browser's WebM/MP4. */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

async function toWav(recorded: Blob): Promise<Blob> {
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await recorded.arrayBuffer());
    const length = Math.ceil(decoded.duration * SAMPLE_RATE);
    const offline = new OfflineAudioContext(1, length, SAMPLE_RATE);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    return encodeWav(rendered.getChannelData(0), SAMPLE_RATE);
  } finally {
    ctx.close();
  }
}

export function useWavRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const resolveRef = useRef<((b: Blob | null) => void) | null>(null);

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    setLevels(Array(BARS).fill(0));
  }, []);

  useEffect(() => teardown, [teardown]);

  /** Resolves with a WAV blob when recording stops, or null if cancelled. */
  const start = useCallback(async (): Promise<Blob | null> => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording isn't supported in this browser.");
      return null;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setError("Microphone access was blocked. Allow it in your browser settings and try again.");
      return null;
    }
    streamRef.current = stream;

    // Live level meter for the waveform.
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(bins);
      const step = Math.floor(bins.length / BARS);
      setLevels(Array.from({ length: BARS }, (_, i) => bins[i * step] / 255));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    const done = new Promise<Blob | null>((resolve) => (resolveRef.current = resolve));
    recorder.onstop = async () => {
      teardown();
      const resolve = resolveRef.current;
      resolveRef.current = null;
      if (!resolve) return;
      if (!chunks.length) {
        setState("idle");
        resolve(null);
        return;
      }
      setState("processing");
      try {
        resolve(await toWav(new Blob(chunks, { type: recorder.mimeType })));
      } catch {
        setError("Couldn't process the recording. Please try again.");
        resolve(null);
      } finally {
        setState("idle");
      }
    };

    setSeconds(0);
    const startedAt = Date.now();
    timerRef.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) recorder.stop();
    }, 250);

    recorder.start();
    setState("recording");
    return done;
  }, [teardown]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const cancel = useCallback(() => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(null);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setState("idle");
  }, []);

  return { state, levels, seconds, error, start, stop, cancel };
}
