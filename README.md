# Site do Casamento — Aninha & Daniel 💛

Site estático (HTML/CSS/JS puro) pronto para publicar no **GitHub Pages**.

## Estrutura

```
index.html        → Início (capa + contagem regressiva)
cronograma.html    → Cronograma do dia
cardapio.html      → Cardápio digital
drinks.html        → Drinks e bar
album.html         → Álbum colaborativo (link para Google Fotos)
mural.html         → Mural de recados (Firebase Firestore)
solteiros.html     → Jornal dos Solteiros (edição de brincadeira)
mapa.html          → Mapa da festa (Google Maps + planta baixa)
css/style.css      → Estilo geral (tema rústico romântico)
js/main.js         → Menu mobile, link ativo e contagem regressiva
js/firebase-config.js → Chaves do Firebase (edite aqui)
js/mural.js        → Lógica do mural de recados
```

## Como personalizar

- **Nomes, data e local**: já preenchidos com "Aninha & Daniel, 08/08/2026, Lago Norte, Brasília" em todas as páginas e no [js/main.js](js/main.js) (variável `dataCasamento`).
- **Cardápio e drinks**: edite os itens diretamente em [cardapio.html](cardapio.html) e [drinks.html](drinks.html).
- **Fotos dos drinks**: salve as fotos na pasta `assets/drinks/` (formato quadrado, ex. 800x800px, funciona melhor):
  - `aperol.jpg` (Aperol Spritz)
  - `gin_tonica.jpeg` (Gin Tônica)
  - `fitzgerald.jpeg`
  - `moscow_mule.jpeg` (Moscow Mule)
  - `drink-05-amora.jpg`
  - `drink-06-alecrim.jpg`
  - `drink-07-limao.jpg`
  - `drink-08-mojito.jpg`
  - `drink-09-laranja.jpg`

  Enquanto a foto não existe, o card mostra um quadro vazio (sem quebrar o layout). Se quiser usar outro nome de arquivo, é só atualizar o `src` da tag `<img>` correspondente em [drinks.html](drinks.html).
- **Álbum colaborativo**: crie um álbum compartilhado no Google Fotos (app ou site → Álbuns → Criar álbum → Compartilhar → Criar link) e cole o link em [album.html](album.html) no lugar de `SUBSTITUA_PELO_LINK_DO_SEU_ALBUM`.
- **Jornal dos Solteiros**: troque as fotos (`https://via.placeholder.com/...`) e os textos em [solteiros.html](solteiros.html) pelos convidados reais.
- **Mapa da festa**: troque o endereço do iframe em [mapa.html](mapa.html) pelo endereço exato do salão (Google Maps → Compartilhar → Incorporar um mapa → copiar o `src` do iframe) e troque a imagem de planta baixa por uma real, se tiver.

## Configurando o Mural de Recados (Firebase)

O mural precisa de um banco de dados na nuvem para que mensagens de qualquer convidado apareçam para todos. Usamos o **Firebase Firestore**, que tem plano gratuito generoso.

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto (gratuito).
2. No projeto, clique em **Adicionar app → Web (`</>`)**, dê um nome e registre o app.
3. Copie o objeto `firebaseConfig` gerado e cole em [js/firebase-config.js](js/firebase-config.js), substituindo os valores de exemplo.
4. No menu lateral, vá em **Firestore Database → Criar banco de dados** (modo produção, escolha uma região próxima, ex. `southamerica-east1`).
5. Vá em **Regras** (Rules) do Firestore e cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mensagens/{docId} {
      allow read: if true;
      allow create: if request.resource.data.mensagem is string
                    && request.resource.data.mensagem.size() > 0
                    && request.resource.data.mensagem.size() <= 500
                    && request.resource.data.nome is string
                    && request.resource.data.nome.size() <= 60
                    && request.resource.data.keys().hasOnly(['nome', 'mensagem', 'criadoEm']);
      allow update, delete: if false;
    }
  }
}
```

Essas regras permitem que qualquer pessoa **leia e crie** mensagens, mas **não edite nem apague** as de outros, e limitam o tamanho/campos de cada mensagem para evitar spam ou abuso.

6. Publique as regras clicando em **Publicar**.
7. Pronto! Abra `mural.html` no site publicado e teste enviar uma mensagem.

> Dica opcional: para reduzir spam de robôs, você pode ativar o **Firebase App Check** (reCAPTCHA) depois que o site estiver estável.

## Publicando no GitHub Pages

1. Crie um repositório no GitHub (ex.: `casamento-aninha-e-daniel`) e suba todos os arquivos deste projeto para a branch `main`.

   ```bash
   git init
   git add .
   git commit -m "Site do casamento"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

2. No GitHub, vá em **Settings → Pages**.
3. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
4. Salve. Em alguns minutos o site estará disponível em:
   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

5. Sempre que editar algo, basta commitar e dar `git push` novamente — o GitHub Pages atualiza sozinho.

## Testando localmente

Como o mural usa `import` de módulos JS, é preciso rodar um servidor local (não abrir o `index.html` direto pelo navegador). Duas opções simples:

```bash
# Opção 1: Python (já vem em muitos sistemas)
python3 -m http.server 8080

# Opção 2: Node
npx serve .
```

Depois acesse `http://localhost:8080` no navegador.
