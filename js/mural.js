// Mural de Mensagens — usa Firebase Firestore para que as mensagens
// enviadas por qualquer convidado apareçam em tempo real para todos.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const LIMITE_NOME = 60;
const LIMITE_MENSAGEM = 500;

const form = document.getElementById("mural-form");
const lista = document.getElementById("mural-list");
const status = document.getElementById("mural-status");

if (form && lista) {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const mensagensRef = collection(db, "mensagens");

    const consulta = query(mensagensRef, orderBy("criadoEm", "desc"), limit(100));

    onSnapshot(
      consulta,
      (snapshot) => {
        lista.innerHTML = "";

        if (snapshot.empty) {
          lista.innerHTML =
            '<p class="mural-empty">Seja o primeiro a deixar uma mensagem para Ana Carolina e Daniel! 💌</p>';
          return;
        }

        snapshot.forEach((doc) => {
          const dados = doc.data();
          const card = document.createElement("article");
          card.className = "mural-card";

          const mensagemEl = document.createElement("p");
          mensagemEl.className = "mural-message";
          mensagemEl.textContent = dados.mensagem || "";

          const autorEl = document.createElement("span");
          autorEl.className = "mural-author";
          autorEl.textContent = "— " + (dados.nome || "Convidado(a) anônimo(a)");

          card.append(mensagemEl, autorEl);
          lista.appendChild(card);
        });
      },
      (erro) => {
        console.error("Erro ao carregar o mural:", erro);
        lista.innerHTML =
          '<p class="mural-empty">Não foi possível carregar as mensagens agora. Tente novamente mais tarde.</p>';
      }
    );

    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const nome = form.nome.value.trim().slice(0, LIMITE_NOME);
      const mensagem = form.mensagem.value.trim().slice(0, LIMITE_MENSAGEM);

      if (!mensagem) {
        status.textContent = "Escreva uma mensagem antes de enviar. 🙂";
        return;
      }

      const botao = form.querySelector("button");
      botao.disabled = true;
      status.textContent = "Enviando...";

      try {
        await addDoc(mensagensRef, {
          nome: nome || "Anônimo",
          mensagem,
          criadoEm: serverTimestamp(),
        });
        form.reset();
        status.textContent = "Mensagem enviada com carinho! 💛";
      } catch (erro) {
        console.error("Erro ao enviar mensagem:", erro);
        status.textContent = "Não foi possível enviar agora. Tente novamente em instantes.";
      } finally {
        botao.disabled = false;
        setTimeout(() => (status.textContent = ""), 4000);
      }
    });
  } catch (erro) {
    console.error("Firebase não configurado corretamente:", erro);
    lista.innerHTML =
      '<p class="mural-empty">O mural ainda não foi configurado. Veja o README.md para ativar o Firebase.</p>';
  }
}
