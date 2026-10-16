import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI, Type } from '@google/genai';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Metode HTTP tidak diizinkan. Endpoint ini hanya menerima permintaan POST.',
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const {
      topic = 'Pengetahuan Umum Kepramukaan',
      count = 5,
      golongan = 'Penggalang',
      difficulty = 'Sedang',
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di Environment Variables Vercel. Silakan tambahkan GEMINI_API_KEY di dashboard Vercel (Project Settings > Environment Variables).',
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
    return res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Vercel Quiz API Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan soal kuis dengan AI.',
    });
  }
}
