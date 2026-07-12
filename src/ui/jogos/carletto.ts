import {
  CONFIG_CARLETTO, criarCarletto, gerarItens, yDoItem, type TipoItem,
} from '../../lib/jogos/carletto'
import { criarCronometro, formatarMinuto, minutoFicticio } from '../../lib/jogos/relogio'
import type { MontarJogo, ResultadoJogo } from '../../lib/jogos/tipos'

const EMOJI: Record<TipoItem, string> = { chiclete: '🍬', menta: '🍃', bandeira: '🇳🇴' }
const PASSO_TECLADO = 0.06

export const montar: MontarJogo = (el, aoTerminar) => {
  const cfg = CONFIG_CARLETTO
  const jogo = criarCarletto(cfg, gerarItens(cfg, Math.random))

  el.innerHTML = `
    <div class="jogo-carletto">
      <p class="jogo-placar">
        <span class="carletto-relogio">0'</span> · Brasil × Noruega
      </p>
      <div class="carletto-barra-caixa" aria-hidden="true">
        <span class="carletto-barra-rotulo">Desempenho da Seleção</span>
        <div class="carletto-barra"><div class="carletto-barra-nivel"></div></div>
      </div>
      <div class="carletto-area">
        <div class="carletto" aria-hidden="true">😮</div>
      </div>
    </div>
  `

  const area = el.querySelector<HTMLElement>('.carletto-area')!
  const boneco = el.querySelector<HTMLElement>('.carletto')!
  const nivel = el.querySelector<HTMLElement>('.carletto-barra-nivel')!
  const relogio = el.querySelector<HTMLElement>('.carletto-relogio')!
  const divs = new Map<number, HTMLElement>()

  // Cronômetro clampado: aba em segundo plano congela a partida em vez de
  // derramar a chuva de chicletes acumulada (decisão da revisão da Task 4).
  const cronometro = criarCronometro()
  let xBoca = 0.5
  let quadro = 0
  let terminado = false

  function mover(x: number): void {
    if (terminado) return
    // travado pela isca: a cara de decepção não anda
    if (cronometro(performance.now()) < jogo.travadoAte()) return
    xBoca = Math.min(1, Math.max(0, x))
  }
  function aoApontar(evento: PointerEvent): void {
    const r = area.getBoundingClientRect()
    mover((evento.clientX - r.left) / r.width)
  }
  function aoPressionar(evento: PointerEvent): void {
    // Captura o ponteiro: o dedo pode sair da área que o Carletto continua junto.
    area.setPointerCapture(evento.pointerId)
    aoApontar(evento)
  }
  function aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      mover(xBoca - PASSO_TECLADO)
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      mover(xBoca + PASSO_TECLADO)
    }
  }
  area.addEventListener('pointermove', aoApontar)
  area.addEventListener('pointerdown', aoPressionar)
  document.addEventListener('keydown', aoTeclar)

  function terminar(resultado: ResultadoJogo): void {
    if (terminado) return
    terminado = true
    desmontar()
    aoTerminar(resultado)
  }

  function frame(agora: number): void {
    const t = cronometro(agora)
    const eventos = jogo.tick(t, xBoca)
    for (const item of eventos.capturados) {
      divs.get(item.id)?.remove()
      divs.delete(item.id)
    }
    for (const item of eventos.noChao) {
      const div = divs.get(item.id)
      if (div) {
        div.classList.add('no-chao')
        setTimeout(() => div.remove(), 350)
        divs.delete(item.id)
      }
      if (item.tipo === 'chiclete') {
        area.classList.remove('carletto-sofreu')
        void area.offsetWidth
        area.classList.add('carletto-sofreu')
      }
    }
    for (const item of jogo.noAr(t)) {
      let div = divs.get(item.id)
      if (!div) {
        div = document.createElement('div')
        div.className = `carletto-item item-${item.tipo}`
        div.textContent = EMOJI[item.tipo]
        div.style.left = `${item.x * 100}%`
        area.appendChild(div)
        divs.set(item.id, div)
      }
      div.style.top = `${yDoItem(item, t) * 100}%`
    }
    const travado = t < jogo.travadoAte()
    boneco.classList.toggle('travado', travado)
    boneco.textContent = travado ? '😖' : '😮'
    boneco.style.left = `${xBoca * 100}%`
    nivel.style.width = `${jogo.barra()}%`
    relogio.textContent = formatarMinuto(minutoFicticio(t, cfg.duracaoMs, 0, cfg.minutoFinal), 90)
    const { resultado } = jogo.estado()
    if (resultado) {
      terminar(resultado)
      return
    }
    quadro = requestAnimationFrame(frame)
  }
  quadro = requestAnimationFrame(frame)

  function desmontar(): void {
    terminado = true // neutraliza qualquer frame/input tardio pós-Esc
    cancelAnimationFrame(quadro)
    document.removeEventListener('keydown', aoTeclar)
    area.removeEventListener('pointermove', aoApontar)
    area.removeEventListener('pointerdown', aoPressionar)
  }
  return desmontar
}
