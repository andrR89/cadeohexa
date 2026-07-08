import { diasDaEspera, formatarDias, partesDaEspera, type PartesEspera } from '../lib/contadores'
import { TAGLINES } from '../data/taglines'

export function montarHeroi(el: HTMLElement): void {
  const dias = diasDaEspera(new Date())
  el.innerHTML = `
    <div class="heroi-taca-camada" aria-hidden="true">
      <img class="heroi-taca" src="/img/taca-heroi.jpg" alt="Taça sob o facho de luz" loading="eager" width="1024" height="1024" />
    </div>
    <div class="heroi-veu" aria-hidden="true"></div>
    <div class="heroi-conteudo">
      <p class="rotulo">Memorial Nacional da Espera</p>
      <h1 class="numero-gigante" id="contador-dias">${formatarDias(dias)}</h1>
      <p class="rotulo">dias sem o hexa</p>
      <p class="contador-detalhado" id="contador-detalhado" aria-hidden="true">${formatarPartes(partesDaEspera(new Date()))}</p>
      <p class="legenda" id="tagline">Dia ${formatarDias(dias)}. ${TAGLINES[0]}</p>
    </div>
  `
  animarContagem(el.querySelector('#contador-dias')!, dias)
  rotacionarTaglines(el.querySelector('#tagline')!, dias)
  iniciarContadorDetalhado(el.querySelector('#contador-detalhado')!)
}

// Singular/plural pt-BR só para as unidades por extenso; "h/min/seg" ficam
// abreviadas e invariáveis (uso diegético de UI, não é piada nem conteúdo editorial).
function unidade(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

function formatarPartes(p: PartesEspera): string {
  return [
    unidade(p.anos, 'ano', 'anos'),
    unidade(p.meses, 'mês', 'meses'),
    unidade(p.dias, 'dia', 'dias'),
    `${p.horas} h`,
    `${p.minutos} min`,
    `${p.segundos} seg`,
  ].join(' · ')
}

// Recalcula do zero a cada tique (não incrementa um contador local) para nunca
// acumular deriva; é o herói persistente da página, então não precisa de teardown.
function iniciarContadorDetalhado(alvo: HTMLElement): void {
  setInterval(() => {
    alvo.textContent = formatarPartes(partesDaEspera(new Date()))
  }, 1000)
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
