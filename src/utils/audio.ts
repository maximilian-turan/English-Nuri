// Audio, Speech Recognition, and Speech Synthesis Utilities

type SpeechCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;
type StateCallback = (isListening: boolean) => void;

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class SpeechManager {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: SpeechCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;
  private onStateCallback: StateCallback | null = null;

  // MediaRecorder fallback
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;

  // Audio playback cache & concurrency control
  private audioCache = new Map<string, string>();
  private currentAudioElement: HTMLAudioElement | null = null;
  private playbackCounter = 0;
  private currentAbortController: AbortController | null = null;
  private audioEngine: 'browser' | 'gemini' = 'browser'; // 100% OHNE API DEFAULT
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.populateVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.populateVoices();
      }
    }
  }

  private populateVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      this.cachedVoices = window.speechSynthesis.getVoices();
    } catch (e) {
      // ignore
    }
  }

  public getAudioEngine(): 'browser' | 'gemini' {
    return this.audioEngine;
  }

  public setAudioEngine(engine: 'browser' | 'gemini') {
    this.audioEngine = engine;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const win = window as IWindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStateCallback?.(true);
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript.trim()) {
            this.onResultCallback?.(finalTranscript.trim(), true);
          } else if (interimTranscript.trim()) {
            this.onResultCallback?.(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          this.onStateCallback?.(false);
          this.onErrorCallback?.(event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStateCallback?.(false);
        };
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowWithSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition || navigator.mediaDevices?.getUserMedia);
  }

  public startListening(
    onResult: SpeechCallback,
    onError?: ErrorCallback,
    onState?: StateCallback
  ): boolean {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onStateCallback = onState || null;

    this.stopSpeaking();

    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (err: any) {
        // Recognition might already be running
        console.warn('Recognition start caught:', err);
      }
    }

    // Try MediaRecorder fallback if Web Speech API isn't available
    this.startMediaRecorder(onResult, onError, onState);
    return true;
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignore
      }
    }
    this.isListening = false;
    this.onStateCallback?.(false);
    this.stopMediaRecorder();
  }

  private async startMediaRecorder(
    onResult: SpeechCallback,
    onError?: ErrorCallback,
    onState?: StateCallback
  ) {
    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.('Microphone not supported on this browser.');
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      const options = { mimeType: 'audio/webm' };
      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length === 0) return;
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string)?.split(',')[1];
          if (base64Data) {
            try {
              const res = await fetch('/api/coach/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
              });
              const data = await res.json();
              if (data.text) {
                onResult(data.text, true);
              }
            } catch (transcribeErr) {
              console.warn('Transcribe request error:', transcribeErr);
            }
          }
        };
      };

      this.mediaRecorder.start();
      this.isListening = true;
      onState?.(true);
    } catch (e: any) {
      onError?.(e.message || 'Permission denied or microphone error.');
      this.isListening = false;
      onState?.(false);
    }
  }

  private stopMediaRecorder() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  // PLAY PRE-RECORDED PRISTINE GREETING FOR FAMILY TURAN
  public async playGreeting(
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    this.stopSpeaking();
    const currentPlaybackId = ++this.playbackCounter;

    // First try the native high-definition audio asset
    try {
      const success = await this.playAudioFromUrl(
        '/assets/audio/greeting_family_turan.wav',
        currentPlaybackId,
        onStart,
        onEnd
      );
      if (success) return true;
    } catch (e) {
      console.warn('Native wav playback not allowed yet, trying WebSpeech...', e);
    }

    // Fallback: Web Speech Synthesis
    return this.playBrowserTTS(
      'Hello Family Turan! Welcome to NextLumen English Academy.',
      'normal',
      onStart,
      onEnd
    );
  }

  // SOUND CHECK TONE (100% OFFLINE WEB AUDIO OSCILLATOR)
  public playSoundCheckTone(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // ignore
    }
  }

  // TTS PLAYBACK WITH ZERO-API BROWSER SPEECH SYNTHESIS AS PRIMARY DEFAULT
  public async playCoachSpeech(
    text: string,
    options: {
      speed?: 'normal' | 'slow';
      voice?: string;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ): Promise<boolean> {
    const { speed = 'normal', voice = 'Kore', onStart, onEnd } = options;
    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) return false;

    // Immediately stop any currently playing or pending audio
    this.stopSpeaking();

    // Check if this is the standard Family Turan greeting
    if (cleanText.toLowerCase().includes('hello family turan')) {
      const success = await this.playGreeting(onStart, onEnd);
      if (success) return true;
    }

    // 1. DEFAULT OHNE API: Web Speech Synthesis (Sofortige Audio-Wiedergabe ohne Server/API-Anfrage)
    if (this.audioEngine === 'browser') {
      const browserSuccess = await this.playBrowserTTS(cleanText, speed, onStart, onEnd);
      if (browserSuccess) return true;
      // If browser TTS failed, gracefully fall through to cloud TTS fallback!
    }

    // 2. SERVER AUDIO / CLOUD API FALLBACK
    const currentPlaybackId = ++this.playbackCounter;
    this.currentAbortController = new AbortController();

    const cacheKey = `${voice}_${speed}_${cleanText}`;
    if (this.audioCache.has(cacheKey)) {
      const cachedDataUrl = this.audioCache.get(cacheKey)!;
      if (this.playbackCounter !== currentPlaybackId) return false;
      return this.playAudioFromUrl(cachedDataUrl, currentPlaybackId, onStart, onEnd);
    }

    try {
      const res = await fetch('/api/coach/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, speed, voice }),
        signal: this.currentAbortController.signal,
      });

      if (this.playbackCounter !== currentPlaybackId) return false;
      if (!res.ok) throw new Error(`TTS server responded with ${res.status}`);

      const data = await res.json();
      if (this.playbackCounter !== currentPlaybackId) return false;

      if (data.audioBase64) {
        const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
        this.audioCache.set(cacheKey, audioUrl);
        return this.playAudioFromUrl(audioUrl, currentPlaybackId, onStart, onEnd);
      } else {
        throw new Error('No base64 audio returned');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || this.playbackCounter !== currentPlaybackId) {
        return false;
      }
      console.warn('Audio playback fallback error:', err);
      return false;
    }
  }

  private playAudioFromUrl(
    url: string,
    playbackId: number,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.playbackCounter !== playbackId) {
        onEnd?.();
        return resolve(false);
      }

      const audio = new Audio(url);
      this.currentAudioElement = audio;

      audio.onplay = () => onStart?.();
      audio.onended = () => {
        if (this.currentAudioElement === audio) {
          this.currentAudioElement = null;
        }
        onEnd?.();
        resolve(true);
      };
      audio.onerror = (e) => {
        if (this.currentAudioElement === audio) {
          this.currentAudioElement = null;
        }
        onEnd?.();
        reject(e);
      };

      audio.play().catch((e) => {
        console.warn('Audio play error (user interaction might be required):', e);
        if (this.currentAudioElement === audio) {
          this.currentAudioElement = null;
        }
        onEnd?.();
        reject(e);
      });
    });
  }

  public playBrowserTTS(
    text: string,
    speed: 'normal' | 'slow' = 'normal',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.();
        return resolve(false);
      }

      try {
        // Unlock / resume if paused by browser
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speed === 'slow' ? 0.78 : 0.95;
      utterance.pitch = 1.0;

      // Find best English voice if available
      const voices =
        this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();

      const enVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Karen') ||
              v.name.includes('Daniel') ||
              v.name.includes('Victoria') ||
              v.name.includes('Serena') ||
              v.name.includes('Alex'))
        ) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (enVoice) utterance.voice = enVoice;

      // Prevent Chrome GC bug by referencing utterance globally
      (window as any).__activeSpeechUtterance = utterance;

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        (window as any).__activeSpeechUtterance = null;
        onEnd?.();
        resolve(true);
      };
      utterance.onerror = (e) => {
        (window as any).__activeSpeechUtterance = null;
        console.warn('Speech synthesis utterance error:', e);
        onEnd?.();
        resolve(false);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        (window as any).__activeSpeechUtterance = null;
        console.warn('Speech synthesis speak error:', err);
        onEnd?.();
        resolve(false);
      }
    });
  }

  public stopSpeaking() {
    this.playbackCounter++;
    if (this.currentAbortController) {
      try {
        this.currentAbortController.abort();
      } catch (e) {
        // ignore
      }
      this.currentAbortController = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioService = new SpeechManager();
