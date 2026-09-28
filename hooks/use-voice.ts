"use client";
import { useEffect, useRef, useState } from "react";
import { plain } from "@/lib/types";
export function useVoice(
  language: string,
  onText: (text: string) => void,
  onError: (text: string) => void,
  rate = 1,
) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [player, setPlayer] = useState<{
    text: string;
    paused: boolean;
    elapsed: number;
    finished?: boolean;
  } | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const rec = useRef<any>(null);
  const active = useRef(false);
  const pausedRef = useRef(false);
  const full = useRef("");
  const partial = useRef("");
  const context = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const confirmed = useRef(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speakId = useRef(0);
  const lastText = useRef("");
  const stopMedia = () => {
    active.current = false;
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    context.current?.close().catch(() => {});
    context.current = null;
    setLevel(0);
    setRecording(false);
  };
  const cancel = () => {
    confirmed.current = false;
    active.current = false;
    rec.current?.abort();
    stopMedia();
    full.current = "";
    partial.current = "";
    setTranscript("");
  };
  async function start() {
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      onError(
        language === "fa"
          ? "تبدیل صدا به متن در این مرورگر پشتیبانی نمی‌شود. از Chrome اندروید استفاده کن."
          : "Speech recognition is unavailable. Try Chrome on Android.",
      );
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Microphone requires HTTPS.");
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      stream.current = media;
      active.current = true;
      pausedRef.current = false;
      confirmed.current = false;
      full.current = "";
      partial.current = "";
      setTranscript("");
      setSeconds(0);
      setPaused(false);
      const ctx = new AudioContext();
      context.current = ctx;
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      ctx.createMediaStreamSource(media).connect(analyzer);
      const samples = new Uint8Array(analyzer.frequencyBinCount);
      const tick = () => {
        if (!active.current) return;
        analyzer.getByteFrequencyData(samples);
        setLevel(samples.reduce((a, b) => a + b, 0) / samples.length / 128);
        raf.current = requestAnimationFrame(tick);
      };
      tick();
      const recognition = new Recognition();
      rec.current = recognition;
      recognition.lang = language === "fa" ? "fa-IR" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (e: any) => {
        let inter = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal)
            full.current += e.results[i][0].transcript + " ";
          else inter += e.results[i][0].transcript;
        }
        partial.current = inter;
        setTranscript(full.current + inter);
      };
      recognition.onend = () => {
        if (active.current && !pausedRef.current) {
          try {
            recognition.start();
          } catch {}
        } else if (confirmed.current) {
          confirmed.current = false;
          const text = (full.current + partial.current).trim();
          if (text) onText(text);
          else
            onError(
              language === "fa"
                ? "متنی تشخیص داده نشد. دوباره امتحان کن."
                : "No speech was recognized. Please try again.",
            );
        }
      };
      recognition.onerror = (e: any) => {
        if (e.error === "not-allowed" || e.error === "audio-capture") {
          cancel();
          onError(
            language === "fa"
              ? "دسترسی میکروفون را در تنظیمات مرورگر فعال کن."
              : "Allow microphone access in browser settings.",
          );
        } else if (e.error === "network") {
          cancel();
          onError(
            language === "fa"
              ? "سرویس تشخیص گفتار در دسترس نیست. اتصال اینترنت را بررسی کن."
              : "The speech service could not connect. Check your connection.",
          );
        }
      };
      recognition.start();
      setRecording(true);
    } catch (e: any) {
      cancel();
      onError(
        language === "fa"
          ? "میکروفون باز نشد؛ اجازهٔ دسترسی و اتصال امن را بررسی کن."
          : e.message || "Microphone could not start.",
      );
    }
  }
  function confirm() {
    confirmed.current = true;
    stopMedia();
    rec.current?.stop();
    if (pausedRef.current) {
      confirmed.current = false;
      const text = (full.current + partial.current).trim();
      if (text) onText(text);
    }
    setPaused(false);
  }
  function pause() {
    const p = !pausedRef.current;
    pausedRef.current = p;
    setPaused(p);
    if (p) {
      rec.current?.stop();
      stream.current?.getAudioTracks().forEach((t) => (t.enabled = false));
    } else {
      stream.current?.getAudioTracks().forEach((t) => (t.enabled = true));
      try {
        rec.current?.start();
      } catch {}
    }
  }
  function stopSpeaking() {
    speakId.current++;
    window.speechSynthesis?.cancel();
    utterance.current = null;
    setPlayer(null);
  }
  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      onError(
        language === "fa"
          ? "پخش گفتار در این مرورگر در دسترس نیست."
          : "Speech playback is not supported.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const token = ++speakId.current;
    lastText.current = text;
    const clean = plain(text);
    const isFa = /[\u0600-\u06ff]/.test(clean);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(isFa ? "fa" : "en"));
    if (isFa && !voice) {
      onError(
        "صدای فارسی روی این دستگاه نصب نیست. صدای فارسی را در تنظیمات تبدیل متن به گفتار اندروید نصب کن.",
      );
      return;
    }
    const chunks = clean.match(/[^.!?؟\n]{1,180}[.!?؟\n]?/g) || [clean];
    let i = 0;
    setPlayer({ text, paused: false, elapsed: 0 });
    const next = () => {
      if (token !== speakId.current) return;
      if (i >= chunks.length) {
        setPlayer((p) => (p ? { ...p, paused: true, finished: true } : null));
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i++]);
      utterance.current = u;
      u.lang = isFa ? "fa-IR" : "en-US";
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onend = next;
      u.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          stopSpeaking();
          onError(
            language === "fa"
              ? "پخش صدا انجام نشد."
              : "Speech playback failed.",
          );
        }
      };
      window.speechSynthesis.speak(u);
    };
    next();
  }
  function togglePlayer() {
    if (player?.finished) {
      speak(lastText.current);
      return;
    }
    if (player?.paused) window.speechSynthesis.resume();
    else window.speechSynthesis.pause();
    setPlayer((p) => (p ? { ...p, paused: !p.paused } : null));
  }
  useEffect(() => {
    // Android/Chromium load installed voices asynchronously on first use.
    window.speechSynthesis?.getVoices();
    const timer = setInterval(() => {
      if (active.current && !pausedRef.current) setSeconds((s) => s + 1);
      setPlayer((p) => (p && !p.paused ? { ...p, elapsed: p.elapsed + 1 } : p));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () => () => {
      active.current = false;
      rec.current?.abort();
      stream.current?.getTracks().forEach((t) => t.stop());
      context.current?.close();
      cancelAnimationFrame(raf.current);
      window.speechSynthesis?.cancel();
    },
    [],
  );
  return {
    recording,
    paused,
    seconds,
    level,
    transcript,
    start,
    cancel,
    confirm,
    pause,
    player,
    speak,
    stopSpeaking,
    togglePlayer,
  };
}
