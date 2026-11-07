import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Clock,
  Check,
  RefreshCw,
  Upload,
  Trash2,
  Mic,
} from 'lucide-react';
import { Scene, VisualElement } from '../../types/explainroo';
import { audioEngine } from '../../utils/audioEngine';

interface ScriptEditorProps {
  scene: Scene;
  selectedElementId: string | null;
  onUpdateNarration: (text: string) => void;
  onUpdateElementTriggerWord: (elementId: string, word: string) => void;
  onUpdateCustomAudio?: (url?: string, filename?: string) => void;
  voiceRate: number;
  voicePitch: number;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scene,
  selectedElementId,
  onUpdateNarration,
  onUpdateElementTriggerWord,
  onUpdateCustomAudio,
  voiceRate,
  voicePitch,
}) => {
  const [isPolishing, setIsPolishing] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [liveSpokenWordIndex, setLiveSpokenWordIndex] = useState<number>(-1);

  // Subscribe to real-time word boundary updates from AudioEngine
  useEffect(() => {
    const unsub = audioEngine.addWordListener((_word, _charIdx, wordIdx) => {
      setLiveSpokenWordIndex(wordIdx);
      if (wordIdx < 0) {
        setIsPlayingVoice(false);
      }
    });
    return () => unsub();
  }, []);

  const words = scene.narration
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((rawWord) => rawWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ''));

  const wordCount = words.length;
  // Estimated reading time at ~150 words per minute (2.5 words per second)
  const estimatedSeconds = Math.max(3, Math.round(wordCount / 2.5));

  // Find currently selected element
  const selectedElement = scene.elements.find((el) => el.id === selectedElementId);

  // Map each word to elements that trigger on it
  const wordTriggerMap: Record<string, VisualElement[]> = {};
  scene.elements.forEach((el) => {
    if (el.triggerWord) {
      const cleanTrigger = el.triggerWord.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!wordTriggerMap[cleanTrigger]) {
        wordTriggerMap[cleanTrigger] = [];
      }
      wordTriggerMap[cleanTrigger].push(el);
    }
  });

  const handlePolishWithAi = async () => {
    if (!scene.narration) return;
    try {
      setIsPolishing(true);
      const res = await fetch('/api/explainroo/improve-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scene.narration, goal: 'punchy and conversational' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.improvedText) {
          onUpdateNarration(data.improvedText);
          audioEngine.playDrawChime();
        }
      }
    } catch (err) {
      console.error('Failed to polish script:', err);
    } finally {
      setIsPolishing(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (onUpdateCustomAudio) {
      onUpdateCustomAudio(url, file.name);
    }
    audioEngine.playPop();
  };

  const handleRemoveCustomAudio = () => {
    if (onUpdateCustomAudio) {
      onUpdateCustomAudio(undefined, undefined);
    }
    audioEngine.stopCustomAudio();
    setIsPlayingVoice(false);
  };

  const handleTestVoice = () => {
    if (isPlayingVoice) {
      audioEngine.stopSpeaking();
      setIsPlayingVoice(false);
      setLiveSpokenWordIndex(-1);
    } else {
      setIsPlayingVoice(true);
      if (scene.customAudioUrl) {
        audioEngine.playCustomAudio(scene.customAudioUrl, () => {
          setIsPlayingVoice(false);
          setLiveSpokenWordIndex(-1);
        });
      } else {
        audioEngine.speakNarration(
          scene.narration,
          (_word, _charIdx, wordIdx) => {
            setLiveSpokenWordIndex(wordIdx);
          },
          () => {
            setIsPlayingVoice(false);
            setLiveSpokenWordIndex(-1);
          },
          voiceRate,
          voicePitch
        );
      }
    }
  };

  const handleWordChipClick = (wordText: string) => {
    if (!selectedElement) return;
    const clean = wordText.toLowerCase();
    onUpdateElementTriggerWord(selectedElement.id, clean);
    audioEngine.playPop();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Voiceover Script & Word Sync
          </h3>
          <p className="text-[11px] text-slate-500">
            Explainroo synchronizes your drawings with spoken words
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Test Voice */}
          <button
            onClick={handleTestVoice}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isPlayingVoice
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Preview spoken narration"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPlayingVoice ? 'Speaking...' : 'Listen'}</span>
          </button>

          {/* AI Polish Script */}
          <button
            onClick={handlePolishWithAi}
            disabled={isPolishing || !scene.narration}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Make script punchier using AI"
          >
            {isPolishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>AI Polish</span>
          </button>
        </div>
      </div>

      {/* Narration Text Area */}
      <div className="relative">
        <textarea
          rows={3}
          value={scene.narration}
          onChange={(e) => onUpdateNarration(e.target.value)}
          placeholder="Write the narration voiceover for this scene..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400/80 rounded-xl p-3 text-xs sm:text-sm text-slate-200 outline-none resize-none transition-colors"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>~{estimatedSeconds}s spoken ({wordCount} words)</span>
          </span>
          <span className="italic text-slate-400">
            {selectedElement
              ? `Click a word below to anchor "${selectedElement.label || selectedElement.type}"`
              : 'Select an element to sync it to a word'}
          </span>
        </div>
      </div>

      {/* Custom Audio Upload Row */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center gap-2 overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />
          <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {scene.customAudioUrl ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-xs text-emerald-300 font-mono truncate max-w-[180px]">
                {scene.customAudioName || 'Custom Audio'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Web Speech TTS active · Or upload voiceover file
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {scene.customAudioUrl ? (
            <button
              onClick={handleRemoveCustomAudio}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Remove custom audio and use Web Speech TTS"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Upload MP3 or WAV voiceover track"
            >
              <Upload className="w-3 h-3 text-slate-400" />
              <span>Upload MP3/WAV</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Word Sync Chips */}
      {words.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-2">
            Click Word to Anchor Selected Element:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {words.map((w, idx) => {
              const clean = w.toLowerCase();
              const isAttachedToSelected =
                selectedElement &&
                selectedElement.triggerWord?.toLowerCase().replace(/[^a-z0-9]/g, '') === clean;
              const attachedElements = wordTriggerMap[clean] || [];
              const isSpeakingNow = liveSpokenWordIndex === idx;

              return (
                <button
                  key={`${w}-${idx}`}
                  onClick={() => handleWordChipClick(w)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSpeakingNow
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-300 scale-110 shadow-[0_0_18px_rgba(251,191,36,0.95)] ring-2 ring-amber-300 z-10 animate-pulse'
                      : isAttachedToSelected
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)] scale-105'
                      : attachedElements.length > 0
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                  title={
                    isSpeakingNow
                      ? `Currently speaking: "${w}"`
                      : selectedElement
                      ? `Click to trigger "${selectedElement.label || selectedElement.type}" on "${w}"`
                      : `${attachedElements.length} element(s) trigger here`
                  }
                >
                  <span>{w}</span>
                  {attachedElements.length > 0 && !isAttachedToSelected && !isSpeakingNow && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                  {isAttachedToSelected && !isSpeakingNow && (
                    <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                  )}
                  {isSpeakingNow && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
