import { MEDIDORES } from '../data/medidores'
import { formatarDias } from '../lib/contadores'

export function montarMedidores(el: HTMLElement): void {
  const agora = new Date()
  el.innerHTML = `
    <p class="rotulo">O que aconteceu enquanto esperávamos</p>
    <div class="grade-medidores">
      ${MEDIDORES.map((m) => {
        const v = m.valor(agora)
        return `
        <div class="placa medidor">
          <p class="numero-medidor" data-final="${v}">0</p>
          <p class="rotulo">${m.rotulo}</p>
          <p class="legenda">${m.nota}</p>
        </div>`
      }).join('')}
    </div>
  `
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        observador.unobserve(e.target)
        contar(e.target as HTMLElement)
      }
    },
    { threshold: 0.6 },
  )
  el.querySelectorAll('.numero-medidor').forEach((n) => observador.observe(n))
}

function contar(alvo: HTMLElement): void {
  const final = Number(alvo.dataset.final)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    alvo.textContent = formatarDias(final)
    return
  }
  const inicio = performance.now()
  const duracao = 1200
  function frame(t: number) {
    const p = Math.min(1, (t - inicio) / duracao)
    alvo.textContent = formatarDias(Math.round(final * (1 - Math.pow(1 - p, 3))))
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
