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
  { key: "solteiros.html", label: "Elenco da Festa" },
  { key: "mural.html", label: "Mural" },
  { key: "mapa.html", label: "Mapa" },
];

const STORAGE_KEY = "experiencia-visitadas";

// Eventos do card "Surpresa" — desbloqueiam automaticamente no horário.
// Ajuste as datas/horas conforme a organização da festa (fuso -03:00 = Brasília).
// Quando mais de um já estiver liberado, mostra sempre o mais recente.
const SURPRESAS = [
  {
    hora: new Date("2026-08-08T22:00:00-03:00"),
    titulo: "Hora do Whisky",
    desc: "Passe no bar: o whisky especial dos noivos está liberado!",
  },
  {
    hora: new Date("2026-08-08T23:30:00-03:00"),
    titulo: "Hora do Buquê",
    desc: "Solteiras, se aproximem da pista! Está quase na hora do buquê.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  configurarMenu();
  marcarLinkAtivo();
  preencherAno();
  registrarVisita();
  renderProgresso();
  configurarSurpresa();
  embaralharSolteiros();
  configurarPlantaBaixa();
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

  const desbloqueadas = SURPRESAS.filter((s) => agora >= s.hora);

  if (desbloqueadas.length > 0) {
    const atual = desbloqueadas[desbloqueadas.length - 1];
    card.classList.remove("is-locked");
    card.classList.add("is-unlocked");
    if (titulo) titulo.textContent = atual.titulo;
    if (desc) desc.textContent = atual.desc;
    if (arrow) arrow.textContent = "";
  } else {
    // Mostra o horário da próxima surpresa a ser liberada
    const proxima = SURPRESAS[0];
    const hh = String(proxima.hora.getHours()).padStart(2, "0");
    const mm = String(proxima.hora.getMinutes()).padStart(2, "0");
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

// ---------- Mapa da festa: planta baixa navegável (arrastar + zoom) ----------
function configurarPlantaBaixa() {
  const viewer = document.getElementById("planta-viewer");
  const track = document.getElementById("planta-track");
  const imagem = document.getElementById("planta-imagem");
  if (!viewer || !track || !imagem) return;

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_PASSO = 0.4;

  let escala = 1;
  let posX = 0;
  let posY = 0;
  let arrastando = false;
  let inicioX = 0;
  let inicioY = 0;

  function aplicarTransformacao() {
    track.style.transform = "translate(" + posX + "px, " + posY + "px) scale(" + escala + ")";
  }

  function limitarPosicao() {
    // Evita arrastar a imagem para muito longe da área visível
    const limiteX = viewer.clientWidth * (escala - 1) + viewer.clientWidth * 0.5;
    const limiteY = viewer.clientHeight * (escala - 1) + viewer.clientHeight * 0.5;
    posX = Math.max(-limiteX, Math.min(limiteX, posX));
    posY = Math.max(-limiteY, Math.min(limiteY, posY));
  }

  function ajustarZoom(delta) {
    const anterior = escala;
    escala = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escala + delta));
    if (escala === ZOOM_MIN) {
      posX = 0;
      posY = 0;
    } else {
      // Compensa a posição para o zoom parecer centralizado
      const fator = escala / anterior;
      posX *= fator;
      posY *= fator;
      limitarPosicao();
    }
    viewer.classList.toggle("pode-arrastar", escala > ZOOM_MIN);
    aplicarTransformacao();
  }

  // Arrastar com mouse/touch (Pointer Events cobre os dois)
  viewer.addEventListener("pointerdown", (evento) => {
    if (escala <= ZOOM_MIN) return;
    arrastando = true;
    inicioX = evento.clientX - posX;
    inicioY = evento.clientY - posY;
    viewer.setPointerCapture(evento.pointerId);
    viewer.classList.add("arrastando");
  });

  viewer.addEventListener("pointermove", (evento) => {
    if (!arrastando) return;
    posX = evento.clientX - inicioX;
    posY = evento.clientY - inicioY;
    limitarPosicao();
    aplicarTransformacao();
  });

  function pararArraste() {
    arrastando = false;
    viewer.classList.remove("arrastando");
  }

  viewer.addEventListener("pointerup", pararArraste);
  viewer.addEventListener("pointerleave", pararArraste);
  viewer.addEventListener("pointercancel", pararArraste);

  // Zoom com scroll do mouse
  viewer.addEventListener(
    "wheel",
    (evento) => {
      evento.preventDefault();
      ajustarZoom(evento.deltaY < 0 ? ZOOM_PASSO : -ZOOM_PASSO);
    },
    { passive: false }
  );

  // Botões de zoom
  const btnMais = document.getElementById("planta-zoom-in");
  const btnMenos = document.getElementById("planta-zoom-out");
  const btnReset = document.getElementById("planta-zoom-reset");

  if (btnMais) btnMais.addEventListener("click", () => ajustarZoom(ZOOM_PASSO));
  if (btnMenos) btnMenos.addEventListener("click", () => ajustarZoom(-ZOOM_PASSO));
  if (btnReset)
    btnReset.addEventListener("click", () => {
      escala = ZOOM_MIN;
      posX = 0;
      posY = 0;
      viewer.classList.remove("pode-arrastar");
      aplicarTransformacao();
    });

  // Duplo clique/toque para dar um zoom rápido
  viewer.addEventListener("dblclick", () => {
    ajustarZoom(escala > ZOOM_MIN ? ZOOM_MIN - escala : ZOOM_PASSO * 2);
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
