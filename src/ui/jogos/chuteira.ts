import { criarChuteira, posicaoMarcador } from '../../lib/jogos/chuteira'
import { criarCronometro } from '../../lib/jogos/relogio'
import type { MontarJogo, ResultadoJogo } from '../../lib/jogos/tipos'

/** UI do QTE: o rAF move o marcador e o Henry; espaço/toque aperta. Toda a
 * regra vive em lib/jogos/chuteira — aqui é só DOM. */
export const montar: MontarJogo = (el, aoTerminar) => {
  const jogo = criarChuteira()
  const { periodoMs, meiasLarguras, ilhoses, duracaoHenryMs } = jogo.config

  el.innerHTML = `
    <div class="jogo-chuteira">
      <div class="chuteira-henry" aria-hidden="true"><span class="henry">🏃</span></div>
      <p class="jogo-placar">Amarre os ${ilhoses} ilhoses antes do Henry chegar</p>
      <div class="chuteira-ilhoses" aria-hidden="true">
        ${Array.from({ length: ilhoses }, (_, i) => `<span class="ilhos" data-i="${i}">○</span>`).join('')}
      </div>
      <div class="chuteira-trilho" aria-hidden="true">
        <div class="chuteira-zona"></div>
        <div class="chuteira-marcador"></div>
      </div>
      <button class="solene jogo-acao">AMARRAR (ou espaço)</button>
    </div>
  `

  const raiz = el.querySelector<HTMLElement>('.jogo-chuteira')!
  const marcador = el.querySelector<HTMLElement>('.chuteira-marcador')!
  const zona = el.querySelector<HTMLElement>('.chuteira-zona')!
  const henry = el.querySelector<HTMLElement>('.henry')!

  function ajustarZona(): void {
    const indice = Math.min(jogo.estado().ilhos, meiasLarguras.length - 1)
    zona.style.width = `${meiasLarguras[indice] * 2 * 100}%`
  }
  ajustarZona()

  // Cronômetro clampado: aba em segundo plano congela a partida em vez de
  // estourar o timer do Henry de uma vez (decisão da revisão da Task 4).
  const cronometro = criarCronometro()
  let quadro = 0
  let terminado = false

  function terminar(resultado: ResultadoJogo): void {
    if (terminado) return
    terminado = true
    desmontar()
    aoTerminar(resultado)
  }

  function frame(agora: number): void {
    const t = cronometro(agora)
    jogo.tick(t)
    marcador.style.left = `${posicaoMarcador(t, periodoMs) * 100}%`
    henry.style.left = `${Math.min(t / duracaoHenryMs, 1) * 100}%`
    const { resultado } = jogo.estado()
    if (resultado) {
      terminar(resultado)
      return
    }
    quadro = requestAnimationFrame(frame)
  }
  quadro = requestAnimationFrame(frame)

  function apertar(): void {
    if (terminado) return
    const resposta = jogo.apertar(cronometro(performance.now()))
    if (resposta === 'acerto') {
      const { ilhos, resultado } = jogo.estado()
      const fechado = el.querySelector(`.ilhos[data-i="${ilhos - 1}"]`)
      if (fechado) fechado.textContent = '●'
      ajustarZona()
      if (resultado) terminar(resultado)
    } else if (resposta === 'erro') {
      raiz.classList.remove('cadarco-arrebentou')
      void raiz.offsetWidth // reinicia a animação da tremida
      raiz.classList.add('cadarco-arrebentou')
    }
  }

  function aoTeclar(evento: KeyboardEvent): void {
    // preventDefault também evita o clique nativo do botão focado no espaço —
    // sem ele, um aperto viraria dois.
    if (evento.code === 'Space') {
      evento.preventDefault()
      apertar()
    }
  }
  el.querySelector<HTMLButtonElement>('.jogo-acao')!.addEventListener('click', apertar)
  document.addEventListener('keydown', aoTeclar)

  function desmontar(): void {
    terminado = true // neutraliza apertar() e qualquer frame tardio — sem aoTerminar fantasma pós-Esc
    cancelAnimationFrame(quadro)
    document.removeEventListener('keydown', aoTeclar)
  }
  return desmontar
}
