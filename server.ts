import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/generate-description", async (req, res) => {
  try {
    const { studentName, subjectName, formativeScore, summativeScore, semester } = req.body;

    const prompt = `
      Anda adalah seorang guru profesional yang sedang menyusun rapor Kurikulum Merdeka.
      Tolong buatkan deskripsi capaian kompetensi yang deskriptif dan memotivasi untuk siswa berikut:
      Nama Siswa: ${studentName}
      Mata Pelajaran: ${subjectName}
      Semester: ${semester}
      Nilai Formatif (Rata-rata): ${formativeScore}
      Nilai Sumatif (Rata-rata): ${summativeScore}

      Instruksi:
      1. Tulis dalam Bahasa Indonesia yang formal namun hangat.
      2. Deskripsi harus mencakup poin yang sudah dikuasai dengan sangat baik dan poin yang perlu ditingkatkan.
      3. Jika nilai rata-rata di atas 80, berikan apresiasi tinggi.
      4. Jika nilai di bawah 70, berikan saran perbaikan yang konstruktif.
      5. Panjang deskripsi sekitar 2-3 kalimat.
      6. Fokuslah pada perkembangan kompetensi, bukan sekadar angka.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ description: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Gagal menghasilkan deskripsi." });
  }
});

// Vite Middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
