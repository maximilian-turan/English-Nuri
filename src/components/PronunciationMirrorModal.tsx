import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Volume2, Sparkles, X, Check, Eye } from 'lucide-react';
import { audioService } from '../utils/audio';

interface PronunciationMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSound?: string;
}

interface SoundGuide {
  sound: string;
  ipa: string;
  name: string;
  mouthTip: string;
  exampleWords: string[];
  audioText: string;
}

const SOUND_GUIDES: SoundGuide[] = [
  {
    sound: 'TH (soft)',
    ipa: '/θ/',
    name: 'Unvoiced TH (think, thanks, mouth)',
    mouthTip: 'Zungenspitze leicht zwischen die Schneidezähne schieben. Luft sanft herausblasen, ohne die Stimmbänder vibrieren zu lassen.',
    exampleWords: ['Think', 'Thanks', 'Three', 'Birthday', 'Tooth'],
    audioText: 'The soft TH sound: Think. Thanks. Three. Birthday.',
  },
  {
    sound: 'TH (voiced)',
    ipa: '/ð/',
    name: 'Voiced TH (this, that, brother)',
    mouthTip: 'Gleiche Zungenposition zwischen den Zähnen wie bei soft TH, aber mit Stimmton (Stimmbänder spürbar vibrieren lassen).',
    exampleWords: ['This', 'That', 'They', 'Mother', 'Breathe'],
    audioText: 'The voiced TH sound: This. That. They. Mother.',
  },
  {
    sound: 'W sound',
    ipa: '/w/',
    name: 'W Sound (water, world, weekend)',
    mouthTip: 'Lippen rund spitzen wie zu einem Kussmund oder kleinem O. Die Zähne berühren die Lippen NICHT! Nicht wie deutsches W aussprechen.',
    exampleWords: ['Water', 'World', 'Weekend', 'Window', 'Always'],
    audioText: 'The W sound: Round your lips. Water. World. Weekend.',
  },
  {
    sound: 'V sound',
    ipa: '/v/',
    name: 'V Sound (voice, very, travel)',
    mouthTip: 'Obere Schneidezähne sanft auf die innere Unterlippe legen. Luft vibrierend mit Stimmton herausblasen.',
    exampleWords: ['Very', 'Voice', 'Visit', 'Travel', 'Never'],
    audioText: 'The V sound: Upper teeth on lower lip. Very. Voice. Visit.',
  },
  {
    sound: 'American R',
    ipa: '/r/',
    name: 'American R (red, right, story)',
    mouthTip: 'Zungenspitze leicht nach oben und hinten biegen (retroflex), ohne den Gaumen zu berühren! Lippen leicht runden.',
    exampleWords: ['Red', 'Right', 'Friend', 'Great', 'Star'],
    audioText: 'The American R sound: Curl tongue back. Red. Right. Friend.',
  },
];

export const PronunciationMirrorModal: React.FC<PronunciationMirrorModalProps> = ({
  isOpen,
  onClose,
  initialSound = '/θ/',
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedGuideIndex, setSelectedGuideIndex] = useState<number>(0);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialSound) {
      const idx = SOUND_GUIDES.findIndex((g) => g.ipa === initialSound || g.sound.includes(initialSound));
      if (idx !== -1) setSelectedGuideIndex(idx);
    }
  }, [initialSound, isOpen]);

  // Start webcam when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera im aktuellen Browser nicht verfügbar.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Webcam mirror error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Kamerazugriff wurde im Browser blockiert. Bitte Berechtigung in der Adressleiste erlauben.'
          : 'Kamera konnte nicht gestartet werden. Bitte überprüfen, ob eine Webcam angeschlossen ist.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handlePlaySound = async (text: string) => {
    audioService.playSoundCheckTone();
    try {
      setIsPlayingSound(true);
      await audioService.playCoachSpeech(text, {
        voice: 'Kore',
        speed: 'slow',
        onStart: () => setIsPlayingSound(true),
        onEnd: () => setIsPlayingSound(false),
      });
    } catch (e) {
      console.warn('Sound play error:', e);
    } finally {
      setIsPlayingSound(false);
    }
  };

  if (!isOpen) return null;

  const currentGuide = SOUND_GUIDES[selectedGuideIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  Aussprache-Spiegel (Sehen & Hören)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Lokal · Ohne API
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sieh deine eigene Mund- und Zungenstellung im Spiegel, um englische Laute perfekt zu formen!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left: Video Mirror Feed */}
          <div className="md:col-span-6 flex flex-col space-y-3">
            <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Live Video with Mirror Transform */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />

              {!isCameraActive && (
                <div className="p-6 text-center flex flex-col items-center space-y-3 max-w-xs">
                  <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                    <CameraOff className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200">
                      Kamera nicht aktiv
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {cameraError || 'Erlaube den Kamerazugriff im Browser, um deinen Mund live zu sehen.'}
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Kamera jetzt starten</span>
                  </button>
                </div>
              )}

              {/* Guide Overlay inside Video */}
              {isCameraActive && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Mund-Spiegel aktiv
                  </span>
                  <button
                    onClick={stopCamera}
                    className="text-[11px] text-slate-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Kamera ausschalten
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              <span>🔒 Privatsphäre: Dein Kamerabild verlässt niemals dein Gerät (100% lokal).</span>
            </div>
          </div>

          {/* Right: Sound Guide & Mouth Position Instructions */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            {/* Sound Selector Tabs */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Laut zum Üben auswählen:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SOUND_GUIDES.map((g, idx) => (
                  <button
                    key={g.sound}
                    onClick={() => setSelectedGuideIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
                      selectedGuideIndex === idx
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {g.sound} <span className="opacity-75">{g.ipa}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Guide Details */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-amber-300">
                    {currentGuide.name}
                  </h3>
                  <span className="font-mono text-xs text-emerald-400">
                    IPA Lautschrift: {currentGuide.ipa}
                  </span>
                </div>

                <button
                  onClick={() => handlePlaySound(currentGuide.audioText)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    isPlayingSound
                      ? 'bg-emerald-400 text-slate-950 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title="Lautbeispiel anhören"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingSound ? 'Spielt...' : 'Laut hören 🔊'}</span>
                </button>
              </div>

              {/* Mouth tip */}
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1">
                  👄 Mund- & Zungenstellung im Spiegel:
                </span>
                {currentGuide.mouthTip}
              </div>

              {/* Example Words */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Wörter zum Nachsprechen:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentGuide.exampleWords.map((word) => (
                    <button
                      key={word}
                      onClick={() => handlePlaySound(word)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      title={`${word} anhören`}
                    >
                      <Volume2 className="w-3 h-3 text-slate-400" />
                      <span>{word}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Coach Quick Tip */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Tipp für Schüler (10–15 J.):</strong> Schaue beim Sprechen genau auf deine Lippen und Zähne. Bei englischem TH muss die Zunge sichtbar sein!
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            NextLumen English Speaking Academy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fertig & Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
