# "Cadê o Hexa?" — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o memorial interativo da espera pelo hexa (spec: `docs/superpowers/specs/2026-07-07-cadeohexa-design.md`) — página única com contador de dias, taça 3D, timeline de eliminações, profecia, quiz e card compartilhável, deployado no Cloudflare Pages com OG image dinâmica.

**Architecture:** Site estático Vite + TypeScript. Lógica pura (datas, quiz) em `src/lib/` testada com Vitest; conteúdo em `src/data/`; UI vanilla em `src/ui/` (cada seção um módulo que preenche um `<section>` do `index.html`); 3D em `src/cena3d/` carregado via dynamic import com fallback. Uma Pages Function (`functions/og.ts`) gera a imagem de preview do link reutilizando `src/lib/contadores.ts`.

**Tech Stack:** Vite 6, TypeScript, Three.js, GSAP (ScrollTrigger), Vitest, workers-og (Pages Function), Cloudflare Pages.

## ✅ IMPLEMENTAÇÃO CONCLUÍDA — 08/07/2026

**T1–T16 todas concluídas** com revisão dupla (spec + qualidade) e fixes por task, mais checklist manual final 7/7 (contador ~90ms no 4G, mobile 375px sem overflow, quiz→card→download, reduced-motion, /og PNG 1200×630, desktop 3D, zero erro no console) e revisão final de integração (READY TO MERGE+DEPLOY, só achados Minor). **Falta apenas o deploy (T17 Step 4)** — depende de `wrangler login` interativo do andre.

**Desvios do plano incorporados ao código (o texto original das tasks abaixo NÃO foi atualizado):** técnicos = 10 com 'Fernando Diniz (interino)'; rotulo 'presidências da República'; quiz-logic deriva TOTAL de PERGUNTAS.length e clampa; TAGLINES em `src/data/taglines.ts`; contraste AA via `--ouro-baco`; `.secao` com `100dvh`; revelar com querySelectorAll + foco + botão hidden; T9 seletor `.medidor .numero-medidor` (especificidade); T10 gráfico com media-query 22px no mobile + logMax/anos derivados dos dados + `.placa .rotulo { overflow-wrap: anywhere }`; T11 hover `:not(:disabled)` + foco no h3 + aria-live; T12 canvas role=img + tratamento de erro no share + `.acoes-card`; T14 probe só WebGL2 + `.catch` no import 3D; T15 gate de visibilidade pra não piscar seções já visíveis + pausar/retomar render loop; T16 og:image absoluta + Cache-Control único (`Response` reconstruída).

**Follow-ups Minor (não-bloqueantes, da revisão final):** Cache-Control do /og poderia ter TTL até a virada do dia em SP (hoje flat 1h); nenhum script tipa `functions/`+`tests/`; `matchMedia(prefers-reduced-motion)` repetido em 3 arquivos (extrair helper). Backlog fase 2: vídeos do Craque Neto pós-eliminações.


**Regras do projeto:** contador em texto renderiza antes de qualquer 3D; nenhuma seção depende de WebGL pra fazer sentido; timezone `America/Sao_Paulo` em toda matemática de data; conteúdo/piada mora em `src/data/`, nunca hardcoded na UI. Commits pequenos por task.

---

## Estrutura de arquivos (visão geral)

```
hexa-site/
├── index.html                  # casca: <section> vazias por bloco + meta OG
├── package.json / tsconfig.json / vite.config.ts
├── functions/og.ts             # Pages Function — OG image do dia
├── src/
│   ├── main.ts                 # bootstrap: contadores primeiro, resto depois
│   ├── styles/main.css         # tema Memorial de Mármore
│   ├── lib/
│   │   ├── contadores.ts       # matemática de datas (puro)
│   │   ├── quiz-logic.ts       # pontuação → patente (puro)
│   │   └── og-template.ts      # HTML da OG image (puro)
│   ├── data/
│   │   ├── datas.ts            # constantes-âncora
│   │   ├── copas.ts            # 6 lápides
│   │   ├── medidores.ts        # contadores absurdos
│   │   ├── profecia.ts         # tabela 2030–2050
│   │   └── quiz.ts             # perguntas + patentes
│   ├── ui/
│   │   ├── hero.ts  countdown.ts  timeline.ts  medidores.ts
│   │   ├── profecia.ts  quiz.ts  card.ts
│   └── cena3d/
│       ├── index.ts            # detecção WebGL/reduced-motion + boot
│       ├── taca.ts             # taça procedural (LatheGeometry)
│       └── scroll.ts           # ScrollTrigger ↔ câmera
└── tests/
    ├── contadores.test.ts  medidores.test.ts  quiz.test.ts  og-template.test.ts
```

---

### Task 1: Scaffold do projeto

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` (mínimo provisório), `src/main.ts` (provisório), `.gitignore` (já existe — conferir)

- [ ] **Step 1: Criar projeto Vite e instalar dependências**

```bash
cd /home/andre/Workspace/hexa-site
npm create vite@latest . -- --template vanilla-ts   # aceitar "ignore files and continue"
npm i three gsap
npm i -D vitest @types/three workers-og wrangler
```

- [ ] **Step 2: Configurar scripts e Vitest**

`package.json` — garantir scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "npx wrangler pages dev dist",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: { target: 'es2022' },
})
```

- [ ] **Step 3: Limpar o template**

Apagar `src/counter.ts`, `src/typescript.svg`, `public/vite.svg`, `src/style.css`. Criar diretórios `src/lib`, `src/data`, `src/ui`, `src/cena3d`, `src/styles`, `tests`, `functions`. Substituir `src/main.ts` por:

```ts
console.log('cadeohexa: bootstrap')
```

E `index.html` provisório:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cadê o Hexa?</title>
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Verificar que roda**

Run: `npm run dev` → abrir http://localhost:5173, console mostra `cadeohexa: bootstrap`. `npm run build` → sai `dist/` sem erro.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite + TS + deps (three, gsap, vitest, workers-og)"
```

---

### Task 2: Constantes de data + contadores (TDD)

**Files:**
- Create: `src/data/datas.ts`, `src/lib/contadores.ts`
- Test: `tests/contadores.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

`tests/contadores.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import {
  diasEntre, hojeEmSaoPaulo, diasDaEspera, diasAteProximaCopa, formatarDias,
} from '../src/lib/contadores'

describe('diasEntre', () => {
  test('conta dias inteiros entre datas ISO', () => {
    expect(diasEntre('2002-06-30', '2002-07-01')).toBe(1)
    expect(diasEntre('2002-06-30', '2003-06-30')).toBe(365)
    expect(diasEntre('2004-02-28', '2004-03-01')).toBe(2) // bissexto
  })
})

describe('hojeEmSaoPaulo', () => {
  test('vira o dia à meia-noite de São Paulo, não de UTC', () => {
    // 02:59 UTC = 23:59 do dia anterior em SP (UTC-3)
    expect(hojeEmSaoPaulo(new Date('2026-07-08T02:59:00Z'))).toBe('2026-07-07')
    expect(hojeEmSaoPaulo(new Date('2026-07-08T03:00:00Z'))).toBe('2026-07-08')
  })
})

describe('contadores do site', () => {
  const meioDiaSP = new Date('2026-07-07T15:00:00Z') // 12:00 em SP
  test('dias da espera desde o penta (30/06/2002)', () => {
    expect(diasDaEspera(meioDiaSP)).toBe(8773)
  })
  test('dias até a Copa 2030 (estimada 08/06/2030)', () => {
    expect(diasAteProximaCopa(meioDiaSP)).toBe(1432)
    // nunca negativo depois da data
    expect(diasAteProximaCopa(new Date('2031-01-01T15:00:00Z'))).toBe(0)
  })
  test('formata em pt-BR', () => {
    expect(formatarDias(8773)).toBe('8.773')
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test` → FAIL (`Cannot find module '../src/lib/contadores'`).

- [ ] **Step 3: Implementar**

`src/data/datas.ts`:

```ts
/** Final de Yokohama — o penta. Início oficial da espera. */
export const DATA_PENTA = '2002-06-30'
/** Abertura estimada da Copa 2030 — a FIFA não confirmou, mas a espera sim. Ajustar aqui quando confirmar. */
export const DATA_COPA_2030_ESTIMADA = '2030-06-08'
export const TIMEZONE_BR = 'America/Sao_Paulo'
```

`src/lib/contadores.ts`:

```ts
import { DATA_PENTA, DATA_COPA_2030_ESTIMADA, TIMEZONE_BR } from '../data/datas'

const MS_POR_DIA = 86_400_000

export function hojeEmSaoPaulo(agora: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE_BR }).format(agora)
}

export function diasEntre(deISO: string, ateISO: string): number {
  const [y1, m1, d1] = deISO.split('-').map(Number)
  const [y2, m2, d2] = ateISO.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / MS_POR_DIA)
}

export function diasDaEspera(agora: Date): number {
  return diasEntre(DATA_PENTA, hojeEmSaoPaulo(agora))
}

export function diasAteProximaCopa(agora: Date): number {
  return Math.max(0, diasEntre(hojeEmSaoPaulo(agora), DATA_COPA_2030_ESTIMADA))
}

export function formatarDias(n: number): string {
  return n.toLocaleString('pt-BR')
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test` → PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add src/data/datas.ts src/lib/contadores.ts tests/contadores.test.ts
git commit -m "feat: matemática de datas do memorial (espera, countdown, tz São Paulo)"
```

---

### Task 3: Medidores absurdos — dados e cálculo (TDD)

**Files:**
- Create: `src/data/medidores.ts`
- Test: `tests/medidores.test.ts`

- [ ] **Step 1: Testes que falham**

`tests/medidores.test.ts`:

```ts
import { expect, test } from 'vitest'
import { MEDIDORES, anosDeEspera } from '../src/data/medidores'

const ref = new Date('2026-07-07T15:00:00Z')

test('anos de espera completos desde o penta', () => {
  expect(anosDeEspera(ref)).toBe(24)
  expect(anosDeEspera(new Date('2026-06-29T15:00:00Z'))).toBe(23) // véspera do aniversário
})

test('todo medidor produz valor positivo e tem rótulo e nota', () => {
  for (const m of MEDIDORES) {
    expect(m.valor(ref), m.id).toBeGreaterThan(0)
    expect(m.rotulo.length, m.id).toBeGreaterThan(0)
    expect(m.nota.length, m.id).toBeGreaterThan(0)
  }
})

test('valores conferidos na data de referência', () => {
  const porId = Object.fromEntries(MEDIDORES.map((m) => [m.id, m.valor(ref)]))
  expect(porId['mandatos']).toBe(5)
  expect(porId['tecnicos']).toBe(9)
  expect(porId['copas-perdidas']).toBe(6)
  expect(porId['campeoes-na-fila']).toBe(5)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

`src/data/medidores.ts`:

```ts
import { diasDaEspera, hojeEmSaoPaulo, diasEntre } from '../lib/contadores'
import { DATA_PENTA } from './datas'

export interface Medidor {
  id: string
  rotulo: string
  valor: (agora: Date) => number
  nota: string
}

export function anosDeEspera(agora: Date): number {
  return Math.floor(diasEntre(DATA_PENTA, hojeEmSaoPaulo(agora)) / 365.2425)
}

// Listas fixas: atualizar exige mexer só aqui.
const MANDATOS_DESDE_O_PENTA = ['Lula I–II (2003)', 'Dilma I–II (2011)', 'Temer (2016)', 'Bolsonaro (2019)', 'Lula III (2023)']
const TECNICOS_DESDE_O_PENTA = ['Parreira', 'Dunga', 'Mano Menezes', 'Felipão (de novo)', 'Dunga (de novo)', 'Tite', 'Ramon Menezes (interino)', 'Dorival Jr.', 'Ancelotti']
const CAMPEOES_NA_NOSSA_FRENTE = ['Itália 2006', 'Espanha 2010', 'Alemanha 2014', 'França 2018', 'Argentina 2022']

export const MEDIDORES: Medidor[] = [
  {
    id: 'dias', rotulo: 'dias de espera', valor: (a) => diasDaEspera(a),
    nota: 'Contados um a um. Conferimos.',
  },
  {
    id: 'mandatos', rotulo: 'mandatos presidenciais', valor: () => MANDATOS_DESDE_O_PENTA.length,
    nota: 'Um presidente voltou na esperança de ver o hexa. Ainda nada.',
  },
  {
    id: 'tecnicos', rotulo: 'passagens de técnico pela Seleção', valor: () => TECNICOS_DESDE_O_PENTA.length,
    nota: 'Duas delas repetidas. A definição de insistência.',
  },
  {
    id: 'iphones', rotulo: 'gerações de iPhone lançadas', valor: (a) => Math.max(0, anosDeEspera(a) - 5),
    nota: 'Todas. O iPhone não existia quando fomos campeões.',
  },
  {
    id: 'copas-perdidas', rotulo: 'Copas disputadas sem título', valor: () => 6,
    nota: '2006, 2010, 2014, 2018, 2022, 2026. A coleção completa.',
  },
  {
    id: 'campeoes-na-fila', rotulo: 'países que levantaram a taça na nossa frente', valor: () => CAMPEOES_NA_NOSSA_FRENTE.length,
    nota: 'A Argentina inclusive. Em dezembro de 2022. Doeu digitar isso.',
  },
]
```

Nota: `iphones` = anos de espera − 5 (primeiro iPhone: 2007, cinco anos após o penta — aproximação de uma geração/ano, honesta o suficiente pra zoação).

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/medidores.ts tests/medidores.test.ts
git commit -m "feat: medidores absurdos da espera (dados + cálculo)"
```

---

### Task 4: Quiz — dados e pontuação (TDD)

**Files:**
- Create: `src/data/quiz.ts`, `src/lib/quiz-logic.ts`
- Test: `tests/quiz.test.ts`

- [ ] **Step 1: Testes que falham**

`tests/quiz.test.ts`:

```ts
import { expect, test } from 'vitest'
import { PERGUNTAS } from '../src/data/quiz'
import { calcularPatente } from '../src/lib/quiz-logic'

test('quiz tem 8 perguntas com exatamente 1 correta cada', () => {
  expect(PERGUNTAS).toHaveLength(8)
  for (const p of PERGUNTAS) {
    expect(p.opcoes.filter((o) => o.correta), p.texto).toHaveLength(1)
    expect(p.opcoes.length).toBeGreaterThanOrEqual(3)
  }
})

test('patentes cobrem toda a faixa 0..8 e são crescentes em sofrimento', () => {
  expect(calcularPatente(0).titulo).toBe('Torcedor de Novela')
  expect(calcularPatente(2).titulo).toBe('Torcedor de Novela')
  expect(calcularPatente(3).titulo).toBe('Sofredor Júnior')
  expect(calcularPatente(5).titulo).toBe('Sofredor Júnior')
  expect(calcularPatente(6).titulo).toBe('Sofredor Sênior')
  expect(calcularPatente(7).titulo).toBe('Sofredor Sênior')
  expect(calcularPatente(8).titulo).toBe('Doutor em Vexames, Honoris Causa')
})

test('patente carrega o placar no formato N/8', () => {
  expect(calcularPatente(6).placar).toBe('6/8 vexames presenciados')
})
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test` → FAIL.

- [ ] **Step 3: Implementar**

`src/data/quiz.ts` (conteúdo derivado de `docs/pesquisa-zoacao.md`):

```ts
export interface OpcaoQuiz { texto: string; correta: boolean }
export interface PerguntaQuiz { texto: string; opcoes: OpcaoQuiz[]; consolo: string }

export const PERGUNTAS: PerguntaQuiz[] = [
  {
    texto: 'No gol que nos eliminou em 2006, Roberto Carlos estava…',
    opcoes: [
      { texto: 'Marcando o Henry', correta: false },
      { texto: 'Amarrando a chuteira', correta: true },
      { texto: 'Cobrando falta', correta: false },
    ],
    consolo: 'O cadarço está bem, obrigado por perguntar.',
  },
  {
    texto: 'Em 2010, Felipe Melo participou de quantos dos 3 gols do jogo?',
    opcoes: [
      { texto: '1', correta: false },
      { texto: '2', correta: false },
      { texto: 'Todos os 3 (assistência, gol contra e clima)', correta: true },
    ],
    consolo: 'Ele ainda nos deve um feriado.',
  },
  {
    texto: 'Em 2014, quantos gols a Alemanha marcou entre os minutos 23 e 29?',
    opcoes: [
      { texto: '2', correta: false },
      { texto: '3', correta: false },
      { texto: '4', correta: true },
    ],
    consolo: 'O replay de um gol foi interrompido por outro gol. Isso aconteceu.',
  },
  {
    texto: 'Quanto tempo o Neymar passou deitado no gramado na Copa de 2018?',
    opcoes: [
      { texto: 'Uns 3 minutos', correta: false },
      { texto: 'Quase 14 minutos', correta: true },
      { texto: 'Meia hora', correta: false },
    ],
    consolo: 'O mundo inteiro rolou junto. #NeymarChallenge.',
  },
  {
    texto: 'Em 2022, quem foi guardado para o 5º pênalti — que nunca chegou?',
    opcoes: [
      { texto: 'Neymar', correta: true },
      { texto: 'Casemiro', correta: false },
      { texto: 'Pedro', correta: false },
    ],
    consolo: 'O momento de maior pressão segue aguardando.',
  },
  {
    texto: 'Que animal amaldiçoou a Seleção na coletiva de 2022?',
    opcoes: [
      { texto: 'Um pombo', correta: false },
      { texto: 'Um gato', correta: true },
      { texto: 'Uma capivara', correta: false },
    ],
    consolo: 'Batizado de Hexa. Arremessado da mesa. Nunca mais fomos os mesmos.',
  },
  {
    texto: 'Qual foi a última vez que o Brasil eliminou um europeu em mata-mata de Copa?',
    opcoes: [
      { texto: '2010', correta: false },
      { texto: '2006', correta: false },
      { texto: '2002', correta: true },
    ],
    consolo: 'Seis eliminações seguidas para europeus desde então. A tendência é científica.',
  },
  {
    texto: 'Neymar estreou pela Seleção em 2010 e se despediu em 2026. Em qual estádio aconteceram os dois?',
    opcoes: [
      { texto: 'Maracanã', correta: false },
      { texto: 'MetLife Stadium', correta: true },
      { texto: 'Camp Nou', correta: false },
    ],
    consolo: '"Começou aqui e terminei aqui. Acabou." Nunca saia de Nova Jersey.',
  },
]
```

`src/lib/quiz-logic.ts`:

```ts
export interface Patente { titulo: string; placar: string; descricao: string }

const FAIXAS: Array<{ min: number; titulo: string; descricao: string }> = [
  { min: 8, titulo: 'Doutor em Vexames, Honoris Causa', descricao: 'Presenciou tudo. Lembra de tudo. Não superou nada.' },
  { min: 6, titulo: 'Sofredor Sênior', descricao: 'Sabe de cor o que preferia esquecer.' },
  { min: 3, titulo: 'Sofredor Júnior', descricao: 'Sofreu, mas ainda dorme à noite.' },
  { min: 0, titulo: 'Torcedor de Novela', descricao: 'Só chega para a final. Invejável.' },
]

export function calcularPatente(acertos: number): Patente {
  const faixa = FAIXAS.find((f) => acertos >= f.min)!
  return { titulo: faixa.titulo, placar: `${acertos}/8 vexames presenciados`, descricao: faixa.descricao }
}
```

- [ ] **Step 4: Rodar e ver passar** — `npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/quiz.ts src/lib/quiz-logic.ts tests/quiz.test.ts
git commit -m "feat: quiz do sofrimento (perguntas + patentes)"
```

---

### Task 5: Casca HTML + tema Memorial de Mármore

**Files:**
- Modify: `index.html`
- Create: `src/styles/main.css`

- [ ] **Step 1: index.html definitivo**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cadê o Hexa? — Memorial da Espera</title>
    <meta name="description" content="Memorial nacional da espera pelo hexa. O povo mantém a fé." />
    <meta property="og:title" content="Cadê o Hexa?" />
    <meta property="og:description" content="Estamos esperando. Contando dia por dia." />
    <meta property="og:image" content="/og" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <canvas id="cena3d" aria-hidden="true"></canvas>
    <main>
      <section id="heroi" class="secao"></section>
      <section id="proxima-tentativa" class="secao"></section>
      <section id="ala-das-tentativas" class="secao"></section>
      <section id="medidores" class="secao"></section>
      <section id="profecia" class="secao"></section>
      <section id="quiz" class="secao"></section>
      <section id="card" class="secao"></section>
      <footer id="placa-final" class="secao"></footer>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Tema CSS**

`src/styles/main.css`:

```css
:root {
  --marmore-0: #0a0805;
  --marmore-1: #14100a;
  --marmore-2: #1c1810;
  --ouro-vivo: #f0d693;
  --ouro: #d4af5f;
  --ouro-baco: #8a7245;
  --ouro-sombra: #6e5c38;
  --serifa: Georgia, 'Times New Roman', serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background: var(--marmore-0);
  color: var(--ouro);
  font-family: var(--serifa);
  overflow-x: hidden;
}

#cena3d {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

main { position: relative; z-index: 1; }

.secao {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12vh 1.5rem;
  text-align: center;
}

.rotulo {
  font-size: 0.75rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--ouro-baco);
}

.numero-gigante {
  font-size: clamp(3.5rem, 16vw, 9rem);
  font-weight: 700;
  color: var(--ouro-vivo);
  text-shadow: 0 0 40px rgba(212, 175, 95, 0.35);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.legenda { font-style: italic; color: var(--ouro-sombra); margin-top: 1rem; }

.placa {
  border: 1px solid var(--ouro-sombra);
  background: linear-gradient(160deg, var(--marmore-2), var(--marmore-1));
  padding: 2rem;
  max-width: 34rem;
  margin: 1rem auto;
  border-radius: 2px;
}

.placa h3 { color: var(--ouro-vivo); letter-spacing: 0.08em; margin-bottom: 0.75rem; }
.placa p { color: var(--ouro); line-height: 1.6; }

button.solene {
  font-family: var(--serifa);
  background: none;
  border: 1px solid var(--ouro);
  color: var(--ouro-vivo);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.8rem;
  padding: 0.9rem 2.2rem;
  margin-top: 2rem;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
}
button.solene:hover { background: var(--ouro); color: var(--marmore-0); }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 3: Verificar**

Run: `npm run dev` → fundo quase preto, sem erro no console. (Seções vazias — ok.)

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles/main.css
git commit -m "feat: casca da página e tema Memorial de Mármore"
```

---

### Task 6: Herói — contador imediato + animação

**Files:**
- Create: `src/ui/hero.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implementar o herói**

`src/ui/hero.ts`:

```ts
import { diasDaEspera, formatarDias } from '../lib/contadores'

const TAGLINES = [
  'O povo mantém a fé.',
  'Ninguém disse que seria fácil. E não foi.',
  'A espera também é uma forma de tradição.',
  'Seis tentativas. A sétima vem aí.',
]

export function montarHeroi(el: HTMLElement): void {
  const dias = diasDaEspera(new Date())
  el.innerHTML = `
    <p class="rotulo">Memorial Nacional da Espera</p>
    <h1 class="numero-gigante" id="contador-dias">${formatarDias(dias)}</h1>
    <p class="rotulo">dias sem o hexa</p>
    <p class="legenda" id="tagline">Dia ${formatarDias(dias)}. ${TAGLINES[0]}</p>
  `
  animarContagem(el.querySelector('#contador-dias')!, dias)
  rotacionarTaglines(el.querySelector('#tagline')!, dias)
}

function animarContagem(alvo: HTMLElement, valorFinal: number): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const duracao = 1800
  const inicio = performance.now()
  const partida = Math.max(0, valorFinal - 400)
  function frame(t: number) {
    const p = Math.min(1, (t - inicio) / duracao)
    const suave = 1 - Math.pow(1 - p, 3)
    alvo.textContent = formatarDias(Math.round(partida + (valorFinal - partida) * suave))
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

function rotacionarTaglines(alvo: HTMLElement, dias: number): void {
  let i = 0
  setInterval(() => {
    i = (i + 1) % TAGLINES.length
    alvo.textContent = `Dia ${formatarDias(dias)}. ${TAGLINES[i]}`
  }, 6000)
}
```

- [ ] **Step 2: Bootstrap no main.ts**

`src/main.ts` (substituir):

```ts
import { montarHeroi } from './ui/hero'

// O contador aparece antes de qualquer coisa — a piada nunca espera o WebGL.
montarHeroi(document.querySelector('#heroi')!)
```

- [ ] **Step 3: Verificar**

`npm run dev` → número gigante dourado conta até 8.77x na chegada; tagline troca a cada 6s.

- [ ] **Step 4: Commit**

```bash
git add src/ui/hero.ts src/main.ts
git commit -m "feat: herói com contador de dias e taglines solenes"
```

---

### Task 7: Countdown da próxima tentativa

**Files:**
- Create: `src/ui/countdown.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implementar**

`src/ui/countdown.ts`:

```ts
import { diasAteProximaCopa, formatarDias } from '../lib/contadores'

export function montarCountdown(el: HTMLElement): void {
  const dias = diasAteProximaCopa(new Date())
  el.innerHTML = `
    <p class="rotulo">Próxima tentativa</p>
    <h2 class="numero-gigante">${formatarDias(dias)}</h2>
    <p class="rotulo">dias até a Copa de 2030</p>
    <p class="legenda">Data estimada — a FIFA não confirmou. A espera, sim.</p>
  `
}
```

`src/main.ts` — adicionar:

```ts
import { montarCountdown } from './ui/countdown'
montarCountdown(document.querySelector('#proxima-tentativa')!)
```

- [ ] **Step 2: Verificar** — `npm run dev`, segunda dobra mostra ~1.43x dias.

- [ ] **Step 3: Commit**

```bash
git add src/ui/countdown.ts src/main.ts
git commit -m "feat: countdown solene para a Copa 2030"
```

---

### Task 8: Ala das Tentativas (timeline)

**Files:**
- Create: `src/data/copas.ts`, `src/ui/timeline.ts`
- Modify: `src/main.ts`, `src/styles/main.css`

- [ ] **Step 1: Dados das lápides**

`src/data/copas.ts` (conteúdo curado de `docs/pesquisa-zoacao.md`; epitáfios do spec §3.3):

```ts
export interface Copa {
  ano: number
  algoz: string
  placar: string
  placarOculto?: boolean // 2014: revela só em interação
  fase: string
  epitafio: string
  fatos: string[]
}

export const COPAS: Copa[] = [
  {
    ano: 2006, algoz: 'França', placar: '0x1', fase: 'quartas de final',
    epitafio: 'O Quadrado Trágico. Uma finalização no gol em 90 minutos.',
    fatos: [
      'Roberto Carlos amarrava a chuteira enquanto Henry marcava o gol da eliminação.',
      'O Quadrado Mágico jogou junto uma única vez em 18 jogos de Eliminatórias.',
      'Zidane deu chapéu no Ronaldo jogando lesionado na coxa.',
    ],
  },
  {
    ano: 2010, algoz: 'Holanda', placar: '1x2', fase: 'quartas de final',
    epitafio: 'Felipe Melo participou dos três gols do jogo. Dois foram para a Holanda.',
    fatos: [
      'Assistência, primeiro gol contra da história da Seleção em Copas e expulsão — tudo no mesmo jogo.',
      'A virada veio em 8 minutos; o gol de cabeça foi do Sneijder, o menor jogador em campo (1,70m).',
      'A comunidade "Felipe Melo me deve um feriado" juntou 10 mil pessoas no Orkut em dias.',
    ],
  },
  {
    ano: 2014, algoz: 'Alemanha', placar: '1x7', placarOculto: true, fase: 'semifinal, em casa',
    epitafio: 'O Incidente.',
    fatos: [
      '4 gols entre os minutos 23 e 29. O replay de um gol foi interrompido por outro gol.',
      'Klose quebrou o recorde do Ronaldo ali, com o Ronaldo no estádio comentando.',
      '35,6 milhões de tweets — o maior evento de zoação da história da internet brasileira.',
    ],
  },
  {
    ano: 2018, algoz: 'Bélgica', placar: '1x2', fase: 'quartas de final',
    epitafio: '27 finalizações contra 9. Metade dos gols da Bélgica foi nossa.',
    fatos: [
      'O primeiro gol belga foi gol contra do Fernandinho — que também estava em campo no Incidente de 2014.',
      'Neymar passou 13min50s da Copa deitado no gramado. O planeta rolou junto: #NeymarChallenge.',
      'Messi, Cristiano Ronaldo e Neymar foram eliminados na mesma semana. Só um deles rolando.',
    ],
  },
  {
    ano: 2022, algoz: 'Croácia', placar: '1(2)x(4)1', fase: 'quartas de final, nos pênaltis',
    epitafio: 'Neymar guardado para o 5º pênalti. Não houve 5º pênalti.',
    fatos: [
      'Caímos invictos no tempo normal, com mais posse de bola. A estatística consola. O placar não.',
      'Dias antes, um gato chamado Hexa foi arremessado da mesa na coletiva. Tire suas conclusões.',
      'O time que dançou em cada gol da fase de grupos não teve o que dançar nas quartas.',
    ],
  },
  {
    ano: 2026, algoz: 'Noruega', placar: '1x2', fase: 'OITAVAS de final',
    epitafio: 'Eliminados por um país com menos gente que a Grande Curitiba. Nas oitavas.',
    fatos: [
      'Pênalti perdido aos 14 minutos; dois gols do Haaland; gol de honra aos 90+10.',
      'Neymar se aposentou da Seleção no mesmo estádio em que estreou, 16 anos antes. "Acabou."',
      'A torcida deles remou. A nossa assistiu. Sexta eliminação consecutiva para europeus.',
    ],
  },
]

export const FECHO_DA_ALA =
  'Seis eliminações consecutivas para europeus. Nenhum europeu eliminado em mata-mata desde 2002. ' +
  'Com base na tendência, nosso Departamento de Projeções apresenta a seguir o futuro.'
```

- [ ] **Step 2: UI das lápides**

`src/ui/timeline.ts`:

```ts
import { COPAS, FECHO_DA_ALA } from '../data/copas'

export function montarTimeline(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">Ala das Tentativas · 2006–2026</p>
    <div class="lapides">
      ${COPAS.map(
        (c) => `
        <article class="placa lapide" data-ano="${c.ano}">
          <p class="rotulo">${c.ano} · ${c.fase}</p>
          <h3>${c.algoz} ${c.placarOculto ? `<button class="revelar" aria-label="revelar placar">†</button><span class="placar oculto">${c.placar}</span>` : c.placar}</h3>
          <p class="epitafio">“${c.epitafio}”</p>
          <ul class="fatos">${c.fatos.map((f) => `<li>${f}</li>`).join('')}</ul>
        </article>`,
      ).join('')}
    </div>
    <p class="legenda fecho">${FECHO_DA_ALA}</p>
  `
  el.querySelector('.revelar')?.addEventListener('click', (ev) => {
    const alvo = (ev.currentTarget as HTMLElement).nextElementSibling!
    alvo.classList.remove('oculto')
    ;(ev.currentTarget as HTMLElement).remove()
  })
}
```

- [ ] **Step 3: CSS das lápides** — acrescentar em `src/styles/main.css`:

```css
.lapides { display: grid; gap: 1.5rem; max-width: 40rem; width: 100%; }
.lapide { text-align: left; }
.lapide .epitafio { font-style: italic; color: var(--ouro-vivo); margin: 0.5rem 0 1rem; }
.lapide .fatos { list-style: none; }
.lapide .fatos li { color: var(--ouro-sombra); font-size: 0.9rem; line-height: 1.7; padding-left: 1rem; position: relative; }
.lapide .fatos li::before { content: '·'; position: absolute; left: 0; color: var(--ouro); }
.placar.oculto { display: none; }
.revelar { background: none; border: none; color: var(--ouro-baco); font-size: 1.2rem; cursor: pointer; }
.fecho { max-width: 34rem; }
```

- [ ] **Step 4: Registrar no main.ts**

```ts
import { montarTimeline } from './ui/timeline'
montarTimeline(document.querySelector('#ala-das-tentativas')!)
```

- [ ] **Step 5: Verificar** — `npm run dev`: 6 lápides; 2014 mostra `Alemanha †` e o placar 1x7 só aparece ao clicar no †.

- [ ] **Step 6: Commit**

```bash
git add src/data/copas.ts src/ui/timeline.ts src/main.ts src/styles/main.css
git commit -m "feat: Ala das Tentativas com lápides 2006-2026"
```

---

### Task 9: Medidores — UI com contagem no scroll

**Files:**
- Create: `src/ui/medidores.ts`
- Modify: `src/main.ts`, `src/styles/main.css`

- [ ] **Step 1: Implementar**

`src/ui/medidores.ts`:

```ts
import { MEDIDORES } from '../data/medidores'
import { formatarDias } from '../lib/contadores'

export function montarMedidores(el: HTMLElement): void {
  const agora = new Date()
  el.innerHTML = `
    <p class="rotulo">O que aconteceu enquanto esperávamos</p>
    <div class="grade-medidores">
      ${MEDIDORES.map((m) => {
        const v = m.valor(agora)
        return `
        <div class="placa medidor">
          <p class="numero-medidor" data-final="${v}">0</p>
          <p class="rotulo">${m.rotulo}</p>
          <p class="legenda">${m.nota}</p>
        </div>`
      }).join('')}
    </div>
  `
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        observador.unobserve(e.target)
        contar(e.target as HTMLElement)
      }
    },
    { threshold: 0.6 },
  )
  el.querySelectorAll('.numero-medidor').forEach((n) => observador.observe(n))
}

function contar(alvo: HTMLElement): void {
  const final = Number(alvo.dataset.final)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    alvo.textContent = formatarDias(final)
    return
  }
  const inicio = performance.now()
  const duracao = 1200
  function frame(t: number) {
    const p = Math.min(1, (t - inicio) / duracao)
    alvo.textContent = formatarDias(Math.round(final * (1 - Math.pow(1 - p, 3))))
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
```

CSS (acrescentar):

```css
.grade-medidores { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1.5rem; max-width: 60rem; width: 100%; }
.medidor { text-align: center; }
.numero-medidor { font-size: 3rem; font-weight: 700; color: var(--ouro-vivo); font-variant-numeric: tabular-nums; }
```

main.ts:

```ts
import { montarMedidores } from './ui/medidores'
montarMedidores(document.querySelector('#medidores')!)
```

- [ ] **Step 2: Verificar** — números contam de 0 ao valor quando a seção entra na tela.

- [ ] **Step 3: Commit**

```bash
git add src/ui/medidores.ts src/main.ts src/styles/main.css
git commit -m "feat: medidores absurdos com contagem animada no scroll"
```

---

### Task 10: A Profecia — tabela + gráfico da vergonha

**Files:**
- Create: `src/data/profecia.ts`, `src/ui/profecia.ts`
- Modify: `src/main.ts`, `src/styles/main.css`

- [ ] **Step 1: Dados**

`src/data/profecia.ts`:

```ts
export interface Previsao {
  ano: number
  sede: string
  algoz: string
  populacao: number
  populacaoRotulo: string
  fase: string
  nota: string
}

export const PROFECIA: Previsao[] = [
  {
    ano: 2030, sede: 'Espanha/Portugal/Marrocos', algoz: 'Islândia', populacao: 390_000, populacaoRotulo: '390 mil',
    fase: 'fase de grupos',
    nota: 'Mais vulcões ativos que jogadores profissionais. As palmas vikings já estão ensaiadas.',
  },
  {
    ano: 2034, sede: 'Arábia Saudita', algoz: 'Ilhas Faroé', populacao: 54_000, populacaoRotulo: '54 mil',
    fase: 'repescagem intercontinental',
    nota: 'Primeira seleção da história com mais ovelhas que torcedores.',
  },
  {
    ano: 2038, sede: 'a definir', algoz: 'San Marino', populacao: 34_000, populacaoRotulo: '34 mil',
    fase: 'Eliminatórias',
    nota: 'A pior seleção do ranking FIFA quebra um jejum milenar justamente contra nós. Estatisticamente inevitável.',
  },
  {
    ano: 2042, sede: 'a definir', algoz: 'Vaticano', populacao: 764, populacaoRotulo: '764',
    fase: 'amistoso preparatório',
    nota: 'Gol de milagre aos 90+7. O VAR não pode contestar decisão divina. O Papa decreta feriado.',
  },
  {
    ano: 2046, sede: 'a definir', algoz: 'Robôs da RoboCup', populacao: 22, populacaoRotulo: '22 robôs',
    fase: 'sorteio dos grupos',
    nota: 'A meta oficial do projeto era vencer os campeões humanos em 2050. Contra o Brasil, anteciparam.*',
  },
  {
    ano: 2050, sede: 'a definir', algoz: 'Seleção do Gemini', populacao: 1, populacaoRotulo: '1 modelo',
    fase: 'antes da convocação',
    nota: 'A seleção do Claude Code, invicta, recusou o convite por falta de desafio. O Gemini alucinou um impedimento no próprio ataque, pediu desculpas duas vezes — e venceu de 2x1, com gol contra nosso.',
  },
]

export const RODAPE_PROFECIA =
  'Projeção por regressão linear da vergonha (R² = 0,97). A ciência não erra. ' +
  '*A meta da RoboCup para 2050 é real e verificável. Nós conferimos. Duas vezes.'
```

- [ ] **Step 2: UI + gráfico SVG (escala log, sem lib)**

`src/ui/profecia.ts`:

```ts
import { PROFECIA, RODAPE_PROFECIA } from '../data/profecia'

export function montarProfecia(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">A Profecia · Departamento de Projeções Estatísticas</p>
    <p class="legenda">A cada Copa, o algoz encolhe e a queda chega mais cedo. Extrapolamos.</p>
    ${graficoDaVergonha()}
    <div class="lapides">
      ${PROFECIA.map(
        (p) => `
        <article class="placa lapide">
          <p class="rotulo">${p.ano} · ${p.sede} · queda prevista: ${p.fase}</p>
          <h3>${p.algoz} <small>(${p.populacaoRotulo})</small></h3>
          <p class="epitafio">${p.nota}</p>
        </article>`,
      ).join('')}
    </div>
    <p class="legenda fecho">${RODAPE_PROFECIA}</p>
  `
}

function graficoDaVergonha(): string {
  const larg = 640, alt = 220, margem = 40
  const anos = PROFECIA.map((p) => p.ano)
  const xDe = (ano: number) =>
    margem + ((ano - anos[0]) / (anos[anos.length - 1] - anos[0])) * (larg - 2 * margem)
  const logMax = Math.log10(390_000)
  const yDe = (pop: number) => margem + (1 - Math.log10(Math.max(pop, 1)) / logMax) * (alt - 2 * margem)
  const pontos = PROFECIA.map((p) => `${xDe(p.ano)},${yDe(p.populacao)}`).join(' ')
  return `
    <svg viewBox="0 0 ${larg} ${alt}" class="grafico-vergonha" role="img"
         aria-label="População do algoz por Copa, em escala logarítmica decrescente">
      <polyline points="${pontos}" fill="none" stroke="var(--ouro)" stroke-width="2" />
      ${PROFECIA.map(
        (p) => `
        <circle cx="${xDe(p.ano)}" cy="${yDe(p.populacao)}" r="4" fill="var(--ouro-vivo)" />
        <text x="${xDe(p.ano)}" y="${alt - 12}" text-anchor="middle" class="tique">${p.ano}</text>`,
      ).join('')}
    </svg>`
}
```

CSS (acrescentar):

```css
.grafico-vergonha { width: min(40rem, 100%); margin: 2rem 0; }
.grafico-vergonha .tique { fill: var(--ouro-baco); font-size: 11px; font-family: var(--serifa); }
```

main.ts:

```ts
import { montarProfecia } from './ui/profecia'
montarProfecia(document.querySelector('#profecia')!)
```

- [ ] **Step 3: Verificar** — curva dourada despencando de 2030 a 2050; 6 placas com as previsões; rodapé com o R².

- [ ] **Step 4: Commit**

```bash
git add src/data/profecia.ts src/ui/profecia.ts src/main.ts src/styles/main.css
git commit -m "feat: a Profecia com gráfico logarítmico da vergonha"
```

---

### Task 11: Quiz — UI

**Files:**
- Create: `src/ui/quiz.ts`
- Modify: `src/main.ts`, `src/styles/main.css`

- [ ] **Step 1: Implementar**

`src/ui/quiz.ts`:

```ts
import { PERGUNTAS } from '../data/quiz'
import { calcularPatente, type Patente } from '../lib/quiz-logic'

let patenteAtual: Patente | null = null
export function obterPatente(): Patente | null {
  return patenteAtual
}

export function montarQuiz(el: HTMLElement): void {
  let indice = 0
  let acertos = 0

  function renderizarPergunta(): void {
    const p = PERGUNTAS[indice]
    el.innerHTML = `
      <p class="rotulo">Exame Oficial de Sofrimento · ${indice + 1}/${PERGUNTAS.length}</p>
      <div class="placa">
        <h3>${p.texto}</h3>
        <div class="opcoes">
          ${p.opcoes.map((o, i) => `<button class="solene opcao" data-i="${i}">${o.texto}</button>`).join('')}
        </div>
        <p class="legenda consolo" hidden>${p.consolo}</p>
      </div>
    `
    el.querySelectorAll<HTMLButtonElement>('.opcao').forEach((btn) =>
      btn.addEventListener('click', () => {
        const escolhida = p.opcoes[Number(btn.dataset.i)]
        if (escolhida.correta) acertos++
        el.querySelectorAll<HTMLButtonElement>('.opcao').forEach((b, i) => {
          b.disabled = true
          if (p.opcoes[i].correta) b.classList.add('correta')
          else if (b === btn) b.classList.add('errada')
        })
        el.querySelector<HTMLElement>('.consolo')!.hidden = false
        setTimeout(() => {
          indice++
          indice < PERGUNTAS.length ? renderizarPergunta() : renderizarResultado()
        }, 2200)
      }),
    )
  }

  function renderizarResultado(): void {
    patenteAtual = calcularPatente(acertos)
    el.innerHTML = `
      <p class="rotulo">Diploma de Sofrimento</p>
      <div class="placa">
        <h3>${patenteAtual.titulo}</h3>
        <p class="epitafio">${patenteAtual.placar}</p>
        <p class="legenda">${patenteAtual.descricao}</p>
        <button class="solene" id="refazer">Sofrer novamente</button>
      </div>
    `
    el.querySelector('#refazer')!.addEventListener('click', () => {
      indice = 0
      acertos = 0
      renderizarPergunta()
    })
    document.dispatchEvent(new CustomEvent('patente-emitida'))
  }

  el.innerHTML = `
    <p class="rotulo">Exame Oficial de Sofrimento</p>
    <div class="placa">
      <h3>Quanto você sofreu?</h3>
      <p class="legenda">8 perguntas. Suas cicatrizes serão avaliadas por uma banca solene.</p>
      <button class="solene" id="comecar">Iniciar o exame</button>
    </div>
  `
  el.querySelector('#comecar')!.addEventListener('click', renderizarPergunta)
}
```

CSS (acrescentar):

```css
.opcoes { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1rem; }
.opcao.correta { border-color: var(--ouro-vivo); background: var(--ouro); color: var(--marmore-0); }
.opcao.errada { opacity: 0.35; }
```

main.ts:

```ts
import { montarQuiz } from './ui/quiz'
montarQuiz(document.querySelector('#quiz')!)
```

- [ ] **Step 2: Verificar** — fluxo completo: iniciar → 8 perguntas com feedback e consolo → diploma com patente → refazer funciona.

- [ ] **Step 3: Commit**

```bash
git add src/ui/quiz.ts src/main.ts src/styles/main.css
git commit -m "feat: Exame Oficial de Sofrimento (quiz com patentes)"
```

---

### Task 12: Gerador de card compartilhável

**Files:**
- Create: `src/ui/card.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Implementar**

`src/ui/card.ts`:

```ts
import { diasDaEspera, formatarDias } from '../lib/contadores'
import { obterPatente } from './quiz'

const L = 1080, A = 1080

export function montarCard(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">Ateste publicamente o seu luto</p>
    <canvas id="canvas-card" width="${L}" height="${A}"></canvas>
    <div>
      <button class="solene" id="compartilhar">Compartilhar</button>
      <button class="solene" id="baixar">Baixar</button>
    </div>
  `
  const canvas = el.querySelector<HTMLCanvasElement>('#canvas-card')!
  desenhar(canvas)
  document.addEventListener('patente-emitida', () => desenhar(canvas))

  el.querySelector('#compartilhar')!.addEventListener('click', async () => {
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
    const arquivo = new File([blob], 'cadeohexa.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo], title: 'Cadê o Hexa?' })
    } else {
      baixar(canvas)
    }
  })
  el.querySelector('#baixar')!.addEventListener('click', () => baixar(canvas))
}

function baixar(canvas: HTMLCanvasElement): void {
  const a = document.createElement('a')
  a.download = 'cadeohexa.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

function desenhar(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!
  const dias = formatarDias(diasDaEspera(new Date()))
  const patente = obterPatente()

  const fundo = ctx.createRadialGradient(L / 2, A * 0.3, 80, L / 2, A / 2, A * 0.8)
  fundo.addColorStop(0, '#1c1810')
  fundo.addColorStop(1, '#0a0805')
  ctx.fillStyle = fundo
  ctx.fillRect(0, 0, L, A)
  ctx.strokeStyle = '#6e5c38'
  ctx.strokeRect(40, 40, L - 80, A - 80)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#8a7245'
  ctx.font = '32px Georgia'
  ctx.fillText('M E M O R I A L   D A   E S P E R A', L / 2, 180)

  ctx.fillStyle = '#f0d693'
  ctx.font = 'bold 220px Georgia'
  ctx.fillText(dias, L / 2, 520)

  ctx.fillStyle = '#b39558'
  ctx.font = '44px Georgia'
  ctx.fillText('dias sem o hexa', L / 2, 600)

  if (patente) {
    ctx.fillStyle = '#d4af5f'
    ctx.font = 'italic 48px Georgia'
    ctx.fillText(patente.titulo, L / 2, 760)
    ctx.font = '36px Georgia'
    ctx.fillText(patente.placar, L / 2, 820)
  }

  ctx.fillStyle = '#6e5c38'
  ctx.font = '30px Georgia'
  ctx.fillText('cadeohexa.pages.dev', L / 2, A - 90)
}
```

CSS (acrescentar):

```css
#canvas-card { width: min(24rem, 90vw); height: auto; border: 1px solid var(--ouro-sombra); margin: 1.5rem 0; }
```

main.ts:

```ts
import { montarCard } from './ui/card'
montarCard(document.querySelector('#card')!)
```

- [ ] **Step 2: Verificar** — card renderiza com o contador; após terminar o quiz, patente aparece no card; Baixar salva PNG; Compartilhar abre share sheet no mobile (no desktop cai no download).

- [ ] **Step 3: Commit**

```bash
git add src/ui/card.ts src/main.ts src/styles/main.css
git commit -m "feat: gerador de card com Web Share e fallback de download"
```

---

### Task 13: Rodapé-placa

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Implementar direto no main.ts** (pequeno demais pra módulo):

```ts
import { diasDaEspera, formatarDias } from './lib/contadores'

const rodape = document.querySelector<HTMLElement>('#placa-final')!
rodape.innerHTML = `
  <div class="placa">
    <p class="rotulo">Placa de inauguração</p>
    <p>Este memorial foi inaugurado no dia ${formatarDias(diasDaEspera(new Date()))} da espera.</p>
    <p class="legenda">Ele será demolido em caso de hexa. Ninguém aqui está com pressa de demolir.</p>
  </div>
  <div id="slot-apoio" aria-hidden="true"></div>
`
```

(`#slot-apoio` é o espaço reservado do spec §3.8 — vazio na fase 1.)

- [ ] **Step 2: Verificar e commit**

```bash
git add src/main.ts
git commit -m "feat: rodapé-placa de inauguração com slot reservado"
```

---

### Task 14: Cena 3D — taça sob o facho de luz (lazy + fallback)

**Files:**
- Create: `src/cena3d/index.ts`, `src/cena3d/taca.ts`
- Modify: `src/main.ts`, `src/styles/main.css`

- [ ] **Step 1: Taça procedural**

`src/cena3d/taca.ts`:

```ts
import * as THREE from 'three'

/** Perfil de revolução da taça (x = raio, y = altura). Low-poly de propósito. */
const PERFIL: Array<[number, number]> = [
  [0.00, 0.00], [0.85, 0.00], [0.85, 0.12], [0.35, 0.20], [0.22, 0.55],
  [0.16, 0.85], [0.30, 1.15], [0.62, 1.45], [0.72, 1.80], [0.58, 2.10],
  [0.30, 2.28], [0.00, 2.32],
]

export function criarTaca(): THREE.Mesh {
  const pontos = PERFIL.map(([x, y]) => new THREE.Vector2(x, y))
  const geometria = new THREE.LatheGeometry(pontos, 48)
  const material = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.92, roughness: 0.28,
  })
  const taca = new THREE.Mesh(geometria, material)
  taca.position.y = -1.1
  return taca
}
```

- [ ] **Step 2: Cena com detecção e boot**

`src/cena3d/index.ts`:

```ts
import * as THREE from 'three'
import { criarTaca } from './taca'

export function podeRodar3D(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const c = document.createElement('canvas')
  return !!(c.getContext('webgl2') ?? c.getContext('webgl'))
}

export function iniciarCena(canvas: HTMLCanvasElement): { taca: THREE.Mesh; camera: THREE.PerspectiveCamera } {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

  const cena = new THREE.Scene()
  cena.fog = new THREE.Fog(0x0a0805, 6, 14)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
  camera.position.set(0, 0.4, 6)

  const taca = criarTaca()
  cena.add(taca)

  const facho = new THREE.SpotLight(0xfff0c0, 260, 20, Math.PI / 7, 0.45)
  facho.position.set(0, 7, 2)
  facho.target = taca
  cena.add(facho, new THREE.AmbientLight(0x2a2115, 2))

  function redimensionar(): void {
    renderer.setSize(innerWidth, innerHeight, false)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', redimensionar)
  redimensionar()

  renderer.setAnimationLoop(() => {
    taca.rotation.y += 0.004
    renderer.render(cena, camera)
  })

  return { taca, camera }
}
```

- [ ] **Step 3: Carregamento tardio no main.ts** (depois de todas as seções montadas):

```ts
// 3D por último e só se der: a piada nunca espera o WebGL.
const canvas3d = document.querySelector<HTMLCanvasElement>('#cena3d')!
import('./cena3d').then(({ podeRodar3D, iniciarCena }) => {
  if (!podeRodar3D()) {
    canvas3d.remove()
    document.body.classList.add('sem-3d')
    return
  }
  const { taca, camera } = iniciarCena(canvas3d)
  import('./cena3d/scroll').then(({ ligarScroll }) => ligarScroll(taca, camera)).catch(() => {})
})
```

(O import de `./cena3d/scroll` vai falhar silenciosamente até a Task 15 criar o arquivo — aceitável por um commit; alternativa: só adicionar essas 2 linhas na Task 15. Preferir a alternativa: **nesta task, importar apenas `iniciarCena`**, sem o bloco do scroll.)

CSS fallback (acrescentar):

```css
.sem-3d #heroi { background: radial-gradient(ellipse at 50% 30%, var(--marmore-2), var(--marmore-0) 70%); }
```

- [ ] **Step 4: Verificar**

`npm run dev` → taça dourada girando devagar atrás do herói, iluminada por cima, fundo com névoa. Com DevTools → Rendering → "prefers-reduced-motion: reduce" → recarregar: sem canvas, herói com gradiente estático, tudo legível. `npm run build` → chunk do three separado do bundle inicial (conferir no output do Vite que `index` não contém three).

- [ ] **Step 5: Commit**

```bash
git add src/cena3d/ src/main.ts src/styles/main.css
git commit -m "feat: taça 3D procedural com lazy load e fallback sem WebGL"
```

---

### Task 15: Scroll cinematográfico (GSAP ScrollTrigger)

**Files:**
- Create: `src/cena3d/scroll.ts`
- Modify: `src/main.ts`, `src/styles/main.css`

- [ ] **Step 1: Implementar**

`src/cena3d/scroll.ts`:

```ts
import type * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Amarra o scroll da página à câmera/taça e revela as seções. */
export function ligarScroll(taca: THREE.Mesh, camera: THREE.PerspectiveCamera): void {
  // A câmera se afasta e sobe conforme o memorial se revela.
  gsap.to(camera.position, {
    z: 10, y: 2.2,
    ease: 'none',
    scrollTrigger: { trigger: '#proxima-tentativa', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
  })
  // A taça desce ao fundo depois do countdown — o museu segue sem ela.
  gsap.to(taca.position, {
    y: -6,
    ease: 'none',
    scrollTrigger: { trigger: '#ala-das-tentativas', start: 'top bottom', end: 'top center', scrub: 0.6 },
  })
  // Revelação solene de cada seção.
  document.querySelectorAll<HTMLElement>('.secao').forEach((secao) => {
    gsap.from(secao.children, {
      opacity: 0, y: 40, stagger: 0.12, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: secao, start: 'top 70%' },
    })
  })
}
```

main.ts — completar o bloco do 3D da Task 14:

```ts
import('./cena3d').then(async ({ podeRodar3D, iniciarCena }) => {
  if (!podeRodar3D()) {
    canvas3d.remove()
    document.body.classList.add('sem-3d')
    return
  }
  const { taca, camera } = iniciarCena(canvas3d)
  const { ligarScroll } = await import('./cena3d/scroll')
  ligarScroll(taca, camera)
})
```

- [ ] **Step 2: Verificar** — rolar a página: câmera recua/sobe na 2ª dobra, taça mergulha antes da Ala, seções entram com fade solene; sem reduced-motion nada disso roda (o guard da Task 14 já corta tudo).

- [ ] **Step 3: Commit**

```bash
git add src/cena3d/scroll.ts src/main.ts
git commit -m "feat: scroll cinematográfico amarrando câmera e revelações"
```

---

### Task 16: OG image dinâmica (Pages Function) — template TDD

**Files:**
- Create: `src/lib/og-template.ts`, `functions/og.ts`
- Test: `tests/og-template.test.ts`

- [ ] **Step 1: Teste que falha**

`tests/og-template.test.ts`:

```ts
import { expect, test } from 'vitest'
import { ogHtml } from '../src/lib/og-template'

test('template OG contém o contador formatado e a marca', () => {
  const html = ogHtml('8.773')
  expect(html).toContain('8.773')
  expect(html).toContain('dias sem o hexa')
  expect(html).toContain('cadeohexa')
})
```

Run: `npm test` → FAIL.

- [ ] **Step 2: Implementar template**

`src/lib/og-template.ts` (HTML inline-styles — formato que o satori/workers-og entende):

```ts
export function ogHtml(diasFormatado: string): string {
  return `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
              width:100%;height:100%;background:#0a0805;color:#d4af5f;font-family:Georgia;">
    <div style="font-size:28px;letter-spacing:12px;color:#8a7245;">MEMORIAL DA ESPERA</div>
    <div style="font-size:190px;font-weight:700;color:#f0d693;margin:10px 0;">${diasFormatado}</div>
    <div style="font-size:40px;color:#b39558;">dias sem o hexa</div>
    <div style="font-size:26px;color:#6e5c38;margin-top:30px;">cadeohexa.pages.dev</div>
  </div>`
}
```

Run: `npm test` → PASS.

- [ ] **Step 3: Pages Function**

`functions/og.ts`:

```ts
import { ImageResponse } from 'workers-og'
import { diasDaEspera, formatarDias } from '../src/lib/contadores'
import { ogHtml } from '../src/lib/og-template'

export const onRequest: PagesFunction = async () => {
  const dias = formatarDias(diasDaEspera(new Date()))
  return new ImageResponse(ogHtml(dias), {
    width: 1200,
    height: 630,
    headers: { 'cache-control': 'public, max-age=3600' },
  })
}
```

Se `PagesFunction` não for reconhecido pelo TS: `npm i -D @cloudflare/workers-types` e adicionar `"types": ["@cloudflare/workers-types"]` num `tsconfig.functions.json` próprio de `functions/` (não poluir o tsconfig do site). O build do Vite não compila `functions/` — o Wrangler/Pages cuida disso.

- [ ] **Step 4: Verificar localmente**

```bash
npm run build && npx wrangler pages dev dist
```

Abrir `http://localhost:8788/og` → PNG 1200x630 com o contador do dia. (Primeira execução baixa o runtime do wrangler.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/og-template.ts functions/ tests/og-template.test.ts package.json package-lock.json
git commit -m "feat: OG image dinâmica com o contador do dia (Pages Function)"
```

---

### Task 17: Verificação final + deploy

**Files:**
- Create: `README.md`

- [ ] **Step 1: Suíte completa + build**

```bash
npm test && npm run build
```

Expected: todos os testes PASS; build limpo; chunk do three separado.

- [ ] **Step 2: Checklist manual (usar `npx wrangler pages dev dist`)**

- Contador aparece instantaneamente (desligar cache + throttling "Fast 4G" no DevTools: texto do herói < 1,5s).
- Fluxo inteiro no mobile viewport (375px): nada estoura horizontalmente.
- Quiz completo → card com patente → download OK.
- `prefers-reduced-motion` → sem 3D, tudo legível.
- `/og` responde PNG com o número correto.

- [ ] **Step 3: README curto**

```markdown
# Cadê o Hexa? — Memorial da Espera

Site-zoação: contador de dias desde o penta, countdown pra 2030, a Ala das
Tentativas, a Profecia e o Exame Oficial de Sofrimento.

- `npm run dev` — desenvolvimento
- `npm test` — Vitest (datas, quiz, OG template)
- `npm run build && npm run preview` — build + Pages Functions locais
- Deploy: `npx wrangler pages deploy dist --project-name cadeohexa`

Conteúdo/piadas: `src/data/` · Spec: `docs/superpowers/specs/` · Pesquisa: `docs/pesquisa-zoacao.md`
```

- [ ] **Step 4: Deploy**

```bash
npx wrangler login          # se necessário (abre navegador — pedir pro andre)
npx wrangler pages project create cadeohexa --production-branch main
npx wrangler pages deploy dist --project-name cadeohexa
```

Expected: URL `https://cadeohexa.pages.dev` no ar. Testar `/og` em produção e o preview do link no WhatsApp Web.

- [ ] **Step 5: Commit final**

```bash
git add README.md && git commit -m "docs: README com comandos e mapa do projeto"
```

---

## Self-review (feito na escrita do plano)

- **Cobertura do spec:** §3.1→T6+T14, §3.2→T7, §3.3→T8, §3.4→T3+T9, §3.5→T10, §3.6→T4+T11, §3.7→T12, §3.8→T13, §4→T1/T16, §5→T14 (fallback) + T17 (checklist), §6→T2/T3/T4/T16, §7 fora de escopo — ok.
- **Placeholders:** nenhum "TBD"/"depois"; os "a definir" em `profecia.ts` são conteúdo (sedes que a FIFA não definiu).
- **Consistência de tipos:** `Patente` (T4) usada em T11/T12 via `obterPatente()`; `formatarDias` (T2) usada em T6/T7/T9/T12/T13/T16; `iniciarCena` retorna `{taca, camera}` consumidos por `ligarScroll` (T15) — confere.
```
