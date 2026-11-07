import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';
import { Scene } from '../../types/explainroo';

interface SceneListProps {
  scenes: Scene[];
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onAddScene: () => void;
  onDuplicateScene: (index: number) => void;
  onDeleteScene: (index: number) => void;
  onMoveScene: (index: number, direction: 'prev' | 'next') => void;
}

export const SceneList: React.FC<SceneListProps> = ({
  scenes,
  activeSceneIndex,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Scenes ({scenes.length})
          </h3>
        </div>

        <button
          onClick={onAddScene}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors cursor-pointer"
          title="Add a new blank scene"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>New Scene</span>
        </button>
      </div>

      {/* Horizontal Scrollable Scene Strips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 pr-1 scrollbar-thin">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`min-w-[170px] max-w-[200px] flex-1 p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                isActive
                  ? 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono font-bold text-amber-400">
                    #{idx + 1}
                  </span>
                  <span>{scene.durationSeconds || 7}s</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">
                  {scene.title || `Scene ${idx + 1}`}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {scene.narration || 'No spoken narration yet'}
                </p>
              </div>

              {/* Bottom bar inside card */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span>{scene.elements.length} visuals</span>

                {/* Micro Actions */}
                <div
                  className="flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    disabled={idx === 0}
                    onClick={() => onMoveScene(idx, 'prev')}
                    className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30"
                    title="Move left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === scenes.length - 1}
                    onClick={() => onMoveScene(idx, 'next')}
                    className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-30"
                    title="Move right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDuplicateScene(idx)}
                    className="p-1 rounded text-slate-500 hover:text-cyan-400"
                    title="Duplicate scene"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {scenes.length > 1 && (
                    <button
                      onClick={() => onDeleteScene(idx)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="Delete scene"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
