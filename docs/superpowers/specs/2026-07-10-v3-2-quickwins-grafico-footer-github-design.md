# v3.2 — Quick-wins: gráfico cinematográfico, footer e publicação no GitHub

**Data:** 2026-07-10 · **Status:** aprovado pelo andre

Três entregas pequenas e independentes que melhoram o que já está no ar e
inauguram o lado portfólio do projeto.

## 1. Gráfico da Profecia — modo cinematográfico

Hoje (`src/ui/profecia.ts`) o gráfico é um SVG estático: polyline e 6 pontos
já nascem prontos; a seleção só troca classe via CSS e o halo dos pontos só
aparece no hover — por isso ninguém percebe que é interativo nem onde está.

### Draw-in no scroll

- Quando a seção entra na viewport (ScrollTrigger, mesmo padrão de
  `src/ui/scroll.ts` da v3), a polyline se desenha da esquerda para a direita
  via `stroke-dasharray`/`stroke-dashoffset`.
- Cada ponto "pipoca" (scale 0→1 com leve overshoot) e o rótulo do ano surge
  junto, sincronizado com a passagem da linha por ele.
- Roda **uma vez só** por carga de página.

### Marcador vivo (estado permanente)

- Ponto selecionado: anel pulsante contínuo ("você está aqui").
- Ao trocar a seleção, o anel **desliza pela linha** até o novo ponto (GSAP
  animando ao longo do path).
- Pontos não selecionados: halo sutil **permanente** (não só no hover) +
  `cursor: pointer` no grupo.

### Crossfade no painel de detalhe

- Ao trocar de profecia, o painel `#profecia-detalhe` faz fade-out → troca →
  fade-in, reusando o padrão do quiz v3.1.
- Compatível com `aria-live`: **uma única escrita no DOM**, no meio do fade —
  sem anúncios duplicados no leitor de tela.

### Eletrocardiograma moribundo

- Tremor contínuo e sutil na linha, tipo monitor cardíaco. Técnica a decidir
  na implementação entre filtro SVG (`feTurbulence` animado) e wiggle de
  pontos via GSAP — critério: o que ficar mais leve (CPU) e estável
  cross-browser.
- Ao selecionar 2050 (Seleção das IAs), a linha **flatline**: pisca como
  monitor dando tela plana enquanto esse ponto estiver selecionado.

### Acessibilidade e rede de segurança

- Tudo atrás de `prefers-reduced-motion: reduce` → gráfico nasce pronto e
  estático, comportamento idêntico ao atual.
- A rede de segurança existente (galeria `.lapides` só é ocultada depois de
  toda a fiação ligada) permanece intacta; as animações não podem quebrá-la —
  falha em qualquer passo de animação não pode impedir a interatividade básica.

## 2. Footer

Novo módulo `src/ui/rodape.ts`, montado no `main.ts`, com:

- Linha de zoeira: “Feito com mágoa e TypeScript por **@andrR89**” (link para
  `https://github.com/andrR89`) “· **código aberto pra quem quiser auditar o
  sofrimento**” (link para `https://github.com/andrR89/cadeohexa`).
- Linha discreta de créditos técnicos: Vite · GSAP · Cloudflare Pages.
- Visual do tema: fundo escuro, tipografia pequena, rótulo dourado; links com
  `rel="noopener"` e `target="_blank"`.

## 3. Publicação no GitHub

Repo `github.com/andrR89/cadeohexa` já existe, público e vazio
(default branch `main`). Local: branches `main` e `dev/site` (atual), sem
remote configurado.

1. Scan por segredos no histórico antes do push (repo será público).
2. `git remote add origin git@github.com:andrR89/cadeohexa.git`.
3. Atualizar `main` local com o conteúdo de `dev/site` (fast-forward/merge) e
   push de `main` e `dev/site`. `main` é a vitrine (default do repo).
4. README: garantir link do site no ar (`cadeohexa.pages.dev`); ajustes só se
   faltar algo.

## Testes

- Suíte existente (Vitest) continua passando.
- Novo teste do HTML do rodapé: presença e destino dos dois links.
- Animações GSAP não são testadas no Vitest; a rede de segurança das lápides
  já cobre falha de JS no gráfico.

## Fora de escopo

Demais ideias do backlog de 2026-07-10 (mini-jogos das derrotas, “o preço da
espera”, cápsula do tempo 2002, escalações, vídeos do Neto, famosos,
auto-update entre copas) — cada uma terá sua própria spec.
