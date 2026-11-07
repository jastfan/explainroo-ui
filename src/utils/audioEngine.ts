// Audio Engine with real-time generative background music, Web Speech TTS, and auto-ducking

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  currentWordIndex: number;
  duckingActive: boolean;
}

export type WordBoundaryListener = (word: string, charIndex: number, wordIndex: number) => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private currentTrack = 'lofi';
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private wordListeners: Set<WordBoundaryListener> = new Set();
  private currentWordIndex: number = -1;
  private currentSpokenWord: string = '';
  private fallbackWordTimer: number | null = null;
  private hasReceivedNativeBoundary: boolean = false;

  public getCurrentTrack(): string {
    return this.currentTrack;
  }

  public isSpeaking(): boolean {
    return Boolean(this.speechUtterance);
  }

  public addWordListener(listener: WordBoundaryListener): () => void {
    this.wordListeners.add(listener);
    if (this.currentWordIndex >= 0) {
      try {
        listener(this.currentSpokenWord, 0, this.currentWordIndex);
      } catch {}
    }
    return () => {
      this.wordListeners.delete(listener);
    };
  }

  public notifyWord(word: string, charIndex: number, wordIndex: number) {
    this.currentSpokenWord = word;
    this.currentWordIndex = wordIndex;
    this.wordListeners.forEach((listener) => {
      try {
        listener(word, charIndex, wordIndex);
      } catch (err) {
        console.error('Error in word listener:', err);
      }
    });
  }

  public getCurrentWord(): { word: string; index: number } {
    return { word: this.currentSpokenWord, index: this.currentWordIndex };
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play Sound Effects
  public playPop() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(740, t + 0.08);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Audio fallback
    }
  }

  public playWhoosh() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      // Filtered noise swoosh
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.2);
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(t);
      noise.stop(t + 0.2);
    } catch {
      // Audio fallback
    }
  }

  public playDrawChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.12, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.28);
      });
    } catch {
      // Audio fallback
    }
  }

  // Audio Ducking: lowers music when narrator is speaking
  public setDucking(active: boolean) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const target = active ? 0.08 : 0.25;
    this.musicGain.gain.cancelScheduledValues(t);
    this.musicGain.gain.linearRampToValueAtTime(target, t + 0.25);
  }

  // Generative Background Music Tracks
  public startMusic(track: string = 'lofi') {
    this.initContext();
    this.stopMusic();
    this.currentTrack = track;
    this.isMusicPlaying = true;

    // Generative chord progression based on track
    const chordProgressions: Record<string, number[][]> = {
      lofi: [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
      ],
      tech: [
        [130.81, 196.0, 261.63, 392.0], // C power
        [110.0, 164.81, 220.0, 329.63], // A power
        [146.83, 220.0, 293.66, 440.0], // D power
        [123.47, 185.0, 246.94, 370.0], // B power
      ],
      acoustic: [
        [261.63, 329.63, 392.0],        // C
        [196.0, 246.94, 293.66],        // G
        [220.0, 261.63, 329.63],        // Am
        [174.61, 220.0, 261.63],        // F
      ],
    };

    const chords = chordProgressions[track] || chordProgressions.lofi;
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      const t = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = track === 'tech' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(track === 'tech' ? 1200 : 700, t);

        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.6 + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 3.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(t);
        osc.stop(t + 3.3);
      });
    };

    playChord();
    this.musicInterval = window.setInterval(playChord, 3200);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Web Speech API Voiceover with Word Boundary Synchronization
  public speakNarration(
    text: string,
    onWordSpoken?: (word: string, charIndex: number, wordIndex: number) => void,
    onEnd?: () => void,
    rate: number = 1.0,
    pitch: number = 1.0
  ) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();
    this.setDucking(true);

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const trimmedText = text.trim();
    const wordsList = trimmedText.split(/\s+/).filter(Boolean);

    const utterance = new SpeechSynthesisUtterance(trimmedText);
    utterance.rate = Math.max(0.7, Math.min(1.5, rate));
    utterance.pitch = Math.max(0.8, Math.min(1.3, pitch));

    // Try to pick a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.hasReceivedNativeBoundary = false;

    // Fallback timer: in case SpeechSynthesis onboundary is not fired by the OS/voice
    // Estimates speech progress (~2.6 words per second scaled by rate)
    let fallbackIdx = 0;
    const intervalMs = Math.max(150, Math.round(1000 / (2.6 * utterance.rate)));
    this.fallbackWordTimer = window.setInterval(() => {
      if (this.hasReceivedNativeBoundary) {
        if (this.fallbackWordTimer) {
          clearInterval(this.fallbackWordTimer);
          this.fallbackWordTimer = null;
        }
        return;
      }
      if (fallbackIdx < wordsList.length) {
        const spokenWord = wordsList[fallbackIdx];
        if (onWordSpoken) {
          onWordSpoken(spokenWord, 0, fallbackIdx);
        }
        this.notifyWord(spokenWord, 0, fallbackIdx);
        fallbackIdx++;
      }
    }, intervalMs);

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.hasReceivedNativeBoundary = true;
        if (this.fallbackWordTimer) {
          clearInterval(this.fallbackWordTimer);
          this.fallbackWordTimer = null;
        }

        const charIdx = event.charIndex;
        const slice = trimmedText.slice(charIdx);
        const match = slice.match(/^[\w'-]+/);
        const spokenWord = match
          ? match[0]
          : event.charLength
          ? trimmedText.substring(charIdx, charIdx + event.charLength)
          : '';

        // Calculate 0-based word index
        const textBefore = trimmedText.slice(0, charIdx);
        const wordsBefore = textBefore.trim() ? textBefore.trim().split(/\s+/).filter(Boolean) : [];
        const wordIndex = wordsBefore.length;

        if (onWordSpoken) {
          onWordSpoken(spokenWord, charIdx, wordIndex);
        }
        this.notifyWord(spokenWord, charIdx, wordIndex);
      }
    };

    utterance.onend = () => {
      if (this.fallbackWordTimer) {
        clearInterval(this.fallbackWordTimer);
        this.fallbackWordTimer = null;
      }
      this.setDucking(false);
      this.speechUtterance = null;
      this.notifyWord('', -1, -1);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (this.fallbackWordTimer) {
        clearInterval(this.fallbackWordTimer);
        this.fallbackWordTimer = null;
      }
      this.setDucking(false);
      this.speechUtterance = null;
      this.notifyWord('', -1, -1);
      if (onEnd) onEnd();
    };

    this.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private customAudio: HTMLAudioElement | null = null;

  public playCustomAudio(url: string, onEnd?: () => void) {
    this.stopSpeaking();
    this.setDucking(true);
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    const audio = new Audio(url);
    audio.onended = () => {
      this.setDucking(false);
      this.customAudio = null;
      this.notifyWord('', -1, -1);
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      this.setDucking(false);
      this.customAudio = null;
      this.notifyWord('', -1, -1);
      if (onEnd) onEnd();
    };
    this.customAudio = audio;
    audio.play().catch(() => {});
  }

  public stopCustomAudio() {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
      this.customAudio = null;
    }
    this.setDucking(false);
    this.notifyWord('', -1, -1);
  }

  public stopSpeaking() {
    if (this.fallbackWordTimer) {
      clearInterval(this.fallbackWordTimer);
      this.fallbackWordTimer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.speechUtterance = null;
    this.notifyWord('', -1, -1);
    this.stopCustomAudio();
    this.setDucking(false);
  }

  public stopAll() {
    this.stopSpeaking();
    this.stopCustomAudio();
    this.stopMusic();
    this.notifyWord('', -1, -1);
  }
}

export const audioEngine = new AudioEngine();
