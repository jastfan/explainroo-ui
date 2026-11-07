import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Github,
  Loader2,
} from 'lucide-react';
import { Project, ThemeLook, THEME_CONFIGS } from '../../types/explainroo';
import { audioEngine } from '../../utils/audioEngine';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectGenerated: (project: Project) => void;
}

const POPULAR_SUGGESTIONS = [
  'How DNS resolves a website domain',
  'What is Docker containerization?',
  'How Stripe processes credit card payments',
  'Git rebase vs merge explained visually',
  'How Redis in-memory caching works',
];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onProjectGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [look, setLook] = useState<ThemeLook>('whiteboard');
  const [numScenes, setNumScenes] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a topic or repository name to explain.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGenerationStep('Designing video architecture & script...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Synthesizing visual diagrams & mockups...');
      }, 1400);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Synchronizing drawings with spoken word anchors...');
      }, 2800);

      const response = await fetch('/api/explainroo/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          repoUrl: repoUrl.trim(),
          look,
          numScenes,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate explainer video');
      }

      const project: Project = await response.json();
      audioEngine.playDrawChime();
      onProjectGenerated(project);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with AI service');
    } finally {
      setIsLoading(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Explainer Video Generator
              </h3>
              <p className="text-xs text-slate-400">
                Turn any concept or GitHub repo into a narrated animated video
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Topic Prompt Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              What do you want to explain?
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How DNS works, What is an API, or paste a GitHub repo summary..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-slate-200 outline-none resize-none"
            />

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setPrompt(sug)}
                  className="px-2 py-0.5 rounded-md bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {sug.length > 38 ? sug.slice(0, 35) + '...' : sug}
                </button>
              ))}
            </div>
          </div>

          {/* Optional GitHub URL */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>GitHub Repository Link (Optional)</span>
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/facebook/react"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            />
          </div>

          {/* Settings Grid: Look & Scene count */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Visual Look Style
              </label>
              <select
                value={look}
                onChange={(e) => setLook(e.target.value as ThemeLook)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
              >
                {Object.entries(THEME_CONFIGS).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Number of Scenes
              </label>
              <select
                value={numScenes}
                onChange={(e) => setNumScenes(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value={3}>3 Scenes (~20 seconds)</option>
                <option value={4}>4 Scenes (~30 seconds)</option>
                <option value={5}>5 Scenes (~45 seconds)</option>
              </select>
            </div>
          </div>

          {/* Generation Progress state */}
          {isLoading && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-fade-in">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-amber-300 block">
                  Creating Your Explainer Video...
                </span>
                <span className="text-slate-400 text-[11px]">{generationStep}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};
