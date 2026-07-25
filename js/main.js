// =====================================================================
// Experiência Digital — Ana Carolina & Daniel
// Menu, progresso (localStorage), card surpresa e animações de scroll
// =====================================================================

// Lista das experiências que compõem a "jornada" do convidado.
// A ordem aqui define a ordem exibida na barra de progresso.
const EXPERIENCIAS = [
  { key: "cronograma.html", label: "Cronograma" },
  { key: "cardapio.html", label: "Cardápio" },
  { key: "drinks.html", label: "Drinks" },
  { key: "album.html", label: "Fotos" },
  { key: "playlist.html", label: "Playlist" },
  { key: "solteiros.html", label: "Jornal dos Solteiros" },
  { key: "mural.html", label: "Mural" },
  { key: "mapa.html", label: "Mapa" },
];

const STORAGE_KEY = "experiencia-visitadas";

// Horário em que o card "Surpresa" é desbloqueado automaticamente.
// Ajuste a data/hora conforme desejar (fuso -03:00 = horário de Brasília).
const SURPRESA_UNLOCK = new Date("2026-08-08T22:00:00-03:00");
const SURPRESA_CONTEUDO = {
  titulo: "Hora do Whisky",
  desc: "Passe no bar: o whisky especial dos noivos está liberado!",
};

document.addEventListener("DOMContentLoaded", () => {
  configurarMenu();
  marcarLinkAtivo();
  preencherAno();
  registrarVisita();
  renderProgresso();
  configurarSurpresa();
  embaralharSolteiros();
  configurarAnimacoesScroll();
});

// ---------- Menu mobile ----------
function configurarMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => links.classList.remove("open"));
  });
}

// ---------- Link ativo ----------
function paginaAtual() {
  return location.pathname.split("/").pop() || "index.html";
}

function marcarLinkAtivo() {
  const atual = paginaAtual();
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === atual) link.classList.add("active");
  });
}

// ---------- Ano no rodapé ----------
function preencherAno() {
  document.querySelectorAll("[data-ano-atual]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

// ---------- Progresso (localStorage) ----------
function lerVisitadas() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (e) {
    return [];
  }
}

function registrarVisita() {
  const atual = paginaAtual();
  if (!EXPERIENCIAS.some((exp) => exp.key === atual)) return;

  const visitadas = lerVisitadas();
  if (!visitadas.includes(atual)) {
    visitadas.push(atual);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitadas));
    } catch (e) {
      /* localStorage indisponível — segue sem persistir */
    }
  }
}

function renderProgresso() {
  const lista = document.getElementById("progresso-lista");
  const contador = document.getElementById("progresso-contador");
  const fill = document.getElementById("progresso-fill");
  const final = document.getElementById("progresso-final");
  if (!lista) return;

  const visitadas = lerVisitadas();
  const total = EXPERIENCIAS.length;
  const feitas = EXPERIENCIAS.filter((exp) => visitadas.includes(exp.key)).length;

  lista.innerHTML = "";
  EXPERIENCIAS.forEach((exp) => {
    const feito = visitadas.includes(exp.key);
    const li = document.createElement("li");
    li.className = "progresso-item" + (feito ? " feito" : "");
    li.innerHTML =
      '<span class="progresso-check" aria-hidden="true"></span>' +
      '<a href="' + exp.key + '">' + exp.label + "</a>";
    lista.appendChild(li);
  });

  if (contador) contador.textContent = feitas + "/" + total;
  if (fill) fill.style.width = Math.round((feitas / total) * 100) + "%";
  if (final) final.hidden = feitas < total;
}

// ---------- Card surpresa ----------
function configurarSurpresa() {
  const card = document.getElementById("surpresa-card");
  if (!card) return;

  const desc = document.getElementById("surpresa-desc");
  const arrow = document.getElementById("surpresa-arrow");
  const titulo = card.querySelector(".xp-title");
  const agora = new Date();

  if (agora >= SURPRESA_UNLOCK) {
    card.classList.remove("is-locked");
    card.classList.add("is-unlocked");
    if (titulo) titulo.textContent = SURPRESA_CONTEUDO.titulo;
    if (desc) desc.textContent = SURPRESA_CONTEUDO.desc;
    if (arrow) arrow.textContent = "";
  } else {
    // Mostra o horário previsto de liberação
    const hh = String(SURPRESA_UNLOCK.getHours()).padStart(2, "0");
    const mm = String(SURPRESA_UNLOCK.getMinutes()).padStart(2, "0");
    if (desc) desc.textContent = "Disponível a partir das " + hh + "h" + mm;
  }
}

// ---------- Jornal dos Solteiros: ordem embaralhada a cada visita ----------
function embaralharSolteiros() {
  const grid = document.querySelector(".grid-3");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".solteiro-card"));
  if (cards.length < 2) return;

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  cards.forEach((card, indice) => {
    card.style.setProperty("--i", indice);
    grid.appendChild(card);
  });
}

// ---------- Animações de scroll (fade-in escalonado) ----------
function configurarAnimacoesScroll() {
  const alvos = document.querySelectorAll(".reveal");
  if (!alvos.length) return;

  // Sem suporte a IntersectionObserver: mostra tudo direto.
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  alvos.forEach((el) => observador.observe(el));
}
