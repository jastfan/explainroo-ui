import React, { useState } from 'react';
import {
  X,
  Download,
  Film,
  FileCode,
  FileText,
  Copy,
  Check,
  Camera,
  Archive,
  Terminal,
  Globe,
  FileJson,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../../types/explainroo';
import {
  downloadProjectZip,
  downloadTextFile,
  downloadStandaloneHtml,
  downloadProjectJson,
  generateScriptMd,
  generateScenesJs,
  generateStandaloneHtml,
} from '../../utils/cliExporter';
import { videoRecorder } from '../../utils/videoRecorder';
import { audioEngine } from '../../utils/audioEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'standalone' | 'cli' | 'snapshot'>('standalone');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  if (!isOpen) return null;

  const scriptMd = generateScriptMd(project);
  const scenesJs = generateScenesJs(project);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    audioEngine.playPop();
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-snapshot.png`;
    a.click();
    audioEngine.playPop();
  };

  const handleDownloadStandalone = () => {
    downloadStandaloneHtml(project);
    audioEngine.playDrawChime();
  };

  const handlePreviewStandalone = () => {
    const html = generateStandaloneHtml(project);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    audioEngine.playPop();
  };

  const handleDownloadJsonBackup = () => {
    downloadProjectJson(project);
    audioEngine.playPop();
  };

  const handleStartVideoRecording = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    setIsRecordingVideo(true);
    setRecordProgress(0);

    const started = videoRecorder.start(canvas);
    if (!started) {
      setIsRecordingVideo(false);
      return;
    }

    // Determine recording duration based on active scene or total duration
    const totalSec = project.scenes.reduce((acc, sc) => acc + (sc.durationSeconds || 7), 0);
    const recDuration = Math.max(4, Math.min(30, totalSec));

    let sec = 0;
    const interval = setInterval(() => {
      sec += 0.5;
      setRecordProgress(Math.min(100, Math.round((sec / recDuration) * 100)));
      if (sec >= recDuration) {
        clearInterval(interval);
        videoRecorder.stop().then((blob) => {
          setIsRecordingVideo(false);
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            audioEngine.playDrawChime();
          }
        });
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Export & Direct Download</h3>
            <p className="text-xs text-slate-400">
              Download offline-ready standalone player, video, or Explainroo CLI files
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl my-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('standalone')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'standalone'
                ? 'bg-slate-800 text-amber-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Standalone Player</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'video'
                ? 'bg-slate-800 text-orange-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Recording</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'cli'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CLI Bundle</span>
          </button>

          <button
            onClick={() => setActiveTab('snapshot')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'snapshot'
                ? 'bg-slate-800 text-emerald-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snapshot</span>
          </button>
        </div>

        {/* Tab: Standalone Offline Player */}
        {activeTab === 'standalone' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>1-Click Zero-Install HTML Player (.html)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-[10px] font-mono text-amber-300 font-semibold">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Directly downloads a single self-contained <code className="text-amber-300">.html</code> file with all your scenes, vector diagrams, Whisper karaoke subtitles, and voice synthesis embedded.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Double-click to open and play in any web browser with <strong>zero server or Node.js</strong> needed.</li>
                <li>Share via email, send on Slack/Discord, or host on GitHub Pages/Netlify.</li>
                <li>Includes interactive scrubber, play/pause, voice controls, and fullscreen mode.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadStandalone}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Standalone Player (.html)</span>
              </button>

              <button
                onClick={handlePreviewStandalone}
                className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Preview standalone player in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: Video Export */}
        {activeTab === 'video' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Browser Video Capture</span>
                <span className="text-[11px] font-mono text-cyan-400">1280x720 30FPS</span>
              </div>
              <p className="text-xs text-slate-400">
                Directly captures and renders the current video animation into a downloadable WebM/MP4 video file.
              </p>

              {isRecordingVideo && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-400 mb-1 font-mono">
                    <span>Recording Canvas Stream...</span>
                    <span>{recordProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${recordProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStartVideoRecording}
              disabled={isRecordingVideo}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Film className="w-4 h-4" />
              <span>{isRecordingVideo ? 'Rendering Video...' : 'Record & Download Video'}</span>
            </button>
          </div>
        )}

        {/* Tab: Explainroo CLI Bundle */}
        {activeTab === 'cli' && (
          <div className="space-y-3 py-2 overflow-y-auto max-h-[48vh]">
            {/* Full ZIP */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-cyan-400" />
                  <span>Full Project ZIP Package</span>
                </span>
                <button
                  onClick={() => downloadProjectZip(project)}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Download .zip
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Includes <code className="text-slate-300">standalone-player.html</code>, <code className="text-slate-300">script.md</code>, <code className="text-slate-300">scenes.js</code>, and <code className="text-slate-300">explainroo.config.json</code> ready to run via the Explainroo terminal CLI.
              </p>
            </div>

            {/* Direct Project JSON Backup */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Project Backup (.json)</span>
                  <span className="text-[10px] text-slate-500">Save full studio state to reload anytime</span>
                </div>
              </div>
              <button
                onClick={handleDownloadJsonBackup}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Download .explainroo.json backup"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save JSON</span>
              </button>
            </div>

            {/* Individual Files: script.md */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">script.md</span>
                  <span className="text-[10px] text-slate-500">Narration text & scene breaks</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(scriptMd, 'script')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedType === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'script' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => downloadTextFile('script.md', scriptMd)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  title="Download script.md"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Individual Files: scenes.js */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">scenes.js</span>
                  <span className="text-[10px] text-slate-500">Canvas drawings & coordinates</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(scenesJs, 'scenes')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedType === 'scenes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'scenes' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => downloadTextFile('scenes.js', scenesJs)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  title="Download scenes.js"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Snapshot PNG */}
        {activeTab === 'snapshot' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <Camera className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-200">High-Resolution Canvas Snapshot</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Download a clean, crystal-clear 1280x720 PNG of your current visual scene for presentations, tweets, or documentation.
              </p>
            </div>

            <button
              onClick={handleDownloadSnapshot}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Snapshot PNG</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
