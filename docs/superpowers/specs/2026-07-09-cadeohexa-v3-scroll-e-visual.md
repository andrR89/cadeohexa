# "Cadê o Hexa?" v3 — scroll cinematográfico e correções visuais

> Spec do feedback do andre em 09/07/2026, logo após a v2 subir para produção.
> Executar via superpowers:subagent-driven-development.

## Contexto

A v2 está no ar em https://cadeohexa.pages.dev (commit `56fd43f`). Ao ver o site rodando, o andre apontou quatro problemas. Três são defeitos objetivos; um é uma funcionalidade nova.

## Objetivos

1. **A taça não é a taça.** A imagem do herói (`taca-heroi.webp`) é um cálice ornamentado genérico. Deve ser a taça da Copa do Mundo: duas figuras estilizadas em espiral, de costas uma para a outra, sustentando por baixo um globo gravado com continentes, sobre pedestal redondo de malaquita com duas faixas verdes.
2. **O fundo global tem uma grade de bolhas visível.** Defeito objetivo em `src/styles/main.css:49`: o ruído de mármore usa `feTurbulence baseFrequency='0.015'` num tile de 220×220px. Frequência tão baixa produz manchas do tamanho do próprio tile, então o `background-repeat` expõe a periodicidade.
3. **O scroll está estranho** e falta navegação entre seções.
4. **A Profecia mostra os 6 cards de uma vez.** Deve mostrar só o gráfico; o card aparece ao clicar num ponto.

## Não-objetivos

- Não mexer em `scroll-snap`. Ver "Decisão: inércia OU snap, nunca os dois".
- Não adicionar scaffolding de teste de DOM (jsdom). O projeto não tem e não vai ter nesta rodada.
- Não migrar a Profecia de `role="button"`/`aria-pressed` para um padrão de tablist.
- Não mexer no `#slot-apoio` (placeholder deliberado dos ads da fase 2).
- Não tocar em cache-busting de assets de `public/`.

## Design

### 1. Taça

Imagem nova gerada por `fal-ai/flux-pro`. O andre escolheu a variante **`taca-d1`** (a que já traz o facho de luz descendo sobre a taça). Substitui `public/img/taca-heroi.webp` **no mesmo caminho e nome** — assim o preload de `index.html:15`, o `<img>` de `src/ui/hero.ts` e o `dist/` continuam coerentes sem mais nenhuma mudança.

⚠️ **A d1 tem facho de luz próprio.** O `.heroi-veu` (`main.css:87-94`) é um gradiente calibrado para escurecer a faixa central, onde o texto senta, justamente porque a imagem antiga era mais clara no meio. A d1 é *ainda mais* clara ali. Recalcular o contraste do texto do herói sobre a imagem nova e, se furar o piso AA de 4,5:1, escurecer o véu na faixa central. Verificação obrigatória, não opcional.

A imagem passa pelo mesmo pipeline da v2: `scripts/otimizar-imagens.sh` (resize `900x900>`, `-strip`, WebP q78 `method=6`). O script deve continuar idempotente.

#### A fonte da taça nova precisa de um lar versionado

Dois problemas reais, descobertos ao preparar a fonte:

1. **O glob do script só pega `*.jpg`** (`otimizar-imagens.sh:60` e `:66`). A d1 veio em PNG e seria silenciosamente ignorada.
2. **A taça velha ressuscitaria.** O script restaura os originais com `git archive imagens-originais-v2 -- public/img`, e essa tag aponta para um commit anterior à V7, onde `public/img/` ainda continha os 13 JPEGs — incluindo o `taca-heroi.jpg` do cálice genérico. A taça nova **não existe em nenhum objeto do git**: mora só no `assets/img-fonte/`, que é gitignored. Num clone limpo, o script regeneraria a taça errada e desfaria a v3.

**Decisão:** versionar a fonte da nova taça. Ela é o único original que muda na v3, e são ~250 kB.

- Gravar a d1 como `assets/fontes/taca-heroi.jpg` (ou `.png`), **rastreada pelo git** — abrindo exceção no `.gitignore`, que hoje ignora `assets/img-fonte/` inteiro.
- Ajustar o script para converter também esse arquivo (ampliar o glob para `*.jpg` + `*.png`, ou apontar explicitamente para a fonte versionada).
- Garantir que o passo de restauração **não sobrescreva** uma fonte que já existe localmente, e que o `taca-heroi.jpg` restaurado da tag v2 não vença sobre a fonte nova. O teste de aceite é direto: apagar `assets/img-fonte/`, rodar o script, e o `public/img/taca-heroi.webp` resultante tem de ser a **taça nova**, não o cálice.
- Manter a idempotência: rodar o script duas vezes seguidas deixa `git status public/img` vazio.

⚠️ **Atenção ao filtro NSFW do fal.ai:** o lote anterior voltou 100% preto (`has_nsfw_concepts: [true×4]`) porque o prompt continha a palavra "nude" dentro de uma *negação* ("NOT a nude Atlas figure"). O filtro casa por palavra e ignora a negação. Descrever formas ("stylised human forms", "sculpted silhouettes"), nunca corpos nus, e passar `safety_tolerance: "5"`.

`width`/`height` do `<img>` continuam `900x900` se a imagem final for quadrada. Se não for, **atualizar os atributos** — senão volta o layout shift que a V7 eliminou.

### 2. Fundo global

Em `src/styles/main.css:49`, subir `baseFrequency` de `0.015` para `~0.8`. Isso troca manchas do tamanho do tile por grão fino, que lê como granulado de filme e não revela a repetição.

**Verificar contraste depois de mexer.** O comentário em `main.css:39-41` afirma que o ponto mais claro da pilha (facho + ruído) fica em ~4,7:1 contra `--ouro-baco` (#a08a50), acima do piso AA de 4,5:1. Mudar a frequência muda a distribuição de luminância do ruído. Recalcular e, se cair abaixo de 4,5:1, reduzir a opacidade do ruído (hoje `0.05` no `feColorMatrix`) até voltar. Registrar a conta no commit.

### 3. Scroll

#### Decisão: inércia OU snap, nunca os dois

Scroll com inércia (Lenis) e `scroll-snap` do CSS brigam: a inércia continua rolando enquanto o snap tenta prender, produzindo travamento elástico. Além disso, a Ala das Tentativas é uma timeline muito mais alta que o viewport, e `scroll-snap-type: y mandatory` a tornaria uma armadilha.

**Escolha (aprovada pelo andre): inércia, sem snap.** As bolinhas já entregam a navegação por seção sob demanda; o snap automático seria redundante e hostil.

#### 3a. Inércia

Adicionar **Lenis** (~6 kB gzip). Cabe: a v2 devolveu 521 kB ao remover o three.js.

- Inicializar **somente** se `prefers-reduced-motion` não estiver ativo. Sob reduced-motion, não instanciar o Lenis — o scroll nativo é a experiência correta.
- Integrar com o ScrollTrigger do GSAP (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`), senão os reveals disparam nas posições erradas.
- O Lenis entra no chunk `scroll` (import dinâmico já existente em `src/main.ts:30`), preservando a regra de que o contador aparece antes de qualquer visual pesado.

#### 3b. Bolinhas de navegação

Uma `<nav>` fixa na lateral direita, uma bolinha por seção.

- Cada bolinha é uma **âncora real** (`<a href="#medidores">`), não um `<div>` com handler. Isso dá semântica de link: teclado, foco, clique do meio, "abrir em nova aba", e o leitor de tela anuncia como link.
  **Ressalva honesta:** a `<nav>` é montada por JS, então *sem* JS não há bolinha alguma. Isso é aceitável — sem JS o visitante rola a página normalmente e não perde nenhum conteúdo. A exigência de âncora real é por semântica e teclado, não por funcionamento sem JS.
- Nome acessível: o título da seção (`aria-label="Ala das Tentativas"`), nunca só "•".
- Seção corrente marcada com `aria-current="true"` e destaque visual (não só cor — usar tamanho/anel, para não depender de percepção de cor).
- Com JS: `click` chama `lenis.scrollTo(alvo)` e dá `preventDefault()`. Sob reduced-motion (sem Lenis): deixar o comportamento nativo da âncora (salto instantâneo), **sem** `scroll-behavior: smooth`.
- Scroll-spy por `IntersectionObserver`. Fallback: se `IntersectionObserver` não existir, as bolinhas continuam sendo âncoras funcionais, apenas sem destaque — degradação aceitável (mesmo padrão do `timeline.ts:57`).
- Foco visível obrigatório. A nav não pode virar armadilha de foco nem entrar antes do conteúdo na ordem de tabulação — colocar no fim do DOM e posicionar via CSS, ou dar `order`/posição sem alterar a ordem de leitura.
- Esconder em telas estreitas (`max-width: 48rem`), onde a barra rouba área útil.

#### 3c. Fade das seções

Hoje `src/ui/scroll.ts` faz `gsap.from(secao.children, { stagger: 0.12, ... })` — cada **filho** entra em cascata, o que produz o pisca-pisca em série que o andre reclamou.

Trocar por **um fade único e curto da seção inteira** (opacidade + ~16px de subida, ~0.5s, `power2.out`). Preservar o guard existente que evita piscar seções já visíveis no boot (`scroll.ts:22`).

#### 3d. Parallax da taça

Hoje: `yPercent: 20, scale: 1.06`. A taça desce demais e cresce, saindo do enquadramento.

Reduzir para deriva sutil: `yPercent: ~6`, **sem `scale`**. Manter `scrub` e o desligamento sob reduced-motion (já existe em `scroll.ts:8`).

### 4. Profecia — cards sob demanda

Hoje `src/ui/profecia.ts` renderiza o gráfico SVG **e** uma galeria `.lapides` com os 6 cards sempre visíveis.

**Restrição de acessibilidade (corrigida em 09/07 à noite):** a formulação original dizia que a galeria era "o fallback para quem está sem JS" — **falso**: o site inteiro é renderizado por JS (`index.html` é uma casca de 1,5 kB), então sem JS não há galeria, gráfico, nem nada. O fallback real da galeria é o cenário em que a *montagem* roda mas a *fiação interativa* falha (erro em `ligarGraficoInterativo`, por exemplo): como o hide acontece dentro dela, uma falha deixa os 6 cards visíveis, e o visitante não perde conteúdo.

**Solução — progressive enhancement (correta pelas razões acima):** os 6 cards continuam no HTML montado. `ligarGraficoInterativo()` esconde a galeria no boot, via `display: none` (não `visibility`/`opacity` — precisa sair da árvore de acessibilidade para o leitor de tela não ler 6 cards duplicados). O painel de detalhe `aria-live` continua sendo a única superfície de conteúdo quando a interatividade está de pé, anunciando exatamente uma vez por ativação. A classe é aplicada só em runtime, nunca no template.

## Acessibilidade (o padrão que a v1/v2 seguraram)

- Contraste AA (≥4,5:1) mantido, **recalculado** após a mudança do ruído.
- `prefers-reduced-motion` honrado: sem Lenis, sem parallax, sem fade, salto de âncora instantâneo.
- Navegação completa por teclado, incluindo a nav de bolinhas.
- Nenhuma região `aria-live` nova. A da Profecia continua disparando só em ativação explícita.
- Conteúdo sempre em `src/data/`.

## Riscos

- **Lenis + ScrollTrigger** é a integração mais delicada. Se os reveals dispararem cedo/tarde, é sinal de que o `ScrollTrigger.update` não está amarrado ao tick do Lenis.
- **Lenis + âncoras nativas:** com o Lenis ativo, `href="#x"` pode "brigar" com o scroll gerenciado. Por isso o `preventDefault()` + `lenis.scrollTo`.
- **Contraste do fundo:** mexer no ruído pode furar o AA. É verificação obrigatória, não opcional.
- **Peso:** Lenis é a primeira dependência de runtime adicionada desde a remoção do three.js. Conferir que o chunk `scroll` não estoura muito além dos 113 kB atuais.

## Critérios de aceite

1. `npx vitest run`, `npx tsc --noEmit` e `npx vite build` passam.
2. A imagem do herói é a taça da Copa, servida em `/img/taca-heroi.webp`, e o preload de `index.html` aponta para ela (uma única requisição).
3. Nenhuma regra `scroll-snap` no CSS.
4. Com `prefers-reduced-motion: reduce`: Lenis não é instanciado, não há parallax nem fade, e as bolinhas saltam instantaneamente.
5. As bolinhas são `<a href="#...">`, têm nome acessível, `aria-current` na seção corrente, e são alcançáveis por Tab com foco visível.
6. Sem JS: os 6 cards da Profecia aparecem. Com JS: some a galeria e o card só aparece ao ativar um ponto.
7. O fundo não exibe repetição visível do tile de 220px.
8. O contraste do `--ouro-baco` sobre o ponto mais claro do fundo permanece ≥4,5:1, com a conta registrada.
9. O `scripts/otimizar-imagens.sh` continua idempotente e regenera a nova taça.
