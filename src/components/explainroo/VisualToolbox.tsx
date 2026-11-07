import React from 'react';
import {
  Server,
  Database,
  Cloud,
  Laptop,
  Shield,
  Layout,
  Terminal,
  Smartphone,
  Square,
  Circle,
  MoveRight,
  Code,
  Type,
  CheckCircle2,
  Tag,
  Zap,
  Key,
  Globe,
  User,
} from 'lucide-react';
import { ElementType, VisualElement } from '../../types/explainroo';
import { audioEngine } from '../../utils/audioEngine';

interface VisualToolboxProps {
  onAddElement: (element: Partial<VisualElement>) => void;
  primaryColor: string;
}

export const VisualToolbox: React.FC<VisualToolboxProps> = ({
  onAddElement,
  primaryColor,
}) => {
  const tools = [
    {
      category: 'Architecture',
      items: [
        {
          type: 'client' as ElementType,
          label: 'Client Laptop',
          icon: Laptop,
          def: { width: 180, height: 130, color: '#38bdf8', label: 'Client App' },
        },
        {
          type: 'server' as ElementType,
          label: 'Server Rack',
          icon: Server,
          def: { width: 180, height: 120, color: '#10b981', label: 'Node Server' },
        },
        {
          type: 'database' as ElementType,
          label: 'Database',
          icon: Database,
          def: { width: 160, height: 150, color: '#a855f7', label: 'PostgreSQL DB' },
        },
        {
          type: 'cloud' as ElementType,
          label: 'Cloud / DNS',
          icon: Cloud,
          def: { width: 220, height: 140, color: '#3b82f6', label: 'Cloud Service' },
        },
        {
          type: 'api_gateway' as ElementType,
          label: 'API Gateway',
          icon: Shield,
          def: { width: 170, height: 150, color: '#fbbf24', label: 'API Gateway' },
        },
      ],
    },
    {
      category: 'UI Mockups',
      items: [
        {
          type: 'browser_window' as ElementType,
          label: 'Browser Window',
          icon: Layout,
          def: {
            width: 380,
            height: 220,
            color: '#3b82f6',
            label: 'Web Application UI',
            url: 'https://app.io',
          },
        },
        {
          type: 'terminal_window' as ElementType,
          label: 'Terminal Window',
          icon: Terminal,
          def: {
            width: 360,
            height: 180,
            color: '#38bdf8',
            label: 'npm install explainroo',
            subtext: 'Ready',
          },
        },
        {
          type: 'phone_mockup' as ElementType,
          label: 'Phone Screen',
          icon: Smartphone,
          def: { width: 140, height: 240, color: '#0f172a', label: 'Mobile App' },
        },
      ],
    },
    {
      category: 'Shapes & Arrows',
      items: [
        {
          type: 'arrow' as ElementType,
          label: 'Straight Arrow',
          icon: MoveRight,
          def: { width: 160, height: 0, color: '#f97316', label: 'Request' },
        },
        {
          type: 'rectangle' as ElementType,
          label: 'Box Container',
          icon: Square,
          def: { width: 180, height: 120, color: primaryColor, label: 'Component' },
        },
        {
          type: 'circle' as ElementType,
          label: 'Circle / Node',
          icon: Circle,
          def: { width: 110, height: 110, color: primaryColor, label: 'Node' },
        },
        {
          type: 'checkmark' as ElementType,
          label: 'Checkmark Stamp',
          icon: CheckCircle2,
          def: { width: 70, height: 70, color: '#10b981' },
        },
        {
          type: 'badge' as ElementType,
          label: 'Step Badge',
          icon: Tag,
          def: { width: 120, height: 38, color: '#fbbf24', label: 'Step 1' },
        },
      ],
    },
    {
      category: 'Code & Text',
      items: [
        {
          type: 'code_block' as ElementType,
          label: 'Code Block',
          icon: Code,
          def: {
            width: 320,
            height: 150,
            color: '#38bdf8',
            codeSnippet: 'const api = createClient();\nawait api.connect();',
          },
        },
        {
          type: 'text' as ElementType,
          label: 'Title Text',
          icon: Type,
          def: { width: 280, height: 32, color: primaryColor, label: 'Core Mechanism' },
        },
      ],
    },
    {
      category: 'Tech & Network Icons',
      items: [
        {
          type: 'icon' as ElementType,
          label: 'Redis / Cache',
          icon: Zap,
          def: { width: 70, height: 70, color: '#ef4444', iconName: 'zap', label: 'Cache' },
        },
        {
          type: 'icon' as ElementType,
          label: 'Auth / Token',
          icon: Key,
          def: { width: 70, height: 70, color: '#f59e0b', iconName: 'key', label: 'JWT' },
        },
        {
          type: 'icon' as ElementType,
          label: 'Global CDN / Web',
          icon: Globe,
          def: { width: 70, height: 70, color: '#06b6d4', iconName: 'globe', label: 'Edge CDN' },
        },
        {
          type: 'icon' as ElementType,
          label: 'Client User',
          icon: User,
          def: { width: 70, height: 70, color: '#ec4899', iconName: 'user', label: 'End User' },
        },
      ],
    },
  ];

  const handleItemClick = (item: any) => {
    // Generate at randomized center coordinate
    const offsetX = Math.floor(Math.random() * 80) - 40;
    const offsetY = Math.floor(Math.random() * 60) - 30;

    const newElement: Partial<VisualElement> = {
      id: `el-${Date.now()}`,
      type: item.type,
      x: 640 - item.def.width / 2 + offsetX,
      y: 360 - item.def.height / 2 + offsetY,
      width: item.def.width,
      height: item.def.height,
      color: item.def.color,
      label: item.def.label,
      subtext: item.def.subtext,
      url: item.def.url,
      codeSnippet: item.def.codeSnippet,
      iconName: item.def.iconName,
      strokeWidth: 2.5,
      roughness: 1.4,
      animation: 'pop',
      triggerTimeSec: 0.5,
    };

    onAddElement(newElement);
    audioEngine.playPop();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Visual Toolbox</h3>
          <p className="text-[11px] text-slate-500">Click to add diagrams and mockups</p>
        </div>
      </div>

      <div className="space-y-4">
        {tools.map((section) => (
          <div key={section.category}>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-2">
              {section.category}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-colors cursor-pointer group active:scale-95"
                    title={`Add ${item.label} to scene`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-amber-400/10 transition-colors">
                      <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
