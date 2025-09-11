// ====== CONFIG ======
// Agora usamos rota relativa (não importa a porta/localhost)
const API_URL = "/api/search";

// Imagem padrão (inline, não depende de rede)
const DEFAULT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="150"><rect width="100%" height="100%" fill="#3a3a3a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#bbbbbb" font-family="Arial" font-size="14">Sem imagem</text></svg>';

// ====== BUSCA ======
async function buscar() {
  const input = document.getElementById("search");
  const termo = input.value.trim();
  if (!termo) {
    alert("Por favor, insira um produto para buscar.");
    return;
  }

  const carousel = document.getElementById("carousel");
  carousel.innerHTML = '<div class="loading">Carregando resultados...</div>';

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: termo,
        gl: "br",      // força localização Brasil
        hl: "pt-br",   // força idioma português
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Serper pode devolver em várias chaves: shopping, shoppingResults, organic...
    const produtos = data.shopping || data.shoppingResults || data.organic || [];
    mostrarResultados(produtos);
  } catch (err) {
    console.error("Erro na busca:", err);
    carousel.innerHTML = `<div class="loading">Ocorreu um erro ao buscar: ${sanitize(
      err.message
    )}</div>`;
  }
}

// ====== RENDER ======
function mostrarResultados(produtos) {
  const carousel = document.getElementById("carousel");
  carousel.innerHTML = "";

  if (!Array.isArray(produtos) || produtos.length === 0) {
    carousel.innerHTML = "<div class='loading'>Nenhum produto encontrado.</div>";
    return;
  }

  produtos.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const img = document.createElement("img");
    img.src = getImageUrl(p);
    img.alt = p.title || "Produto";
    img.onerror = () => {
      img.onerror = null;
      img.src = DEFAULT_IMAGE;
    };

    const h3 = document.createElement("h3");
    h3.textContent = p.title || "Sem título";

    const price = document.createElement("p");
    price.innerHTML = `<strong>Preço:</strong> ${p.price || "Não informado"}`;

    const source = document.createElement("p");
    source.innerHTML = `<strong>Fonte:</strong> ${p.source || "Desconhecida"}`;

    const link = document.createElement("a");
    link.href = p.link || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Ver produto";

    card.append(img, h3, price, source, link);
    carousel.appendChild(card);
  });
}

// ====== HELPERS ======
function getImageUrl(p) {
  return p.imageUrl || p.thumbnailUrl || p.thumbnail || p.image || DEFAULT_IMAGE;
}

function sanitize(text) {
  return String(text).replace(/[<>&"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
  })[c]);
}

// Navegação do carrossel
function scrollCarousel(direction = 1) {
  const carousel = document.getElementById("carousel");
  const item = carousel.querySelector(".product-card");
  const step = item ? item.offsetWidth + 20 : 300; // 20 = gap
  carousel.scrollBy({ left: direction * step, behavior: "smooth" });
}

// Enter = buscar
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("search");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscar();
  });
});

// Deixa as funções acessíveis ao onclick do HTML
window.buscar = buscar;
window.scrollCarousel = scrollCarousel;
