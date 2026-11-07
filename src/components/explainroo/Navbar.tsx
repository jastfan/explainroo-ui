import React from 'react';
import {
  Sparkles,
  Layers,
  Download,
  Palette,
  RotateCcw,
  Github,
} from 'lucide-react';
import { ThemeLook, THEME_CONFIGS } from '../../types/explainroo';

interface NavbarProps {
  title: string;
  onUpdateTitle: (title: string) => void;
  look: ThemeLook;
  onSelectLook: (look: ThemeLook) => void;
  onOpenAiModal: () => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onResetProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  onUpdateTitle,
  look,
  onSelectLook,
  onOpenAiModal,
  onOpenTemplates,
  onOpenExport,
  onResetProject,
}) => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Brand & Repo Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <span className="text-base font-black text-white">🦘</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Explainroo <span className="text-amber-400 font-bold">UI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono font-semibold text-amber-300">
                v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 leading-none">
              Visual studio for animated software explainer videos
            </p>
          </div>
        </div>

        {/* Project Title Input */}
        <div className="flex-1 max-w-md hidden sm:block">
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="w-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 focus:border-amber-400/80 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 outline-none transition-colors"
            placeholder="Explainer Video Title..."
          />
        </div>

        {/* Look Style Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Palette className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
            <select
              value={look}
              onChange={(e) => onSelectLook(e.target.value as ThemeLook)}
              className="bg-transparent text-slate-200 text-xs font-medium outline-none cursor-pointer pr-1"
            >
              {Object.entries(THEME_CONFIGS).map(([key, config]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Generator CTA */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
            title="Generate complete explainer video from prompt or repo URL"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">AI Generator</span>
          </button>

          {/* Templates Gallery */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
            title="Explore prebuilt explainer templates"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Templates</span>
          </button>

          {/* Export Video & Direct Download */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Download Standalone Player (.html), Video, or Project files"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Export</span>
          </button>

          {/* Reset Project */}
          <button
            onClick={onResetProject}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset to default project"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* GitHub Repository */}
          <a
            href="https://github.com/jastfan/explainroo-ui"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
            title="GitHub: jastfan/explainroo-ui"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
