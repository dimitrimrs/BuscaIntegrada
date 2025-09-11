import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Configurar caminho absoluto do projeto ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- API Serper.dev ---
const API_KEY = process.env.SERPER_API_KEY;

app.post("/api/search", async (req, res) => {
  const query = req.body.query;
  console.log("📩 Recebi consulta:", query);

  try {
  const response = await fetch("https://google.serper.dev/shopping", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: "br",
      hl: "pt-br",
    }),
  });

    const data = await response.json();
    console.log("📤 Resposta da Serper:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error("❌ Erro ao chamar Serper:", err);
    res.status(500).json({ error: "Erro ao consultar Serper.dev" });
  }
});


// --- Servir frontend ---
app.use(express.static(path.join(__dirname, "../frontend")));

// Se o usuário acessar qualquer rota que não seja /api, retorna index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 3395;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
