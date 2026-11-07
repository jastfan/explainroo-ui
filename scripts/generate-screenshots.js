import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(rootDir, 'assets');

// 1. Generate Desktop Screenshot (1280 x 720)
const desktopSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <radialGradient id="glowTop" cx="50%" cy="10%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15"/>
      <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#glowTop)"/>

  <!-- Top Navigation Header -->
  <rect x="0" y="0" width="1280" height="60" fill="#0f172a" fill-opacity="0.95" stroke="#1e293b" stroke-width="1"/>
  
  <!-- Logo -->
  <rect x="24" y="14" width="32" height="32" rx="8" fill="url(#primaryGrad)"/>
  <text x="40" y="36" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" fill="#ffffff">🦘</text>
  <text x="68" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff" letter-spacing="1">Explainroo <tspan fill="#fbbf24">UI</tspan></text>
  <rect x="180" y="20" width="36" height="18" rx="4" fill="#fbbf24" fill-opacity="0.15" stroke="#fbbf24" stroke-width="1" stroke-opacity="0.3"/>
  <text x="198" y="33" font-family="monospace" font-size="10" font-weight="700" fill="#fbbf24" text-anchor="middle">v1.0</text>

  <!-- Title Input Field -->
  <rect x="240" y="14" width="340" height="32" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="255" y="34" font-family="system-ui, sans-serif" font-size="12" fill="#e2e8f0" font-weight="500">How DNS Works: From URL to Website</text>

  <!-- Top Right Actions -->
  <rect x="880" y="14" width="105" height="32" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="932" y="34" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#cbd5e1" text-anchor="middle">✨ AI Director</text>

  <rect x="995" y="14" width="90" height="32" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="1040" y="34" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#cbd5e1" text-anchor="middle">Templates</text>

  <rect x="1095" y="14" width="85" height="32" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="1137" y="34" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#cbd5e1" text-anchor="middle">Export</text>

  <rect x="1190" y="14" width="70" height="32" rx="6" fill="#f59e0b"/>
  <text x="1225" y="34" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">Record</text>

  <!-- Left Sidebar: Scenes List -->
  <rect x="20" y="75" width="220" height="625" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <text x="35" y="105" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" letter-spacing="1">SCENES (3)</text>

  <!-- Active Scene Card -->
  <rect x="30" y="120" width="200" height="75" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="45" y="145" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">1. Client Request</text>
  <text x="45" y="165" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">7.0s · 3 visual triggers</text>

  <!-- Scene 2 Card -->
  <rect x="30" y="205" width="200" height="65" rx="8" fill="#131c2e" stroke="#1e293b" stroke-width="1"/>
  <text x="45" y="230" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#cbd5e1">2. Recursive Resolver</text>
  <text x="45" y="250" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">6.5s · 4 visual triggers</text>

  <!-- Scene 3 Card -->
  <rect x="30" y="280" width="200" height="65" rx="8" fill="#131c2e" stroke="#1e293b" stroke-width="1"/>
  <text x="45" y="305" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#cbd5e1">3. Server Response</text>
  <text x="45" y="325" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">8.0s · 3 visual triggers</text>

  <!-- Center Stage: 16:9 Canvas (Whiteboard Theme) -->
  <rect x="255" y="75" width="750" height="422" rx="12" fill="#faf9f5" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Subtle Canvas Grid -->
  <path d="M 255 135 L 1005 135 M 255 195 L 1005 195 M 255 255 L 1005 255 M 255 315 L 1005 315 M 255 375 L 1005 375 M 255 435 L 1005 435" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2 4"/>
  <path d="M 315 75 L 315 497 M 375 75 L 375 497 M 435 75 L 435 497 M 495 75 L 495 497 M 555 75 L 555 497 M 615 75 L 615 497 M 675 75 L 675 497 M 735 75 L 735 497 M 795 75 L 795 497 M 855 75 L 855 497 M 915 75 L 915 497 M 975 75 L 975 497" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2 4"/>

  <!-- Canvas Diagram Elements (Hand-Drawn Style) -->
  <!-- Client Laptop -->
  <g transform="translate(320, 200)">
    <rect x="0" y="0" width="130" height="90" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
    <rect x="8" y="8" width="114" height="60" rx="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <rect x="-15" y="90" width="160" height="10" rx="3" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
    <text x="65" y="125" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#0f172a" text-anchor="middle">Client Laptop</text>
  </g>

  <!-- Arrow -->
  <g transform="translate(490, 245)">
    <path d="M 0 0 L 100 0" stroke="#f97316" stroke-width="3" stroke-dasharray="4 2"/>
    <polygon points="100,-6 115,0 100,6" fill="#f97316"/>
    <text x="50" y="-12" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ea580c" text-anchor="middle">DNS Request</text>
  </g>

  <!-- Cloud / Resolver -->
  <g transform="translate(640, 185)">
    <path d="M 30 50 A 25 25 0 0 1 70 20 A 35 35 0 0 1 140 25 A 30 30 0 0 1 170 65 A 25 25 0 0 1 140 100 L 40 100 A 25 25 0 0 1 30 50 Z" fill="#eff6ff" stroke="#3b82f6" stroke-width="2.5"/>
    <text x="100" y="65" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#1d4ed8" text-anchor="middle">DNS Resolver</text>
    <text x="100" y="82" font-family="monospace" font-size="10" fill="#3b82f6" text-anchor="middle">1.1.1.1</text>
  </g>

  <!-- Subtitle Pill (Whisper Karaoke Style) -->
  <rect x="420" y="440" width="420" height="38" rx="19" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1"/>
  <text x="630" y="464" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#e2e8f0" text-anchor="middle">
    Whenever you open your <tspan fill="#facc15" font-weight="800">browser</tspan> and type google.com...
  </text>

  <!-- Bottom Timeline & Audio Player Controls -->
  <rect x="255" y="508" width="750" height="192" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  
  <!-- Player Bar -->
  <circle cx="285" cy="535" r="14" fill="#f59e0b"/>
  <polygon points="282,529 291,535 282,541" fill="#0f172a"/>
  <text x="315" y="540" font-family="monospace" font-size="11" fill="#cbd5e1">02.4s / 07.0s</text>

  <!-- Waveform Scrub Track -->
  <rect x="410" y="530" width="480" height="10" rx="5" fill="#1e293b"/>
  <rect x="410" y="530" width="165" height="10" rx="5" fill="#38bdf8"/>
  <circle cx="575" cy="535" r="7" fill="#ffffff" filter="url(#glow)"/>

  <!-- Word Anchor Pill List -->
  <text x="275" y="580" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#94a3b8">SCRIPT &amp; WORD TRIGGERS</text>
  
  <rect x="275" y="595" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="305" y="611" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">Whenever</text>

  <rect x="342" y="595" width="40" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="362" y="611" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">you</text>

  <rect x="389" y="595" width="45" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="411" y="611" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">open</text>

  <rect x="441" y="595" width="60" height="24" rx="4" fill="#3b82f6" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="471" y="611" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">browser ⚡</text>

  <rect x="508" y="595" width="35" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="525" y="611" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">and</text>

  <rect x="550" y="595" width="55" height="24" rx="4" fill="#f97316" stroke="#fb923c" stroke-width="1.5"/>
  <text x="577" y="611" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">type ⚡</text>

  <rect x="612" y="595" width="85" height="24" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="654" y="611" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">google.com...</text>

  <!-- Right Sidebar: Visual Toolbox -->
  <rect x="1015" y="75" width="245" height="625" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <text x="1030" y="105" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" letter-spacing="1">VISUAL TOOLBOX</text>

  <rect x="1030" y="125" width="102" height="60" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="1081" y="152" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">💻</text>
  <text x="1081" y="172" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Client</text>

  <rect x="1142" y="125" width="102" height="60" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="1193" y="152" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">🖥️</text>
  <text x="1193" y="172" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Server</text>

  <rect x="1030" y="195" width="102" height="60" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="1081" y="222" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">🗄️</text>
  <text x="1081" y="242" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Database</text>

  <rect x="1142" y="195" width="102" height="60" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="1193" y="222" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">☁️</text>
  <text x="1193" y="242" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Cloud</text>
</svg>
`;

// 2. Generate Mobile Screenshot (720 x 1280)
const mobileSvg = `
<svg width="720" height="1280" viewBox="0 0 720 1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>

  <rect width="720" height="1280" fill="url(#mbg)"/>

  <!-- Mobile Header -->
  <rect x="0" y="0" width="720" height="70" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <rect x="25" y="18" width="34" height="34" rx="8" fill="url(#mGrad)"/>
  <text x="42" y="42" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle" fill="#ffffff">🦘</text>
  <text x="70" y="40" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff">Explainroo UI</text>

  <!-- 16:9 Canvas Stage -->
  <rect x="20" y="90" width="680" height="382" rx="12" fill="#faf9f5" stroke="#cbd5e1" stroke-width="2"/>
  <text x="360" y="260" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#0f172a" text-anchor="middle">Hand-Drawn Explainer Stage (16:9)</text>
  <text x="360" y="295" font-family="system-ui, sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Interactive vector nodes synchronized with voice narration</text>

  <!-- Script Editor Card -->
  <rect x="20" y="495" width="680" height="280" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <text x="40" y="535" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#94a3b8">NARRATION &amp; WORD TRIGGERS</text>
  <rect x="40" y="555" width="640" height="120" rx="8" fill="#1e293b"/>
  <text x="60" y="590" font-family="system-ui, sans-serif" font-size="14" fill="#e2e8f0">Whenever you open your browser and type google.com...</text>

  <!-- Visual Elements Grid -->
  <rect x="20" y="795" width="680" height="450" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <text x="40" y="835" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#94a3b8">TOOLBOX COMPONENTS</text>
  
  <rect x="40" y="860" width="305" height="70" rx="8" fill="#1e293b"/>
  <text x="75" y="902" font-family="system-ui, sans-serif" font-size="22">💻</text>
  <text x="115" y="902" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f8fafc">Client Laptop</text>

  <rect x="375" y="860" width="305" height="70" rx="8" fill="#1e293b"/>
  <text x="410" y="902" font-family="system-ui, sans-serif" font-size="22">🖥️</text>
  <text x="450" y="902" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f8fafc">Server Rack</text>

  <rect x="40" y="950" width="305" height="70" rx="8" fill="#1e293b"/>
  <text x="75" y="992" font-family="system-ui, sans-serif" font-size="22">🗄️</text>
  <text x="115" y="992" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f8fafc">Database Node</text>

  <rect x="375" y="950" width="305" height="70" rx="8" fill="#1e293b"/>
  <text x="410" y="992" font-family="system-ui, sans-serif" font-size="22">☁️</text>
  <text x="450" y="992" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f8fafc">Cloud &amp; DNS</text>
</svg>
`;

// 3. Generate Visual Themes Showcase Screenshot (1280 x 720)
const themesSvg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <rect width="1280" height="720" fill="url(#headerGrad)"/>

  <!-- Top Title Banner -->
  <text x="640" y="48" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    Explainroo UI · 4 Hand-Drawn Visual Themes
  </text>
  <text x="640" y="74" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">
    Switch artistic aesthetics instantly with Rough.js hand-drawn vector physics
  </text>

  <!-- 1. Whiteboard Theme (Top Left) -->
  <g transform="translate(40, 95)">
    <rect width="580" height="280" rx="12" fill="#faf9f5" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="20" y="16" width="130" height="26" rx="6" fill="#0f172a"/>
    <text x="85" y="34" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">1. Whiteboard</text>
    
    <!-- Whiteboard Diagram Elements -->
    <rect x="40" y="70" width="120" height="80" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
    <text x="100" y="115" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">Laptop</text>
    
    <path d="M 165 110 L 255 110" stroke="#f97316" stroke-width="3" stroke-dasharray="4 2"/>
    <polygon points="255,105 270,110 255,115" fill="#f97316"/>
    <text x="215" y="98" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ea580c" text-anchor="middle">REST API</text>

    <rect x="275" y="65" width="130" height="90" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
    <text x="340" y="115" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">API Server</text>

    <path d="M 410 110 L 450 110" stroke="#0f172a" stroke-width="2.5"/>
    <polygon points="450,106 460,110 450,114" fill="#0f172a"/>

    <path d="M 465 80 A 25 10 0 1 0 515 80 A 25 10 0 1 0 465 80 Z M 465 80 L 465 130 A 25 10 0 0 0 515 130 L 515 80" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
    <text x="490" y="152" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8" text-anchor="middle">Database</text>

    <rect x="40" y="215" width="500" height="42" rx="8" fill="#f1f5f9"/>
    <text x="55" y="241" font-family="system-ui, sans-serif" font-size="12" fill="#334155">Aesthetic: Warm cream paper, dark ink strokes, colorful marker fills</text>
  </g>

  <!-- 2. Dark Tech Theme (Top Right) -->
  <g transform="translate(660, 95)">
    <rect width="580" height="280" rx="12" fill="#090d16" stroke="#1e293b" stroke-width="2"/>
    <rect x="20" y="16" width="130" height="26" rx="6" fill="#38bdf8"/>
    <text x="85" y="34" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#020617" text-anchor="middle">2. Dark Tech</text>

    <!-- Dark Tech Diagram -->
    <rect x="40" y="70" width="120" height="80" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="100" y="115" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8" text-anchor="middle">Client Terminal</text>

    <path d="M 165 110 L 255 110" stroke="#f59e0b" stroke-width="3" stroke-dasharray="3 3"/>
    <polygon points="255,105 270,110 255,115" fill="#f59e0b"/>
    <text x="215" y="98" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#fbbf24" text-anchor="middle">WebSocket</text>

    <rect x="275" y="65" width="130" height="90" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
    <text x="340" y="115" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#34d399" text-anchor="middle">Microservice</text>

    <path d="M 410 110 L 450 110" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="450,106 460,110 450,114" fill="#38bdf8"/>

    <path d="M 465 80 A 25 10 0 1 0 515 80 A 25 10 0 1 0 465 80 Z M 465 80 L 465 130 A 25 10 0 0 0 515 130 L 515 80" fill="#1e1b4b" stroke="#a855f7" stroke-width="2"/>
    <text x="490" y="152" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#c084fc" text-anchor="middle">Redis Cache</text>

    <rect x="40" y="215" width="500" height="42" rx="8" fill="#131c2e"/>
    <text x="55" y="241" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">Aesthetic: Deep midnight background, neon cyan, glowing cyber schematics</text>
  </g>

  <!-- 3. Blueprint Theme (Bottom Left) -->
  <g transform="translate(40, 400)">
    <rect width="580" height="280" rx="12" fill="#0c2340" stroke="#1e40af" stroke-width="2"/>
    <rect x="20" y="16" width="130" height="26" rx="6" fill="#ffffff"/>
    <text x="85" y="34" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0c2340" text-anchor="middle">3. Blueprint</text>

    <!-- Blueprint Grid Lines -->
    <path d="M 0 60 L 580 60 M 0 120 L 580 120 M 0 180 L 580 180 M 0 240 L 580 240" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    <path d="M 60 0 L 60 280 M 160 0 L 160 280 M 260 0 L 260 280 M 360 0 L 360 280 M 460 0 L 460 280" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>

    <!-- Blueprint Diagram -->
    <rect x="40" y="70" width="120" height="80" rx="4" fill="none" stroke="#ffffff" stroke-width="2"/>
    <text x="100" y="115" font-family="monospace" font-size="12" fill="#ffffff" text-anchor="middle">SYSTEM_A</text>

    <path d="M 165 110 L 265 110" stroke="#67e8f9" stroke-width="2"/>
    <polygon points="265,106 275,110 265,114" fill="#67e8f9"/>
    <text x="215" y="98" font-family="monospace" font-size="10" fill="#a5f3fc" text-anchor="middle">TCP/IP</text>

    <rect x="280" y="65" width="130" height="90" rx="4" fill="none" stroke="#ffffff" stroke-width="2"/>
    <text x="345" y="115" font-family="monospace" font-size="12" fill="#ffffff" text-anchor="middle">GATEWAY_V2</text>

    <path d="M 415 110 L 465 110" stroke="#ffffff" stroke-width="2"/>
    <polygon points="465,106 475,110 465,114" fill="#ffffff"/>

    <rect x="475" y="75" width="70" height="70" rx="4" fill="none" stroke="#ffffff" stroke-width="2"/>
    <text x="510" y="115" font-family="monospace" font-size="11" fill="#ffffff" text-anchor="middle">STORE</text>

    <rect x="40" y="215" width="500" height="42" rx="8" fill="#173663"/>
    <text x="55" y="241" font-family="system-ui, sans-serif" font-size="12" fill="#bae6fd">Aesthetic: Navy blueprint, precision white ink CAD schematics, cyan drafting lines</text>
  </g>

  <!-- 4. Chalkboard Theme (Bottom Right) -->
  <g transform="translate(660, 400)">
    <rect width="580" height="280" rx="12" fill="#15251d" stroke="#224233" stroke-width="2"/>
    <rect x="20" y="16" width="130" height="26" rx="6" fill="#f8fafc"/>
    <text x="85" y="34" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#15251d" text-anchor="middle">4. Chalkboard</text>

    <!-- Chalkboard Diagram -->
    <rect x="40" y="70" width="120" height="80" rx="10" fill="none" stroke="#f8fafc" stroke-width="2.5" stroke-dasharray="8 3"/>
    <text x="100" y="115" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#f8fafc" text-anchor="middle">Actor</text>

    <path d="M 165 110 L 265 110" stroke="#fef08a" stroke-width="3"/>
    <polygon points="265,105 275,110 265,115" fill="#fef08a"/>
    <text x="215" y="98" font-family="system-ui, sans-serif" font-size="11" fill="#fef08a" text-anchor="middle">Action</text>

    <rect x="280" y="65" width="130" height="90" rx="10" fill="none" stroke="#86efac" stroke-width="2.5" stroke-dasharray="6 2"/>
    <text x="345" y="115" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#86efac" text-anchor="middle">Controller</text>

    <path d="M 415 110 L 465 110" stroke="#f8fafc" stroke-width="2"/>
    <polygon points="465,106 475,110 465,114" fill="#f8fafc"/>

    <circle cx="510" cy="110" r="35" fill="none" stroke="#fdba74" stroke-width="2.5"/>
    <text x="510" y="115" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#fdba74" text-anchor="middle">State</text>

    <rect x="40" y="215" width="500" height="42" rx="8" fill="#1e362a"/>
    <text x="55" y="241" font-family="system-ui, sans-serif" font-size="12" fill="#d1fae5">Aesthetic: Forest slate chalkboard, soft textured chalk strokes, pastel highlights</text>
  </g>
</svg>
`;

async function generate() {
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const desktopBuffer = await sharp(Buffer.from(desktopSvg)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), desktopBuffer);
  fs.writeFileSync(path.join(assetsDir, 'screenshot-desktop.png'), desktopBuffer);
  console.log('✓ Generated Explainroo UI screenshot-desktop.png (1280x720)');

  const mobileBuffer = await sharp(Buffer.from(mobileSvg)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), mobileBuffer);
  fs.writeFileSync(path.join(assetsDir, 'screenshot-mobile.png'), mobileBuffer);
  console.log('✓ Generated Explainroo UI screenshot-mobile.png (720x1280)');

  const themesBuffer = await sharp(Buffer.from(themesSvg)).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'screenshot-themes.png'), themesBuffer);
  fs.writeFileSync(path.join(assetsDir, 'screenshot-themes.png'), themesBuffer);
  console.log('✓ Generated Explainroo UI screenshot-themes.png (1280x720)');
}

generate().catch(console.error);
