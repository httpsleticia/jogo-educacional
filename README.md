# Jogo Educacional: O Chão é Lava! 🐈‍⬛🌋

Um jogo interativo, leve e divertido voltado para a **alfabetização infantil e desenvolvimento de vocabulário**. O objetivo é ajudar um gatinho a subir uma escada completando as letras que faltam em palavras reais antes que a lava o alcance!

## 🚀 Funcionalidades

* **Gerador Dinâmico de Desafios:** O sistema lê palavras puras e gera as lacunas (`_`) e opções de resposta automaticamente por código, eliminando erros manuais.
* **Banco de Palavras Seguro e Infantil:** Mais de 500 palavras reais do Português (PT-BR) selecionadas a dedo, totalmente livres de termos complexos, violentos ou inadequados para crianças.
* **Níveis Adaptativos:**
    * 🌱 **Modo Fácil:** Palavras curtas (4 a 6 letras) com velocidade inicial da lava de `0.52` e aceleração sutil a cada 3 acertos.
    * 🔥 **Modo Difícil:** Palavras maiores (6 a 9 letras) com subida de lava mais agressiva e maior punição em caso de erros.
* **Efeitos Sonoros Retrô:** Áudio gerado nativamente via `AudioContext` do navegador, sem necessidade de arquivos externos de som.
* **Sistema de Recordes:** Salva a maior pontuação localmente no navegador (`localStorage`).

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando tecnologias web puras (Vanilla), sem frameworks externos:

* **HTML5:** Estrutura das telas e elementos do jogo.
* **CSS3:** Estilização moderna baseada em cartões (cards) e animações de pulo do gatinho.
* **JavaScript (ES6+):** Lógica do motor do jogo, manipulação do DOM, controle de tempo da lava e gerador de perguntas.

## 📁 Estrutura do Projeto

```text
├── index.html        # Estrutura principal e gerenciamento de telas
├── style.css         # Identidade visual, responsividade e animações
├── game.js          # Motor do jogo, controle da lava e lógica dinâmica
└── words.js         # Banco de dados puro com as palavras separadas por tamanho
