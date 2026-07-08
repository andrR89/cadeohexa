import { diasDaEspera, formatarDias } from '../lib/contadores'
import { TAGLINES } from '../data/taglines'

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
