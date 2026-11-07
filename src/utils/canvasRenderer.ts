import rough from 'roughjs';
import { VisualElement, Scene, ThemeLook, THEME_CONFIGS } from '../types/explainroo';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  scene: Scene;
  currentTime: number; // In seconds relative to scene start
  theme: ThemeLook;
  selectedElementId?: string | null;
  interactiveMode?: boolean;
}

export function renderSceneToCanvas({
  canvas,
  scene,
  currentTime,
  theme,
  selectedElementId,
  interactiveMode = false,
}: RenderContext) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const themeCfg = THEME_CONFIGS[theme] || THEME_CONFIGS.whiteboard;

  // 1. Clear & Draw Background
  ctx.save();
  ctx.fillStyle = themeCfg.background;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Subtle Paper / Blueprint Grid if enabled
  if (themeCfg.paperGrid) {
    ctx.strokeStyle = theme === 'blueprint' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;

    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  // 3. Initialize Rough.js for Hand-drawn Aesthetics
  const rc = rough.canvas(canvas);

  // 4. Sort Elements by Order
  const sortedElements = [...scene.elements].sort((a, b) => (a.order || 0) - (b.order || 0));

  // 5. Render Each Element
  sortedElements.forEach((el) => {
    const triggerTime = el.triggerTimeSec || 0;
    const duration = (el.durationMs || 500) / 1000;

    // Calculate entrance animation progress
    let progress = 1;
    if (!interactiveMode) {
      if (currentTime < triggerTime) {
        return; // Element hasn't entered yet
      }
      progress = Math.min(1, Math.max(0, (currentTime - triggerTime) / duration));
    }

    ctx.save();

    // Animation Transform Easing
    if (el.animation === 'pop') {
      const scale = progress < 0.8 ? progress * 1.3 : 1 + (1 - progress) * 0.2;
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
    } else if (el.animation === 'slide') {
      const offset = (1 - progress) * 80;
      ctx.translate(0, offset);
      ctx.globalAlpha = progress;
    } else if (el.animation === 'fade') {
      ctx.globalAlpha = progress;
    } else if (el.animation === 'draw') {
      ctx.globalAlpha = Math.min(1, progress * 1.5);
    }

    if (el.rotation) {
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
    }

    // Rough.js configuration options
    const isSketchy = theme === 'whiteboard' || theme === 'chalkboard';
    const roughOptions: any = {
      roughness: isSketchy ? el.roughness || 1.4 : 0.2,
      bowing: isSketchy ? 1.5 : 0.2,
      stroke: el.color || themeCfg.primaryColor,
      strokeWidth: el.strokeWidth || 2.5,
    };

    if (el.fillStyle && el.fillStyle !== 'none' && el.fillColor) {
      roughOptions.fill = el.fillColor;
      roughOptions.fillStyle = el.fillStyle;
    }

    // Render by Element Type
    switch (el.type) {
      case 'rectangle':
        rc.rectangle(el.x, el.y, el.width, el.height, roughOptions);
        if (el.label) {
          drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + el.height / 2, themeCfg, el.color);
        }
        break;

      case 'circle': {
        const radius = Math.min(el.width, el.height) / 2;
        rc.circle(el.x + radius, el.y + radius, radius * 2, roughOptions);
        if (el.label) {
          drawCenteredText(ctx, el.label, el.x + radius, el.y + radius, themeCfg, el.color);
        }
        break;
      }

      case 'arrow':
      case 'curved_arrow': {
        const x1 = el.x;
        const y1 = el.y;
        const x2 = el.x + el.width;
        const y2 = el.y + el.height;

        if (el.type === 'curved_arrow') {
          const cx = (x1 + x2) / 2;
          const cy = Math.min(y1, y2) - 30;
          rc.curve([[x1, y1], [cx, cy], [x2, y2]], roughOptions);
        } else {
          rc.line(x1, y1, x2, y2, roughOptions);
        }

        // Draw Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 16;
        const arrowAngle = Math.PI / 6;
        rc.line(
          x2,
          y2,
          x2 - headLength * Math.cos(angle - arrowAngle),
          y2 - headLength * Math.sin(angle - arrowAngle),
          roughOptions
        );
        rc.line(
          x2,
          y2,
          x2 - headLength * Math.cos(angle + arrowAngle),
          y2 - headLength * Math.sin(angle + arrowAngle),
          roughOptions
        );

        if (el.label) {
          drawCenteredText(ctx, el.label, (x1 + x2) / 2, (y1 + y2) / 2 - 14, themeCfg, el.color, 14);
        }
        break;
      }

      case 'browser_window': {
        drawBrowserMockup(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'terminal_window': {
        drawTerminalMockup(rc, ctx, el, themeCfg, roughOptions, progress);
        break;
      }

      case 'phone_mockup': {
        drawPhoneMockup(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'server': {
        drawServerDiagram(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'database': {
        drawDatabaseDiagram(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'client': {
        drawClientLaptop(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'cloud': {
        drawCloudDiagram(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'api_gateway': {
        drawApiGateway(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      case 'code_block': {
        drawCodeBlock(rc, ctx, el, themeCfg, roughOptions, progress);
        break;
      }

      case 'text': {
        ctx.font = `600 ${el.height || 28}px ${themeCfg.fontFamily}`;
        ctx.fillStyle = el.color || themeCfg.textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lines = (el.label || '').split('\n');
        lines.forEach((line, lineIdx) => {
          ctx.fillText(line, el.x, el.y + lineIdx * ((el.height || 28) * 1.3));
        });

        if (el.subtext) {
          ctx.font = `400 16px ${themeCfg.fontFamily}`;
          ctx.fillStyle = theme === 'darktech' ? '#94a3b8' : '#64748b';
          ctx.fillText(el.subtext, el.x, el.y + lines.length * ((el.height || 28) * 1.3) + 4);
        }
        break;
      }

      case 'badge': {
        rc.rectangle(el.x, el.y, el.width, el.height, {
          ...roughOptions,
          fill: el.fillColor || `${el.color}22`,
          fillStyle: 'solid',
        });
        drawCenteredText(ctx, el.label || 'Step', el.x + el.width / 2, el.y + el.height / 2, themeCfg, el.color, 14);
        break;
      }

      case 'checkmark': {
        rc.circle(el.x + el.width / 2, el.y + el.height / 2, el.width, {
          ...roughOptions,
          fill: '#10b98122',
          fillStyle: 'solid',
          stroke: '#10b981',
        });
        rc.line(el.x + el.width * 0.25, el.y + el.height * 0.5, el.x + el.width * 0.45, el.y + el.height * 0.72, {
          stroke: '#10b981',
          strokeWidth: 3.5,
        });
        rc.line(el.x + el.width * 0.45, el.y + el.height * 0.72, el.x + el.width * 0.78, el.y + el.height * 0.28, {
          stroke: '#10b981',
          strokeWidth: 3.5,
        });
        break;
      }

      case 'icon': {
        drawVectorIcon(rc, ctx, el, themeCfg, roughOptions);
        break;
      }

      default:
        rc.rectangle(el.x, el.y, el.width, el.height, roughOptions);
        if (el.label) {
          drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + el.height / 2, themeCfg, el.color);
        }
    }

    // Selection Indicator Box (when user clicks in visual editor)
    if (selectedElementId === el.id) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(el.x - 6, el.y - 6, el.width + 12, el.height + 12);
      ctx.setLineDash([]);

      // 4 Corner Drag Handles
      ctx.fillStyle = '#38bdf8';
      const corners = [
        [el.x - 9, el.y - 9],
        [el.x + el.width + 3, el.y - 9],
        [el.x - 9, el.y + el.height + 3],
        [el.x + el.width + 3, el.y + el.height + 3],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx, cy, 6, 6);
      });
    }

    ctx.restore();
  });

  ctx.restore();
}

// Helper: Centered text drawing
function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  themeCfg: any,
  overrideColor?: string,
  fontSize: number = 18
) {
  ctx.save();
  ctx.font = `600 ${fontSize}px ${themeCfg.fontFamily}`;
  ctx.fillStyle = overrideColor || themeCfg.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

// Specialized Diagram: Browser Mockup Window
function drawBrowserMockup(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  // Outer frame
  rc.rectangle(el.x, el.y, el.width, el.height, {
    ...roughOptions,
    fill: themeCfg.background === '#090d16' ? '#0f172a' : '#ffffff',
    fillStyle: 'solid',
  });

  // Top Title Bar
  rc.rectangle(el.x, el.y, el.width, 36, {
    ...roughOptions,
    fill: themeCfg.background === '#090d16' ? '#1e293b' : '#f1f5f9',
    fillStyle: 'solid',
  });

  // 3 Window Traffic Lights
  const dotY = el.y + 18;
  rc.circle(el.x + 18, dotY, 9, { stroke: '#ef4444', fill: '#ef4444', fillStyle: 'solid' });
  rc.circle(el.x + 36, dotY, 9, { stroke: '#f59e0b', fill: '#f59e0b', fillStyle: 'solid' });
  rc.circle(el.x + 54, dotY, 9, { stroke: '#10b981', fill: '#10b981', fillStyle: 'solid' });

  // URL bar
  const urlX = el.x + 80;
  const urlW = el.width - 96;
  rc.rectangle(urlX, el.y + 7, urlW, 22, {
    stroke: '#94a3b8',
    strokeWidth: 1,
    fill: themeCfg.background === '#090d16' ? '#020617' : '#ffffff',
    fillStyle: 'solid',
  });

  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.url || 'https://api.example.com/v1/auth', urlX + 8, el.y + 18);

  // Content body
  if (el.label) {
    drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + 36 + (el.height - 36) / 2, themeCfg, el.color, 16);
  }
}

// Specialized Diagram: Terminal Window
function drawTerminalMockup(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  _themeCfg: any,
  roughOptions: any,
  progress: number
) {
  rc.rectangle(el.x, el.y, el.width, el.height, {
    ...roughOptions,
    fill: '#0f172a',
    fillStyle: 'solid',
    stroke: '#334155',
  });

  // Header bar
  rc.rectangle(el.x, el.y, el.width, 30, {
    fill: '#1e293b',
    fillStyle: 'solid',
    stroke: '#334155',
  });

  // Window dots
  const dotY = el.y + 15;
  rc.circle(el.x + 16, dotY, 8, { stroke: '#ef4444', fill: '#ef4444', fillStyle: 'solid' });
  rc.circle(el.x + 32, dotY, 8, { stroke: '#f59e0b', fill: '#f59e0b', fillStyle: 'solid' });
  rc.circle(el.x + 48, dotY, 8, { stroke: '#10b981', fill: '#10b981', fillStyle: 'solid' });

  // Terminal text lines
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const command = el.label || 'git commit -m "feat: core architecture"';
  const fullLength = command.length;
  const visibleChars = Math.floor(fullLength * progress);
  const typedCommand = command.slice(0, visibleChars);

  ctx.fillText(`$ ${typedCommand}${progress < 1 ? '▋' : ''}`, el.x + 16, el.y + 44);

  if (progress > 0.7 && el.subtext) {
    ctx.fillStyle = '#10b981';
    ctx.fillText(`✓ ${el.subtext}`, el.x + 16, el.y + 70);
  }
}

// Specialized Diagram: Phone Mockup
function drawPhoneMockup(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  rc.rectangle(el.x, el.y, el.width, el.height, {
    ...roughOptions,
    fill: themeCfg.background === '#090d16' ? '#0f172a' : '#ffffff',
    fillStyle: 'solid',
  });

  // Phone notch
  rc.rectangle(el.x + el.width / 2 - 24, el.y + 6, 48, 8, {
    fill: '#1e293b',
    fillStyle: 'solid',
    stroke: '#1e293b',
  });

  // Screen Content
  if (el.label) {
    drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + el.height / 2, themeCfg, el.color, 15);
  }
}

// Specialized Diagram: Server Stack
function drawServerDiagram(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  const rackHeight = el.height / 3;
  for (let i = 0; i < 3; i++) {
    const rackY = el.y + i * rackHeight;
    rc.rectangle(el.x, rackY, el.width, rackHeight - 4, {
      ...roughOptions,
      fill: themeCfg.background === '#090d16' ? '#1e293b' : '#f8fafc',
      fillStyle: 'solid',
    });

    // Blinking LED dots
    rc.circle(el.x + 14, rackY + rackHeight / 2 - 2, 5, {
      stroke: '#10b981',
      fill: '#10b981',
      fillStyle: 'solid',
    });
    rc.circle(el.x + 26, rackY + rackHeight / 2 - 2, 5, {
      stroke: '#38bdf8',
      fill: '#38bdf8',
      fillStyle: 'solid',
    });

    // Server drive vent lines
    rc.line(el.x + 45, rackY + rackHeight / 2 - 2, el.x + el.width - 15, rackY + rackHeight / 2 - 2, {
      stroke: '#94a3b8',
      strokeWidth: 1.5,
    });
  }

  if (el.label) {
    drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + el.height + 16, themeCfg, el.color, 14);
  }
}

// Specialized Diagram: Database Cylinder
function drawDatabaseDiagram(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  const ellipseHeight = 22;

  // Cylinder body
  rc.rectangle(el.x, el.y + ellipseHeight / 2, el.width, el.height - ellipseHeight, {
    ...roughOptions,
    fill: themeCfg.background === '#090d16' ? '#1e293b' : '#f8fafc',
    fillStyle: 'solid',
  });

  // Top Ellipse
  rc.ellipse(el.x + el.width / 2, el.y + ellipseHeight / 2, el.width, ellipseHeight, roughOptions);

  // Bottom Ellipse
  rc.ellipse(el.x + el.width / 2, el.y + el.height - ellipseHeight / 2, el.width, ellipseHeight, roughOptions);

  if (el.label) {
    drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + el.height / 2, themeCfg, el.color, 15);
  }
}

// Specialized Diagram: Client Laptop
function drawClientLaptop(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  const screenH = el.height * 0.75;
  // Screen
  rc.rectangle(el.x + 10, el.y, el.width - 20, screenH, {
    ...roughOptions,
    fill: themeCfg.background === '#090d16' ? '#0f172a' : '#ffffff',
    fillStyle: 'solid',
  });

  // Base
  rc.rectangle(el.x, el.y + screenH, el.width, el.height - screenH, {
    ...roughOptions,
    fill: '#334155',
    fillStyle: 'solid',
  });

  if (el.label) {
    drawCenteredText(ctx, el.label, el.x + el.width / 2, el.y + screenH / 2, themeCfg, el.color, 14);
  }
}

// Specialized Diagram: Cloud Outline
function drawCloudDiagram(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const w = el.width;
  const h = el.height;

  // Composite 3 overlapping rough circles
  rc.circle(cx - w * 0.22, cy + h * 0.05, h * 0.7, roughOptions);
  rc.circle(cx + w * 0.22, cy + h * 0.05, h * 0.7, roughOptions);
  rc.circle(cx, cy - h * 0.15, h * 0.85, roughOptions);

  if (el.label) {
    drawCenteredText(ctx, el.label, cx, cy, themeCfg, el.color, 15);
  }
}

// Specialized Diagram: API Gateway Shield
function drawApiGateway(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const r = Math.min(el.width, el.height) / 2;

  // Hexagon
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  rc.polygon(points, {
    ...roughOptions,
    fill: themeCfg.background === '#090d16' ? '#1e293b' : '#f8fafc',
    fillStyle: 'solid',
  });

  drawCenteredText(ctx, el.label || 'API Gateway', cx, cy, themeCfg, el.color, 14);
}

// Specialized Diagram: Code Block
function drawCodeBlock(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  _themeCfg: any,
  roughOptions: any,
  progress: number
) {
  rc.rectangle(el.x, el.y, el.width, el.height, {
    ...roughOptions,
    fill: '#020617',
    fillStyle: 'solid',
    stroke: '#1e293b',
  });

  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f1f5f9';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const code = el.codeSnippet || el.label || 'const express = require("express");\napp.listen(3000);';
  const lines = code.split('\n');
  const visibleLineCount = Math.ceil(lines.length * progress);

  lines.slice(0, visibleLineCount).forEach((line, idx) => {
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${idx + 1}`, el.x + 8, el.y + 12 + idx * 18);

    ctx.fillStyle = line.includes('const') || line.includes('function') ? '#38bdf8' : line.includes('return') ? '#a855f7' : '#e2e8f0';
    ctx.fillText(line, el.x + 32, el.y + 12 + idx * 18);
  });
}

// Vector Icons
function drawVectorIcon(
  rc: any,
  ctx: CanvasRenderingContext2D,
  el: VisualElement,
  themeCfg: any,
  roughOptions: any
) {
  const icon = el.iconName || 'shield';
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const size = Math.min(el.width, el.height);

  rc.circle(cx, cy, size, {
    ...roughOptions,
    fill: `${el.color}15`,
    fillStyle: 'solid',
  });

  ctx.save();
  ctx.font = `700 ${size * 0.45}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = el.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const iconGlyphs: Record<string, string> = {
    shield: '🛡️',
    lock: '🔒',
    server: '🖥️',
    database: '💾',
    cloud: '☁️',
    globe: '🌐',
    key: '🔑',
    user: '👤',
    rocket: '🚀',
    zap: '⚡',
    check: '✅',
    alert: '⚠️',
  };

  ctx.fillText(iconGlyphs[icon] || '⚡', cx, cy - 2);
  ctx.restore();

  if (el.label) {
    drawCenteredText(ctx, el.label, cx, el.y + el.height + 16, themeCfg, el.color, 14);
  }
}
