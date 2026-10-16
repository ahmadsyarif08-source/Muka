import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API: Generate Pramuka Quiz Questions with Gemini AI
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const {
      topic = 'Pengetahuan Umum Kepramukaan',
      count = 5,
      golongan = 'Penggalang',
      difficulty = 'Sedang',
    } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi. Anda dapat membuat dan mengedit soal secara manual di antarmuka.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Buatkan tepat ${count} butir soal kuis cerdas cermat kepramukaan Indonesia dengan topik: "${topic}" untuk tingkat/golongan "${golongan}" dengan tingkat kesulitan "${difficulty}".
Setiap soal harus memiliki:
1. "pertanyaan": kalimat pertanyaan yang mendidik, faktual, dan jelas
2. "pilihan": tepat 4 pilihan jawaban yang masuk akal (A, B, C, D)
3. "kunci": bilangan bulat (integer) 0, 1, 2, atau 3 yang merujuk pada indeks pilihan jawaban yang benar (0 = pilihan pertama, 1 = pilihan kedua, 2 = pilihan ketiga, 3 = pilihan keempat)
4. "penjelasan": uraian ringkas alasan kebenaran jawaban untuk edukasi pandu.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pertanyaan: { type: Type.STRING },
              pilihan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              kunci: { type: Type.INTEGER },
              penjelasan: { type: Type.STRING },
            },
            required: ['pertanyaan', 'pilihan', 'kunci', 'penjelasan'],
          },
        },
      },
    });

    const text = response.text || '[]';
    const questions = JSON.parse(text);
    return res.json({ questions });
  } catch (error: any) {
    console.error('AI Quiz Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan soal kuis dengan AI.',
    });
  }
});

async function start() {
  const portToUse = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(portToUse, '0.0.0.0', () => {
    console.log(`PramukaHub fullstack server running on http://0.0.0.0:${portToUse}`);
  });
}

start();
