import React, { useState, useEffect } from 'react';
import { Project, Scene, VisualElement, ThemeLook, THEME_CONFIGS } from './types/explainroo';
import { PREBUILT_TEMPLATES } from './templates/prebuiltTemplates';
import { Navbar } from './components/explainroo/Navbar';
import { VideoPlayer } from './components/explainroo/VideoPlayer';
import { SceneList } from './components/explainroo/SceneList';
import { ScriptEditor } from './components/explainroo/ScriptEditor';
import { VisualToolbox } from './components/explainroo/VisualToolbox';
import { ElementInspector } from './components/explainroo/ElementInspector';
import { AIGeneratorModal } from './components/explainroo/AIGeneratorModal';
import { ExportModal } from './components/explainroo/ExportModal';
import { TemplatesModal } from './components/explainroo/TemplatesModal';
import { audioEngine } from './utils/audioEngine';

export const App: React.FC = () => {
  // Load initial project from localStorage or default template
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem('explainroo_project');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return PREBUILT_TEMPLATES[0];
  });

  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Modals
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Persist project changes
  useEffect(() => {
    try {
      localStorage.setItem('explainroo_project', JSON.stringify(project));
    } catch {
      // Ignore quota errors
    }
  }, [project]);

  // Safe active scene
  const activeScene: Scene =
    project.scenes[activeSceneIndex] || project.scenes[0] || {
      id: 'scene-default',
      title: 'Scene 1',
      narration: '',
      elements: [],
      durationSeconds: 7,
    };

  const selectedElement =
    activeScene.elements.find((el) => el.id === selectedElementId) || null;

  // Active theme look config
  const activeThemeLook = activeScene.lookOverride || project.look;
  const themeConfig = THEME_CONFIGS[activeThemeLook] || THEME_CONFIGS.whiteboard;

  // Handlers for Project & Scenes
  const handleUpdateTitle = (title: string) => {
    setProject((prev) => ({ ...prev, title }));
  };

  const handleSelectLook = (look: ThemeLook) => {
    setProject((prev) => ({ ...prev, look }));
    audioEngine.playPop();
  };

  const handleSelectScene = (index: number) => {
    if (index >= 0 && index < project.scenes.length) {
      setActiveSceneIndex(index);
      setSelectedElementId(null);
      audioEngine.playWhoosh();
    }
  };

  const handleAddScene = () => {
    const newSceneNum = project.scenes.length + 1;
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: `Scene ${newSceneNum}`,
      narration: 'Describe what happens next in this part of the video...',
      durationSeconds: 7,
      transition: 'fade',
      elements: [],
    };

    setProject((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
    }));
    setActiveSceneIndex(project.scenes.length);
    setSelectedElementId(null);
    audioEngine.playPop();
  };

  const handleDuplicateScene = (index: number) => {
    const target = project.scenes[index];
    if (!target) return;

    const dupScene: Scene = {
      ...target,
      id: `scene-${Date.now()}`,
      title: `${target.title} (Copy)`,
      elements: target.elements.map((el) => ({ ...el, id: `el-${Date.now()}-${Math.random()}` })),
    };

    const updated = [...project.scenes];
    updated.splice(index + 1, 0, dupScene);
    setProject((prev) => ({ ...prev, scenes: updated }));
    setActiveSceneIndex(index + 1);
    audioEngine.playPop();
  };

  const handleDeleteScene = (index: number) => {
    if (project.scenes.length <= 1) return;
    const updated = project.scenes.filter((_, idx) => idx !== index);
    setProject((prev) => ({ ...prev, scenes: updated }));
    setActiveSceneIndex(Math.max(0, index - 1));
    setSelectedElementId(null);
    audioEngine.playPop();
  };

  const handleMoveScene = (index: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= project.scenes.length) return;

    const updated = [...project.scenes];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setProject((prev) => ({ ...prev, scenes: updated }));
    setActiveSceneIndex(targetIdx);
    audioEngine.playPop();
  };

  // Handlers for Elements
  const handleAddElement = (elementPartial: Partial<VisualElement>) => {
    const newEl: VisualElement = {
      id: `el-${Date.now()}`,
      type: elementPartial.type || 'rectangle',
      x: elementPartial.x ?? 540,
      y: elementPartial.y ?? 300,
      width: elementPartial.width ?? 180,
      height: elementPartial.height ?? 120,
      label: elementPartial.label || '',
      color: elementPartial.color || themeConfig.primaryColor,
      strokeWidth: elementPartial.strokeWidth ?? 2.5,
      roughness: elementPartial.roughness ?? 1.4,
      animation: elementPartial.animation || 'pop',
      triggerTimeSec: elementPartial.triggerTimeSec ?? 0.5,
      ...elementPartial,
    };

    setProject((prev) => {
      const updatedScenes = [...prev.scenes];
      const current = updatedScenes[activeSceneIndex];
      if (!current) return prev;
      updatedScenes[activeSceneIndex] = {
        ...current,
        elements: [...current.elements, newEl],
      };
      return { ...prev, scenes: updatedScenes };
    });

    setSelectedElementId(newEl.id);
  };

  const handleUpdateElement = (id: string, updates: Partial<VisualElement>) => {
    setProject((prev) => {
      const updatedScenes = [...prev.scenes];
      const current = updatedScenes[activeSceneIndex];
      if (!current) return prev;
      updatedScenes[activeSceneIndex] = {
        ...current,
        elements: current.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      };
      return { ...prev, scenes: updatedScenes };
    });
  };

  const handleUpdateElementPosition = (id: string, x: number, y: number) => {
    handleUpdateElement(id, { x, y });
  };

  const handleDeleteElement = (id: string) => {
    setProject((prev) => {
      const updatedScenes = [...prev.scenes];
      const current = updatedScenes[activeSceneIndex];
      if (!current) return prev;
      updatedScenes[activeSceneIndex] = {
        ...current,
        elements: current.elements.filter((el) => el.id !== id),
      };
      return { ...prev, scenes: updatedScenes };
    });
    setSelectedElementId(null);
    audioEngine.playPop();
  };

  const handleDuplicateElement = (element: VisualElement) => {
    const dup: VisualElement = {
      ...element,
      id: `el-${Date.now()}`,
      x: element.x + 30,
      y: element.y + 30,
    };
    handleAddElement(dup);
  };

  const handleUpdateNarration = (narration: string) => {
    setProject((prev) => {
      const updatedScenes = [...prev.scenes];
      const current = updatedScenes[activeSceneIndex];
      if (!current) return prev;
      const wordCount = narration.split(/\s+/).filter(Boolean).length;
      const calculatedDuration = Math.max(5, Math.round(wordCount / 2.5));

      updatedScenes[activeSceneIndex] = {
        ...current,
        narration,
        durationSeconds: calculatedDuration,
      };
      return { ...prev, scenes: updatedScenes };
    });
  };

  const handleUpdateCustomAudio = (url?: string, filename?: string) => {
    setProject((prev) => {
      const updatedScenes = [...prev.scenes];
      const current = updatedScenes[activeSceneIndex];
      if (!current) return prev;
      updatedScenes[activeSceneIndex] = {
        ...current,
        customAudioUrl: url,
        customAudioName: filename,
      };
      return { ...prev, scenes: updatedScenes };
    });
  };

  const handleUpdateElementTriggerWord = (elementId: string, word: string) => {
    // Also estimate time based on position of word in narration
    const words = activeScene.narration
      .split(/\s+/)
      .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const wordIdx = words.indexOf(word.toLowerCase());
    const estTime = wordIdx >= 0 ? Math.max(0.2, (wordIdx / words.length) * activeScene.durationSeconds) : 0.5;

    handleUpdateElement(elementId, {
      triggerWord: word,
      triggerTimeSec: parseFloat(estTime.toFixed(1)),
    });
  };

  const handleResetProject = () => {
    if (window.confirm('Reset project back to default template?')) {
      setProject(PREBUILT_TEMPLATES[0]);
      setActiveSceneIndex(0);
      setSelectedElementId(null);
    }
  };

  // Keyboard Shortcuts: Space for Play/Pause, Esc for deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null);
      } else if (e.key === 'ArrowRight' && e.altKey) {
        handleSelectScene(activeSceneIndex + 1);
      } else if (e.key === 'ArrowLeft' && e.altKey) {
        handleSelectScene(activeSceneIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSceneIndex, project.scenes.length]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden">
      {/* Top Studio Navbar */}
      <Navbar
        title={project.title}
        onUpdateTitle={handleUpdateTitle}
        look={project.look}
        onSelectLook={handleSelectLook}
        onOpenAiModal={() => setShowAiModal(true)}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onResetProject={handleResetProject}
      />

      {/* Main Studio Workspace Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (3 cols): Scene Navigation & Visual Toolbox */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <SceneList
            scenes={project.scenes}
            activeSceneIndex={activeSceneIndex}
            onSelectScene={handleSelectScene}
            onAddScene={handleAddScene}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onMoveScene={handleMoveScene}
          />

          <VisualToolbox
            onAddElement={handleAddElement}
            primaryColor={themeConfig.primaryColor}
          />
        </div>

        {/* Center Column (6 cols): 16:9 Video Player & Spoken Narration Script */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <VideoPlayer
            scene={activeScene}
            theme={activeThemeLook}
            selectedElementId={selectedElementId}
            onSelectElement={(id) => setSelectedElementId(id)}
            onUpdateElementPosition={handleUpdateElementPosition}
            currentSceneIndex={activeSceneIndex}
            totalScenes={project.scenes.length}
            onPrevScene={() => handleSelectScene(activeSceneIndex - 1)}
            onNextScene={() => handleSelectScene(activeSceneIndex + 1)}
            musicTrack={project.musicTrack}
            autoDuck={project.autoDuck}
            voiceRate={project.voiceRate}
            voicePitch={project.voicePitch}
          />

          <ScriptEditor
            scene={activeScene}
            selectedElementId={selectedElementId}
            onUpdateNarration={handleUpdateNarration}
            onUpdateElementTriggerWord={handleUpdateElementTriggerWord}
            onUpdateCustomAudio={handleUpdateCustomAudio}
            voiceRate={project.voiceRate}
            voicePitch={project.voicePitch}
          />
        </div>

        {/* Right Column (3 cols): Element Inspector */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ElementInspector
            element={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            sceneDuration={activeScene.durationSeconds}
          />

          {/* Quick Guide Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
              How Explainroo Works
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              1. <strong>Write Narration</strong>: Type what the voiceover says for each scene.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              2. <strong>Add Visuals</strong>: Click items in the toolbox and position them on the 16:9 canvas.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              3. <strong>Word Sync</strong>: Click any word in the script to anchor your drawing to that moment.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              4. <strong>Export</strong>: Download the video or export the <code className="text-slate-300">script.md</code> & <code className="text-slate-300">scenes.js</code> bundle!
            </p>
          </div>
        </div>
      </main>

      {/* Studio Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Explainroo UI</span>
            <span className="text-slate-600">·</span>
            <span>Visual Studio for Explainer Videos & Architecture Demos</span>
          </div>
          <span className="font-mono text-[11px] text-slate-600">
            [Space] Play/Pause · [Alt + ←/→] Switch Scene · [Esc] Deselect
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AIGeneratorModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onProjectGenerated={(newProject) => {
          setProject(newProject);
          setActiveSceneIndex(0);
          setSelectedElementId(null);
        }}
      />

      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={(tmpl) => {
          setProject(tmpl);
          setActiveSceneIndex(0);
          setSelectedElementId(null);
        }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={project}
      />
    </div>
  );
};
