# Backlog — Cadê o Hexa?

Ideias do andre (10/07/2026), priorizadas em conversa. Uma linha de status
cada; detalhe nas specs em `docs/superpowers/specs/`.

## Em andamento

- [ ] **Fliperama do Sofrimento (mini-jogos das derrotas)** — *must have*.
  Spec PRONTA: `docs/superpowers/specs/2026-07-10-fliperama-do-sofrimento-design.md`.
  Decidido: 2006 Amarre a Chuteira (QTE) · 2022 NÃO SOBE! · 2026 Segura,
  Carletto! (Teoria do Chiclete); difícil-mas-vencível, vitória = "e se...";
  pixel art via PixelLab (andre vai assinar), placeholders CSS primeiro.
  **Próximo passo:** andre revisa a spec → plano (writing-plans) → implementar.

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

- [x] **v3.2 (10/07/2026)** — gráfico da Profecia animado/interativo claro
  (draw-in, anel "você está aqui", halo nos pontos, ECG + flatline), footer
  de créditos/portfólio, repo público em github.com/andrR89/cadeohexa.
  Spec: `2026-07-10-v3-2-quickwins-grafico-footer-github-design.md`.
