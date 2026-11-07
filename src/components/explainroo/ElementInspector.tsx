import React from 'react';
import {
  Trash2,
  Copy,
  Sliders,
} from 'lucide-react';
import { VisualElement, AnimationType } from '../../types/explainroo';

interface ElementInspectorProps {
  element: VisualElement | null;
  onUpdateElement: (id: string, updates: Partial<VisualElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (element: VisualElement) => void;
  sceneDuration: number;
}

const COLOR_PRESETS = [
  { label: 'Cyan', hex: '#38bdf8' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Amber', hex: '#fbbf24' },
  { label: 'Purple', hex: '#a855f7' },
  { label: 'Rose', hex: '#f43f5e' },
  { label: 'Dark Slate', hex: '#0f172a' },
  { label: 'White', hex: '#ffffff' },
];

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  sceneDuration,
}) => {
  if (!element) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center py-8">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <h4 className="text-xs font-semibold text-slate-300">No Element Selected</h4>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          Click any element on the preview canvas to edit its label, colors, and word trigger.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
            {element.type}
          </span>
          <h3 className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
            {element.label || 'Element Properties'}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateElement(element)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Duplicate element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteElement(element.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Label & Text input */}
      <div className="space-y-2">
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Display Label
          </label>
          <input
            type="text"
            value={element.label || ''}
            onChange={(e) => onUpdateElement(element.id, { label: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            placeholder="Text / Title"
          />
        </div>

        {element.type === 'browser_window' && (
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Browser URL
            </label>
            <input
              type="text"
              value={element.url || ''}
              onChange={(e) => onUpdateElement(element.id, { url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none"
              placeholder="https://..."
            />
          </div>
        )}

        {element.type === 'code_block' && (
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Code Snippet
            </label>
            <textarea
              rows={3}
              value={element.codeSnippet || ''}
              onChange={(e) => onUpdateElement(element.id, { codeSnippet: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400/80 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none resize-none"
              placeholder="Code lines..."
            />
          </div>
        )}
      </div>

      {/* Color Palette */}
      <div>
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Stroke Color
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color.hex}
              onClick={() => onUpdateElement(element.id, { color: color.hex })}
              style={{ backgroundColor: color.hex }}
              className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                element.color === color.hex
                  ? 'ring-2 ring-amber-400 scale-110 border-white'
                  : 'border-slate-700/80 hover:scale-105'
              }`}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Animation Style */}
      <div>
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Entrance Animation
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {(['pop', 'draw', 'slide', 'fade'] as AnimationType[]).map((anim) => (
            <button
              key={anim}
              onClick={() => onUpdateElement(element.id, { animation: anim })}
              className={`p-1.5 rounded-lg border text-left capitalize transition-colors cursor-pointer ${
                element.animation === anim
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {anim}
            </button>
          ))}
        </div>
      </div>

      {/* Word Sync Trigger */}
      <div className="pt-1 border-t border-slate-800">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Word Anchor Trigger
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={element.triggerWord || ''}
            onChange={(e) => onUpdateElement(element.id, { triggerWord: e.target.value })}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            placeholder="Type or click word above"
          />
        </div>
      </div>

      {/* Trigger Time Slider (fallback offset) */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Appearance Time</span>
          <span className="font-mono text-cyan-400">{element.triggerTimeSec?.toFixed(1) || '0.0'}s</span>
        </div>
        <input
          type="range"
          min={0}
          max={sceneDuration}
          step={0.1}
          value={element.triggerTimeSec || 0}
          onChange={(e) =>
            onUpdateElement(element.id, { triggerTimeSec: parseFloat(e.target.value) })
          }
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
};
