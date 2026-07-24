// Menu mobile + destaque do link ativo + contagem regressiva
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  // Marca o link da página atual como ativo
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll("[data-ano-atual]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  iniciarContagemRegressiva();
});

function iniciarContagemRegressiva() {
  const container = document.querySelector(".countdown");
  if (!container) return;

  // Data e hora do casamento — ajuste aqui se necessário
  const dataCasamento = new Date("2026-08-08T16:00:00-03:00").getTime();

  const dias = document.getElementById("cd-dias");
  const horas = document.getElementById("cd-horas");
  const minutos = document.getElementById("cd-minutos");
  const segundos = document.getElementById("cd-segundos");

  function atualizar() {
    const agora = new Date().getTime();
    const diferenca = dataCasamento - agora;

    if (diferenca <= 0) {
      container.innerHTML = '<p style="font-family: var(--fonte-titulo); font-size:1.4rem; color: var(--cor-marsala);">Já estamos casados! 💍</p>';
      clearInterval(intervalo);
      return;
    }

    const d = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const h = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diferenca / (1000 * 60)) % 60);
    const s = Math.floor((diferenca / 1000) % 60);

    if (dias) dias.textContent = d;
    if (horas) horas.textContent = String(h).padStart(2, "0");
    if (minutos) minutos.textContent = String(m).padStart(2, "0");
    if (segundos) segundos.textContent = String(s).padStart(2, "0");
  }

  atualizar();
  const intervalo = setInterval(atualizar, 1000);
}
