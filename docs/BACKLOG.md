# Backlog — Cadê o Hexa?

Ideias do andre (10/07/2026), priorizadas em conversa. Uma linha de status
cada; detalhe nas specs em `docs/superpowers/specs/`.

## Em andamento

- [ ] **Fliperama — sprites PixelLab** — trocar os placeholders emoji/CSS do
  Fliperama (v1 já no ar) por pixel art gerada no PixelLab (API já no
  claude-creds-vault; `services/pixellab/README.md`). Pontos de encaixe prontos:
  `--gabinete-icone`, `.henry`, `.nao-sobe-jogador`, `.carletto`,
  `.carletto-item`. Lista de sprites na seção "Direção de arte" da spec; cada
  geração consome créditos — confirmar o lote com o andre.
  **Próximo passo:** andre libera o lote → gerar os sprites.

## Próximas (sem ordem fechada)

- [ ] **"O preço da espera"** — inflação no período sem hexa (gasolina, Coca),
  evolução do dólar, velocidade média da internet por Copa, valor de mercado
  dos jogadores do penta vs. cada tentativa. Uma família só: dados numéricos
  2002→hoje virando zoeira. Ao fazer, já nascer com o modelo de auto-update
  (ver item transversal).
- [ ] **Cápsula do tempo 2002** — o que era moda no último título, música mais
  tocada, jogo mais popular, filmes em cartaz, como era a internet na época.
- [ ] **Escalações das derrotas** — campinho estilo Google Maps com bolinhas e
  números, uma escalação por vexame.
- [ ] **Vídeos do Craque Neto** malhando o pau nas derrotas — curadoria por
  eliminação (embeds do YouTube).
- [ ] **Famosos brasileiros que não viram o hexa** — lista/galeria.
- [ ] **Fliperama v2** — 2010 Contenha o Felipe Melo, 2014 Não tome o gol da
  Alemanha, 2018 Levante o Neymar; atalho "reviver" nas lápides da timeline;
  conceitos reservas do chiclete na spec do Fliperama.
- [ ] **Ads** — usar o `#slot-apoio` (placeholder deliberado em `src/main.ts`).
- [ ] **Domínio próprio.**

## Transversal (decisão de arquitetura, não seção)

- [ ] **Auto-update entre Copas** — modelar os dados pensando na evolução:
  se sair outro iPhone/console, outra Copa, outra queda, o site se atualiza
  com o mínimo de esforço (ex.: dados por ano + "hoje" calculado, nunca
  números hardcoded no texto). Decidir junto com o primeiro item de dados
  ("O preço da espera").

## Feito

- [x] **v4 · Fliperama do Sofrimento (12/07/2026)** — seção `#fliperama` com 3
  mini-jogos jogáveis das eliminações (2006 Amarre a Chuteira, 2022 NÃO SOBE!,
  2026 Segura, Carletto!): lógica pura testada (73/73 no Vitest), overlay
  `<dialog>` com foco/Esc, 3 chunks lazy, stats locais e E2E headless
  (`scripts/verificar-fliperama.mjs`). Ícones/sprites ainda são placeholders
  emoji/CSS — a arte do PixelLab ficou pra próxima (ver "Em andamento").
  Spec: `2026-07-10-fliperama-do-sofrimento-design.md`;
  plano: `2026-07-11-fliperama-do-sofrimento.md`.
- [x] **v3.2 (10/07/2026)** — gráfico da Profecia animado/interativo claro
  (draw-in, anel "você está aqui", halo nos pontos, ECG + flatline), footer
  de créditos/portfólio, repo público em github.com/andrR89/cadeohexa.
  Spec: `2026-07-10-v3-2-quickwins-grafico-footer-github-design.md`.
