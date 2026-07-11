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
