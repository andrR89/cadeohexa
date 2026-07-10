# v3.2 — Quick-wins: gráfico cinematográfico, footer e GitHub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animar o gráfico da Profecia (draw-in, marcador vivo, crossfade, ECG/flatline), adicionar footer de créditos/portfólio e publicar o repo em github.com/andrR89/cadeohexa.

**Architecture:** As animações GSAP vivem num chunk novo (`src/ui/profecia-animacao.ts`) carregado por `import()` dinâmico com guard de `prefers-reduced-motion` — mesma filosofia do `scroll.ts`: a piada nunca espera o GSAP, e falha de chunk deixa o gráfico estático porém funcional. `profecia.ts` só ganha o crossfade CSS do painel (padrão do quiz v3.1) e passa a emitir `CustomEvent('profecia:selecao')`, que o módulo de animação escuta — acoplamento zero. O footer é um módulo puro (`htmlRodape(): string`) testável no Vitest sem DOM.

**Tech Stack:** TypeScript + Vite, GSAP 3 (ScrollTrigger, já no projeto), Vitest, Cloudflare Pages (wrangler).

**Spec:** `docs/superpowers/specs/2026-07-10-v3-2-quickwins-grafico-footer-github-design.md`

---

## File Structure

- Create: `src/ui/rodape.ts` — HTML do footer (função pura) 
- Create: `tests/rodape.test.ts` — testes dos links
- Create: `src/ui/profecia-animacao.ts` — draw-in, anel deslizante, tremor ECG, flatline (chunk lazy)
- Modify: `src/main.ts` — monta o footer dentro de `#placa-final`
- Modify: `src/ui/profecia.ts` — crossfade do painel + evento de seleção + lazy-load da animação
- Modify: `src/styles/main.css` — halo permanente, anel pulsante, flatline, crossfade, estilos do footer
- Modify: `README.md` — link do site no ar

---

### Task 1: Footer com zoeira e créditos técnicos

**Files:**
- Create: `src/ui/rodape.ts`
- Create: `tests/rodape.test.ts`
- Modify: `src/main.ts:20-28`
- Modify: `src/styles/main.css` (fim do arquivo)

- [x] **Step 1: Write the failing test**

Criar `tests/rodape.test.ts`:

```ts
import { expect, test } from 'vitest'
import { htmlRodape } from '../src/ui/rodape'

test('rodapé linka o perfil e o repositório no GitHub', () => {
  const html = htmlRodape()
  expect(html).toContain('href="https://github.com/andrR89"')
  expect(html).toContain('href="https://github.com/andrR89/cadeohexa"')
})

test('links externos abrem em nova aba sem vazar o opener', () => {
  const links = htmlRodape().match(/<a\s[^>]*>/g) ?? []
  expect(links.length).toBe(2)
  for (const link of links) {
    expect(link).toContain('rel="noopener"')
    expect(link).toContain('target="_blank"')
  }
})

test('créditos citam a stack de verdade', () => {
  const html = htmlRodape()
  for (const tecnologia of ['Vite', 'GSAP', 'Cloudflare Pages']) {
    expect(html).toContain(tecnologia)
  }
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/rodape.test.ts`
Expected: FAIL — `Cannot find module '../src/ui/rodape'` (ou equivalente).

- [x] **Step 3: Write minimal implementation**

Criar `src/ui/rodape.ts`:

```ts
/** Créditos do memorial. Função pura (string) para o Vitest testar sem DOM. */
export function htmlRodape(): string {
  return `
    <div class="rodape-creditos">
      <p class="legenda">
        Feito com mágoa e TypeScript por
        <a href="https://github.com/andrR89" target="_blank" rel="noopener">@andrR89</a>
        ·
        <a href="https://github.com/andrR89/cadeohexa" target="_blank" rel="noopener">código aberto pra quem quiser auditar o sofrimento</a>
      </p>
      <p class="legenda rodape-stack">Vite · GSAP · Cloudflare Pages</p>
    </div>
  `
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/rodape.test.ts`
Expected: PASS (3 testes).

- [x] **Step 5: Montar no `main.ts`**

Em `src/main.ts`, adicionar o import junto aos demais:

```ts
import { htmlRodape } from './ui/rodape'
```

E trocar o bloco do `#placa-final` (linhas 20–28) por:

```ts
const rodape = document.querySelector<HTMLElement>('#placa-final')!
rodape.innerHTML = `
  <div class="placa">
    <p class="rotulo">Placa de inauguração</p>
    <p>Este memorial foi inaugurado no dia ${formatarDias(diasDaEspera(new Date()))} da espera.</p>
    <p class="legenda">Ele será demolido em caso de hexa. Ninguém aqui está com pressa de demolir.</p>
  </div>
  <div id="slot-apoio" aria-hidden="true"></div>
  ${htmlRodape()}
`
```

- [x] **Step 6: Estilos do footer**

No fim de `src/styles/main.css`:

```css
/* ── Rodapé de créditos ─────────────────────────────────────────────── */
.rodape-creditos { margin-top: 2.5rem; text-align: center; }
.rodape-creditos .legenda { margin: 0.3rem 0; }
.rodape-creditos a { color: var(--ouro-vivo); text-decoration-color: var(--ouro-baco); }
.rodape-stack { opacity: 0.7; letter-spacing: 0.06em; }
```

- [x] **Step 7: Suíte inteira + verificação visual rápida**

Run: `npm test`
Expected: todas as suítes PASS.

Run: `npm run dev` e conferir no browser que o footer aparece sob a placa de inauguração com os dois links funcionando (abrir cada um).

- [x] **Step 8: Commit**

```bash
git add src/ui/rodape.ts tests/rodape.test.ts src/main.ts src/styles/main.css
git commit -m "feat(v3.2): footer de créditos — mágoa, TypeScript e código aberto"
```

---

### Task 2: Crossfade do painel + evento de seleção + halo permanente

**Files:**
- Modify: `src/ui/profecia.ts:117-154` (função `ligarGraficoInterativo`)
- Modify: `src/styles/main.css:385-408` (bloco dos pontos) + fim do arquivo

- [x] **Step 1: Crossfade e evento em `ligarGraficoInterativo`**

Substituir a função `selecionar` inteira (linhas 124–137 de `src/ui/profecia.ts`) por:

```ts
  const reduzirMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const DURACAO_SAIDA = 250

  /** Crossfade do painel, padrão do quiz v3.1: anima a saída, troca o conteúdo
   * (UMA escrita no aria-live, no meio do fade — sem anúncio duplicado no
   * leitor de tela), anima a entrada. Sob reduced-motion troca na hora. */
  function trocarDetalhe(previsao: Previsao): void {
    if (reduzirMovimento()) {
      painel.innerHTML = detalheHTML(previsao)
      return
    }
    painel.classList.add('detalhe-saindo')
    setTimeout(() => {
      painel.classList.remove('detalhe-saindo')
      painel.classList.add('detalhe-entrando')
      painel.innerHTML = detalheHTML(previsao)
      painel.addEventListener('animationend', () => painel.classList.remove('detalhe-entrando'), {
        once: true,
      })
    }, DURACAO_SAIDA)
  }

  function selecionar(indice: number): void {
    // Reativar o ponto já selecionado não deve reescrever a região aria-live
    // (o conteúdo já está na tela) — evita um anúncio redundante no leitor de tela.
    if (indice === atual) return
    const previsao = PROFECIA[indice]
    if (!previsao) return
    atual = indice
    pontos.forEach((ponto, i) => {
      const ativo = i === indice
      ponto.classList.toggle('selecionado', ativo)
      ponto.setAttribute('aria-pressed', String(ativo))
    })
    trocarDetalhe(previsao)
    // O módulo de animação (chunk lazy) escuta este evento para deslizar o anel
    // e ligar o flatline — acoplamento por evento: sem o chunk, nada quebra.
    el.dispatchEvent(new CustomEvent('profecia:selecao', { detail: { indice } }))
  }
```

- [x] **Step 2: CSS do crossfade e do halo permanente**

Em `src/styles/main.css`, trocar a regra `.ponto-vergonha .ponto-alvo { fill: transparent; }` (linha 386) por:

```css
/* Halo permanente: o alvo de 22px vira um anel pontilhado sutil — é ele que
   diz "sou clicável" sem depender de hover (que celular não tem). */
.ponto-vergonha .ponto-alvo {
  fill: transparent;
  stroke: var(--ouro-baco);
  stroke-opacity: 0.4;
  stroke-dasharray: 2 5;
}
```

E adicionar, perto do bloco `.profecia-detalhe` existente (linha ~411):

```css
/* Crossfade do painel de destaque — mesmo padrão do quiz (.quiz-saindo/entrando). */
.profecia-detalhe.detalhe-saindo {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s ease-in, transform 0.25s ease-in;
}
.profecia-detalhe.detalhe-entrando { animation: surgir 0.3s ease-out; }
```

(A keyframe `surgir` já existe — é a mesma do quiz.)

- [x] **Step 3: Verificar**

Run: `npm test`
Expected: PASS (nada de profecia depende do DOM nos testes).

Run: `npm run dev` — clicar nos pontos: painel faz fade-out/in; halo pontilhado visível em todos os pontos sem hover. Com DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: troca instantânea, sem fade.

- [x] **Step 4: Commit**

```bash
git add src/ui/profecia.ts src/styles/main.css
git commit -m "feat(v3.2): crossfade no painel da Profecia e halo permanente nos pontos"
```

---

### Task 3: Módulo de animação — draw-in, anel deslizante, tremor ECG e flatline

**Files:**
- Create: `src/ui/profecia-animacao.ts`
- Modify: `src/ui/profecia.ts:16` (fim de `montarProfecia`)
- Modify: `src/styles/main.css` (fim do arquivo)

- [x] **Step 1: Criar `src/ui/profecia-animacao.ts`**

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DURACAO_LINHA = 1.6
const INTERVALO_TREMOR_MS = 120
const AMPLITUDE_TREMOR = 0.8

/** Camada cinematográfica do gráfico da Profecia. Carregada por import()
 * dinâmico sob guard de prefers-reduced-motion; se este chunk nunca rodar, o
 * gráfico continua estático e clicável (rede de segurança em profecia.ts).
 * Nada aqui pode mexer na fiação de interatividade — só decora. */
export function ligarAnimacaoProfecia(el: HTMLElement): void {
  const svg = el.querySelector<SVGSVGElement>('.grafico-vergonha')
  const linha = el.querySelector<SVGPolylineElement>('.grafico-vergonha polyline')
  const pontos = [...el.querySelectorAll<SVGGElement>('.ponto-vergonha')]
  const tiques = [...el.querySelectorAll<SVGTextElement>('.grafico-vergonha .tique')]
  if (!svg || !linha || pontos.length === 0) return

  // Vértices originais da linha: o tremor oscila em torno deles e o restore
  // do flatline volta exatamente para cá.
  const vertices = (linha.getAttribute('points') ?? '')
    .trim()
    .split(/\s+/)
    .map((par) => par.split(',').map(Number) as [number, number])

  // ── Anel "você está aqui" ───────────────────────────────────────────
  const anel = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  anel.classList.add('anel-selecao')
  anel.setAttribute('r', '11')
  anel.setAttribute('cx', String(vertices[0]![0]))
  anel.setAttribute('cy', String(vertices[0]![1]))
  svg.appendChild(anel)

  // Fração do comprimento da linha em cada vértice — é o "trilho" do anel.
  const total = linha.getTotalLength()
  const fracoes = vertices.map((_, i) => {
    let acumulado = 0
    for (let j = 1; j <= i; j++) {
      const [x0, y0] = vertices[j - 1]!
      const [x1, y1] = vertices[j]!
      acumulado += Math.hypot(x1 - x0, y1 - y0)
    }
    return acumulado / total
  })

  const progresso = { valor: 0 }
  function deslizarAnelPara(indice: number): void {
    gsap.to(progresso, {
      valor: fracoes[indice] ?? 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onUpdate() {
        const p = linha!.getPointAtLength(progresso.valor * total)
        anel.setAttribute('cx', String(p.x))
        anel.setAttribute('cy', String(p.y))
      },
    })
  }

  // ── Tremor de eletrocardiograma + flatline ──────────────────────────
  // O tremor só roda com o gráfico desenhado, visível e sem flatline; fora
  // disso o intervalo é desligado (não gastar CPU com a seção fora da tela).
  let desenhado = false
  let visivel = false
  let flatline = false
  let tremor: ReturnType<typeof setInterval> | null = null

  const pontosOriginais = vertices.map(([x, y]) => `${x},${y}`).join(' ')
  function atualizarTremor(): void {
    const deveTremer = desenhado && visivel && !flatline
    if (deveTremer && tremor === null) {
      tremor = setInterval(() => {
        const tremidos = vertices
          .map(([x, y]) => `${x},${y + (Math.random() * 2 - 1) * AMPLITUDE_TREMOR}`)
          .join(' ')
        linha!.setAttribute('points', tremidos)
      }, INTERVALO_TREMOR_MS)
    } else if (!deveTremer && tremor !== null) {
      clearInterval(tremor)
      tremor = null
      linha!.setAttribute('points', pontosOriginais)
    }
  }

  ScrollTrigger.create({
    trigger: svg,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (auto) => {
      visivel = auto.isActive
      atualizarTremor()
    },
  })

  // O flatline (2050, Seleção das IAs) mata o tremor — coração parado não treme.
  el.addEventListener('profecia:selecao', (evento) => {
    const indice = (evento as CustomEvent<{ indice: number }>).detail.indice
    deslizarAnelPara(indice)
    flatline = indice === pontos.length - 1
    svg.classList.toggle('grafico-flatline', flatline)
    atualizarTremor()
  })

  // ── Draw-in no scroll ───────────────────────────────────────────────
  gsap.set(linha, { strokeDasharray: total, strokeDashoffset: total })
  gsap.set(pontos, { scale: 0, transformOrigin: '50% 50%' })
  gsap.set(tiques, { opacity: 0 })
  gsap.set(anel, { opacity: 0 })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: svg, start: 'top 75%', once: true },
  })
  tl.to(linha, { strokeDashoffset: 0, duration: DURACAO_LINHA, ease: 'none' })
  pontos.forEach((ponto, i) => {
    const quando = (fracoes[i] ?? 0) * DURACAO_LINHA
    tl.to(ponto, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, quando)
    if (tiques[i]) tl.to(tiques[i]!, { opacity: 1, duration: 0.3 }, quando)
  })
  tl.to(anel, { opacity: 1, duration: 0.3 }, DURACAO_LINHA)
  tl.add(() => {
    // O dasharray precisa sair de cena: o tremor muda o comprimento da linha
    // e um dash fixo abriria um vão na ponta.
    gsap.set(linha, { clearProps: 'strokeDasharray,strokeDashoffset' })
    desenhado = true
    atualizarTremor()
  })
}
```

- [x] **Step 2: Lazy-load no fim de `montarProfecia`**

Em `src/ui/profecia.ts`, depois de `ligarGraficoInterativo(el)` (linha 16):

```ts
  // Animação por cima, nunca por baixo: chunk separado, só sem reduced-motion,
  // e se falhar o gráfico segue estático e clicável — mesma filosofia do
  // scroll no main.ts (a piada nunca espera o GSAP).
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    import('./profecia-animacao')
      .then(({ ligarAnimacaoProfecia }) => ligarAnimacaoProfecia(el))
      .catch(() => {})
  }
```

- [x] **Step 3: CSS do anel e do flatline**

No fim de `src/styles/main.css`:

```css
/* ── Animações da Profecia (só entram com o chunk profecia-animacao) ── */
.anel-selecao {
  fill: none;
  stroke: var(--ouro-vivo);
  stroke-width: 1.5;
  pointer-events: none;
  transform-box: fill-box;
  transform-origin: center;
  animation: pulsar-anel 1.8s ease-in-out infinite;
}
@keyframes pulsar-anel {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.35); opacity: 0.35; }
}
/* Flatline: monitor cardíaco dando tela plana enquanto 2050 estiver selecionado. */
.grafico-flatline polyline { animation: flatline-piscar 0.9s steps(2, start) infinite; }
@keyframes flatline-piscar { 50% { opacity: 0.15; } }
@media (prefers-reduced-motion: reduce) {
  .anel-selecao, .grafico-flatline polyline { animation: none; }
}
```

- [x] **Step 4: Verificar build, testes e comportamento**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: build limpo; no output do Vite, `profecia-animacao` aparece como chunk separado (conferir na lista de assets).

Run: `npm run dev` e conferir:
1. Ao rolar até a Profecia: linha se desenha, pontos pipocam em sequência com os anos, anel pulsante aparece no ponto 2030.
2. Clicar em outro ponto: anel desliza pela linha até ele; painel faz crossfade.
3. Linha treme sutilmente (ECG) enquanto a seção está visível.
4. Selecionar 2050: tremor para e a linha pisca (flatline). Voltar para outro ano: tremor volta.
5. Com `prefers-reduced-motion: reduce` emulado + reload: gráfico nasce pronto, sem anel, sem tremor — idêntico ao comportamento atual.
6. Simular falha do chunk (DevTools → Network → block `profecia-animacao*`): gráfico estático e clicável, zero erro no console além do fetch bloqueado.

Nota: como o chunk é lazy, pode haver um flash sutil (pontos aparecem e re-pipocam) se o usuário já estiver com o gráfico na tela no boot — aceitável, a Profecia fica bem abaixo da dobra.

- [x] **Step 5: Commit**

```bash
git add src/ui/profecia-animacao.ts src/ui/profecia.ts src/styles/main.css
git commit -m "feat(v3.2): gráfico da Profecia cinematográfico — draw-in, anel vivo, ECG e flatline"
```

---

### Task 4: README + publicação no GitHub

**Files:**
- Modify: `README.md`
- Git: remote + branches

- [x] **Step 1: Link do site no README**

Em `README.md`, trocar a primeira seção para incluir o link no ar (logo após o parágrafo de abertura):

```markdown
**No ar:** https://cadeohexa.pages.dev · **Código:** https://github.com/andrR89/cadeohexa
```

```bash
git add README.md
git commit -m "docs: links do site no ar e do repositório no README"
```

- [x] **Step 2: Scan de segredos no histórico (repo vai ser público)**

```bash
cd /home/andre/Workspace/hexa-site
git log --all --name-only --pretty=format: | sort -u | grep -iE '\.env|secret|credential|senha' || echo "nenhum arquivo suspeito"
git grep -iE '(api[_-]?key|token|senha|password|secret)\s*[:=]\s*["'"'"']?[A-Za-z0-9_/+-]{16,}' $(git rev-list --all) || echo "nenhum segredo no histórico"
```

Expected: os dois `echo` de "nenhum". Se aparecer match, LER o trecho — match em texto de piada/doc é falso positivo; segredo real = PARAR e avisar o andre antes de qualquer push.

- [x] **Step 3: Configurar remote e testar autenticação**

```bash
git remote add origin git@github.com:andrR89/cadeohexa.git
git ls-remote origin
```

Expected: `git ls-remote` responde (vazio, repo sem commits) sem erro de auth. Se der `Permission denied (publickey)`: trocar para HTTPS com `git remote set-url origin https://github.com/andrR89/cadeohexa.git` e testar de novo (pode exigir `gh auth login` — nesse caso, pedir ao andre para rodar `! gh auth login`).

- [x] **Step 4: Atualizar `main` e push**

```bash
git checkout main
git merge --ff-only dev/site
git push -u origin main
git checkout dev/site
git push -u origin dev/site
```

Expected: merge fast-forward limpo (main não tem commits próprios). Se `--ff-only` falhar, PARAR e mostrar `git log --oneline dev/site..main` ao andre — não fazer merge commit sem confirmar.

- [x] **Step 5: Verificar no GitHub**

```bash
curl -s https://api.github.com/repos/andrR89/cadeohexa | grep -E '"(default_branch|size|pushed_at)"'
```

Expected: `size` > 0 e `pushed_at` de hoje. Conferir também que o README renderiza na página do repo.

---

### Task 5: Deploy e verificação final

**Files:** nenhum (build + deploy)

- [x] **Step 1: Suíte completa + build**

```bash
npm test && npm run build
```

Expected: testes PASS, build limpo.

- [x] **Step 2: Preview local com Pages Functions**

```bash
npx wrangler pages dev dist
```

Conferir o site inteiro uma última vez (footer + gráfico animado).

- [x] **Step 3: Deploy**

```bash
npx wrangler pages deploy dist --project-name cadeohexa
```

Expected: URL de deployment no output.

- [x] **Step 4: Verificar produção**

```bash
curl -s https://cadeohexa.pages.dev | grep -o 'rodape-creditos\|andrR89' | sort -u
```

Expected: as duas strings presentes. Abrir o site e confirmar o gráfico animando.

- [x] **Step 5: Commit final de docs (se houver ajuste) e push**

```bash
git push origin dev/site main
```
