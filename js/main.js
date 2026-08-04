// =====================================================================
// Experiência Digital — Ana Carolina & Daniel
// Menu, progresso (localStorage), card surpresa e animações de scroll
// =====================================================================

// Lista das experiências que compõem a "jornada" do convidado.
// A ordem aqui define a ordem exibida na barra de progresso.
const EXPERIENCIAS = [
  { key: "cronograma.html", label: "Cronograma" },
  { key: "cardapio.html", label: "Cardápio" },
  { key: "drinks.html", label: "Bebidas" },
  { key: "album.html", label: "Fotos" },
  { key: "gibi.html", label: "Gibi do Guigo" },
  { key: "docinhos.html", label: "Docinhos" },
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
  configurarMapTooltips();
  configurarGibi();
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

function estaEmModoEdicaoMapa() {
  const params = new URLSearchParams(window.location.search);
  return paginaAtual() === "mapa.html" && params.get("edit") === "true";
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
  const superficie = viewer ? viewer.querySelector(".planta-map-surface") : null;
  if (!viewer || !track || !imagem || !superficie) return;

  const modoEdicao = estaEmModoEdicaoMapa();
  const marcadores = Array.from(superficie.querySelectorAll(".map-marker"));

  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;
  const ZOOM_PASSO = 0.4;

  let escala = 1;
  let posX = 0;
  let posY = 0;
  let arrastando = false;
  let inicioX = 0;
  let inicioY = 0;
  let marcadorArrastando = null;
  let outputPosicoes = null;
  let statusEdicao = null;

  function limitarPercentual(valor) {
    return Math.max(0, Math.min(100, valor));
  }

  function nomeMarcador(marcador, indice) {
    const classe = Array.from(marcador.classList).find((item) => item !== "map-marker");
    return classe || "marker-" + String(indice + 1);
  }

  function textoPosicoes() {
    return marcadores
      .map((marcador, indice) => {
        const nome = nomeMarcador(marcador, indice);
        const left = marcador.style.left || "0%";
        const top = marcador.style.top || "0%";
        return nome + ": left: " + left + "; top: " + top + ";";
      })
      .join("\n");
  }

  function atualizarOutputEdicao() {
    if (!outputPosicoes) return;
    outputPosicoes.value = textoPosicoes();
  }

  function atualizarPosicaoMarcador(evento, marcador) {
    const rect = superficie.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const left = limitarPercentual(((evento.clientX - rect.left) / rect.width) * 100);
    const top = limitarPercentual(((evento.clientY - rect.top) / rect.height) * 100);

    marcador.style.left = left.toFixed(2) + "%";
    marcador.style.top = top.toFixed(2) + "%";
    atualizarOutputEdicao();
  }

  function configurarEdicaoMarcadores() {
    if (!modoEdicao || !marcadores.length) return;

    document.body.classList.add("map-edit-mode");

    marcadores.forEach((marcador, indice) => {
      const pin = marcador.querySelector(".map-pin");
      const rotulo = pin ? pin.getAttribute("aria-label") : "";
      marcador.dataset.editLabel = rotulo || nomeMarcador(marcador, indice);
    });

    const painel = document.createElement("aside");
    painel.className = "map-edit-panel";
    painel.innerHTML =
      '<h4>Modo de edicao dos marcadores</h4>' +
      '<p>Arraste os marcadores para ajustar as posicoes. Depois, copie o resultado para atualizar o HTML.</p>' +
      '<textarea class="map-edit-output" rows="6" readonly></textarea>' +
      '<div class="map-edit-actions">' +
      '<button type="button" class="map-edit-copy">Copiar posicoes</button>' +
      '<span class="map-edit-status" aria-live="polite"></span>' +
      "</div>";

    const base = document.querySelector(".planta-baixa");
    if (base) base.appendChild(painel);

    outputPosicoes = painel.querySelector(".map-edit-output");
    statusEdicao = painel.querySelector(".map-edit-status");
    const botaoCopiar = painel.querySelector(".map-edit-copy");

    atualizarOutputEdicao();

    if (botaoCopiar) {
      botaoCopiar.addEventListener("click", async () => {
        const conteudo = textoPosicoes();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(conteudo);
            if (statusEdicao) statusEdicao.textContent = "Posicoes copiadas.";
          } else if (outputPosicoes) {
            outputPosicoes.focus();
            outputPosicoes.select();
            if (statusEdicao) statusEdicao.textContent = "Selecione e copie manualmente (Ctrl+C).";
          }
        } catch (e) {
          if (statusEdicao) statusEdicao.textContent = "Nao foi possivel copiar automaticamente.";
        }
      });
    }
  }

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
    const alvoMarcador = evento.target.closest(".map-marker");

    if (modoEdicao && alvoMarcador && superficie.contains(alvoMarcador)) {
      marcadorArrastando = alvoMarcador;
      viewer.setPointerCapture(evento.pointerId);
      viewer.classList.add("editando-marcador");
      atualizarPosicaoMarcador(evento, marcadorArrastando);
      return;
    }

    if (evento.target.closest(".map-marker") || evento.target.closest(".map-pin")) return;
    if (escala <= ZOOM_MIN) return;
    arrastando = true;
    inicioX = evento.clientX - posX;
    inicioY = evento.clientY - posY;
    viewer.setPointerCapture(evento.pointerId);
    viewer.classList.add("arrastando");
  });

  viewer.addEventListener("pointermove", (evento) => {
    if (marcadorArrastando) {
      atualizarPosicaoMarcador(evento, marcadorArrastando);
      return;
    }

    if (!arrastando) return;
    posX = evento.clientX - inicioX;
    posY = evento.clientY - inicioY;
    limitarPosicao();
    aplicarTransformacao();
  });

  function pararArraste() {
    if (marcadorArrastando) {
      marcadorArrastando = null;
      viewer.classList.remove("editando-marcador");
      atualizarOutputEdicao();
    }

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

  configurarEdicaoMarcadores();
}

// ---------- Gibi do Guigo: páginas em sequência com efeito de virar ----------
function configurarGibi() {
  const viewer = document.getElementById("gibi-viewer");
  const imagem = document.getElementById("gibi-imagem");
  const slideTexto = document.getElementById("gibi-texto");
  const slideTextoTitulo = document.getElementById("gibi-texto-titulo");
  const slideTextoConteudo = document.getElementById("gibi-texto-conteudo");
  const contador = document.getElementById("gibi-counter");
  const btnAnterior = document.getElementById("gibi-prev");
  const btnProximo = document.getElementById("gibi-next");
  if (
    !viewer ||
    !imagem ||
    !slideTexto ||
    !slideTextoTitulo ||
    !slideTextoConteudo ||
    !contador ||
    !btnAnterior ||
    !btnProximo
  )
    return;

  const totalPaginasGibi = 7;
  const slides = [
    {
      tipo: "texto",
      titulo: "Antes da capa",
      conteudo:
        "Dias antes do casamento, o Guigo nos surpreendeu com um presente muito especial: um gibi contando a aventura do Sargento Mictório para salvar o nosso bolo de casamento. Gostamos tanto da ideia que decidimos transformar seus desenhos em uma versão digital, preservando todo o charme, a criatividade e a imaginação da história original.",
    },
    ...Array.from({ length: totalPaginasGibi }, (_, indice) => ({
      tipo: "imagem",
      pagina: indice + 1,
    })),
    {
      tipo: "texto",
      titulo: "Sobre o Guigo",
      conteudo:
        "O Guigo é um dos nossos pajens e uma verdadeira caixinha de criatividade. Além de criar histórias em quadrinhos, ele também é ator, já participou de propagandas na TV e de minisséries em plataformas de streaming. E, segundo o noivo, também joga futebol melhor que o pai, o Guto.",
    },
  ];

  let paginaAtual = 0;

  function atualizarPagina() {
    const slideAtual = slides[paginaAtual];
    const ehImagem = slideAtual.tipo === "imagem";

    imagem.hidden = !ehImagem;
    slideTexto.hidden = ehImagem;

    if (ehImagem) {
      imagem.src = "assets/gibi/" + slideAtual.pagina + ".png";
      imagem.alt = "Página " + slideAtual.pagina + " do gibi";
    } else {
      slideTextoTitulo.textContent = slideAtual.titulo;
      slideTextoConteudo.textContent = slideAtual.conteudo;
    }

    contador.textContent = paginaAtual + 1 + " / " + slides.length;
    btnAnterior.disabled = paginaAtual === 0;
    btnProximo.disabled = paginaAtual === slides.length - 1;
    viewer.classList.remove("is-turning");
    void viewer.offsetWidth;
    viewer.classList.add("is-turning");
  }

  function irPara(delta) {
    const proxima = Math.min(slides.length - 1, Math.max(0, paginaAtual + delta));
    if (proxima === paginaAtual) return;
    paginaAtual = proxima;
    atualizarPagina();
  }

  btnAnterior.addEventListener("click", () => irPara(-1));
  btnProximo.addEventListener("click", () => irPara(1));

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") irPara(-1);
    if (evento.key === "ArrowRight") irPara(1);
  });

  atualizarPagina();
}

// ---------- Mapa da festa: tooltips dos marcadores ----------
function configurarMapTooltips() {
  if (estaEmModoEdicaoMapa()) return;

  const pins = document.querySelectorAll(".map-pin[data-tooltip]");
  if (!pins.length) return;

  pins.forEach((pin) => {
    const tooltip = document.createElement("span");
    tooltip.className = "map-tooltip";
    tooltip.textContent = pin.dataset.tooltip || "";
    pin.insertAdjacentElement("afterend", tooltip);

    pin.addEventListener("click", (evento) => {
      evento.stopPropagation();

      const isOpen = pin.classList.contains("is-open");

      pins.forEach((otherPin) => {
        otherPin.classList.remove("is-open");
        otherPin.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        pin.classList.add("is-open");
        pin.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", () => {
    pins.forEach((pin) => {
      pin.classList.remove("is-open");
      pin.setAttribute("aria-expanded", "false");
    });
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
