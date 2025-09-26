import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference } from 'mercadopago';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- Configura caminho absoluto do projeto ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar o cliente, do MP
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

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
    console.log("Resposta da Serper:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error("Erro ao chamar Serper:", err);
    res.status(500).json({ error: "Erro ao consultar Serper.dev" });
  }
});

// ====== ROTA DE PAGAMENTO MP ======
app.post("/api/create-payment", async (req, res) => {
  const { title, price } = req.body;
  console.log("Recebi pedido de pagamento para:", title, "| Preço:", price);

  try {
    const precoNumerico = parseFloat(
      String(price).replace("R$", "").replace(".", "").replace(",", ".").trim()
    );

    if (isNaN(precoNumerico)) {
      console.error("Preço inválido:", price);
      return res.status(400).json({ error: "Formato de preço inválido." });
    }
    console.log("Verificando a BASE_URL:", process.env.BASE_URL);

    const preferenceBody = {
      items: [
        {
          title: title,
          unit_price: precoNumerico,
          quantity: 1,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${process.env.BASE_URL}/success.html`,
        failure: `${process.env.BASE_URL}/failure.html`,
        pending: `${process.env.BASE_URL}/pending.html`,
      },
      //não vai funfar no localhost o auto return
      //auto_return: "approved",
    };

    const preference = new Preference(client);
    const response = await preference.create({ body: preferenceBody });

    console.log("Link de pagamento gerado!");

    // A resposta do MP
    res.json({ paymentUrl: response.init_point });

  } catch (err) {
    console.error("❌ Erro ao criar pagamento no Mercado Pago:", err.cause || err);
    res.status(500).json({ error: "Erro ao criar preferência de pagamento" });
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
