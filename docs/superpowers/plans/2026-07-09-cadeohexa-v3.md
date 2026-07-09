# "Cadê o Hexa?" v3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a imagem do herói pela taça real da Copa, consertar a grade de bolhas do fundo, dar inércia + navegação por bolinhas ao scroll, e fazer a Profecia mostrar o card só sob demanda.

**Architecture:** Site estático Vite + TypeScript, sem framework. Conteúdo em `src/data/`, UI em `src/ui/`, animação isolada no chunk dinâmico `src/ui/scroll.ts` (carregado por último, com `.catch()`, para o contador nunca esperar o GSAP). A v3 adiciona o Lenis dentro desse mesmo chunk e uma nav de bolinhas que funciona sem JS por serem âncoras reais.

**Tech Stack:** Vite 8, TypeScript 6, Vitest 4, GSAP 3 + ScrollTrigger, Lenis (novo), ImageMagick 7 (pipeline de imagem), Cloudflare Pages + Pages Functions.

**Spec:** `docs/superpowers/specs/2026-07-09-cadeohexa-v3-scroll-e-visual.md`

---

## Contexto que o implementador precisa saber

- Branch de trabalho: `dev/site`. **O repo não tem remote** — nunca tente `git push`.
- Rodar tudo da raiz `/home/andre/Workspace/hexa-site`.
- Testes: `npx vitest run` (ambiente **node**, sem jsdom — não existe teste de DOM e **não se deve criar**). Typecheck: `npx tsc --noEmit`. Build: `npx vite build`.
- Regra do projeto, sem exceção: **conteúdo em `src/data/`**, nunca hardcoded na UI.
- Regra do projeto: contraste **AA (≥4,5:1)**, teclado completo, `prefers-reduced-motion` honrado.
- Deploy (só na última task, e só com o OK do andre): `npx wrangler pages deploy dist --project-name cadeohexa --branch main`. **O `--branch main` é obrigatório**: sem ele o wrangler lê o nome da branch git (`dev/site`) e publica só um preview.

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `assets/fontes/taca-heroi.png` (criar, **rastreado**) | Fonte versionada da taça nova. Único original que a v3 muda. |
| `scripts/otimizar-imagens.sh` (modificar) | Passa a converter também a fonte versionada; restauração não pode sobrescrever fonte existente. |
| `.gitignore` (modificar) | Abre exceção para `assets/fontes/`. |
| `public/img/taca-heroi.webp` (substituir) | A taça nova, otimizada. Mesmo nome/caminho de antes. |
| `src/styles/main.css` (modificar) | `baseFrequency` do ruído; remove `scroll-behavior: smooth`; estilos da nav de bolinhas. |
| `src/data/secoes.ts` (criar) | Lista `{id, titulo}` das seções — conteúdo, logo mora em `src/data/`. |
| `src/ui/navegacao.ts` (criar) | Monta a nav de bolinhas (âncoras) e o scroll-spy. Não conhece o Lenis. |
| `src/ui/scroll.ts` (modificar) | Lenis + ScrollTrigger, fade único, parallax reduzido, e liga o clique suave da nav. |
| `src/ui/profecia.ts` (modificar) | Esconde a galeria no boot (progressive enhancement). |
| `src/main.ts` (modificar) | Monta a nav. |
| `index.html` (modificar) | Container `<nav id="nav-secoes">` no fim do `<body>`. |
| `tests/secoes.test.ts` (criar) | Garante que todo id de `SECOES` existe como `<section>` no `index.html`. |

---

## Task 1: Fonte versionada da taça + script

**Files:**
- Create: `assets/fontes/taca-heroi.png` (rastreado)
- Modify: `.gitignore`
- Modify: `scripts/otimizar-imagens.sh`
- Replace: `public/img/taca-heroi.webp`

A imagem escolhida (variante `taca-d1`) já está em `assets/img-fonte/taca-heroi.png`. **Não gerar imagem nova.**

**Por que esta task existe:** o script hoje varre `assets/img-fonte/*.jpg` e, quando o diretório falta, restaura os originais com `git archive imagens-originais-v2 -- public/img`. Essa tag aponta para um commit anterior à V7, onde `public/img/` ainda tinha o `taca-heroi.jpg` do **cálice genérico**. Sem esta task, um clone limpo regeneraria a taça errada.

- [ ] **Step 1: Mover a fonte para o diretório rastreado**

`git mv` não serve aqui: `assets/img-fonte/` é gitignored, então o arquivo não está no índice. É `mv` puro.

```bash
mkdir -p assets/fontes
mv assets/img-fonte/taca-heroi.png assets/fontes/taca-heroi.png
rm -f assets/img-fonte/taca-heroi.jpg   # o cálice genérico não é mais fonte de nada
ls -la assets/fontes/
```

Esperado: `assets/fontes/taca-heroi.png` existe (~190 kB, 1024×1024).

- [ ] **Step 2: Abrir exceção no `.gitignore`**

Depois da linha que ignora `assets/img-fonte/`, adicionar:

```gitignore
# assets/fontes/ é rastreado de propósito: guarda os originais que NÃO existem
# em nenhum outro objeto do git (a tag imagens-originais-v2 só tem os da v2).
!assets/fontes/
```

Verificar: `git check-ignore -v assets/fontes/taca-heroi.png` deve sair **sem match** (código 1).

- [ ] **Step 3: Ensinar o script a converter a fonte versionada**

Em `scripts/otimizar-imagens.sh`, o loop hoje é `for origem in "$ORIGEM"/*.jpg`. Trocar para varrer as duas pastas e as duas extensões, e fazer a fonte versionada **vencer** sobre qualquer restauração:

```bash
# Fontes versionadas (assets/fontes) têm precedência sobre as restauradas da
# tag: são originais que não existem em nenhum outro objeto do git.
FONTES_VERSIONADAS="${FONTES_VERSIONADAS:-$RAIZ/assets/fontes}"

converter() {
  local origem="$1"
  local base; base="$(basename "${origem%.*}")"
  magick "$origem" -resize '900x900>' -strip -quality 78 -define webp:method=6 \
    "$RAIZ/public/img/$base.webp"
  echo "  $base.webp"
}

# 1) restauradas/locais
for origem in "$ORIGEM"/*.jpg; do
  [ -e "$origem" ] || continue
  base="$(basename "${origem%.*}")"
  # pulada se houver fonte versionada com o mesmo nome (ela é a verdade)
  if compgen -G "$FONTES_VERSIONADAS/$base.*" > /dev/null; then continue; fi
  converter "$origem"
done

# 2) versionadas (jpg ou png)
for origem in "$FONTES_VERSIONADAS"/*.{jpg,png}; do
  [ -e "$origem" ] || continue
  converter "$origem"
done
```

Manter `set -euo pipefail`, o guard de `magick`, e o `shopt -s nullglob` (adicionar se não existir, senão o glob `*.{jpg,png}` sem match vira literal).

- [ ] **Step 4: Rodar o script e conferir que a taça é a NOVA**

```bash
rm -rf assets/img-fonte
./scripts/otimizar-imagens.sh
identify -format "%f %wx%h\n" public/img/taca-heroi.webp
```

Esperado: o script restaura os 12 originais da tag, **não** sobrescreve a taça versionada, e `taca-heroi.webp` sai `900x900`.

**Verificação obrigatória de que não é o cálice:** abrir `public/img/taca-heroi.webp` e olhar. Tem de ser a taça da Copa (duas figuras em espiral sustentando um globo, base de malaquita verde). Se for um cálice/vaso ornamentado, a precedência falhou — **pare e reporte**.

- [ ] **Step 5: Idempotência**

```bash
./scripts/otimizar-imagens.sh && git status --short public/img
```

Esperado: `git status` vazio na segunda rodada (fora a própria taça, que mudou uma vez só).

- [ ] **Step 6: Conferir dimensões vs atributos do `<img>`**

Se `identify` disser algo diferente de `900x900`, atualizar `width`/`height` em `src/ui/hero.ts:8`. Se for `900x900`, nada muda. **Não deixe divergir** — é o layout shift que a V7 eliminou.

- [ ] **Step 7: Contraste do texto do herói sobre a taça nova**

A d1 tem facho de luz próprio e é mais clara na faixa central, exatamente onde o texto senta. O `.heroi-veu` (`main.css:87-95`) escurece essa faixa com `rgba(10,8,5,0.88→0.92)`.

Este comando é autocontido: mede a faixa central da imagem, compõe o véu por cima e imprime o veredito. Rodar como está, sem editar nada.

```bash
MEDIA=$(magick public/img/taca-heroi.webp -crop 100%x40%+0+270 +repage \
  -format "%[fx:int(255*mean.r)],%[fx:int(255*mean.g)],%[fx:int(255*mean.b)]" info:)
echo "média RGB da faixa do texto: $MEDIA"

node -e '
const srgb=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
const L=([r,g,b])=>0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b)
const over=(fg,bg,a)=>fg.map((c,i)=>Math.round(c*a+bg[i]*(1-a)))
const img=process.argv[1].split(",").map(Number)
const veu=[10,8,5], fundo=over(veu,img,0.90)   // .heroi-veu ~0,90 na faixa central
const ouro=[212,175,95]                         // --ouro #d4af5f
const razao=(Math.max(L(ouro),L(fundo))+0.05)/(Math.min(L(ouro),L(fundo))+0.05)
console.log("fundo composto:",fundo,"contraste:",razao.toFixed(2),razao>=4.5?"AA OK":"FUROU AA")
' "$MEDIA"
```

Esperado: **AA OK**. Se der **FUROU AA**, subir os stops centrais do `.heroi-veu` (`0.88` e `0.92`, `main.css:91-93`) em incrementos de `0.02` e repetir até passar. Colar a saída do comando na mensagem do commit.

- [ ] **Step 8: Verificar e commitar**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git add assets/fontes .gitignore scripts/otimizar-imagens.sh public/img/taca-heroi.webp src/ui/hero.ts src/styles/main.css
git commit -m "feat(v3): taça da Copa de verdade no herói, com fonte versionada"
```

Esperado: 26/26 testes, tsc limpo, build ✓.

---

## Task 2: Fundo sem grade de bolhas

**Files:**
- Modify: `src/styles/main.css:49` (o `data:` do `feTurbulence`)

**O defeito:** `baseFrequency='0.015'` gera manchas do tamanho do tile de 220px, então o `background-repeat` expõe a periodicidade. Grão de mármore precisa de frequência alta.

**Nota tranquilizadora:** o `feColorMatrix` fixa o alpha do ruído em `0.05` (`0 0 0 0.05 0` na linha do alpha) **independentemente** da `baseFrequency`. Mudar a frequência redistribui o grão no espaço, não muda o pico de luminância. Logo o contraste AA não deve mudar. Verificar mesmo assim (Step 3).

- [ ] **Step 1: Subir a frequência**

Em `src/styles/main.css:49`, dentro do `url("data:image/svg+xml,...")`, trocar:

```
baseFrequency='0.015'
```

por:

```
baseFrequency='0.8'
```

Manter `numOctaves='4'`, `stitchTiles='stitch'`, o `feColorMatrix` e o `background-size: 220px 220px`.

- [ ] **Step 2: Atualizar o comentário acima do bloco**

O comentário em `main.css:32` diz "ruído SVG (feTurbulence) em opacidade baixíssima". Acrescentar por que a frequência é alta:

```
   1) grão de mármore — ruído SVG (feTurbulence) em opacidade baixíssima. A
      baseFrequency é ALTA (0.8) de propósito: frequência baixa produz manchas
      do tamanho do tile de 220px e a repetição do background fica visível a
      olho nu. Alta frequência lê como granulado de filme.
```

- [ ] **Step 3: Confirmar que o AA não mudou**

O ponto mais claro da pilha é: `--marmore-1` (#14100a) + facho `rgba(110,92,56,0.08)` + ruído branco a `0.05`.

```bash
node -e '
const srgb=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
const L=([r,g,b])=>0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b)
const over=(fg,bg,a)=>fg.map((c,i)=>Math.round(c*a+bg[i]*(1-a)))
let c=[0x14,0x10,0x0a]
c=over([110,92,56],c,0.08)     // facho
c=over([255,255,255],c,0.05)   // pico do ruído
const ouro=[0xa0,0x8a,0x50]    // --ouro-baco
const razao=(Math.max(L(ouro),L(c))+0.05)/(Math.min(L(ouro),L(c))+0.05)
console.log("ponto mais claro:",c,"contraste:",razao.toFixed(2),razao>=4.5?"AA OK":"FUROU AA")
'
```

Esperado: **AA OK** (~4,7:1). Se furar, baixar o `0.05` do alpha do `feColorMatrix` até voltar.

- [ ] **Step 4: Olhar o resultado**

```bash
npx vite build && npx vite preview --port 4321
```

Abrir `http://localhost:4321/`, rolar até a seção "Próxima Tentativa" e confirmar **a olho** que não há grade de manchas repetidas. Encerrar o preview.

- [ ] **Step 5: Commitar**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git add src/styles/main.css
git commit -m "fix(v3): grão do mármore em alta frequência — some a grade de tiles do fundo"
```

---

## Task 3: Profecia mostra o card só sob demanda

**Files:**
- Modify: `src/ui/profecia.ts:116-153` (`ligarGraficoInterativo`)
- Modify: `src/styles/main.css` (classe `.lapides-ocultas`)

**Restrição inegociável:** a galeria `.lapides` é hoje o fallback de conteúdo para quem está **sem JS**. Ela continua no HTML renderizado. Quem esconde é o próprio JS, no boot. Assim:
- sem JS → gráfico inerte + 6 cards visíveis (conteúdo íntegro);
- com JS → só o gráfico; o card aparece no painel `aria-live` ao ativar um ponto.

Esconder com `display: none`, **não** `opacity`/`visibility`: precisa sair da árvore de acessibilidade, senão o leitor de tela lê os 6 cards **mais** o painel de detalhe (duplicação pior que hoje).

- [ ] **Step 1: Adicionar a classe no CSS**

Em `src/styles/main.css`, junto aos estilos de `.lapides`:

```css
/* A galeria completa é o fallback sem JS. Com JS, ligarGraficoInterativo()
   aplica esta classe: o conteúdo passa a vir só do painel aria-live, ativado
   ponto a ponto. display:none (e não opacity/visibility) para sair também da
   árvore de acessibilidade — senão o leitor de tela lê os 6 cards E o painel. */
.lapides-ocultas { display: none; }
```

- [ ] **Step 2: Esconder no boot**

Em `src/ui/profecia.ts`, dentro de `ligarGraficoInterativo`, logo após o guard `if (!painelEl || pontos.length === 0) return`:

```ts
  // Progressive enhancement: só escondemos a galeria quando temos certeza de que
  // a interatividade do gráfico está de pé. Sem JS, os 6 cards continuam à vista.
  el.querySelector<HTMLElement>('.lapides')?.classList.add('lapides-ocultas')
```

- [ ] **Step 3: Limpar o que virou morto**

Com a galeria escondida, `cards` e o `cards.forEach(...)` dentro de `selecionar()` (`profecia.ts:119` e `:136-138`) passam a mexer em nós invisíveis. **Remover ambos**, e remover o parâmetro `indice` de `cardHTML` junto com o `lapide-selecionada` inicial (`profecia.ts:56-57`) — sem JS não há "selecionado", e com JS a galeria some. Ajustar a chamada `PROFECIA.map((p, i) => cardHTML(p, i))` para `PROFECIA.map((p) => cardHTML(p))`.

Remover também a classe `.lapide-selecionada` do CSS se não sobrar nenhum uso (`grep -n "lapide-selecionada" src/`).

- [ ] **Step 4: Atualizar os comentários que ficaram mentindo**

O comentário em `profecia.ts:19-22` diz que a galeria "é o arquivo completo, sempre presente". E o de `:52-55` diz "completo para leitor de tela, mobile e qualquer visitante". Ambos deixaram de ser verdade quando há JS. Reescrever para descrever o fallback sem-JS.

Idem a legenda do gráfico (`profecia.ts:103`), que continua correta ("Clique, toque ou use Tab e Enter") — conferir e manter.

- [ ] **Step 5: Verificar os dois caminhos**

```bash
npx vite build && npx vite preview --port 4321
```

1. Com JS: abrir `http://localhost:4321/`, ir à Profecia. Deve haver **só o gráfico + um card**. Clicar em outro ponto move o card.
2. Sem JS: no DevTools, desabilitar JavaScript e recarregar. Devem aparecer **os 6 cards**.

- [ ] **Step 6: Commitar**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git add src/ui/profecia.ts src/styles/main.css
git commit -m "feat(v3): Profecia mostra só o gráfico; card aparece na ativação (galeria é o fallback sem JS)"
```

---

## Task 4: Dados das seções + nav de bolinhas (sem Lenis)

**Files:**
- Create: `src/data/secoes.ts`
- Create: `tests/secoes.test.ts`
- Create: `src/ui/navegacao.ts`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles/main.css`

As bolinhas são **âncoras de verdade** (`<a href="#id">`), então funcionam sem JS e no teclado. O Lenis entra só na Task 5.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/secoes.test.ts`. Ele guarda contra o bug real de o `index.html` e o `SECOES` saírem de sincronia:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SECOES } from '../src/data/secoes'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

describe('SECOES', () => {
  it('tem pelo menos uma seção e nenhum id repetido', () => {
    expect(SECOES.length).toBeGreaterThan(0)
    const ids = SECOES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todo id existe como <section> no index.html', () => {
    for (const { id } of SECOES) {
      expect(html).toContain(`<section id="${id}"`)
    }
  })

  it('todo título é não-vazio (vira o nome acessível da bolinha)', () => {
    for (const { titulo } of SECOES) {
      expect(titulo.trim().length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run tests/secoes.test.ts`
Esperado: FAIL — `Cannot find module '../src/data/secoes'`.

- [ ] **Step 3: Criar os dados**

Criar `src/data/secoes.ts`. O `#heroi` entra: é o topo, e a bolinha serve de "voltar ao início". O `#placa-final` é `<footer>`, não `<section>` — fica de fora.

```ts
/** Seções navegáveis pela nav de bolinhas. O título vira o nome acessível
 * (aria-label) de cada bolinha — nunca deixar como "•". */
export interface Secao {
  id: string
  titulo: string
}

export const SECOES: readonly Secao[] = [
  { id: 'heroi', titulo: 'Início' },
  { id: 'proxima-tentativa', titulo: 'Próxima tentativa' },
  { id: 'ala-das-tentativas', titulo: 'Ala das Tentativas' },
  { id: 'medidores', titulo: 'Medidores da espera' },
  { id: 'profecia', titulo: 'A Profecia' },
  { id: 'quiz', titulo: 'Quiz' },
  { id: 'card', titulo: 'Seu card' },
]
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run tests/secoes.test.ts`
Esperado: PASS (3 testes).

- [ ] **Step 5: Container no `index.html`**

O `<nav>` vai **depois** do `<main>`, para não entrar antes do conteúdo na ordem de tabulação. A posição visual é dada pelo CSS.

Em `index.html`, entre `</main>` e o `<script>`:

```html
    <!-- Depois do <main> de propósito: a ordem de leitura/tabulação é conteúdo
         primeiro, navegação depois. A posição na lateral é só CSS. -->
    <nav id="nav-secoes" aria-label="Seções do memorial"></nav>
```

- [ ] **Step 6: Montar a nav**

Criar `src/ui/navegacao.ts`:

```ts
import { SECOES } from '../data/secoes'

/** Nav de bolinhas: uma âncora real por seção. Funciona sem JS (são links) e
 * sem IntersectionObserver (só perde o destaque da seção corrente). O scroll
 * suave é ligado depois, no chunk de scroll, via ligarNavegacaoSuave(). */
export function montarNavegacao(el: HTMLElement): void {
  el.innerHTML = `
    <ul class="nav-secoes-lista">
      ${SECOES.map(
        (s) => `
        <li>
          <a class="nav-bolinha" href="#${s.id}" data-secao="${s.id}" aria-label="${s.titulo}">
            <span class="nav-bolinha-marca" aria-hidden="true"></span>
          </a>
        </li>`,
      ).join('')}
    </ul>
  `
  ligarScrollSpy(el)
}

/** Marca a bolinha da seção corrente com aria-current. Se o navegador não tiver
 * IntersectionObserver, as bolinhas seguem sendo âncoras funcionais — só sem
 * destaque. Mesma degradação de src/ui/timeline.ts. */
function ligarScrollSpy(el: HTMLElement): void {
  if (typeof IntersectionObserver === 'undefined') return
  const bolinhas = new Map<string, HTMLAnchorElement>()
  el.querySelectorAll<HTMLAnchorElement>('.nav-bolinha').forEach((a) => {
    bolinhas.set(a.dataset.secao!, a)
  })

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        bolinhas.forEach((a, id) => {
          const ativa = id === e.target.id
          a.classList.toggle('nav-bolinha-ativa', ativa)
          if (ativa) a.setAttribute('aria-current', 'true')
          else a.removeAttribute('aria-current')
        })
      }
    },
    // Uma faixa estreita no meio da tela: a seção que a cruza é a "corrente".
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  )

  SECOES.forEach(({ id }) => {
    const secao = document.getElementById(id)
    if (secao) observador.observe(secao)
  })
}
```

- [ ] **Step 7: Montar no `main.ts`**

Em `src/main.ts`, importar e montar depois do rodapé e **antes** do `import('./ui/scroll')`:

```ts
import { montarNavegacao } from './ui/navegacao'
```

```ts
montarNavegacao(document.querySelector('#nav-secoes')!)
```

- [ ] **Step 8: Estilos**

Em `src/styles/main.css`, no fim:

```css
/* Nav de bolinhas: fixa na lateral direita. Vive depois do <main> no DOM (ordem
   de leitura correta) e é trazida pra cá só visualmente. Escondida em telas
   estreitas, onde roubaria área útil. */
#nav-secoes {
  position: fixed;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.nav-secoes-lista { list-style: none; display: flex; flex-direction: column; gap: 0.9rem; }

/* Alvo de toque de 44px, com a marca visível bem menor dentro dele. */
.nav-bolinha {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  text-decoration: none;
}

.nav-bolinha-marca {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ouro-sombra);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
  transition: background 0.25s, transform 0.25s, box-shadow 0.25s;
}

.nav-bolinha:hover .nav-bolinha-marca { background: var(--ouro-baco); }

/* Seção corrente: cor E tamanho/anel — nunca só cor, pra não depender de
   percepção cromática. */
.nav-bolinha-ativa .nav-bolinha-marca {
  background: var(--ouro-vivo);
  transform: scale(1.5);
  box-shadow: 0 0 0 3px rgba(212, 175, 95, 0.25);
}

.nav-bolinha:focus-visible { outline: 2px solid var(--ouro-vivo); outline-offset: -6px; border-radius: 50%; }

@media (max-width: 48rem) { #nav-secoes { display: none; } }
```

- [ ] **Step 9: Verificar teclado e sem-JS**

```bash
npx vite build && npx vite preview --port 4321
```

- Tab até as bolinhas: foco visível, e o leitor anuncia o título da seção (não "•").
- Clicar numa bolinha rola até a seção.
- Rolar a página: a bolinha da seção corrente destaca (tamanho + cor).
- DevTools com JS desligado: as bolinhas **ainda** aparecem? **Não** — a nav é montada por JS. Isso é aceitável: sem JS o usuário rola normalmente e não perde conteúdo. (A exigência de "âncora real" é para teclado e para o clique do meio, não para o caso sem-JS.)

- [ ] **Step 10: Commitar**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git add src/data/secoes.ts tests/secoes.test.ts src/ui/navegacao.ts src/main.ts index.html src/styles/main.css
git commit -m "feat(v3): nav de bolinhas por seção, com âncoras reais e scroll-spy"
```

Esperado: 29/29 testes (26 + 3 novos).

---

## Task 5: Inércia com Lenis

**Files:**
- Modify: `package.json` (dependência `lenis`)
- Modify: `src/styles/main.css:18` (remover `scroll-behavior: smooth`)
- Modify: `src/ui/scroll.ts`
- Modify: `src/ui/navegacao.ts` (exportar hook para o clique suave)

**Conflito conhecido:** `html { scroll-behavior: smooth }` (`main.css:18`) briga com o Lenis — a doc do Lenis manda usar `scroll-behavior: auto`. Além disso, `scroll-snap` **não** entra: inércia e snap se atropelam. (Decisão registrada na spec.)

- [ ] **Step 1: Instalar**

```bash
npm install lenis
node -e "console.log(require('./package.json').dependencies)"
```

Esperado: `lenis` listado em `dependencies`.

- [ ] **Step 2: Remover o smooth nativo**

Em `src/styles/main.css:18`, trocar:

```css
html { scroll-behavior: smooth; }
```

por:

```css
/* auto, não smooth: o Lenis gerencia a rolagem quando está ativo, e os dois
   juntos produzem rolagem dupla. Sob prefers-reduced-motion o Lenis nem é
   instanciado, e o salto instantâneo da âncora é o comportamento correto. */
html { scroll-behavior: auto; }
```

- [ ] **Step 3: Expor o hook de clique na nav**

No fim de `src/ui/navegacao.ts`, adicionar:

```ts
/** Chamado só pelo chunk de scroll, quando o Lenis está de pé. Sem isso, as
 * bolinhas continuam funcionando como âncoras nativas. */
export function ligarNavegacaoSuave(irPara: (alvo: HTMLElement) => void): void {
  document.querySelectorAll<HTMLAnchorElement>('.nav-bolinha').forEach((a) => {
    a.addEventListener('click', (evento) => {
      const alvo = document.getElementById(a.dataset.secao!)
      if (!alvo) return
      evento.preventDefault()
      irPara(alvo)
    })
  })
}
```

- [ ] **Step 4: Ligar o Lenis no `scroll.ts`**

Em `src/ui/scroll.ts`, no topo de `ligarScroll()`, **depois** do guard de reduced-motion (que já existe e faz `return`), instanciar o Lenis e casá-lo com o ScrollTrigger:

```ts
import Lenis from 'lenis'
import { ligarNavegacaoSuave } from './navegacao'
```

```ts
  // Inércia. Vive dentro do guard de reduced-motion: quem pediu menos movimento
  // fica com a rolagem nativa do navegador, que é a experiência correta.
  const lenis = new Lenis()
  // Sem estas duas linhas o ScrollTrigger continua lendo a posição nativa e os
  // reveals disparam nas alturas erradas.
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000))
  gsap.ticker.lagSmoothing(0)

  ligarNavegacaoSuave((alvo) => lenis.scrollTo(alvo))
```

- [ ] **Step 5: Conferir o peso do chunk**

```bash
npx vite build
```

Esperado: o chunk `scroll-*.js` sai de ~113 kB para ~130 kB (gzip ~44 kB → ~50 kB). Se passar de 160 kB, **pare e reporte** — algo entrou junto que não devia.

- [ ] **Step 6: Verificar reduced-motion**

```bash
npx vite preview --port 4321
```

No DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", recarregar:
- A rolagem é a nativa (sem inércia).
- Clicar numa bolinha salta instantaneamente.
- Nenhum erro no console.

Sem a emulação: a rolagem tem inércia e a bolinha rola suavemente até a seção.

- [ ] **Step 7: Commitar**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git add package.json package-lock.json src/styles/main.css src/ui/scroll.ts src/ui/navegacao.ts
git commit -m "feat(v3): scroll com inércia (Lenis) casado ao ScrollTrigger; sem smooth nativo"
```

---

## Task 6: Fade único e parallax contido

**Files:**
- Modify: `src/ui/scroll.ts`

**Os dois defeitos:** o reveal atual anima os **filhos** de cada seção com `stagger: 0.12` — daí o pisca-pisca em cascata. E o parallax da taça usa `yPercent: 20, scale: 1.06`, que a joga pra fora do enquadramento.

- [ ] **Step 1: Trocar o reveal por um fade da seção inteira**

Em `src/ui/scroll.ts`, substituir o bloco `document.querySelectorAll<HTMLElement>('.secao').forEach(...)` por:

```ts
  // Fade único da seção inteira. O reveal antigo animava cada filho com stagger,
  // o que produzia um pisca-pisca em cascata. Um fade curto é mais sóbrio e
  // combina com o tom de memorial.
  document.querySelectorAll<HTMLElement>('.secao').forEach((secao) => {
    // Seções já visíveis no boot não devem piscar: o gsap.from zeraria a
    // opacidade de algo que o usuário já está lendo. O corte espelha o start
    // do trigger ('top 70%') — só revela o que ainda vem.
    if (secao.getBoundingClientRect().top < innerHeight * 0.7) return
    gsap.from(secao, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: secao, start: 'top 70%' },
    })
  })
```

- [ ] **Step 2: Conter o parallax**

No mesmo arquivo, trocar o `gsap.to('.heroi-taca', ...)` por:

```ts
  // Deriva sutil: sem scale (que estourava o enquadramento) e com metade da
  // translação anterior.
  gsap.to('.heroi-taca', {
    yPercent: 6,
    ease: 'none',
    scrollTrigger: { trigger: '#heroi', start: 'top top', end: 'bottom top', scrub: 0.6 },
  })
```

- [ ] **Step 3: Verificar a olho**

```bash
npx vite build && npx vite preview --port 4321
```

- Rolar devagar: cada seção entra com **um** fade, não em cascata.
- A taça deriva de leve e **não** sai do enquadramento nem cresce.
- Com reduced-motion emulado: nada anima, tudo legível.

- [ ] **Step 4: Commitar**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
git add src/ui/scroll.ts
git commit -m "fix(v3): fade único por seção e parallax da taça contido"
```

---

## Task 7: Verificação final e deploy

**Files:** nenhum (só verificação)

- [ ] **Step 1: Suíte, typecheck, build limpo**

```bash
npx vitest run && npx tsc --noEmit && rm -rf dist && npx vite build
```

Esperado: 29/29 testes, tsc limpo, build ✓.

- [ ] **Step 2: Checklist automática**

```bash
grep -rn "scroll-snap" src/ && echo "!! scroll-snap não devia existir" || echo "OK: sem scroll-snap"
grep -rn "scroll-behavior: smooth" src/ && echo "!! smooth nativo briga com Lenis" || echo "OK: sem smooth nativo"
grep -c "lapides-ocultas" src/ui/profecia.ts src/styles/main.css
grep -rn "console\.log\|TODO\|FIXME" src/ || echo "OK: nada"
ls dist/img/taca-heroi.webp && identify -format "%f %wx%h\n" dist/img/taca-heroi.webp
grep -o 'href="/img/taca-heroi\.[a-z]*"' dist/index.html
```

Esperado: sem `scroll-snap`, sem `scroll-behavior: smooth`, `lapides-ocultas` presente nos dois arquivos, sem `console.log`, taça `900x900`, preload apontando para `.webp`.

- [ ] **Step 3: Checklist manual no preview**

```bash
npx vite preview --port 4321
```

1. Herói mostra **a taça da Copa** (duas figuras + globo + base verde), não um cálice.
2. O fundo não tem grade de manchas repetidas.
3. Bolinhas à direita: Tab chega nelas, foco visível, nome da seção anunciado, `aria-current` acompanha a rolagem.
4. Rolagem tem inércia; clicar numa bolinha desliza até a seção.
5. Seções entram com um fade só.
6. A taça deriva pouco e não cresce.
7. Profecia: só o gráfico + um card; clicar em outro ponto troca o card.
8. Com JS desligado: os 6 cards da Profecia aparecem.
9. Com `prefers-reduced-motion: reduce`: sem inércia, sem parallax, sem fade; bolinhas saltam.
10. Nenhum erro no console.

- [ ] **Step 4: PARAR e pedir o OK do andre**

O deploy publica por cima do site ao vivo. **Não deployar sem confirmação explícita.**

- [ ] **Step 5: Deploy (só depois do OK)**

```bash
npx wrangler pages deploy dist --project-name cadeohexa --branch main
```

O `--branch main` é obrigatório: sem ele o wrangler usa o nome da branch git (`dev/site`) e publica só um preview.

- [ ] **Step 6: Verificar produção com cache-buster**

O edge cache serve HTML antigo e engana. Sempre com `?cb=`:

```bash
CB=$(date +%s)
curl -s "https://cadeohexa.pages.dev/?cb=$CB" | grep -o '/assets/index-[^"]*\.js'
ls dist/assets/index-*.js | xargs -n1 basename   # tem de bater
curl -s -o /dev/null -w "og: %{http_code} %{content_type}\n" "https://cadeohexa.pages.dev/og?cb=$CB"
npx wrangler pages deployment list --project-name cadeohexa 2>&1 | grep Production | head -1
```

Esperado: o bundle servido tem o mesmo hash do build local; `/og` responde `200 image/png`; o deployment de Production aponta para o commit novo.

- [ ] **Step 7: Atualizar plano e memória**

Marcar as tasks como concluídas neste arquivo, commitar, e atualizar a memória do projeto (`projeto-cadeohexa.md`) com o estado v3.

---

## Riscos

- **Lenis + ScrollTrigger** é a integração mais delicada. Se os reveals dispararem cedo ou tarde, é sinal de que `ScrollTrigger.update` não está amarrado ao tick do Lenis (Task 5, Step 4).
- **Precedência da fonte da taça** (Task 1): se o script restaurar `taca-heroi.jpg` da tag e converter por cima, a taça velha volta. O Step 4 existe justamente para pegar isso.
- **Contraste**: duas verificações obrigatórias (Task 1 Step 7, Task 2 Step 3). Não pular.
- **Peso**: o Lenis é a primeira dependência de runtime desde a remoção do three.js. Conferir o chunk (Task 5, Step 5).
