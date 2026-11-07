export type ThemeLook = 'whiteboard' | 'darktech' | 'blueprint' | 'chalkboard';

export type AnimationType = 'draw' | 'fade' | 'pop' | 'slide' | 'typewriter';

export type ElementType =
  // Shapes & sketches
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'curved_arrow'
  | 'bracket'
  | 'highlight'
  | 'speech_bubble'
  // Architecture & Diagrams
  | 'client'
  | 'server'
  | 'database'
  | 'cloud'
  | 'api_gateway'
  | 'queue'
  // UI Mockups
  | 'browser_window'
  | 'terminal_window'
  | 'phone_mockup'
  // Text, Code, Annotations
  | 'text'
  | 'code_block'
  | 'badge'
  | 'checkmark'
  | 'cross'
  | 'icon';

export interface VisualElement {
  id: string;
  type: ElementType;
  x: number; // 0 to 1280
  y: number; // 0 to 720
  width: number;
  height: number;
  rotation?: number;
  label?: string;
  subtext?: string;
  color: string;
  strokeWidth: number;
  roughness?: number; // 0 to 3
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch' | 'none';
  fillColor?: string;
  iconName?: string;
  codeSnippet?: string;
  url?: string;
  animation: AnimationType;
  triggerWord?: string; // Word in script that triggers this visual
  triggerTimeSec?: number; // Calculated or explicit second mark
  durationMs?: number; // Animation duration in ms
  order?: number;
}

export interface Scene {
  id: string;
  title: string;
  narration: string;
  elements: VisualElement[];
  durationSeconds: number;
  transition?: 'none' | 'fade' | 'slide_left' | 'wipe';
  lookOverride?: ThemeLook;
  customAudioUrl?: string;
  customAudioName?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl?: string;
  look: ThemeLook;
  scenes: Scene[];
  musicTrack: string;
  musicVolume: number; // 0 to 1
  voicePitch: number; // 0.8 to 1.3
  voiceRate: number; // 0.85 to 1.3
  autoDuck: boolean;
}

export interface WordTimestamp {
  word: string;
  cleanWord: string;
  startTime: number;
  endTime: number;
  index: number;
}

export interface ThemeConfig {
  id: ThemeLook;
  name: string;
  description: string;
  background: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  paperGrid?: boolean;
}

export const THEME_CONFIGS: Record<ThemeLook, ThemeConfig> = {
  whiteboard: {
    id: 'whiteboard',
    name: 'Hand-drawn Whiteboard',
    description: 'Signature Explainroo sketchy pencil and marker strokes on warm textured board',
    background: '#faf9f5',
    primaryColor: '#0f172a',
    secondaryColor: '#3b82f6',
    accentColor: '#f97316',
    textColor: '#1e293b',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    paperGrid: true,
  },
  darktech: {
    id: 'darktech',
    name: 'Modern Dark Tech',
    description: 'Sleek neon cyan and amber glowing diagrams on deep midnight slate',
    background: '#090d16',
    primaryColor: '#38bdf8',
    secondaryColor: '#a855f7',
    accentColor: '#fbbf24',
    textColor: '#f8fafc',
    fontFamily: '"JetBrains Mono", monospace',
    paperGrid: false,
  },
  blueprint: {
    id: 'blueprint',
    name: 'Architectural Blueprint',
    description: 'Crisp white and cyan engineering schematics on deep blueprint navy',
    background: '#0c2340',
    primaryColor: '#ffffff',
    secondaryColor: '#38bdf8',
    accentColor: '#facc15',
    textColor: '#f1f5f9',
    fontFamily: '"JetBrains Mono", monospace',
    paperGrid: true,
  },
  chalkboard: {
    id: 'chalkboard',
    name: 'Classroom Chalkboard',
    description: 'Soft white, yellow, and pastel chalk marks on deep forest blackboard',
    background: '#15251d',
    primaryColor: '#f8fafc',
    secondaryColor: '#fde047',
    accentColor: '#6ee7b7',
    textColor: '#f1f5f9',
    fontFamily: '"Caveat", cursive, sans-serif',
    paperGrid: false,
  },
};
