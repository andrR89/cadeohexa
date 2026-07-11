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
  yBoca: 0.8, // INVARIANTE: (1 − yBoca) · quedaMs (320ms) > maxDeltaMs do criarCronometro (100ms) — garante ≥3 frames de janela na boca
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
          if (item.tipo === 'chiclete') {
            barra = Math.max(0, barra - cfg.perdaChao)
            // Na hora: o gol do Haaland não espera o resto do quadro —
            // sem resgate por uma captura posterior no mesmo tick.
            if (barra <= 0) {
              resultado = 'derrota'
              return eventos
            }
          }
        }
      }
      if (barra <= 0) resultado = 'derrota' // Haaland marca na hora
      else if (tMs >= cfg.duracaoMs) resultado = 'vitoria'
      return eventos
    },
  }
}
