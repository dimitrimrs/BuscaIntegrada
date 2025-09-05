import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" })); // libera acesso do frontend
app.use(express.json());

const API_KEY = process.env.SERPER_API_KEY;

app.post("/api/search", async (req, res) => {
  try {
    const query = req.body.query;

    const response = await fetch("https://google.serper.dev/shopping", {
    method: "POST",
    headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        q: query,
        location: "Brazil", // força Brasil
        gl: "br",           // geolocalização Brasil
        hl: "pt-br",        // idioma português
        num: 40             // número de resultados
    })
    });

    const data = await response.json();
    res.json(data); // devolve o objeto inteiro, não só shopping
  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
