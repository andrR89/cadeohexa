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
