# Fliperama do Sofrimento (v4) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seção `#fliperama` com 3 mini-jogos das eliminações (2006 Amarre a
Chuteira, 2022 NÃO SOBE!, 2026 Segura, Carletto!), jogáveis em overlay
`<dialog>`, com lógica pura testada no Vitest e estatísticas locais.

**Architecture:** Toda a regra de jogo vive em `src/lib/jogos/` (funções puras,
sem DOM, RNG injetável — determinístico nos testes). A UI de cada jogo é um
chunk lazy (`import()` no COMEÇAR) que só faz DOM + rAF por cima da lógica,
seguindo o contrato `montar(el, aoTerminar) => desmontar`. A seção, os
gabinetes e o overlay ficam em `src/ui/fliperama.ts` (chunk principal, leve).
Textos 100% em `src/data/fliperama.ts`.

**Tech Stack:** Vite + TypeScript estrito (`strict`, `verbatimModuleSyntax`,
`noUnusedLocals`), Vitest, DOM + rAF (sem canvas; GSAP não é necessário nos
jogos — o rAF já dirige o estado), puppeteer-core + Chromium do sistema no E2E.

**Spec:** `docs/superpowers/specs/2026-07-10-fliperama-do-sofrimento-design.md`
(aprovada pelo andre em 11/07/2026).

**Regras do repo que valem para TODAS as tasks:**
- Branch `dev/site`; commits em português, estilo `feat(v4): ...` / `test(v4): ...`.
- Conteúdo nunca hardcoded na UI — sempre `src/data/`.
- A piada nunca espera JS pesado: jogos são chunks lazy; falha de chunk degrada com mensagem, nunca quebra a página.
- `prefers-reduced-motion`: jogos continuam jogáveis (movimento de gameplay é dirigido por JS e permanece); só animações decorativas (tremidas, transições) desligam via CSS.
- Sprites do PixelLab NÃO bloqueiam nada: tudo nasce com placeholders (emoji/formas CSS). Ver "Depois deste plano".

---

## Mapa de arquivos

| Arquivo | Papel |
|---|---|
| `src/lib/jogos/tipos.ts` (criar) | `ResultadoJogo` e o contrato `MontarJogo` |
| `src/data/fliperama.ts` (criar) | Metadados e todos os textos dos 3 jogos + textos da seção |
| `src/lib/jogos/relogio.ts` (criar) | Relógio fictício (ms reais → minuto de jogo) e formatação |
| `src/lib/jogos/chuteira.ts` (criar) | Lógica do QTE: onda triangular, zona que encolhe, timer do Henry |
| `src/lib/jogos/nao-sobe.ts` (criar) | Lógica: agenda de escapes, puxar, regra dos 3 avançados |
| `src/lib/jogos/carletto.ts` (criar) | Lógica: chuva de itens, colisão na boca, barra, trava de isca |
| `src/lib/jogos/stats.ts` (criar) | Stats locais (tentativas/vitórias) sobre um `Storage` injetado |
| `src/ui/jogos/chuteira.ts` (criar) | UI/input do QTE (chunk lazy) |
| `src/ui/jogos/nao-sobe.ts` (criar) | UI/input do top-down (chunk lazy) |
| `src/ui/jogos/carletto.ts` (criar) | UI/input do catch (chunk lazy) |
| `src/ui/fliperama.ts` (criar) | Seção, gabinetes, overlay `<dialog>`, fluxo fim de partida |
| `index.html` (modificar) | `<section id="fliperama">` entre `#profecia` e `#quiz` |
| `src/data/secoes.ts` (modificar) | Bolinha da nav |
| `src/main.ts` (modificar) | `montarFliperama(...)` |
| `src/styles/main.css` (modificar) | Estética arcade (scanlines, gabinetes, overlay, jogos) |
| `scripts/verificar-fliperama.mjs` (criar) | E2E headless (padrão da v3.2) |
| `tests/fliperama.test.ts`, `tests/fliperama-ui.test.ts`, `tests/jogos/*.test.ts` (criar) | Vitest |

Convenções dos módulos de lógica: coordenadas normalizadas 0..1; tempo é o
`tMs` da partida (a UI passa o tempo do `criarCronometro` de relogio.ts —
delta clampado por quadro, pra aba em segundo plano congelar o jogo); `resultado` é
`'vitoria' | 'derrota' | null` e, uma vez definido, nunca muda.

---

### Task 1: Tipos e dados dos jogos

**Files:**
- Create: `src/lib/jogos/tipos.ts`
- Create: `src/data/fliperama.ts`
- Test: `tests/fliperama.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/fliperama.test.ts
import { expect, test } from 'vitest'
import { JOGOS, LEGENDA_SECAO, RODAPE_SECAO, TITULO_SECAO, textoStats } from '../src/data/fliperama'

test('são exatamente os 3 jogos da spec, na ordem cronológica', () => {
  expect(JOGOS.map((j) => j.id)).toEqual(['chuteira', 'nao-sobe', 'carletto'])
  expect(JOGOS.map((j) => j.ano)).toEqual([2006, 2022, 2026])
})

test('todo jogo tem os textos completos — derrota E "e se..." (regra de ouro da spec)', () => {
  for (const j of JOGOS) {
    for (const texto of [j.titulo, j.icone, j.chamada, j.instrucoes,
      j.derrota.titulo, j.derrota.texto, j.eSe.titulo, j.eSe.texto]) {
      expect(texto.trim().length, `${j.id}`).toBeGreaterThan(0)
    }
    expect(j.derrota.texto).not.toBe(j.eSe.texto)
  }
})

test('a placa de derrota é solene e a de vitória cobra o preço', () => {
  for (const j of JOGOS) expect(j.derrota.titulo).toBe('A HISTÓRIA SE REPETE')
  expect(JOGOS[2].eSe.texto).toContain('doping mandibular')
})

test('textos da seção e linha de stats', () => {
  expect(TITULO_SECAO).toBe('Fliperama do Sofrimento')
  expect(LEGENDA_SECAO).toContain('Você não vai conseguir')
  expect(RODAPE_SECAO).toContain('98,7%')
  expect(textoStats(3, 1)).toBe('Suas tentativas: 3 · Histórias reescritas: 1')
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/fliperama.test.ts`
Expected: FAIL — `Cannot find module '../src/data/fliperama'`

- [ ] **Step 3: Implementar tipos e dados**

```ts
// src/lib/jogos/tipos.ts
/** Contrato comum dos mini-jogos do Fliperama. */
export type ResultadoJogo = 'vitoria' | 'derrota'

/** Monta o jogo dentro de `el` e chama `aoTerminar` UMA única vez ao fim da
 * partida. Retorna a função de desmontagem (cancela rAF e listeners); ela
 * precisa ser idempotente — o overlay a chama defensivamente ao fechar,
 * inclusive no meio da partida (Esc). */
export type MontarJogo = (
  el: HTMLElement,
  aoTerminar: (resultado: ResultadoJogo) => void,
) => () => void
```

```ts
// src/data/fliperama.ts
export type IdJogo = 'chuteira' | 'nao-sobe' | 'carletto'

export interface PlacaFim {
  titulo: string
  texto: string
}

export interface JogoFliperama {
  id: IdJogo
  ano: number
  titulo: string
  icone: string // emoji placeholder até os sprites do PixelLab
  chamada: string // uma linha no gabinete
  instrucoes: string // tela de instruções, antes do COMEÇAR
  derrota: PlacaFim
  eSe: PlacaFim
}

export const TITULO_SECAO = 'Fliperama do Sofrimento'
export const LEGENDA_SECAO = 'Reescreva a história. (Você não vai conseguir.)'
export const RODAPE_SECAO = '98,7% do país também não conseguiu.'

export function textoStats(tentativas: number, vitorias: number): string {
  return `Suas tentativas: ${tentativas} · Histórias reescritas: ${vitorias}`
}

export const JOGOS: readonly JogoFliperama[] = [
  {
    id: 'chuteira',
    ano: 2006,
    titulo: 'Amarre a Chuteira',
    icone: '👟',
    chamada: 'Quatro ilhoses entre o Roberto Carlos e a paz.',
    instrucoes:
      'França, 2006. O cruzamento vem aí e a chuteira está aberta. Aperte ' +
      'AMARRAR (toque ou espaço) quando o marcador estiver na zona dourada — ' +
      'são quatro ilhoses, e a zona encolhe a cada um. Se errar, o cadarço ' +
      'arrebenta e o ilhós recomeça. O Henry não recomeça.',
    derrota: {
      titulo: 'A HISTÓRIA SE REPETE',
      texto:
        'O cadarço arrebentou e o Henry apareceu sozinho no segundo pau. ' +
        'Ele ainda estava agachado. Foi a única finalização no gol em 90 ' +
        'minutos — e bastou.',
    },
    eSe: {
      titulo: 'E SE...',
      texto:
        'Chuteira amarrada, cruzamento cortado. O Brasil ainda perdeu — uma ' +
        'finalização em 90 minutos não se resolve com cadarço. Mas o Roberto ' +
        'Carlos dormiu em paz.',
    },
  },
  {
    id: 'nao-sobe',
    ano: 2022,
    titulo: 'NÃO SOBE!',
    icone: '⛔',
    chamada: 'Prorrogação contra a Croácia. Ninguém. Sobe.',
    instrucoes:
      'Prorrogação, Brasil 1×0 na Croácia. A regra é uma: NÃO SOBE. Toque ' +
      '(ou Tab + Enter) em cada jogador que escapar pro ataque pra puxá-lo ' +
      'de volta. Três na frente ao mesmo tempo e vem o contra-ataque. ' +
      'Segure até os 120 minutos — no fim, até o goleiro tenta.',
    derrota: {
      titulo: 'A HISTÓRIA SE REPETE',
      texto:
        "Subiram. Contra-ataque, empate aos 117'. Nos pênaltis, o 5º " +
        'cobrador nunca foi chamado. Ele ainda aquece até hoje.',
    },
    eSe: {
      titulo: 'E SE...',
      texto:
        'Seguraram o 1×0! Classificados... e na semifinal, a Argentina do ' +
        'Messi. O universo cobra caro por reescrever a história.',
    },
  },
  {
    id: 'carletto',
    ano: 2026,
    titulo: 'Segura, Carletto!',
    icone: '🍬',
    chamada: 'A Teoria do Chiclete: a Seleção só joga enquanto ele masca.',
    instrucoes:
      'Oitavas, Brasil × Noruega. A ciência é clara: a Seleção só joga ' +
      'enquanto o Ancelotti masca. Arraste o Carletto (ou use ← →) pra ' +
      'aparar com a boca os chicletes arremessados do banco. Chiclete no ' +
      'gramado derruba o DESEMPENHO DA SELEÇÃO; pastilha de menta e ' +
      'bandeirinha da Noruega travam o mister por um segundo. Barra zerada, ' +
      'o Haaland marca. Aguente até os 90+10.',
    derrota: {
      titulo: 'A HISTÓRIA SE REPETE',
      texto:
        'O último chiclete caiu no gramado e, com ele, o Brasil. Sem ' +
        'chiclete não houve posse de bola; sem posse de bola não houve ' +
        'vontade. Haaland fez dois. Vinícius Jr., escalado para o pênalti ' +
        'aos 14 minutos, foi visto se posicionando atrás do bandeirinha. O ' +
        'gol de honra saiu aos 90+10, quando a torcida norueguesa já ' +
        'ensaiava a terceira remada viking da noite. Neymar se aposentou ' +
        'ali mesmo, no vestiário. Descanse em paz, desempenho da Seleção: ' +
        'você dependia de uma goma de mascar.',
    },
    eSe: {
      titulo: 'E SE...',
      texto:
        'E se o preparador físico tivesse mira? Nesta realidade, o ' +
        'Ancelotti não fica sem chiclete um segundo sequer: o Brasil tem ' +
        '71% de posse, Vinícius Jr. PEDE para bater o pênalti aos 14 e ' +
        'converte, e Haaland termina o jogo pedindo a camisa — e um ' +
        'tablete. O hexa vem. O preço: a FIFA abre investigação inédita ' +
        "por 'doping mandibular', o chiclete campeão é leiloado por R$ 2,3 " +
        'milhões (já mascado) e o Neymar, empolgado, desfaz a ' +
        'aposentadoria e se anuncia titular para 2030. Toda vitória cobra ' +
        'seu preço.',
    },
  },
]
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/fliperama.test.ts`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/jogos/tipos.ts src/data/fliperama.ts tests/fliperama.test.ts
git commit -m "feat(v4): dados e contrato dos 3 jogos do Fliperama do Sofrimento"
```

---

### Task 2: Relógio fictício

**Files:**
- Create: `src/lib/jogos/relogio.ts`
- Test: `tests/jogos/relogio.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/jogos/relogio.test.ts
import { expect, test } from 'vitest'
import { formatarMinuto, minutoFicticio } from '../../src/lib/jogos/relogio'

test('minutoFicticio mapeia linearmente e clampa nas pontas', () => {
  expect(minutoFicticio(0, 20000, 105, 120)).toBe(105)
  expect(minutoFicticio(10000, 20000, 105, 120)).toBe(112) // floor(112,5)
  expect(minutoFicticio(20000, 20000, 105, 120)).toBe(120)
  expect(minutoFicticio(99999, 20000, 105, 120)).toBe(120)
  expect(minutoFicticio(-50, 20000, 105, 120)).toBe(105)
})

test('formatarMinuto: prorrogação é minuto puro; acréscimo usa 90+X', () => {
  expect(formatarMinuto(73)).toBe("73'")
  expect(formatarMinuto(112)).toBe("112'")
  expect(formatarMinuto(90, 90)).toBe("90'")
  expect(formatarMinuto(95, 90)).toBe("90+5'")
  expect(formatarMinuto(100, 90)).toBe("90+10'")
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/jogos/relogio.test.ts`
Expected: FAIL — módulo inexistente

- [ ] **Step 3: Implementar**

```ts
// src/lib/jogos/relogio.ts
/** Relógio fictício: converte o tempo real da partida (ms) no minuto de jogo,
 * linear e clampado nas pontas. */
export function minutoFicticio(
  tMs: number,
  duracaoMs: number,
  minutoInicial: number,
  minutoFinal: number,
): number {
  const fracao = Math.min(Math.max(tMs / duracaoMs, 0), 1)
  return Math.floor(minutoInicial + fracao * (minutoFinal - minutoInicial))
}

/** "73'"; com `acrescimoApos` (ex.: 90), minutos além dele viram "90+X'" —
 * é o caso do Carletto (0'→90+10'). A prorrogação do NÃO SOBE! não passa o
 * segundo argumento e mostra "112'" direto. */
export function formatarMinuto(minuto: number, acrescimoApos?: number): string {
  if (acrescimoApos !== undefined && minuto > acrescimoApos) {
    return `${acrescimoApos}+${minuto - acrescimoApos}'`
  }
  return `${minuto}'`
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/jogos/relogio.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/jogos/relogio.ts tests/jogos/relogio.test.ts
git commit -m "feat(v4): relógio fictício dos mini-jogos"
```

---

### Task 3: Lógica — Amarre a Chuteira

**Files:**
- Create: `src/lib/jogos/chuteira.ts`
- Test: `tests/jogos/chuteira.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/jogos/chuteira.test.ts
import { expect, test } from 'vitest'
import { criarChuteira, dentroDaZona, posicaoMarcador } from '../../src/lib/jogos/chuteira'

test('marcador oscila em onda triangular 0→1→0', () => {
  expect(posicaoMarcador(0, 1100)).toBe(0)
  expect(posicaoMarcador(275, 1100)).toBe(0.5)
  expect(posicaoMarcador(550, 1100)).toBe(1)
  expect(posicaoMarcador(825, 1100)).toBe(0.5)
  expect(posicaoMarcador(1100, 1100)).toBe(0)
})

test('zona de acerto é centrada no meio do trilho', () => {
  expect(dentroDaZona(0.5, 0)).toBe(true)
  expect(dentroDaZona(0.68, 0.18)).toBe(true)
  expect(dentroDaZona(0.69, 0.18)).toBe(false)
})

test('4 acertos no centro vencem antes do Henry', () => {
  const jogo = criarChuteira()
  const periodo = jogo.config.periodoMs
  for (let i = 0; i < 4; i++) {
    // periodo/4 + i*periodo: o marcador está exatamente no centro (0,5)
    expect(jogo.apertar(periodo / 4 + i * periodo)).toBe('acerto')
  }
  expect(jogo.estado()).toEqual({ ilhos: 4, resultado: 'vitoria' })
})

test('erro não avança o ilhós — o cadarço arrebenta mas o jogo segue', () => {
  const jogo = criarChuteira()
  expect(jogo.apertar(0)).toBe('erro') // marcador em 0, longe do centro
  expect(jogo.estado()).toEqual({ ilhos: 0, resultado: null })
})

test('Henry chegando é derrota, e depois disso nada mais acontece', () => {
  const jogo = criarChuteira()
  jogo.tick(jogo.config.duracaoHenryMs)
  expect(jogo.estado().resultado).toBe('derrota')
  expect(jogo.apertar(jogo.config.duracaoHenryMs + 100)).toBe(null)
})

test('vitória não é sobrescrita por um tick tardio do Henry', () => {
  const jogo = criarChuteira()
  const periodo = jogo.config.periodoMs
  for (let i = 0; i < 4; i++) jogo.apertar(periodo / 4 + i * periodo)
  jogo.tick(99999)
  expect(jogo.estado().resultado).toBe('vitoria')
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/jogos/chuteira.test.ts`
Expected: FAIL — módulo inexistente

- [ ] **Step 3: Implementar**

```ts
// src/lib/jogos/chuteira.ts
import type { ResultadoJogo } from './tipos'

export interface ConfigChuteira {
  ilhoses: number
  duracaoHenryMs: number // o Henry atravessa o fundo em ~12s: timer global
  periodoMs: number // ida e volta completa do marcador
  meiasLarguras: number[] // zona de acerto por ilhós — encolhe a cada um
}

export const CONFIG_CHUTEIRA: ConfigChuteira = {
  ilhoses: 4,
  duracaoHenryMs: 12000,
  periodoMs: 1100,
  meiasLarguras: [0.18, 0.13, 0.09, 0.06],
}

/** Posição do marcador no trilho (0..1), onda triangular: sobe na primeira
 * metade do período, volta na segunda. */
export function posicaoMarcador(tMs: number, periodoMs: number): number {
  const fase = (tMs % periodoMs) / periodoMs
  return fase < 0.5 ? fase * 2 : (1 - fase) * 2
}

/** A zona de acerto é centrada no meio do trilho. O epsilon absorve o erro de
 * ponto flutuante na borda (0,68 − 0,5 = 0,18000000000000005 > 0,18). */
export function dentroDaZona(posicao: number, meiaLargura: number): boolean {
  return Math.abs(posicao - 0.5) <= meiaLargura + 1e-9
}

export interface Chuteira {
  config: ConfigChuteira
  estado(): { ilhos: number; resultado: ResultadoJogo | null }
  /** Chamar a cada frame: o Henry chegando trava a derrota. */
  tick(tMs: number): void
  /** Aperto do jogador no instante tMs. Erro = "cadarço arrebenta": só
   * visual na UI — logicamente o ilhós continua o mesmo e o Henry segue. */
  apertar(tMs: number): 'acerto' | 'erro' | null
}

export function criarChuteira(config: Partial<ConfigChuteira> = {}): Chuteira {
  const cfg = { ...CONFIG_CHUTEIRA, ...config }
  let ilhos = 0
  let resultado: ResultadoJogo | null = null

  function tick(tMs: number): void {
    if (resultado === null && tMs >= cfg.duracaoHenryMs) resultado = 'derrota'
  }

  return {
    config: cfg,
    estado: () => ({ ilhos, resultado }),
    tick,
    apertar(tMs) {
      tick(tMs)
      if (resultado !== null) return null
      if (dentroDaZona(posicaoMarcador(tMs, cfg.periodoMs), cfg.meiasLarguras[ilhos])) {
        ilhos++
        if (ilhos >= cfg.ilhoses) resultado = 'vitoria'
        return 'acerto'
      }
      return 'erro'
    },
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/jogos/chuteira.test.ts`
Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/jogos/chuteira.ts tests/jogos/chuteira.test.ts
git commit -m "feat(v4): lógica do Amarre a Chuteira — QTE de timing com zona que encolhe"
```

---

### Task 4: Lógica — NÃO SOBE!

**Files:**
- Create: `src/lib/jogos/nao-sobe.ts`
- Test: `tests/jogos/nao-sobe.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/jogos/nao-sobe.test.ts
import { expect, test } from 'vitest'
import { CONFIG_NAO_SOBE, criarNaoSobe, gerarEscapes, type ConfigNaoSobe } from '../../src/lib/jogos/nao-sobe'

const CFG: ConfigNaoSobe = {
  ...CONFIG_NAO_SOBE,
  jogadores: 5,
  duracaoMs: 10000,
  limiteAvancados: 3,
}

test('puxar de volta segura o time e o apito final é vitória', () => {
  const jogo = criarNaoSobe(CFG, [
    { tMs: 1000, jogador: 0 },
    { tMs: 2000, jogador: 1 },
    { tMs: 3000, jogador: 2 },
  ])
  expect(jogo.tick(2500)).toEqual([0, 1])
  expect(jogo.estado().resultado).toBe(null)
  expect(jogo.puxar(0)).toBe(true)
  expect(jogo.avancados()).toEqual([1])
  jogo.tick(3000)
  expect(jogo.avancados()).toEqual([1, 2])
  jogo.tick(10000)
  expect(jogo.estado().resultado).toBe('vitoria')
})

test('3 avançados ao mesmo tempo = contra-ataque = derrota', () => {
  const jogo = criarNaoSobe(CFG, [
    { tMs: 1000, jogador: 0 },
    { tMs: 2000, jogador: 1 },
    { tMs: 3000, jogador: 2 },
  ])
  jogo.tick(5000)
  expect(jogo.estado().resultado).toBe('derrota')
  expect(jogo.puxar(0)).toBe(false) // tarde demais
  expect(jogo.tick(6000)).toEqual([])
})

test('sorteado que já subiu escapa como o próximo da defesa (circular)', () => {
  const jogo = criarNaoSobe(CFG, [
    { tMs: 1000, jogador: 3 },
    { tMs: 2000, jogador: 3 },
  ])
  expect(jogo.tick(1000)).toEqual([3])
  expect(jogo.tick(2000)).toEqual([4])
})

test('puxar quem está na defesa não faz nada', () => {
  const jogo = criarNaoSobe(CFG, [])
  expect(jogo.puxar(0)).toBe(false)
})

test('gerarEscapes: frequência cresce e o goleiro só aparece no quarto final', () => {
  const escapes = gerarEscapes(CONFIG_NAO_SOBE, () => 0.99)
  expect(escapes.length).toBeGreaterThan(5)
  for (let i = 1; i < escapes.length; i++) {
    const anterior = escapes[i - 1].tMs
    expect(escapes[i].tMs).toBeGreaterThan(anterior)
    if (i >= 2) {
      // intervalos encolhem: dificuldade crescente
      expect(escapes[i].tMs - anterior).toBeLessThan(anterior - escapes[i - 2].tMs)
    }
    expect(escapes[i].tMs).toBeLessThan(CONFIG_NAO_SOBE.duracaoMs)
  }
  const goleiro = CONFIG_NAO_SOBE.jogadores - 1
  for (const e of escapes) {
    if (e.jogador === goleiro) {
      expect(e.tMs).toBeGreaterThan(CONFIG_NAO_SOBE.duracaoMs * 0.75)
    }
  }
  // com rng 0,99 o goleiro é sorteado assim que entra na roleta
  expect(escapes.some((e) => e.jogador === goleiro)).toBe(true)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/jogos/nao-sobe.test.ts`
Expected: FAIL — módulo inexistente

- [ ] **Step 3: Implementar**

```ts
// src/lib/jogos/nao-sobe.ts
import type { ResultadoJogo } from './tipos'

export interface ConfigNaoSobe {
  jogadores: number // o ÚLTIMO índice é o goleiro
  duracaoMs: number
  minutoInicial: number
  minutoFinal: number
  limiteAvancados: number // 3 na frente ao mesmo tempo = contra-ataque
  intervaloInicialMs: number
  intervaloFinalMs: number
}

export const CONFIG_NAO_SOBE: ConfigNaoSobe = {
  jogadores: 10,
  duracaoMs: 20000,
  minutoInicial: 105,
  minutoFinal: 120,
  limiteAvancados: 3,
  intervaloInicialMs: 2400,
  intervaloFinalMs: 750,
}

export interface EventoEscape {
  tMs: number
  jogador: number
}

/** Agenda de escapes com intervalo encolhendo linearmente (frequência
 * crescente). O goleiro (último índice) só entra no sorteio no quarto final —
 * "no fim, até o goleiro vai". `rng` retorna 0..1; nos testes, injete uma
 * função fixa. */
export function gerarEscapes(cfg: ConfigNaoSobe, rng: () => number): EventoEscape[] {
  const eventos: EventoEscape[] = []
  let t = cfg.intervaloInicialMs
  while (t < cfg.duracaoMs) {
    const progresso = t / cfg.duracaoMs
    const sorteaveis = progresso > 0.75 ? cfg.jogadores : cfg.jogadores - 1
    eventos.push({ tMs: t, jogador: Math.floor(rng() * sorteaveis) })
    t += cfg.intervaloInicialMs + progresso * (cfg.intervaloFinalMs - cfg.intervaloInicialMs)
  }
  return eventos
}

export interface NaoSobe {
  /** Avança a simulação até tMs; retorna quem escapou neste tick. */
  tick(tMs: number): number[]
  /** Puxa o jogador de volta pra defesa. False se ele já estava lá ou se o jogo acabou. */
  puxar(jogador: number): boolean
  avancados(): number[]
  estado(): { resultado: ResultadoJogo | null }
}

export function criarNaoSobe(cfg: ConfigNaoSobe, escapes: EventoEscape[]): NaoSobe {
  const subiu: boolean[] = new Array(cfg.jogadores).fill(false)
  let proximo = 0
  let resultado: ResultadoJogo | null = null

  const avancados = (): number[] => subiu.flatMap((s, j) => (s ? [j] : []))

  /** O sorteado pode já estar na frente: escapa o próximo da defesa, em busca
   * circular — a pressão do jogo não diminui porque o sorteio repetiu. */
  function escapar(sorteado: number): number | null {
    for (let k = 0; k < cfg.jogadores; k++) {
      const j = (sorteado + k) % cfg.jogadores
      if (!subiu[j]) {
        subiu[j] = true
        return j
      }
    }
    return null
  }

  return {
    avancados,
    estado: () => ({ resultado }),
    tick(tMs) {
      if (resultado !== null) return []
      const escaparam: number[] = []
      while (proximo < escapes.length && escapes[proximo].tMs <= tMs) {
        const j = escapar(escapes[proximo].jogador)
        proximo++
        if (j !== null) escaparam.push(j)
        if (avancados().length >= cfg.limiteAvancados) {
          resultado = 'derrota'
          return escaparam
        }
      }
      if (tMs >= cfg.duracaoMs) resultado = 'vitoria'
      return escaparam
    },
    puxar(jogador) {
      if (resultado !== null || !subiu[jogador]) return false
      subiu[jogador] = false
      return true
    },
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/jogos/nao-sobe.test.ts`
Expected: PASS (5 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/jogos/nao-sobe.ts tests/jogos/nao-sobe.test.ts
git commit -m "feat(v4): lógica do NÃO SOBE! — escapes crescentes e regra dos 3 avançados"
```

---

### Task 5: Lógica — Segura, Carletto!

**Files:**
- Create: `src/lib/jogos/carletto.ts`
- Test: `tests/jogos/carletto.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/jogos/carletto.test.ts
import { expect, test } from 'vitest'
import {
  CONFIG_CARLETTO, criarCarletto, gerarItens, yDoItem,
  type ConfigCarletto, type ItemQueda,
} from '../../src/lib/jogos/carletto'

const CFG: ConfigCarletto = {
  ...CONFIG_CARLETTO,
  duracaoMs: 10000,
  quedaMs: 1000,
  yBoca: 0.8,
  raioBoca: 0.1,
  barraInicial: 50,
  ganhoCaptura: 10,
  perdaChao: 20,
  travaMs: 1000,
}

const chiclete = (id: number, x: number, tSpawnMs: number): ItemQueda =>
  ({ id, tipo: 'chiclete', x, tSpawnMs, duracaoQuedaMs: 1000 })

test('chiclete na boca enche a barra; capturado some do ar e não cai no chão', () => {
  const jogo = criarCarletto(CFG, [chiclete(0, 0.5, 0)])
  expect(jogo.noAr(500).map((i) => i.id)).toEqual([0])
  const eventos = jogo.tick(800, 0.5) // y = 0,8 = linha da boca
  expect(eventos.capturados.map((i) => i.id)).toEqual([0])
  expect(jogo.barra()).toBe(60)
  expect(jogo.noAr(900)).toEqual([])
  expect(jogo.tick(1100, 0.5).noChao).toEqual([])
})

test('chiclete no gramado esvazia a barra — e a decisão na boca é única', () => {
  const jogo = criarCarletto(CFG, [chiclete(0, 0.9, 0)])
  jogo.tick(800, 0.2) // longe: escapou
  expect(jogo.barra()).toBe(50)
  const eventos = jogo.tick(1000, 0.9) // mover depois não conserta
  expect(eventos.noChao.map((i) => i.id)).toEqual([0])
  expect(jogo.barra()).toBe(30)
})

test('isca capturada trava o Carletto e o chiclete seguinte escapa', () => {
  const itens: ItemQueda[] = [
    { id: 0, tipo: 'menta', x: 0.5, tSpawnMs: 0, duracaoQuedaMs: 1000 },
    chiclete(1, 0.5, 500),
  ]
  const jogo = criarCarletto(CFG, itens)
  jogo.tick(800, 0.5) // pega a menta: trava até 1800
  expect(jogo.travadoAte()).toBe(1800)
  expect(jogo.barra()).toBe(50) // isca não mexe na barra
  jogo.tick(1300, 0.5) // chiclete cruza a boca travada: escapa
  const eventos = jogo.tick(1500, 0.5)
  expect(eventos.noChao.map((i) => i.id)).toEqual([1])
  expect(jogo.barra()).toBe(30)
})

test('isca no gramado não faz nada', () => {
  const jogo = criarCarletto(CFG, [{ id: 0, tipo: 'bandeira', x: 0.5, tSpawnMs: 0, duracaoQuedaMs: 1000 }])
  jogo.tick(800, 0.0)
  jogo.tick(1000, 0.0)
  expect(jogo.barra()).toBe(50)
  expect(jogo.estado().resultado).toBe(null)
})

test('barra zerada = Haaland marca na hora; sobreviver com barra = e se...', () => {
  const derrotado = criarCarletto({ ...CFG, barraInicial: 20 }, [chiclete(0, 0.9, 0)])
  derrotado.tick(800, 0.0)
  derrotado.tick(1000, 0.0)
  expect(derrotado.barra()).toBe(0)
  expect(derrotado.estado().resultado).toBe('derrota')

  const vencedor = criarCarletto(CFG, [])
  vencedor.tick(10000, 0.5)
  expect(vencedor.estado().resultado).toBe('vitoria')
})

test('barra tem teto em 100', () => {
  const jogo = criarCarletto({ ...CFG, barraInicial: 95 }, [chiclete(0, 0.5, 0)])
  jogo.tick(800, 0.5)
  expect(jogo.barra()).toBe(100)
})

test('gerarItens: ordenado, e dos 70 minutos em diante caem dois por vez', () => {
  const cfg: ConfigCarletto = { ...CFG, chanceIsca: 0, intervaloInicialMs: 1000, intervaloFinalMs: 1000 }
  const itens = gerarItens(cfg, () => 0.5)
  const tDupla = (cfg.minutoChuvaDupla / cfg.minutoFinal) * cfg.duracaoMs
  for (let i = 1; i < itens.length; i++) {
    expect(itens[i].tSpawnMs).toBeGreaterThanOrEqual(itens[i - 1].tSpawnMs)
  }
  const porSpawn = new Map<number, number>()
  for (const item of itens) porSpawn.set(item.tSpawnMs, (porSpawn.get(item.tSpawnMs) ?? 0) + 1)
  for (const [t, quantos] of porSpawn) {
    expect(quantos, `spawn em ${t}`).toBe(t >= tDupla ? 2 : 1)
  }
  // todo item tem tempo de chegar ao chão antes do apito
  const ultimo = itens[itens.length - 1]
  expect(ultimo.tSpawnMs + ultimo.duracaoQuedaMs).toBeLessThanOrEqual(cfg.duracaoMs)
})

test('gerarItens respeita a chance de isca', () => {
  const soIscas = gerarItens({ ...CFG, chanceIsca: 1 }, () => 0.4)
  // com rng 0,4 < 0,5 a isca sorteada é a menta; as duplas da reta final são sempre chiclete
  expect(soIscas.filter((i) => i.tipo === 'menta').length).toBeGreaterThan(0)
  expect(soIscas.filter((i) => i.tipo === 'bandeira')).toEqual([])
  const soChicletes = gerarItens({ ...CFG, chanceIsca: 0 }, () => 0.4)
  expect(soChicletes.every((i) => i.tipo === 'chiclete')).toBe(true)
})

test('yDoItem: 0 no spawn, 1 no chão', () => {
  const item = chiclete(0, 0.5, 2000)
  expect(yDoItem(item, 2000)).toBe(0)
  expect(yDoItem(item, 2500)).toBe(0.5)
  expect(yDoItem(item, 3000)).toBe(1)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/jogos/carletto.test.ts`
Expected: FAIL — módulo inexistente

- [ ] **Step 3: Implementar**

```ts
// src/lib/jogos/carletto.ts
import type { ResultadoJogo } from './tipos'

export type TipoItem = 'chiclete' | 'menta' | 'bandeira'

export interface ItemQueda {
  id: number
  tipo: TipoItem
  x: number // 0..1 na linha lateral
  tSpawnMs: number
  duracaoQuedaMs: number
}

export interface ConfigCarletto {
  duracaoMs: number
  minutoFinal: number // 100 = 90+10
  intervaloInicialMs: number
  intervaloFinalMs: number
  quedaMs: number
  yBoca: number // fração da queda em que a boca decide
  raioBoca: number
  barraInicial: number // 0..100
  ganhoCaptura: number
  perdaChao: number
  travaMs: number // isca na boca: cara de decepção por 1s
  chanceIsca: number
  minutoChuvaDupla: number // dos 70' em diante caem dois por vez
}

export const CONFIG_CARLETTO: ConfigCarletto = {
  duracaoMs: 25000,
  minutoFinal: 100,
  intervaloInicialMs: 1500,
  intervaloFinalMs: 750,
  quedaMs: 1600,
  yBoca: 0.8,
  raioBoca: 0.09,
  barraInicial: 50,
  ganhoCaptura: 14,
  perdaChao: 18,
  travaMs: 1000,
  chanceIsca: 0.18,
  minutoChuvaDupla: 70,
}

/** Altura da queda em tMs: 0 = arremesso, 1 = gramado. */
export function yDoItem(item: ItemQueda, tMs: number): number {
  return (tMs - item.tSpawnMs) / item.duracaoQuedaMs
}

/** Chuva de itens ORDENADA por tSpawnMs (criarCarletto depende disso):
 * intervalos encolhem linearmente; a partir de minutoChuvaDupla cai um
 * segundo chiclete junto, em outra posição. `rng` retorna 0..1. */
export function gerarItens(cfg: ConfigCarletto, rng: () => number): ItemQueda[] {
  const itens: ItemQueda[] = []
  const tDupla = (cfg.minutoChuvaDupla / cfg.minutoFinal) * cfg.duracaoMs
  let id = 0
  for (let t = 700; t + cfg.quedaMs <= cfg.duracaoMs; ) {
    const tipo: TipoItem =
      rng() < cfg.chanceIsca ? (rng() < 0.5 ? 'menta' : 'bandeira') : 'chiclete'
    itens.push({ id: id++, tipo, x: rng(), tSpawnMs: t, duracaoQuedaMs: cfg.quedaMs })
    if (t >= tDupla) {
      itens.push({ id: id++, tipo: 'chiclete', x: rng(), tSpawnMs: t, duracaoQuedaMs: cfg.quedaMs })
    }
    const progresso = t / cfg.duracaoMs
    t += cfg.intervaloInicialMs + progresso * (cfg.intervaloFinalMs - cfg.intervaloInicialMs)
  }
  return itens
}

export interface EventosTick {
  capturados: ItemQueda[]
  noChao: ItemQueda[]
}

export interface Carletto {
  /** Avança a simulação até tMs com a boca em xBoca. A decisão de cada item
   * acontece UMA vez, no frame em que ele cruza a linha da boca —
   * determinístico mesmo com frame rate irregular. */
  tick(tMs: number, xBoca: number): EventosTick
  /** Itens visíveis (arremessados e ainda sem chegar ao chão nem à boca certa). */
  noAr(tMs: number): ItemQueda[]
  barra(): number
  /** Instante (tMs) até o qual o Carletto está travado por uma isca. */
  travadoAte(): number
  estado(): { resultado: ResultadoJogo | null }
}

export function criarCarletto(cfg: ConfigCarletto, itens: ItemQueda[]): Carletto {
  let barra = cfg.barraInicial
  let travadoAteMs = -1
  let resultado: ResultadoJogo | null = null
  const situacao = new Map<number, 'capturado' | 'escapou' | 'chao'>()

  return {
    barra: () => barra,
    travadoAte: () => travadoAteMs,
    estado: () => ({ resultado }),
    noAr: (tMs) =>
      itens.filter((item) => {
        const y = yDoItem(item, tMs)
        return y >= 0 && y < 1 && situacao.get(item.id) !== 'capturado'
      }),
    tick(tMs, xBoca) {
      const eventos: EventosTick = { capturados: [], noChao: [] }
      if (resultado !== null) return eventos
      for (const item of itens) {
        if (item.tSpawnMs > tMs) break // itens ordenados por tSpawnMs
        const y = yDoItem(item, tMs)
        if (situacao.get(item.id) === undefined && y >= cfg.yBoca) {
          const travado = tMs < travadoAteMs
          if (!travado && Math.abs(item.x - xBoca) <= cfg.raioBoca) {
            situacao.set(item.id, 'capturado')
            eventos.capturados.push(item)
            if (item.tipo === 'chiclete') barra = Math.min(100, barra + cfg.ganhoCaptura)
            else travadoAteMs = tMs + cfg.travaMs // isca na boca: decepção
          } else {
            situacao.set(item.id, 'escapou')
          }
        }
        if (situacao.get(item.id) === 'escapou' && y >= 1) {
          situacao.set(item.id, 'chao')
          eventos.noChao.push(item)
          if (item.tipo === 'chiclete') barra = Math.max(0, barra - cfg.perdaChao)
        }
      }
      if (barra <= 0) resultado = 'derrota' // Haaland marca na hora
      else if (tMs >= cfg.duracaoMs) resultado = 'vitoria'
      return eventos
    },
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/jogos/carletto.test.ts`
Expected: PASS (9 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/jogos/carletto.ts tests/jogos/carletto.test.ts
git commit -m "feat(v4): lógica do Segura, Carletto! — chuva de chicletes, iscas e barra"
```

---

### Task 6: Stats locais

**Files:**
- Create: `src/lib/jogos/stats.ts`
- Test: `tests/jogos/stats.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/jogos/stats.test.ts
import { expect, test } from 'vitest'
import { CHAVE_STATS, lerStats, registrarPartida } from '../../src/lib/jogos/stats'

function storageFake(inicial: Record<string, string> = {}) {
  const mapa = new Map(Object.entries(inicial))
  return {
    getItem: (chave: string) => mapa.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void mapa.set(chave, valor),
  }
}

test('storage vazio = stats zeradas', () => {
  expect(lerStats(storageFake())).toEqual({})
})

test('registrarPartida acumula tentativas e vitórias por jogo', () => {
  const storage = storageFake()
  expect(registrarPartida(storage, 'chuteira', 'derrota')).toEqual({
    chuteira: { tentativas: 1, vitorias: 0 },
  })
  registrarPartida(storage, 'chuteira', 'vitoria')
  registrarPartida(storage, 'carletto', 'derrota')
  expect(lerStats(storage)).toEqual({
    chuteira: { tentativas: 2, vitorias: 1 },
    carletto: { tentativas: 1, vitorias: 0 },
  })
})

test('JSON corrompido não derruba o jogo — stats voltam zeradas', () => {
  const storage = storageFake({ [CHAVE_STATS]: '{isso não é json' })
  expect(lerStats(storage)).toEqual({})
})

test('storage que lança (modo privado/bloqueado) também não derruba', () => {
  const quebrado = {
    getItem: (): string | null => {
      throw new Error('bloqueado')
    },
    setItem: (): void => {
      throw new Error('bloqueado')
    },
  }
  expect(lerStats(quebrado)).toEqual({})
  expect(registrarPartida(quebrado, 'chuteira', 'vitoria')).toEqual({
    chuteira: { tentativas: 1, vitorias: 1 },
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/jogos/stats.test.ts`
Expected: FAIL — módulo inexistente

- [ ] **Step 3: Implementar**

```ts
// src/lib/jogos/stats.ts
import type { ResultadoJogo } from './tipos'

export interface StatsJogo {
  tentativas: number
  vitorias: number
}

export type StatsFliperama = Record<string, StatsJogo>

export const CHAVE_STATS = 'fliperama-stats-v1'

/** Só o que usamos de Storage — a UI passa o localStorage, os testes um fake. */
type StorageMinimo = Pick<Storage, 'getItem' | 'setItem'>

export function lerStats(storage: StorageMinimo): StatsFliperama {
  try {
    const bruto = storage.getItem(CHAVE_STATS)
    if (!bruto) return {}
    const dado: unknown = JSON.parse(bruto)
    return typeof dado === 'object' && dado !== null ? (dado as StatsFliperama) : {}
  } catch {
    return {} // JSON corrompido ou storage bloqueado: o jogo não quebra por estatística
  }
}

/** Registra uma partida TERMINADA (partida abandonada no Esc não conta). */
export function registrarPartida(
  storage: StorageMinimo,
  jogo: string,
  resultado: ResultadoJogo,
): StatsFliperama {
  const stats = lerStats(storage)
  const atual = stats[jogo] ?? { tentativas: 0, vitorias: 0 }
  stats[jogo] = {
    tentativas: atual.tentativas + 1,
    vitorias: atual.vitorias + (resultado === 'vitoria' ? 1 : 0),
  }
  try {
    storage.setItem(CHAVE_STATS, JSON.stringify(stats))
  } catch {
    // storage cheio/bloqueado: segue o jogo
  }
  return stats
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/jogos/stats.test.ts`
Expected: PASS (4 testes)

- [ ] **Step 5: Commit**

```bash
git add src/lib/jogos/stats.ts tests/jogos/stats.test.ts
git commit -m "feat(v4): estatísticas locais do fliperama (tentativas/vitórias, sem backend)"
```

---

### Task 7: UI do jogo — Amarre a Chuteira

UI sem teste unitário (não há jsdom no projeto; DOM é verificado pelo E2E da
Task 11). Verificação da task: `npm run build` (tsc estrito) verde.

**Files:**
- Create: `src/ui/jogos/chuteira.ts`
- Modify: `src/styles/main.css` (bloco novo no FIM do arquivo)

- [ ] **Step 1: Implementar a UI**

```ts
// src/ui/jogos/chuteira.ts
import { criarChuteira, posicaoMarcador } from '../../lib/jogos/chuteira'
import { criarCronometro } from '../../lib/jogos/relogio'
import type { MontarJogo, ResultadoJogo } from '../../lib/jogos/tipos'

/** UI do QTE: o rAF move o marcador e o Henry; espaço/toque aperta. Toda a
 * regra vive em lib/jogos/chuteira — aqui é só DOM. */
export const montar: MontarJogo = (el, aoTerminar) => {
  const jogo = criarChuteira()
  const { periodoMs, meiasLarguras, ilhoses, duracaoHenryMs } = jogo.config

  el.innerHTML = `
    <div class="jogo-chuteira">
      <div class="chuteira-henry" aria-hidden="true"><span class="henry">🏃</span></div>
      <p class="jogo-placar">Amarre os ${ilhoses} ilhoses antes do Henry chegar</p>
      <div class="chuteira-ilhoses" aria-hidden="true">
        ${Array.from({ length: ilhoses }, (_, i) => `<span class="ilhos" data-i="${i}">○</span>`).join('')}
      </div>
      <div class="chuteira-trilho" aria-hidden="true">
        <div class="chuteira-zona"></div>
        <div class="chuteira-marcador"></div>
      </div>
      <button class="solene jogo-acao">AMARRAR (ou espaço)</button>
    </div>
  `

  const raiz = el.querySelector<HTMLElement>('.jogo-chuteira')!
  const marcador = el.querySelector<HTMLElement>('.chuteira-marcador')!
  const zona = el.querySelector<HTMLElement>('.chuteira-zona')!
  const henry = el.querySelector<HTMLElement>('.henry')!

  function ajustarZona(): void {
    const indice = Math.min(jogo.estado().ilhos, meiasLarguras.length - 1)
    zona.style.width = `${meiasLarguras[indice] * 2 * 100}%`
  }
  ajustarZona()

  // Cronômetro clampado: aba em segundo plano congela a partida em vez de
  // estourar o timer do Henry de uma vez (decisão da revisão da Task 4).
  const cronometro = criarCronometro()
  let quadro = 0
  let terminado = false

  function terminar(resultado: ResultadoJogo): void {
    if (terminado) return
    terminado = true
    desmontar()
    aoTerminar(resultado)
  }

  function frame(agora: number): void {
    const t = cronometro(agora)
    jogo.tick(t)
    marcador.style.left = `${posicaoMarcador(t, periodoMs) * 100}%`
    henry.style.left = `${Math.min(t / duracaoHenryMs, 1) * 100}%`
    const { resultado } = jogo.estado()
    if (resultado) {
      terminar(resultado)
      return
    }
    quadro = requestAnimationFrame(frame)
  }
  quadro = requestAnimationFrame(frame)

  function apertar(): void {
    if (terminado) return
    const resposta = jogo.apertar(cronometro(performance.now()))
    if (resposta === 'acerto') {
      const { ilhos, resultado } = jogo.estado()
      const fechado = el.querySelector(`.ilhos[data-i="${ilhos - 1}"]`)
      if (fechado) fechado.textContent = '●'
      ajustarZona()
      if (resultado) terminar(resultado)
    } else if (resposta === 'erro') {
      raiz.classList.remove('cadarco-arrebentou')
      void raiz.offsetWidth // reinicia a animação da tremida
      raiz.classList.add('cadarco-arrebentou')
    }
  }

  function aoTeclar(evento: KeyboardEvent): void {
    // preventDefault também evita o clique nativo do botão focado no espaço —
    // sem ele, um aperto viraria dois.
    if (evento.code === 'Space') {
      evento.preventDefault()
      apertar()
    }
  }
  el.querySelector<HTMLButtonElement>('.jogo-acao')!.addEventListener('click', apertar)
  document.addEventListener('keydown', aoTeclar)

  function desmontar(): void {
    cancelAnimationFrame(quadro)
    document.removeEventListener('keydown', aoTeclar)
  }
  return desmontar
}
```

- [ ] **Step 2: CSS do jogo (no fim de `src/styles/main.css`)**

```css
/* ===== v4 · Fliperama — Amarre a Chuteira ===== */
.jogo-chuteira {
  display: grid;
  gap: 1.25rem;
  text-align: center;
}
.jogo-placar {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ouro-baco);
}
.chuteira-henry {
  position: relative;
  height: 2.6rem;
  border-bottom: 1px dashed var(--ouro-sombra);
}
.henry {
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 2rem;
  transform: translateX(-50%);
}
.chuteira-ilhoses {
  display: flex;
  gap: 1rem;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--ouro-baco);
}
.chuteira-trilho {
  position: relative;
  height: 3rem;
  background: var(--marmore-1);
  border: 1px solid var(--ouro-sombra);
  border-radius: 4px;
}
.chuteira-zona {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(212 175 95 / 30%);
  border-inline: 2px solid var(--ouro);
}
.chuteira-marcador {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 4px;
  background: var(--ouro-vivo);
  transform: translateX(-50%);
}
.jogo-acao {
  justify-self: center;
  min-width: 60%;
  min-height: 3rem;
}
@keyframes cadarco-tremida {
  0%, 100% { transform: none; }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
.cadarco-arrebentou {
  animation: cadarco-tremida 250ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .cadarco-arrebentou { animation: none; }
}
```

- [ ] **Step 3: Build verde**

Run: `npm run build`
Expected: sem erros de tsc; build do Vite conclui

- [ ] **Step 4: Commit**

```bash
git add src/ui/jogos/chuteira.ts src/styles/main.css
git commit -m "feat(v4): UI do Amarre a Chuteira — trilho, zona, Henry e tremida do cadarço"
```

---

### Task 8: UI do jogo — NÃO SOBE!

Mesma regra da Task 7: verificação por `npm run build`; comportamento no E2E.

**Files:**
- Create: `src/ui/jogos/nao-sobe.ts`
- Modify: `src/styles/main.css` (bloco novo no fim)

- [ ] **Step 1: Implementar a UI**

```ts
// src/ui/jogos/nao-sobe.ts
import { CONFIG_NAO_SOBE, criarNaoSobe, gerarEscapes } from '../../lib/jogos/nao-sobe'
import { criarCronometro, formatarMinuto, minutoFicticio } from '../../lib/jogos/relogio'
import type { MontarJogo, ResultadoJogo } from '../../lib/jogos/tipos'

/** Campo visto de cima: os 10 são botões (toque OU Tab+Enter, de graça).
 * Quem sobe ganha .subiu e caminha pro ataque via transition CSS — o estado
 * lógico já contou na hora; a caminhada é só o desenho. */
export const montar: MontarJogo = (el, aoTerminar) => {
  const cfg = CONFIG_NAO_SOBE
  const jogo = criarNaoSobe(cfg, gerarEscapes(cfg, Math.random))
  const goleiro = cfg.jogadores - 1

  el.innerHTML = `
    <div class="jogo-nao-sobe">
      <p class="jogo-placar">
        <span class="nao-sobe-relogio">${formatarMinuto(cfg.minutoInicial)}</span>
        · Brasil 1×0 Croácia ·
        <span class="nao-sobe-alerta">na frente: 0/${cfg.limiteAvancados}</span>
      </p>
      <div class="nao-sobe-campo">
        <p class="nao-sobe-ataque" aria-hidden="true">ataque · perigo</p>
        ${Array.from({ length: cfg.jogadores }, (_, j) => `
          <button class="nao-sobe-jogador" data-j="${j}"
                  style="left:${5 + (j / (cfg.jogadores - 1)) * 90}%"
                  aria-label="Puxar ${j === goleiro ? 'o goleiro' : `o jogador ${j + 1}`} de volta">
            ${j === goleiro ? '🧤' : '🟡'}
          </button>`).join('')}
      </div>
    </div>
  `

  const relogio = el.querySelector<HTMLElement>('.nao-sobe-relogio')!
  const alerta = el.querySelector<HTMLElement>('.nao-sobe-alerta')!
  const botoes = [...el.querySelectorAll<HTMLButtonElement>('.nao-sobe-jogador')]

  function atualizarAlerta(): void {
    alerta.textContent = `na frente: ${jogo.avancados().length}/${cfg.limiteAvancados}`
  }

  botoes.forEach((botao) =>
    botao.addEventListener('click', () => {
      if (jogo.puxar(Number(botao.dataset.j))) {
        botao.classList.remove('subiu')
        atualizarAlerta()
      }
    }),
  )

  // Cronômetro clampado: aba em segundo plano congela a partida em vez de
  // replayar a fila de escapes de uma vez (decisão da revisão da Task 4).
  const cronometro = criarCronometro()
  let quadro = 0
  let terminado = false

  function terminar(resultado: ResultadoJogo): void {
    if (terminado) return
    terminado = true
    desmontar()
    aoTerminar(resultado)
  }

  function frame(agora: number): void {
    const t = cronometro(agora)
    for (const j of jogo.tick(t)) botoes[j]?.classList.add('subiu')
    atualizarAlerta()
    relogio.textContent = formatarMinuto(
      minutoFicticio(t, cfg.duracaoMs, cfg.minutoInicial, cfg.minutoFinal),
    )
    const { resultado } = jogo.estado()
    if (resultado) {
      terminar(resultado)
      return
    }
    quadro = requestAnimationFrame(frame)
  }
  quadro = requestAnimationFrame(frame)

  function desmontar(): void {
    cancelAnimationFrame(quadro)
  }
  return desmontar
}
```

- [ ] **Step 2: CSS do jogo (no fim de `src/styles/main.css`)**

```css
/* ===== v4 · Fliperama — NÃO SOBE! ===== */
.jogo-nao-sobe {
  display: grid;
  gap: 1rem;
}
.nao-sobe-campo {
  position: relative;
  height: min(52vh, 420px);
  background:
    linear-gradient(to bottom, rgb(127 29 29 / 30%), transparent 32%),
    var(--marmore-1);
  border: 1px solid var(--ouro-sombra);
  border-radius: 4px;
  overflow: hidden;
}
.nao-sobe-ataque {
  position: absolute;
  top: 0.5rem;
  width: 100%;
  text-align: center;
  color: var(--ouro-baco);
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}
.nao-sobe-jogador {
  position: absolute;
  top: 74%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  /* a caminhada pro ataque — gameplay: sob reduced-motion vira salto seco */
  transition: top 600ms ease-in;
}
.nao-sobe-jogador.subiu {
  top: 12%;
}
.nao-sobe-jogador:focus-visible {
  outline: 2px solid var(--ouro-vivo);
  outline-offset: 2px;
  border-radius: 50%;
}
@media (prefers-reduced-motion: reduce) {
  .nao-sobe-jogador { transition: none; }
}
```

- [ ] **Step 3: Build verde**

Run: `npm run build`
Expected: sem erros

- [ ] **Step 4: Commit**

```bash
git add src/ui/jogos/nao-sobe.ts src/styles/main.css
git commit -m "feat(v4): UI do NÃO SOBE! — campo top-down com botões-jogadores"
```

---

### Task 9: UI do jogo — Segura, Carletto!

Mesma regra: verificação por `npm run build`; comportamento no E2E.

**Files:**
- Create: `src/ui/jogos/carletto.ts`
- Modify: `src/styles/main.css` (bloco novo no fim)

- [ ] **Step 1: Implementar a UI**

```ts
// src/ui/jogos/carletto.ts
import {
  CONFIG_CARLETTO, criarCarletto, gerarItens, yDoItem, type TipoItem,
} from '../../lib/jogos/carletto'
import { criarCronometro, formatarMinuto, minutoFicticio } from '../../lib/jogos/relogio'
import type { MontarJogo, ResultadoJogo } from '../../lib/jogos/tipos'

const EMOJI: Record<TipoItem, string> = { chiclete: '🍬', menta: '🍃', bandeira: '🇳🇴' }
const PASSO_TECLADO = 0.06

export const montar: MontarJogo = (el, aoTerminar) => {
  const cfg = CONFIG_CARLETTO
  const jogo = criarCarletto(cfg, gerarItens(cfg, Math.random))

  el.innerHTML = `
    <div class="jogo-carletto">
      <p class="jogo-placar">
        <span class="carletto-relogio">0'</span> · Brasil × Noruega
      </p>
      <div class="carletto-barra-caixa" aria-hidden="true">
        <span class="carletto-barra-rotulo">Desempenho da Seleção</span>
        <div class="carletto-barra"><div class="carletto-barra-nivel"></div></div>
      </div>
      <div class="carletto-area">
        <div class="carletto" aria-hidden="true">😮</div>
      </div>
    </div>
  `

  const area = el.querySelector<HTMLElement>('.carletto-area')!
  const boneco = el.querySelector<HTMLElement>('.carletto')!
  const nivel = el.querySelector<HTMLElement>('.carletto-barra-nivel')!
  const relogio = el.querySelector<HTMLElement>('.carletto-relogio')!
  const divs = new Map<number, HTMLElement>()

  // Cronômetro clampado: aba em segundo plano congela a partida em vez de
  // derramar a chuva de chicletes acumulada (decisão da revisão da Task 4).
  const cronometro = criarCronometro()
  let xBoca = 0.5
  let quadro = 0
  let terminado = false

  function mover(x: number): void {
    // travado pela isca: a cara de decepção não anda
    if (cronometro(performance.now()) < jogo.travadoAte()) return
    xBoca = Math.min(1, Math.max(0, x))
  }
  function aoApontar(evento: PointerEvent): void {
    const r = area.getBoundingClientRect()
    mover((evento.clientX - r.left) / r.width)
  }
  function aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      mover(xBoca - PASSO_TECLADO)
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      mover(xBoca + PASSO_TECLADO)
    }
  }
  area.addEventListener('pointermove', aoApontar)
  area.addEventListener('pointerdown', aoApontar)
  document.addEventListener('keydown', aoTeclar)

  function terminar(resultado: ResultadoJogo): void {
    if (terminado) return
    terminado = true
    desmontar()
    aoTerminar(resultado)
  }

  function frame(agora: number): void {
    const t = cronometro(agora)
    const eventos = jogo.tick(t, xBoca)
    for (const item of eventos.capturados) {
      divs.get(item.id)?.remove()
      divs.delete(item.id)
    }
    for (const item of eventos.noChao) {
      const div = divs.get(item.id)
      if (div) {
        div.classList.add('no-chao')
        setTimeout(() => div.remove(), 350)
        divs.delete(item.id)
      }
      if (item.tipo === 'chiclete') {
        area.classList.remove('carletto-sofreu')
        void area.offsetWidth
        area.classList.add('carletto-sofreu')
      }
    }
    for (const item of jogo.noAr(t)) {
      let div = divs.get(item.id)
      if (!div) {
        div = document.createElement('div')
        div.className = `carletto-item item-${item.tipo}`
        div.textContent = EMOJI[item.tipo]
        div.style.left = `${item.x * 100}%`
        area.appendChild(div)
        divs.set(item.id, div)
      }
      div.style.top = `${yDoItem(item, t) * 100}%`
    }
    const travado = t < jogo.travadoAte()
    boneco.classList.toggle('travado', travado)
    boneco.textContent = travado ? '😖' : '😮'
    boneco.style.left = `${xBoca * 100}%`
    nivel.style.width = `${jogo.barra()}%`
    relogio.textContent = formatarMinuto(minutoFicticio(t, cfg.duracaoMs, 0, cfg.minutoFinal), 90)
    const { resultado } = jogo.estado()
    if (resultado) {
      terminar(resultado)
      return
    }
    quadro = requestAnimationFrame(frame)
  }
  quadro = requestAnimationFrame(frame)

  function desmontar(): void {
    cancelAnimationFrame(quadro)
    document.removeEventListener('keydown', aoTeclar)
    area.removeEventListener('pointermove', aoApontar)
    area.removeEventListener('pointerdown', aoApontar)
  }
  return desmontar
}
```

- [ ] **Step 2: CSS do jogo (no fim de `src/styles/main.css`)**

```css
/* ===== v4 · Fliperama — Segura, Carletto! ===== */
.jogo-carletto {
  display: grid;
  gap: 0.75rem;
}
.carletto-barra-caixa {
  display: grid;
  gap: 0.25rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--ouro-baco);
}
.carletto-barra {
  height: 14px;
  border: 1px solid var(--ouro-sombra);
  background: var(--marmore-1);
}
.carletto-barra-nivel {
  height: 100%;
  width: 50%;
  background: linear-gradient(to right, #7f1d1d, var(--ouro));
  transition: width 150ms linear;
}
.carletto-area {
  position: relative;
  height: min(50vh, 400px);
  overflow: hidden;
  background:
    linear-gradient(to bottom, transparent 88%, rgb(34 90 34 / 45%) 88%),
    var(--marmore-1);
  border: 1px solid var(--ouro-sombra);
  border-radius: 4px;
  touch-action: none;
  cursor: crosshair;
}
.carletto {
  position: absolute;
  bottom: 3%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2.4rem;
  line-height: 1;
}
.carletto.travado {
  filter: grayscale(1);
}
.carletto-item {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  line-height: 1;
}
.carletto-item.no-chao {
  opacity: 0;
  transition: opacity 300ms;
}
@keyframes carletto-tremida {
  0%, 100% { transform: none; }
  30% { transform: translateY(3px); }
  60% { transform: translateY(-3px); }
}
.carletto-sofreu {
  animation: carletto-tremida 250ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .carletto-sofreu { animation: none; }
  .carletto-item.no-chao { transition: none; }
  .carletto-barra-nivel { transition: none; }
}
```

- [ ] **Step 3: Build verde**

Run: `npm run build`
Expected: sem erros

- [ ] **Step 4: Commit**

```bash
git add src/ui/jogos/carletto.ts src/styles/main.css
git commit -m "feat(v4): UI do Segura, Carletto! — catch de chicletes com barra e iscas"
```

---

### Task 10: Seção, gabinetes e overlay

**Files:**
- Create: `src/ui/fliperama.ts`
- Modify: `index.html` (seção entre `#profecia` e `#quiz`)
- Modify: `src/data/secoes.ts` (bolinha da nav)
- Modify: `src/main.ts` (montagem)
- Modify: `src/styles/main.css` (bloco arcade da seção/overlay)
- Test: `tests/fliperama-ui.test.ts` (builders puros de HTML, padrão do `rodape.ts`)

- [ ] **Step 1: Escrever o teste que falha**

```ts
// tests/fliperama-ui.test.ts
import { expect, test } from 'vitest'
import { JOGOS } from '../src/data/fliperama'
import { gabineteHTML, telaFimHTML, telaInstrucoesHTML } from '../src/ui/fliperama'

test('gabinete tem ano, título, stats e botão JOGAR endereçável', () => {
  const html = gabineteHTML(JOGOS[0], { tentativas: 2, vitorias: 0 })
  expect(html).toContain('2006')
  expect(html).toContain('Amarre a Chuteira')
  expect(html).toContain('Suas tentativas: 2 · Histórias reescritas: 0')
  expect(html).toContain('data-jogo="chuteira"')
  expect(html).toContain('JOGAR')
})

test('tela de instruções tem o texto e os dois botões', () => {
  const html = telaInstrucoesHTML(JOGOS[1])
  expect(html).toContain(JOGOS[1].instrucoes)
  expect(html).toContain('id="comecar-jogo"')
  expect(html).toContain('id="fechar-jogo"')
})

test('derrota mostra a placa solene; vitória mostra o "e se..." dourado', () => {
  const derrota = telaFimHTML(JOGOS[2], 'derrota')
  expect(derrota).toContain('placa-derrota')
  expect(derrota).toContain(JOGOS[2].derrota.texto)
  const vitoria = telaFimHTML(JOGOS[2], 'vitoria')
  expect(vitoria).toContain('placa-e-se')
  expect(vitoria).toContain(JOGOS[2].eSe.texto)
  for (const html of [derrota, vitoria]) {
    expect(html).toContain('id="tentar-de-novo"')
    expect(html).toContain('id="aceitar"')
  }
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- tests/fliperama-ui.test.ts`
Expected: FAIL — módulo inexistente

- [ ] **Step 3: Implementar `src/ui/fliperama.ts`**

```ts
// src/ui/fliperama.ts
import {
  JOGOS, LEGENDA_SECAO, RODAPE_SECAO, TITULO_SECAO, textoStats,
  type IdJogo, type JogoFliperama,
} from '../data/fliperama'
import { lerStats, registrarPartida, type StatsJogo } from '../lib/jogos/stats'
import type { MontarJogo, ResultadoJogo } from '../lib/jogos/tipos'

/** Cada jogo é um chunk lazy: o import() só dispara no COMEÇAR — a piada
 * nunca espera o JS de jogo (mesma filosofia do scroll e da profecia). */
const CARREGADORES: Record<IdJogo, () => Promise<{ montar: MontarJogo }>> = {
  chuteira: () => import('./jogos/chuteira'),
  'nao-sobe': () => import('./jogos/nao-sobe'),
  carletto: () => import('./jogos/carletto'),
}

/* Builders puros de HTML (testáveis sem DOM — padrão do rodape.ts). */

export function gabineteHTML(jogo: JogoFliperama, stats: StatsJogo): string {
  return `
    <article class="gabinete" data-jogo="${jogo.id}">
      <p class="gabinete-icone" aria-hidden="true">${jogo.icone}</p>
      <p class="rotulo">${jogo.ano}</p>
      <h3>${jogo.titulo}</h3>
      <p class="legenda">${jogo.chamada}</p>
      <p class="legenda gabinete-stats">${textoStats(stats.tentativas, stats.vitorias)}</p>
      <button class="solene jogar" data-jogo="${jogo.id}">JOGAR</button>
    </article>`
}

export function telaInstrucoesHTML(jogo: JogoFliperama): string {
  return `
    <div class="fliperama-tela">
      <p class="rotulo">${jogo.ano} · ${jogo.titulo}</p>
      <p class="fliperama-instrucoes">${jogo.instrucoes}</p>
      <div class="fliperama-botoes">
        <button class="solene" id="comecar-jogo">COMEÇAR</button>
        <button class="solene" id="fechar-jogo">Voltar</button>
      </div>
    </div>`
}

export function telaFimHTML(jogo: JogoFliperama, resultado: ResultadoJogo): string {
  const placa = resultado === 'vitoria' ? jogo.eSe : jogo.derrota
  return `
    <div class="fliperama-tela">
      <div class="placa ${resultado === 'vitoria' ? 'placa-e-se' : 'placa-derrota'}">
        <h3 tabindex="-1">${placa.titulo}</h3>
        <p>${placa.texto}</p>
      </div>
      <div class="fliperama-botoes">
        <button class="solene" id="tentar-de-novo">Tentar de novo</button>
        <button class="solene" id="aceitar">Aceitar a história</button>
      </div>
    </div>`
}

export function montarFliperama(el: HTMLElement): void {
  const stats = lerStats(localStorage)
  el.innerHTML = `
    <p class="rotulo">${TITULO_SECAO}</p>
    <p class="legenda">${LEGENDA_SECAO}</p>
    <div class="gabinetes">
      ${JOGOS.map((j) => gabineteHTML(j, stats[j.id] ?? { tentativas: 0, vitorias: 0 })).join('')}
    </div>
    <p class="legenda fecho">${RODAPE_SECAO}</p>
    <dialog class="fliperama-overlay" aria-label="Fliperama do Sofrimento"></dialog>
  `
  const dialog = el.querySelector<HTMLDialogElement>('.fliperama-overlay')!
  let desmontarJogo: (() => void) | null = null

  // Esc (cancel nativo), "Voltar", "Desistir" e "Aceitar a história" caem
  // todos aqui: desmonta o jogo (idempotente) e limpa o overlay.
  dialog.addEventListener('close', () => {
    desmontarJogo?.()
    desmontarJogo = null
    dialog.innerHTML = ''
  })

  function atualizarStats(): void {
    const atuais = lerStats(localStorage)
    el.querySelectorAll<HTMLElement>('.gabinete').forEach((gabinete) => {
      const id = gabinete.dataset.jogo ?? ''
      const s = atuais[id] ?? { tentativas: 0, vitorias: 0 }
      const linha = gabinete.querySelector('.gabinete-stats')
      if (linha) linha.textContent = textoStats(s.tentativas, s.vitorias)
    })
  }

  async function comecar(jogo: JogoFliperama): Promise<void> {
    desmontarJogo?.()
    desmontarJogo = null
    dialog.innerHTML = `
      <div class="fliperama-tela">
        <div class="fliperama-topo">
          <p class="rotulo">${jogo.ano} · ${jogo.titulo}</p>
          <button class="solene" id="fechar-jogo">Desistir</button>
        </div>
        <div class="fliperama-palco"></div>
      </div>`
    dialog.querySelector('#fechar-jogo')!.addEventListener('click', () => dialog.close())
    const palco = dialog.querySelector<HTMLElement>('.fliperama-palco')!
    try {
      const { montar } = await CARREGADORES[jogo.id]()
      if (!dialog.open) return // Esc no meio do carregamento: não montar em palco morto
      desmontarJogo = montar(palco, (resultado) => {
        desmontarJogo = null // o jogo já se desmontou antes de avisar
        registrarPartida(localStorage, jogo.id, resultado)
        atualizarStats()
        dialog.innerHTML = telaFimHTML(jogo, resultado)
        dialog.querySelector<HTMLElement>('h3')?.focus()
        dialog.querySelector('#tentar-de-novo')!.addEventListener('click', () => void comecar(jogo))
        dialog.querySelector('#aceitar')!.addEventListener('click', () => dialog.close())
      })
    } catch {
      // Chunk não carregou (rede): degrada com mensagem, nunca quebra a página.
      palco.innerHTML =
        '<p class="legenda">O gabinete travou. Como tudo neste memorial, a culpa não foi sua: recarregue e tente de novo.</p>'
    }
  }

  function abrir(jogo: JogoFliperama): void {
    dialog.innerHTML = telaInstrucoesHTML(jogo)
    dialog.showModal()
    dialog.querySelector('#comecar-jogo')!.addEventListener('click', () => void comecar(jogo))
    dialog.querySelector('#fechar-jogo')!.addEventListener('click', () => dialog.close())
  }

  el.querySelectorAll<HTMLButtonElement>('.jogar').forEach((botao) =>
    botao.addEventListener('click', () => {
      const jogo = JOGOS.find((j) => j.id === botao.dataset.jogo)
      if (jogo) abrir(jogo)
    }),
  )
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- tests/fliperama-ui.test.ts`
Expected: PASS (3 testes)

- [ ] **Step 5: Ligar a seção no site**

Em `index.html`, entre as seções `profecia` e `quiz`:

```html
      <section id="profecia" class="secao"></section>
      <section id="fliperama" class="secao"></section>
      <section id="quiz" class="secao"></section>
```

Em `src/data/secoes.ts`, entre Profecia e Quiz:

```ts
  { id: 'profecia', titulo: 'A Profecia' },
  { id: 'fliperama', titulo: 'Fliperama do Sofrimento' },
  { id: 'quiz', titulo: 'Quiz' },
```

Em `src/main.ts`: adicionar o import e a montagem (ordem = ordem das seções):

```ts
import { montarProfecia } from './ui/profecia'
import { montarFliperama } from './ui/fliperama'
import { montarQuiz } from './ui/quiz'
```

```ts
montarProfecia(document.querySelector('#profecia')!)
montarFliperama(document.querySelector('#fliperama')!)
montarQuiz(document.querySelector('#quiz')!)
```

- [ ] **Step 6: CSS arcade da seção e do overlay (no fim de `src/styles/main.css`)**

```css
/* ===== v4 · Fliperama do Sofrimento — seção, gabinetes e overlay =====
   Estética de fliperama retrô por cima do mármore: contraste PROPOSITAL
   (spec v4). Scanlines estáticas — não são movimento, ficam sob
   reduced-motion. */
#fliperama .gabinetes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}
.gabinete {
  position: relative;
  overflow: hidden;
  background: var(--marmore-2);
  border: 1px solid var(--ouro-sombra);
  border-radius: 10px 10px 3px 3px;
  padding: 1.75rem 1.25rem;
  text-align: center;
  display: grid;
  gap: 0.5rem;
  justify-items: center;
}
.gabinete::after,
.fliperama-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 2px,
    rgb(0 0 0 / 16%) 2px 3px
  );
}
.gabinete h3,
.gabinete .rotulo {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.gabinete-icone {
  font-size: 3rem;
  line-height: 1;
}
.gabinete .jogar {
  margin-top: 0.75rem;
  position: relative;
  z-index: 1; /* acima das scanlines */
}
.fliperama-overlay {
  width: 100%;
  height: 100dvh;
  max-width: 100vw;
  max-height: 100dvh;
  margin: 0;
  border: none;
  padding: 1.25rem;
  background: var(--marmore-0);
  color: inherit;
  overflow-y: auto;
}
.fliperama-overlay::backdrop {
  background: rgb(0 0 0 / 78%);
}
.fliperama-tela {
  max-width: 720px;
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
  padding-top: 4vh;
  position: relative;
  z-index: 1; /* conteúdo acima das scanlines do overlay */
}
.fliperama-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.fliperama-instrucoes {
  font-size: 1.1rem;
  line-height: 1.6;
}
.fliperama-botoes {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
.placa-derrota h3 {
  letter-spacing: 0.15em;
}
.placa-e-se {
  border-color: var(--ouro-vivo);
  box-shadow: 0 0 28px rgb(240 214 147 / 22%);
}
.placa-e-se h3 {
  color: var(--ouro-vivo);
  letter-spacing: 0.15em;
}
```

- [ ] **Step 7: Suite completa + build**

Run: `npm test && npm run build`
Expected: todos os testes passam (os de `secoes.test.ts` agora cobrem a nova
seção automaticamente); build sem erros

- [ ] **Step 8: Commit**

```bash
git add src/ui/fliperama.ts tests/fliperama-ui.test.ts index.html src/data/secoes.ts src/main.ts src/styles/main.css
git commit -m "feat(v4): seção Fliperama do Sofrimento — gabinetes, overlay e fluxo de partida"
```

---

### Task 11: E2E headless, docs e verificação final

**Files:**
- Create: `scripts/verificar-fliperama.mjs`
- Modify: `package.json` (devDependency `puppeteer-core`)
- Modify: `docs/BACKLOG.md` (marcar o Fliperama v1 como entregue, mantendo os jogos v2 listados)

- [ ] **Step 1: Instalar o puppeteer-core (não baixa Chromium; usamos o do sistema)**

Run: `npm install --save-dev puppeteer-core`

- [ ] **Step 2: Escrever o script E2E**

```js
// scripts/verificar-fliperama.mjs
// E2E headless do Fliperama (padrão da v3.2): Chromium do sistema + puppeteer-core.
// Uso: npm run build && npx vite preview --port 4173 &  → node scripts/verificar-fliperama.mjs
import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.URL_BASE ?? 'http://localhost:4173'
const CAPTURAS = process.env.CAPTURAS ?? '.'
let falhas = 0
const checar = (nome, ok, extra = '') => {
  console.log(`${ok ? '✅' : '❌'} ${nome}${extra ? ` — ${extra}` : ''}`)
  if (!ok) falhas++
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox'],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.goto(URL_BASE, { waitUntil: 'networkidle0' })

  // Seção e nav
  checar('seção #fliperama com 3 gabinetes',
    (await page.$$eval('#fliperama .gabinete', (g) => g.length)) === 3)
  checar('bolinha da nav aponta pra #fliperama',
    (await page.$('#nav-secoes a[href="#fliperama"]')) !== null)
  await page.screenshot({ path: `${CAPTURAS}/fliperama-secao.png` })

  // Chuteira: abrir, começar, perder de propósito (Henry chega em ~12s)
  await page.click('.jogar[data-jogo="chuteira"]')
  checar('overlay abre com instruções',
    (await page.$eval('.fliperama-overlay', (d) => d.open)) === true &&
    (await page.$('#comecar-jogo')) !== null)
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-chuteira')
  checar('chuteira montada', true)
  await page.keyboard.press('Space') // teclado registra aperto sem quebrar
  await page.waitForSelector('.placa-derrota', { timeout: 16000 })
  checar('placa de derrota da chuteira cita o agachamento',
    (await page.$eval('.placa-derrota', (p) => p.textContent ?? '')).includes('agachado'))
  await page.screenshot({ path: `${CAPTURAS}/fliperama-derrota-2006.png` })

  // Tentar de novo remonta; Esc fecha no meio da partida
  await page.click('#tentar-de-novo')
  await page.waitForSelector('.jogo-chuteira')
  checar('tentar de novo remonta o jogo', true)
  await page.keyboard.press('Escape')
  checar('Esc fecha o overlay no meio da partida',
    (await page.$eval('.fliperama-overlay', (d) => !d.open)) === true)

  // Stats: 1 partida terminada (a abandonada no Esc não conta)
  const stats = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('fliperama-stats-v1') ?? '{}'))
  checar('stats registram só a partida terminada',
    stats.chuteira?.tentativas === 1 && stats.chuteira?.vitorias === 0,
    JSON.stringify(stats))
  checar('gabinete mostra as stats atualizadas',
    (await page.$eval('.gabinete[data-jogo="chuteira"] .gabinete-stats',
      (e) => e.textContent ?? '')).includes('Suas tentativas: 1'))

  // NÃO SOBE!: sem puxar ninguém, o contra-ataque vem
  await page.click('.jogar[data-jogo="nao-sobe"]')
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-nao-sobe')
  await page.waitForSelector('.placa-derrota', { timeout: 24000 })
  checar('derrota do NÃO SOBE! cita os 117 minutos',
    (await page.$eval('.placa-derrota', (p) => p.textContent ?? '')).includes('117'))
  await page.keyboard.press('Escape')

  // Carletto: parado no meio, a partida termina de um jeito ou de outro
  await page.click('.jogar[data-jogo="carletto"]')
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-carletto')
  await page.screenshot({ path: `${CAPTURAS}/fliperama-carletto.png` })
  await page.waitForFunction(
    () => document.querySelector('.placa-derrota, .placa-e-se') !== null,
    { timeout: 30000 })
  checar('Carletto termina com placa de fim (derrota ou e-se)', true)
  await page.keyboard.press('Escape')

  // reduced-motion: continua jogável
  const page2 = await browser.newPage()
  await page2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page2.goto(URL_BASE, { waitUntil: 'networkidle0' })
  await page2.click('.jogar[data-jogo="chuteira"]')
  await page2.click('#comecar-jogo')
  await page2.waitForSelector('.jogo-chuteira')
  checar('reduced-motion: jogo monta e roda', true)
} finally {
  await browser.close()
}

console.log(falhas ? `\n${falhas} checagem(ns) falharam` : '\ntudo verde')
process.exit(falhas ? 1 : 0)
```

- [ ] **Step 3: Rodar o E2E**

```bash
npm run build
npx vite preview --port 4173 &   # servidor em background
CAPTURAS=/tmp node scripts/verificar-fliperama.mjs
# matar o vite preview ao final (kill %1 ou o PID)
```

Expected: todas as checagens `✅`, exit 0. Se alguma falhar: é bug real —
investigar com superpowers:systematic-debugging antes de mexer no script.

- [ ] **Step 4: Olhar os screenshots**

Abrir `/tmp/fliperama-secao.png`, `/tmp/fliperama-derrota-2006.png` e
`/tmp/fliperama-carletto.png` e conferir a olho: gabinetes com scanlines,
placa de derrota legível, jogo do Carletto com barra e itens visíveis.

- [ ] **Step 5: Atualizar o backlog**

Em `docs/BACKLOG.md`, marcar o item do Fliperama do Sofrimento como entregue
(v1 — 3 jogos, placeholders CSS), mantendo listados os jogos candidatos a v2
(Felipe Melo, 7x1, Levante o Neymar) e o passo futuro dos sprites PixelLab.

- [ ] **Step 6: Suite completa uma última vez**

Run: `npm test && npm run build`
Expected: tudo verde

- [ ] **Step 7: Commit**

```bash
git add scripts/verificar-fliperama.mjs package.json package-lock.json docs/BACKLOG.md
git commit -m "test(v4): E2E headless do Fliperama + backlog atualizado"
```

---

## Fora deste plano (decisões já tomadas)

- **Deploy:** manual e por decisão do andre, como sempre — ff-merge
  `dev/site` → `main`, scan de segredos antes do push, e
  `npx wrangler pages deploy dist --project-name cadeohexa --branch main`
  (da raiz do repo; verificar com cache-buster `?cb=$(date +%s)`).
- **Sprites PixelLab (próxima sessão):** a API já está no
  claude-creds-vault (`services/pixellab/README.md`; auth
  `Authorization: Bearer $PIXELLAB_API_KEY`, base
  `https://api.pixellab.ai/v2`, maioria das gerações é assíncrona). A lista
  de sprites está na seção "Direção de arte" da spec. Cada geração consome
  créditos — confirmar com o andre antes do lote. Os placeholders emoji
  foram desenhados pra troca pontual: `--gabinete-icone`, `.henry`,
  `.nao-sobe-jogador`, `.carletto`, `.carletto-item` são os pontos de
  encaixe.
- **Jogos v2** (Felipe Melo, 7x1, Levante o Neymar), atalho "⏪ Reviver esta
  derrota" nas lápides e placar global: continuam no backlog.
