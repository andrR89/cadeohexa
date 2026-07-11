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
