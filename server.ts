import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured or is empty. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST route to analyze philosopher or connection
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { mode, philosopher, source, target } = req.body;
    const ai = getGeminiClient();

    let systemInstruction = "Ti si stručan asistent za povijest filozofije. Odgovaraj na hrvatskom jeziku. Tvoj ton treba biti akademski, jasan i edukativan, koristeći bogat vokabular i strukturirane odlomke.";
    let prompt = "";

    if (mode === "philosopher" && philosopher) {
      prompt = `Napravi duboku i konciznu stručnu analizu filozofa: ${philosopher.name} (${philosopher.birthDeath}). 
      Njegove ključne ideje su: ${philosopher.keyIdeas.join(", ")}.
      
      Strukturiraj odgovor u sljedeće cjeline (koristi Markdown s jasnim naslovima):
      1. **Povijesni kontekst i značaj** (Gdje se smješta u epohi ${philosopher.epoch} i zašto je važan?)
      2. **Razrada glavnih filozofskih ideja** (Objasni njegove ključne koncepte)
      3. **Utjecaj na kasniju misao** (Koga je inspirirao, a koga isprovocirao na reakciju?)`;
    } else if (mode === "connection" && source && target) {
      prompt = `Detaljno analiziraj filozofski utjecaj koji je ${source.name} imao na filozofa ${target.name}.
      
      Iz njihove povijesti znamo:
      - ${source.name} (${source.birthDeath}) pripada epohi: ${source.epoch}.
      - ${target.name} (${target.birthDeath}) pripada epohi: ${target.epoch}.
      
      Molim te razradi:
      1. **Zajednički filozofski problemi** (Koje su teme obojica proučavali?)
      2. **Narav utjecaja ili rekonceptualizacija** (Kako je ${target.name} usvojio, modificirao ili radikalno odbacio ideje filozofa ${source.name}?)
      3. **Ključni citati ili primjeri** (Daj konkretne primjere iz njihovih djela, npr. ako Descartes utječe na Spinozu kroz pojam supstancije, ili Sokrat na Platona kroz metodu i lik u dijalozima).
      
      Neka analiza bude bogata činjenicama, duboka, ali laka za čitanje. Koristi Markdown strukturu sa naslovima i grafičkim oznakama.`;
    } else {
      return res.status(400).json({ error: "Slanje neispravnih parametara za analizu." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "Dogodila se pogreška prilikom komunikacije s Gemini AI uslugom." 
    });
  }
});

// Configure Vite middleware or Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

startServer();
