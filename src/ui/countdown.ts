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
