# Segura, Carletto! × PixelLab (v4.1) — briefing de requisitos

**Data:** 2026-07-12 · **Status:** BRIEFING pré-brainstorm — pedido do andre
documentado pra retomar em outra máquina. O brainstorm visual (estilo, paleta,
mockups) ainda NÃO aconteceu; as decisões em aberto estão no fim. Este arquivo
vira spec de design depois desse brainstorm.

## O pedido do andre (12/07/2026, literal)

> "começamos os ajustes no jogo do chiclete.. é o que ficou melhor, penso que
> pode ser algo da forma que ta, mas um background feito em pixelab de um banco
> de reservas da seleção e uma arquibancada, o carleto na area tecnica pixelab
> e os chicletes. quero tudo animado, as de tentar novamente e aceita dentro do
> jogo, e as outra ui do jogo tbm no estilo pixelabl é pra fazer tudo la.
> background, personagens, ciclete, com amioações, ui cartelto triste se
> perdeu, carleto feliz de ganhou, background seguindo a logica se der"

## Requisitos estruturados

1. **Escopo: só o Segura, Carletto! por enquanto** (é o jogo que ficou melhor;
   a mecânica/gameplay fica como está). Chuteira e NÃO SOBE! ficam com
   placeholders até nova ordem.
2. **Background em pixel art (PixelLab):** banco de reservas da Seleção +
   arquibancada ao fundo, visto da linha lateral. **Animado** (torcida se
   mexendo, gente no banco).
3. **Carletto na área técnica (PixelLab):** sprite do Ancelotti no lugar do
   emoji 😮. Estados/animações:
   - **mascando** (idle, loop) — estado normal;
   - **travado/decepção** (quando pega isca — substitui o 😖 + grayscale);
   - **triste** (derrota — aparece na placa de fim);
   - **feliz** (vitória — aparece na placa de fim).
4. **Chicletes e iscas (PixelLab):** sprites animados do chiclete (tablete),
   pastilha de menta e mini-bandeira da Noruega, substituindo 🍬/🍃/🇳🇴.
   Animação de queda (girar/balançar).
5. **Tudo animado** — é a régua. Nada de sprite estático onde couber loop.
6. **Placas de fim DENTRO do jogo:** "Tentar de novo" e "Aceitar a história"
   deixam de ser a tela genérica do overlay e viram um painel pixel art
   POR CIMA da área do jogo (com o Carletto triste/feliz junto). Textos de
   derrota/"e se..." continuam vindo de `src/data/fliperama.ts`.
7. **O resto da UI do jogo também em estilo PixelLab:** barra DESEMPENHO DA
   SELEÇÃO, relógio/placar, botão Desistir — painéis/moldura pixel art.
   "É pra fazer tudo lá" = os assets visuais nascem todos na API do PixelLab.
8. **Background seguindo a lógica, se der:** o cenário reage ao estado do
   jogo — ex.: torcida animada com a barra alta, tensa/apreensiva com a barra
   baixa, explosão de festa na vitória / silêncio na derrota. ("Se der" =
   desejável, não bloqueante; decidir granularidade no brainstorm.)

## Estado do código (onde isso se encaixa)

- Branch `dev/site` **local, ainda não pushada** (v4 completa: 22 commits +
  este briefing). Pra trabalhar em outra máquina, precisa do push de
  `dev/site` (decisão do andre — scan de segredos do diff já passou) ou de
  cópia do repo.
- Jogo: UI em `src/ui/jogos/carletto.ts` (chunk lazy, DOM + rAF), lógica pura
  INTOCÁVEL em `src/lib/jogos/carletto.ts` (66+ testes verdes no total).
- Pontos de encaixe já previstos: `.carletto` (boneco), `.carletto-item`
  (itens), `.carletto-area` (cenário/fundo), `.carletto-barra*` (barra),
  placas de fim hoje vêm de `telaFimHTML` em `src/ui/fliperama.ts` — o item 6
  muda isso PARA O CARLETTO (decidir no brainstorm: hook no contrato ou placa
  própria do jogo antes do `aoTerminar`).
- Convenções que continuam valendo: conteúdo em `src/data/`; reduced-motion
  tem kill switch global de CSS (gameplay via JS continua; loops decorativos
  de spritesheet devem respeitar — decidir como no brainstorm); cronômetro
  clampado (`criarCronometro`); `image-rendering: pixelated` pros sprites;
  assets otimizados (ver `scripts/otimizar-imagens.sh` — avaliar se
  spritesheets entram nesse pipeline ou ficam PNG puros, pixel art comprime
  bem em PNG).

## PixelLab — o que a API oferece (explorado em 12/07)

- **Credencial:** claude-creds-vault, `services/pixellab/README.md`
  (`Authorization: Bearer $PIXELLAB_API_KEY` via
  `set -a; source ~/.config/claude-creds/secrets.env; set +a`).
  ⚠️ Na outra máquina o vault/secrets.env precisa existir com essa key.
- **Conta:** Tier 1 "Pixel Apprentice", 1980/2000 gerações no check de 12/07.
  Cada geração consome cota — **mostrar cada lote pro andre antes de gastar.**
- **Endpoints relevantes** (docs: `https://api.pixellab.ai/v2/llms.txt`,
  OpenAPI em `/v2/openapi.json`; maioria assíncrona, poll em
  `/background-jobs/{job_id}`):
  - `create-image-pixflux` / `create-image-pixflux-background` /
    `generate-image-v2` (Pro) — cenário (banco + arquibancada);
  - `animate-with-text` (v1/v2/v3) — spritesheets de animação a partir de
    imagem + descrição (Carletto mascando, torcida, itens girando);
  - `create-character-*` + `create-character-state` + `animate-character` —
    personagem com estados (alternativa mais estruturada pro Carletto);
  - `create-ui-asset` (Pro) / `generate-ui-v2` (Pro) — painéis/molduras de UI
    (placas de fim, caixa da barra, botões);
  - `generate-font-pro` — fonte pixel (avaliar vs. webfont pixel self-hosted);
  - utilitários: `remove-background`, `resize`, `rotate`, `inpaint`,
    `image-to-pixelart`.

## Decisões em aberto (pro brainstorm visual na outra máquina)

1. **Estilo/paleta do cenário:** tarde de jogo colorida vs. entardecer
   dramático puxando pro mármore/ouro do site? (mockups no visual companion —
   o andre já topou usar)
2. **Resolução/escala:** pixel grande estilo 8-bit ou 16-bit mais fino?
   Cenário gerado em ~400×176 e esticado com `image-rendering: pixelated`?
3. **Carletto:** caricatura do Ancelotti (grisalho, terno, sobrancelha) —
   tamanho em tela, nº de frames do mascando.
4. **Placas de fim:** layout do painel dentro do jogo (cobre a área toda?
   botões pixel art clicáveis + acessíveis por teclado — manter `<button>`
   reais por cima do painel).
5. **Fonte:** `generate-font-pro` do PixelLab vs. webfont pixel OFL
   self-hosted (site hoje não tem webfont nenhuma — decisão de peso/licença).
6. **Background reativo:** quantos estados (2? 3?) e qual gatilho (faixas da
   barra); crossfade ou corte seco.
7. **Reduced-motion:** loops do cenário/torcida param (decorativos), mas
   itens caindo e Carletto seguem (gameplay). Confirmar tratamento dos
   spritesheets CSS (`animation: steps()` cai no kill switch global — ok).
8. **Animações via CSS steps() + spritesheet PNG** (recomendação inicial) vs.
   trocar `src` por frame via JS — decidir na spec.

## Como retomar (na outra máquina)

1. Garantir repo com `dev/site` atualizada + creds-vault com PIXELLAB_API_KEY.
2. Rodar local: `npm ci && npm run build && npx vite preview --port 4173`
   (E2E: `node scripts/verificar-fliperama.mjs`).
3. Abrir sessão do Claude e pedir: "retoma o briefing do Carletto×PixelLab
   (docs/superpowers/specs/2026-07-12-carletto-pixellab-briefing.md)" →
   brainstorm visual (superpowers:brainstorming, visual companion aprovado)
   → spec → plano → implementação com revisões.
4. Lotes de geração no PixelLab: sempre apresentar prompt + resultado ao
   andre antes de integrar; deletar da conta os assets rejeitados.
