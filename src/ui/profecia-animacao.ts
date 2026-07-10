import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DURACAO_LINHA = 1.6
const INTERVALO_TREMOR_MS = 120
const AMPLITUDE_TREMOR = 0.8

/** Camada cinematográfica do gráfico da Profecia. Carregada por import()
 * dinâmico sob guard de prefers-reduced-motion; se este chunk nunca rodar, o
 * gráfico continua estático e clicável (rede de segurança em profecia.ts).
 * Nada aqui pode mexer na fiação de interatividade — só decora. */
export function ligarAnimacaoProfecia(el: HTMLElement): void {
  const svg = el.querySelector<SVGSVGElement>('.grafico-vergonha')
  const linha = el.querySelector<SVGPolylineElement>('.grafico-vergonha polyline')
  const pontos = [...el.querySelectorAll<SVGGElement>('.ponto-vergonha')]
  const tiques = [...el.querySelectorAll<SVGTextElement>('.grafico-vergonha .tique')]
  if (!svg || !linha || pontos.length === 0) return

  // Vértices originais da linha: o tremor oscila em torno deles e o restore
  // do flatline volta exatamente para cá.
  const vertices = (linha.getAttribute('points') ?? '')
    .trim()
    .split(/\s+/)
    .map((par) => par.split(',').map(Number) as [number, number])

  // ── Anel "você está aqui" ───────────────────────────────────────────
  const anel = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  anel.classList.add('anel-selecao')
  anel.setAttribute('r', '11')
  anel.setAttribute('cx', String(vertices[0]![0]))
  anel.setAttribute('cy', String(vertices[0]![1]))
  svg.appendChild(anel)

  // Fração do comprimento da linha em cada vértice — é o "trilho" do anel.
  const total = linha.getTotalLength()
  const fracoes = vertices.map((_, i) => {
    let acumulado = 0
    for (let j = 1; j <= i; j++) {
      const [x0, y0] = vertices[j - 1]!
      const [x1, y1] = vertices[j]!
      acumulado += Math.hypot(x1 - x0, y1 - y0)
    }
    return acumulado / total
  })

  const progresso = { valor: 0 }
  function deslizarAnelPara(indice: number): void {
    gsap.to(progresso, {
      valor: fracoes[indice] ?? 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onUpdate() {
        const p = linha!.getPointAtLength(progresso.valor * total)
        anel.setAttribute('cx', String(p.x))
        anel.setAttribute('cy', String(p.y))
      },
    })
  }

  // ── Tremor de eletrocardiograma + flatline ──────────────────────────
  // O tremor só roda com o gráfico desenhado, visível e sem flatline; fora
  // disso o intervalo é desligado (não gastar CPU com a seção fora da tela).
  let desenhado = false
  let visivel = false
  let flatline = false
  let tremor: ReturnType<typeof setInterval> | null = null

  const pontosOriginais = vertices.map(([x, y]) => `${x},${y}`).join(' ')
  function atualizarTremor(): void {
    const deveTremer = desenhado && visivel && !flatline
    if (deveTremer && tremor === null) {
      tremor = setInterval(() => {
        const tremidos = vertices
          .map(([x, y]) => `${x},${y + (Math.random() * 2 - 1) * AMPLITUDE_TREMOR}`)
          .join(' ')
        linha!.setAttribute('points', tremidos)
      }, INTERVALO_TREMOR_MS)
    } else if (!deveTremer && tremor !== null) {
      clearInterval(tremor)
      tremor = null
      linha!.setAttribute('points', pontosOriginais)
    }
  }

  ScrollTrigger.create({
    trigger: svg,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (auto) => {
      visivel = auto.isActive
      atualizarTremor()
    },
  })

  // O flatline (2050, Seleção das IAs) mata o tremor — coração parado não treme.
  el.addEventListener('profecia:selecao', (evento) => {
    const indice = (evento as CustomEvent<{ indice: number }>).detail.indice
    deslizarAnelPara(indice)
    flatline = indice === pontos.length - 1
    svg.classList.toggle('grafico-flatline', flatline)
    atualizarTremor()
  })

  // ── Draw-in no scroll ───────────────────────────────────────────────
  gsap.set(linha, { strokeDasharray: total, strokeDashoffset: total })
  gsap.set(pontos, { scale: 0, transformOrigin: '50% 50%' })
  gsap.set(tiques, { opacity: 0 })
  gsap.set(anel, { opacity: 0 })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: svg, start: 'top 75%', once: true },
  })
  tl.to(linha, { strokeDashoffset: 0, duration: DURACAO_LINHA, ease: 'none' })
  pontos.forEach((ponto, i) => {
    const quando = (fracoes[i] ?? 0) * DURACAO_LINHA
    tl.to(ponto, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, quando)
    if (tiques[i]) tl.to(tiques[i]!, { opacity: 1, duration: 0.3 }, quando)
  })
  tl.to(anel, { opacity: 1, duration: 0.3 }, DURACAO_LINHA)
  tl.add(() => {
    // O dasharray precisa sair de cena: o tremor muda o comprimento da linha
    // e um dash fixo abriria um vão na ponta.
    gsap.set(linha, { clearProps: 'strokeDasharray,strokeDashoffset' })
    desenhado = true
    atualizarTremor()
  })
}
