import { X, ArrowRight, Layers } from 'lucide-react';
import { Project } from '../../types/explainroo';
import { PREBUILT_TEMPLATES } from '../../templates/prebuiltTemplates';
import { audioEngine } from '../../utils/audioEngine';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (project: Project) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Pre-built Explainer Templates
              </h3>
              <p className="text-xs text-slate-400">
                Jumpstart your video with hand-crafted diagrams and scripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
          {PREBUILT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/90 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                    {tmpl.look} look
                  </span>
                  <span>{tmpl.scenes.length} Scenes</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-800/60">
                <span className="text-[11px] text-slate-500 font-mono">
                  Music: {tmpl.musicTrack}
                </span>
                <button
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    audioEngine.playDrawChime();
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>Load Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
