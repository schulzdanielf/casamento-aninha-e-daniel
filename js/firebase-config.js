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
  apiKey: "AIzaSyB3viptrVUKoZQxZT1jE7sQ0sFK6_Had6M",
  authDomain: "casamento-aninha-daniel.firebaseapp.com",
  projectId: "casamento-aninha-daniel",
  storageBucket: "casamento-aninha-daniel.firebasestorage.app",
  messagingSenderId: "550008054158",
  appId: "1:550008054158:web:4d45ce36f1a35913bec4df",
  measurementId: "G-S3CZSMGJYZ",
};
