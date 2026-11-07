import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '10mb' }));

const getApiKey = () => (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();

const getAiClient = () => {
  const apiKey = getApiKey();
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'explainroo-studio',
      },
    },
  });
};

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(getApiKey()),
    model: 'gemini-3.8-flash',
  });
});

// Explainroo AI Explainer Video Generator
app.post('/api/explainroo/ai-generate', async (req, res) => {
  try {
    const {
      prompt,
      look = 'whiteboard',
      numScenes = 3,
      repoUrl = '',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
      });
      return;
    }

    const ai = getAiClient();

    const systemInstruction = `You are Explainroo Studio, the world-class explainer video and animated software diagram director.
Your mission is to take any software repository, architecture concept, or technical topic and turn it into a short, compelling, 3 to 4 scene animated video script and visual diagram layout.

Rules for great Explainroo videos:
1. Narration should be friendly, conversational, and direct (suitable for spoken voiceover). Keep each scene to 25-45 words (~6 to 8 seconds).
2. For each scene, design 2 to 4 visual elements that tell the story visually on a 1280x720 canvas:
   - Use layout components: 'client' (laptop/user), 'server', 'database', 'cloud', 'api_gateway', 'browser_window', 'terminal_window', 'arrow', 'curved_arrow', 'code_block', 'checkmark', 'icon'.
   - Coordinates (X, Y) must be within width 1280 and height 720 (keep X between 120 and 1050, Y between 150 and 520).
   - Give each element a 'triggerWord' (the exact spoken word in that scene's narration when the element should appear on screen).
   - Set 'triggerTimeSec' matching approximately when that word is spoken (e.g. 0.5s, 1.8s, 3.2s).
   - Colors should be pleasant hex codes like #3b82f6 (blue), #10b981 (emerald), #f59e0b (amber), #a855f7 (purple), #ef4444 (rose), #0f172a (dark slate).
3. Return clean, strictly formatted JSON matching the schema.`;

    const userPrompt = `Create an animated explainer video project about:
Topic / Repo: "${prompt}"
${repoUrl ? `Repository URL: ${repoUrl}` : ''}
Visual Look: ${look}
Number of Scenes: ${numScenes}

Produce an engaging title, description, and ${numScenes} scenes with narration and synchronized visual elements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            look: { type: Type.STRING },
            musicTrack: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  narration: { type: Type.STRING },
                  durationSeconds: { type: Type.NUMBER },
                  transition: { type: Type.STRING },
                  elements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER },
                        label: { type: Type.STRING },
                        color: { type: Type.STRING },
                        animation: { type: Type.STRING },
                        triggerWord: { type: Type.STRING },
                        triggerTimeSec: { type: Type.NUMBER },
                        url: { type: Type.STRING },
                        codeSnippet: { type: Type.STRING },
                        iconName: { type: Type.STRING },
                      },
                      required: ['id', 'type', 'x', 'y', 'width', 'height', 'label', 'color', 'animation'],
                    },
                  },
                },
                required: ['id', 'title', 'narration', 'durationSeconds', 'elements'],
              },
            },
          },
          required: ['title', 'description', 'look', 'musicTrack', 'scenes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    // Ensure default settings
    const project = {
      id: `ai-${Date.now()}`,
      title: parsed.title || 'Explainer Video',
      description: parsed.description || prompt,
      repoUrl,
      look: parsed.look || look,
      musicTrack: parsed.musicTrack || 'lofi',
      musicVolume: 0.3,
      voicePitch: 1.0,
      voiceRate: 1.0,
      autoDuck: true,
      scenes: (parsed.scenes || []).map((s: any, idx: number) => ({
        id: s.id || `scene-${idx + 1}`,
        title: s.title || `Scene ${idx + 1}`,
        narration: s.narration || '',
        durationSeconds: s.durationSeconds || Math.max(5, Math.ceil((s.narration?.split(' ')?.length || 20) / 2.5)),
        transition: s.transition || 'fade',
        elements: (s.elements || []).map((el: any, eIdx: number) => ({
          ...el,
          id: el.id || `el-${idx}-${eIdx}`,
          strokeWidth: 2.5,
          roughness: 1.4,
        })),
      })),
    };

    res.json(project);
  } catch (error: any) {
    console.error('Explainroo AI Generator Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate explainer video with AI',
      details: String(error),
    });
  }
});

// Explainroo Script Polish Endpoint
app.post('/api/explainroo/improve-script', async (req, res) => {
  try {
    const { text, goal = 'punchy' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Rewrite this video voiceover narration to make it more ${goal}, engaging, and easy to speak naturally:\n\n"${text}"`,
      config: {
        systemInstruction: 'You are an elite video script doctor. Return the rewritten script and suggested visual anchor keywords.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedText: { type: Type.STRING },
            estimatedSeconds: { type: Type.NUMBER },
            visualKeyMoments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['improvedText', 'estimatedSeconds', 'visualKeyMoments'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to improve script' });
  }
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Explainroo UI server running at http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
