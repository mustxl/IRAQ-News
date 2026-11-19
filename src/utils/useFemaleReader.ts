import { useCallback, useEffect, useRef, useState } from 'react';
import { getSource } from '../data/newsData';
import { NewsArticle } from '../types/news';

export interface AudioReaderState {
  activeId: string | null;
  activeTitle: string;
  isPaused: boolean;
  isLoading: boolean;
  currentChunkIndex: number;
  totalChunks: number;
  currentSubtitle: string;
  mode: 'cloud' | 'native';
  voiceLabel: string;
}

const SILENT_WAV_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

function chunkFullText(text: string): string[] {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[،.؟!؛])\s+/);
  const chunks: string[] = [];
  let buffer = '';

  for (const s of sentences) {
    if ((buffer + ' ' + s).trim().length <= 220) {
      buffer = (buffer + ' ' + s).trim();
    } else {
      if (buffer) chunks.push(buffer);
      if (s.length <= 240) {
        buffer = s;
      } else {
        const words = s.split(' ');
        let cur = '';
        for (const w of words) {
          if ((cur + ' ' + w).trim().length > 220) {
            if (cur) chunks.push(cur.trim());
            cur = w;
          } else {
            cur = (cur + ' ' + w).trim();
          }
        }
        buffer = cur;
      }
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks.filter(Boolean);
}

export function useFemaleReader(onToast: (msg: string) => void) {
  const [state, setState] = useState<AudioReaderState>({
    activeId: null,
    activeTitle: '',
    isPaused: false,
    isLoading: false,
    currentChunkIndex: 0,
    totalChunks: 0,
    currentSubtitle: '',
    mode: 'cloud',
    voiceLabel: 'القارئ الإخباري السحابي (صوت نسائي)',
  });

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const activeIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef(0);
  const isPausedRef = useRef(false);
  const modeRef = useRef<'cloud' | 'native'>('cloud');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const ttsCacheRef = useRef<Map<string, Promise<Blob>>>(new Map());
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const revokeActiveBlobUrl = useCallback(() => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices() || [];
      if (!list.length) return;
      const preferred = ['laila', 'mariam', 'hoda', 'salma', 'amina', 'fatima', 'rana', 'zira', 'sara', 'female', 'woman'];
      const arList = list.filter((v) => (v.lang || '').toLowerCase().startsWith('ar'));
      femaleVoiceRef.current =
        arList.find((v) => preferred.some((name) => (v.name || '').toLowerCase().includes(name))) ||
        arList[0] ||
        null;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stop = useCallback(() => {
    sessionTokenRef.current += 1;
    activeIdRef.current = null;
    isPausedRef.current = false;
    chunksRef.current = [];
    indexRef.current = 0;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }

    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      } catch {
        // ignore
      }
    }
    revokeActiveBlobUrl();

    setState((prev) => ({
      ...prev,
      activeId: null,
      activeTitle: '',
      isPaused: false,
      isLoading: false,
      currentChunkIndex: 0,
      totalChunks: 0,
      currentSubtitle: '',
    }));
  }, [revokeActiveBlobUrl]);

  useEffect(() => stop, [stop]);

  const fetchChunkBlob = useCallback((text: string): Promise<Blob> => {
    const existing = ttsCacheRef.current.get(text);
    if (existing) return existing;

    const promise = (async () => {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        audioBase64?: string;
        mimeType?: string;
        error?: string;
      };

      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'فشل توليد الصوت من الخادم');
      }

      const mime = data.mimeType || 'audio/wav';
      return base64ToBlob(data.audioBase64, mime);
    })();

    promise.catch(() => {
      ttsCacheRef.current.delete(text);
    });

    if (ttsCacheRef.current.size > 60) {
      const firstKey = ttsCacheRef.current.keys().next().value;
      if (firstKey) ttsCacheRef.current.delete(firstKey);
    }
    ttsCacheRef.current.set(text, promise);
    return promise;
  }, []);

  const playCurrentChunkRef = useRef<() => void>(() => {});

  const playNativeFallback = useCallback(
    (chunk: string, token: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onToast('تعذر تشغيل القارئ الصوتي على هذا المتصفح');
        stop();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(chunk);
        if (femaleVoiceRef.current) {
          utter.voice = femaleVoiceRef.current;
        }
        utter.lang = 'ar-SA';
        utter.pitch = 1.08;
        utter.rate = 0.96;

        utter.onstart = () => {
          if (sessionTokenRef.current !== token) return;
          modeRef.current = 'native';
          setState((prev) => ({
            ...prev,
            mode: 'native',
            isLoading: false,
            voiceLabel: femaleVoiceRef.current
              ? `صوت النظام (${femaleVoiceRef.current.name})`
              : 'صوت المتصفح المحلي',
          }));
        };

        utter.onend = () => {
          if (sessionTokenRef.current !== token) return;
          if (activeIdRef.current && !isPausedRef.current) {
            indexRef.current += 1;
            playCurrentChunkRef.current();
          }
        };

        utter.onerror = () => {
          if (sessionTokenRef.current !== token) return;
          onToast('تعذر تشغيل الصوت — يرجى التحقق من إعدادات الصوت في الجهاز');
          stop();
        };

        window.speechSynthesis.speak(utter);
      } catch {
        onToast('تعذر تشغيل القارئ الصوتي');
        stop();
      }
    },
    [onToast, stop]
  );

  const playCurrentChunk = useCallback(async () => {
    const token = sessionTokenRef.current;
    if (!activeIdRef.current) return;

    if (indexRef.current >= chunksRef.current.length) {
      stop();
      return;
    }

    const currentIdx = indexRef.current;
    const chunk = chunksRef.current[currentIdx];

    setState((prev) => ({
      ...prev,
      isLoading: true,
      currentChunkIndex: currentIdx,
      totalChunks: chunksRef.current.length,
      currentSubtitle: chunk,
    }));

    const nextText = chunksRef.current[currentIdx + 1];
    if (nextText) {
      fetchChunkBlob(nextText).catch(() => {});
    }

    try {
      const blob = await fetchChunkBlob(chunk);
      if (sessionTokenRef.current !== token || !activeIdRef.current) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.onended = null;
      audio.onerror = null;

      revokeActiveBlobUrl();
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrlRef.current = blobUrl;
      audio.src = blobUrl;

      audio.onended = () => {
        if (sessionTokenRef.current !== token) return;
        if (activeIdRef.current && !isPausedRef.current) {
          indexRef.current += 1;
          playCurrentChunkRef.current();
        }
      };

      audio.onerror = () => {
        if (sessionTokenRef.current !== token) return;
        playNativeFallback(chunk, token);
      };

      modeRef.current = 'cloud';
      setState((prev) => ({
        ...prev,
        mode: 'cloud',
        isLoading: false,
        voiceLabel: 'القارئ الإخباري السحابي (صوت نسائي)',
      }));

      if (!isPausedRef.current) {
        await audio.play();
      }
    } catch {
      if (sessionTokenRef.current !== token || !activeIdRef.current) return;
      playNativeFallback(chunk, token);
    }
  }, [fetchChunkBlob, playNativeFallback, revokeActiveBlobUrl, stop]);

  useEffect(() => {
    playCurrentChunkRef.current = () => {
      void playCurrentChunk();
    };
  }, [playCurrentChunk]);

  const playArticle = useCallback(
    (article: NewsArticle) => {
      if (activeIdRef.current === article.id) {
        stop();
        return;
      }

      stop();
      const token = sessionTokenRef.current;
      activeIdRef.current = article.id;
      isPausedRef.current = false;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = SILENT_WAV_URI;
        const p = audioRef.current.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch {
        // ignore unlock errors
      }

      const src = getSource(article.sourceId);
      const fullText = `خبر من ${src.name}. ${article.title}. ${article.paragraphs.join(' ')}`;
      const chunks = chunkFullText(fullText);
      chunksRef.current = chunks;
      indexRef.current = 0;

      setState((prev) => ({
        ...prev,
        activeId: article.id,
        activeTitle: article.title,
        isPaused: false,
        isLoading: true,
        currentChunkIndex: 0,
        totalChunks: chunks.length,
        currentSubtitle: chunks[0] ?? '',
      }));

      if (sessionTokenRef.current === token) {
        void playCurrentChunk();
      }
    },
    [playCurrentChunk, stop]
  );

  const togglePause = useCallback(() => {
    if (!activeIdRef.current) return;
    const nextPaused = !isPausedRef.current;
    isPausedRef.current = nextPaused;
    setState((prev) => ({ ...prev, isPaused: nextPaused }));

    if (modeRef.current === 'cloud' && audioRef.current) {
      if (nextPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (nextPaused) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
    }
  }, []);

  const nextChunk = useCallback(() => {
    if (!activeIdRef.current) return;
    sessionTokenRef.current += 1;

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }

    if (audioRef.current) {
      try {
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
      } catch {
        // ignore
      }
    }

    isPausedRef.current = false;
    indexRef.current += 1;
    setState((prev) => ({ ...prev, isPaused: false }));
    void playCurrentChunk();
  }, [playCurrentChunk]);

  return {
    audioState: state,
    playArticle,
    togglePause,
    nextChunk,
    stop,
  };
}
