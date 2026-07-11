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
