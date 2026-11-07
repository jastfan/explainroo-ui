import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Scene, ThemeLook } from '../../types/explainroo';
import { renderSceneToCanvas } from '../../utils/canvasRenderer';
import { audioEngine } from '../../utils/audioEngine';

interface VideoPlayerProps {
  scene: Scene;
  theme: ThemeLook;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElementPosition: (id: string, x: number, y: number) => void;
  currentSceneIndex: number;
  totalScenes: number;
  onPrevScene: () => void;
  onNextScene: () => void;
  musicTrack: string;
  autoDuck: boolean;
  voiceRate: number;
  voicePitch: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  scene,
  theme,
  selectedElementId,
  onSelectElement,
  onUpdateElementPosition,
  currentSceneIndex,
  totalScenes,
  onPrevScene,
  onNextScene,
  musicTrack,
  voiceRate,
  voicePitch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSubtitlesEnabled, setIsSubtitlesEnabled] = useState<boolean>(true);
  const [liveWordIndex, setLiveWordIndex] = useState<number>(-1);

  // Subscribe to real-time word boundary notifications from AudioEngine
  useEffect(() => {
    const unsub = audioEngine.addWordListener((_word, _charIdx, wordIdx) => {
      setLiveWordIndex(wordIdx);
    });
    return () => unsub();
  }, []);

  // Dragging state for interactive canvas editing
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const duration = scene.durationSeconds || 7;

  // Render canvas whenever state changes
  const redrawCanvas = useCallback(
    (time: number, selectedId: string | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      renderSceneToCanvas({
        canvas,
        scene,
        currentTime: time,
        theme,
        selectedElementId: selectedId,
        interactiveMode: !isPlaying,
      });
    },
    [scene, theme, isPlaying]
  );

  // Redraw when scene, time, theme, or selection changes
  useEffect(() => {
    redrawCanvas(currentTime, selectedElementId);
  }, [redrawCanvas, currentTime, selectedElementId]);

  // Reset playback time and live subtitle sync when scene changes
  useEffect(() => {
    setCurrentTime(0);
    setLiveWordIndex(-1);
  }, [scene.id]);

  // Keep a ref to the latest time so the rAF loop does not need to call parent callbacks inside setState
  const currentTimeRef = useRef<number>(0);
  currentTimeRef.current = currentTime;

  // Animation frame loop for smooth playback
  useEffect(() => {
    let animId: number;
    let lastTimestamp: number | null = null;

    if (isPlaying) {
      if (isMusicEnabled) {
        audioEngine.startMusic(musicTrack);
      }

      // Trigger voiceover (custom uploaded audio or Web Speech synthesis)
      if (!isVoiceMuted) {
        if (scene.customAudioUrl) {
          audioEngine.playCustomAudio(scene.customAudioUrl);
        } else if (scene.narration) {
          audioEngine.speakNarration(
            scene.narration,
            (_word, _charIdx, wordIdx) => {
              setLiveWordIndex(wordIdx);
            },
            () => {
              setLiveWordIndex(-1);
            },
            voiceRate,
            voicePitch
          );
        }
      }

      const loop = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        const nextTime = currentTimeRef.current + delta * playbackSpeed;

        if (nextTime >= duration) {
          if (currentSceneIndex < totalScenes - 1) {
            setCurrentTime(0);
            setLiveWordIndex(-1);
            onNextScene();
          } else {
            setCurrentTime(duration);
            setIsPlaying(false);
            setLiveWordIndex(-1);
            audioEngine.stopSpeaking();
            return;
          }
        } else {
          setCurrentTime(nextTime);
        }

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    } else {
      setLiveWordIndex(-1);
      audioEngine.stopSpeaking();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      setLiveWordIndex(-1);
      audioEngine.stopSpeaking();
    };
  }, [
    isPlaying,
    playbackSpeed,
    duration,
    currentSceneIndex,
    totalScenes,
    onNextScene,
    isMusicEnabled,
    musicTrack,
    isVoiceMuted,
    scene.narration,
    voiceRate,
    voicePitch,
  ]);

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleRewind = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLiveWordIndex(-1);
    audioEngine.stopSpeaking();
    audioEngine.playWhoosh();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isPlaying) {
      setLiveWordIndex(-1);
    }
  };

  // Canvas Mouse / Touch interactions for direct visual manipulation
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPlaying) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    // Hit test reverse (top-most elements first)
    const reversed = [...scene.elements].reverse();
    const hit = reversed.find((el) => {
      return (
        x >= el.x &&
        x <= el.x + el.width &&
        y >= el.y &&
        y <= el.y + el.height
      );
    });

    if (hit) {
      onSelectElement(hit.id);
      setDraggingElementId(hit.id);
      setDragOffset({ x: x - hit.x, y: y - hit.y });
      audioEngine.playPop();
    } else {
      onSelectElement(null);
      setDraggingElementId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingElementId || isPlaying) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const newX = Math.round(x - dragOffset.x);
    const newY = Math.round(y - dragOffset.y);
    onUpdateElementPosition(draggingElementId, newX, newY);
  };

  const handlePointerUp = () => {
    setDraggingElementId(null);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative select-none"
    >
      {/* 16:9 Cinema Canvas Container */}
      <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full object-contain cursor-crosshair touch-none"
          title="Click or drag elements on the canvas to position them"
        />

        {/* Big Center Play Overlay Button when paused at beginning */}
        {!isPlaying && currentTime === 0 && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/20 hover:bg-slate-950/30 transition-colors group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 fill-slate-950 ml-1" />
            </div>
          </button>
        )}

        {/* Scene Indicator Stamp */}
        <div className="absolute top-3 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 pointer-events-none">
          Scene {currentSceneIndex + 1} / {totalScenes} · {scene.title}
        </div>

        {/* Whisper-style Dynamic Captions: Pure Yellow Word Highlight */}
        {isSubtitlesEnabled && scene.narration && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-20 px-4">
            <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-[0_4px_24px_rgba(0,0,0,0.7)] text-center max-w-[90%]">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 flex flex-wrap justify-center items-center gap-1.5 leading-relaxed">
                {(() => {
                  const words = scene.narration.split(/\s+/).filter(Boolean);
                  if (words.length === 0) return null;
                  const progress = Math.min(0.999, Math.max(0, currentTime / Math.max(0.1, duration)));
                  const computedFallbackIdx = Math.min(words.length - 1, Math.floor(progress * words.length));
                  const activeIdx =
                    isPlaying && liveWordIndex >= 0 && liveWordIndex < words.length
                      ? liveWordIndex
                      : computedFallbackIdx;

                  // Rolling window of up to 7 words centered around active word
                  const windowSize = Math.min(words.length, 7);
                  const half = Math.floor(windowSize / 2);
                  let startIdx = Math.max(0, activeIdx - half);
                  let endIdx = Math.min(words.length, startIdx + windowSize);
                  if (endIdx - startIdx < windowSize) {
                    startIdx = Math.max(0, endIdx - windowSize);
                  }

                  return words.slice(startIdx, endIdx).map((w, sliceIdx) => {
                    const actualIdx = startIdx + sliceIdx;
                    const isCurrent = actualIdx === activeIdx;
                    const isPast = actualIdx < activeIdx;
                    return (
                      <span
                        key={actualIdx}
                        className={`inline-block px-1.5 py-0.5 rounded transition-all duration-150 ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow-[0_0_16px_rgba(251,191,36,0.9)] ring-2 ring-amber-300'
                            : isPast
                            ? 'text-slate-400 font-medium'
                            : 'text-slate-200 font-medium'
                        }`}
                      >
                        {w}
                      </span>
                    );
                  });
                })()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Scrub Timeline & Playback Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-3 sm:px-5 flex flex-col gap-2">
        {/* Timeline Range Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono tabular-nums text-slate-400 w-12 text-right">
            {currentTime.toFixed(1)}s
          </span>

          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
            />

            {/* Word Anchors Tick Marks on Timeline */}
            <div className="absolute inset-x-0 -bottom-3 flex justify-between pointer-events-none px-1">
              {scene.elements.map((el) => {
                const leftPercent = ((el.triggerTimeSec || 0) / duration) * 100;
                return (
                  <div
                    key={el.id}
                    style={{ left: `${leftPercent}%` }}
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-cyan-400"
                    title={`"${el.label || el.type}" triggers at ${el.triggerTimeSec?.toFixed(1)}s`}
                  />
                );
              })}
            </div>
          </div>

          <span className="text-[11px] font-mono tabular-nums text-slate-400 w-12">
            {duration.toFixed(1)}s
          </span>
        </div>

        {/* Interactive Cue Markers Row */}
        {scene.elements.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-[10px] scrollbar-none">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
              Cues:
            </span>
            {scene.elements.map((el) => {
              const t = el.triggerTimeSec || 0;
              const isPassed = currentTime >= t;
              const isSelected = selectedElementId === el.id;
              return (
                <button
                  key={el.id}
                  onClick={() => {
                    setCurrentTime(t);
                    onSelectElement(el.id);
                  }}
                  className={`px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 transition-colors cursor-pointer text-[10px] ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                      : isPassed
                      ? 'bg-slate-800/90 border-slate-750 text-slate-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                  title={`Jump to ${el.label || el.type} (${t.toFixed(1)}s)`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: el.color || '#38bdf8' }}
                  />
                  <span className="truncate max-w-[100px]">{el.label || el.type}</span>
                  <span className="font-mono text-[9px] opacity-60">{t.toFixed(1)}s</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Transport Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          {/* Left: Scene Jumpers & Play */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onPrevScene}
              disabled={currentSceneIndex === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Scene"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
            </button>

            <button
              onClick={onNextScene}
              disabled={currentSceneIndex >= totalScenes - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Scene"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleRewind}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Rewind to start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Audio Toggles & Speed */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* CC Subtitles Toggle */}
            <button
              onClick={() => setIsSubtitlesEnabled((s) => !s)}
              className={`px-1.5 py-0.5 rounded-md border font-mono text-[10px] font-bold tracking-wider transition-colors cursor-pointer ${
                isSubtitlesEnabled
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={isSubtitlesEnabled ? 'Live Subtitles Enabled (CC)' : 'Live Subtitles Disabled'}
            >
              CC
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-0.5 bg-slate-950 px-1 py-0.5 rounded-md border border-slate-800 font-mono text-[11px]">
              {[0.75, 1, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-amber-400/20 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Voice Narration Audio Toggle */}
            <button
              onClick={() => setIsVoiceMuted((v) => !v)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isVoiceMuted
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isVoiceMuted ? 'Voiceover Muted' : 'Voiceover Active'}
            >
              {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Background Music Toggle */}
            <button
              onClick={() => {
                if (isMusicEnabled) {
                  audioEngine.stopMusic();
                  setIsMusicEnabled(false);
                } else {
                  setIsMusicEnabled(true);
                  if (isPlaying) audioEngine.startMusic(musicTrack);
                }
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isMusicEnabled
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={isMusicEnabled ? 'Music Enabled (Auto-Ducked)' : 'Music Disabled'}
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
