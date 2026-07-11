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

/** Cronômetro de partida imune a pausas do rAF (aba em segundo plano):
 * acumula o tempo quadro a quadro clampando cada delta em maxDeltaMs.
 * Uma pausa longa vira um único quadro curto — a partida congela em vez
 * de estourar os eventos acumulados de uma vez. O primeiro chamado só
 * calibra (retorna 0). */
export function criarCronometro(maxDeltaMs = 100): (agoraMs: number) => number {
  let ultimo: number | null = null
  let acumulado = 0
  return (agoraMs) => {
    if (ultimo !== null) acumulado += Math.min(Math.max(agoraMs - ultimo, 0), maxDeltaMs)
    ultimo = agoraMs
    return acumulado
  }
}
