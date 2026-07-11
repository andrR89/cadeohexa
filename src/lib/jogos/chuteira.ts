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
