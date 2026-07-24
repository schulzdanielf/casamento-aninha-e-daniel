// =====================================================================
// Configuração do Firebase — usado apenas pelo Mural de Mensagens
// =====================================================================
// 1. Crie um projeto gratuito em https://console.firebase.google.com
// 2. No projeto, adicione um "App da Web" e copie as chaves geradas
// 3. Ative o "Firestore Database" (modo de produção) no menu lateral
// 4. Cole as chaves copiadas substituindo os valores abaixo
// 5. Configure as regras de segurança do Firestore conforme o README.md
//
// Importante: essas chaves (apiKey, projectId, etc.) são públicas por
// natureza no Firebase — quem protege seus dados são as REGRAS do
// Firestore (veja README.md), não o sigilo dessas chaves.
// =====================================================================

export const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};
