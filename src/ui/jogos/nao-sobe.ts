import { CONFIG_NAO_SOBE, criarNaoSobe, gerarEscapes } from '../../lib/jogos/nao-sobe'
import { criarCronometro, formatarMinuto, minutoFicticio } from '../../lib/jogos/relogio'
import type { MontarJogo, ResultadoJogo } from '../../lib/jogos/tipos'

/** Campo visto de cima: os 10 são botões (toque OU Tab+Enter, de graça).
 * Quem sobe ganha .subiu e caminha pro ataque via transition CSS — o estado
 * lógico já contou na hora; a caminhada é só o desenho. */
export const montar: MontarJogo = (el, aoTerminar) => {
  const cfg = CONFIG_NAO_SOBE
  const jogo = criarNaoSobe(cfg, gerarEscapes(cfg, Math.random))
  const goleiro = cfg.jogadores - 1

  el.innerHTML = `
    <div class="jogo-nao-sobe">
      <p class="jogo-placar">
        <span class="nao-sobe-relogio">${formatarMinuto(cfg.minutoInicial)}</span>
        · Brasil 1×0 Croácia ·
        <span class="nao-sobe-alerta">na frente: 0/${cfg.limiteAvancados}</span>
      </p>
      <div class="nao-sobe-campo">
        <p class="nao-sobe-ataque" aria-hidden="true">ataque · perigo</p>
        ${Array.from({ length: cfg.jogadores }, (_, j) => `
          <button class="nao-sobe-jogador" data-j="${j}"
                  style="left:${5 + (j / (cfg.jogadores - 1)) * 90}%"
                  aria-label="Puxar ${j === goleiro ? 'o goleiro' : `o jogador ${j + 1}`} de volta">
            ${j === goleiro ? '🧤' : '🟡'}
          </button>`).join('')}
      </div>
    </div>
  `

  const relogio = el.querySelector<HTMLElement>('.nao-sobe-relogio')!
  const alerta = el.querySelector<HTMLElement>('.nao-sobe-alerta')!
  const botoes = [...el.querySelectorAll<HTMLButtonElement>('.nao-sobe-jogador')]

  function atualizarAlerta(): void {
    alerta.textContent = `na frente: ${jogo.avancados().length}/${cfg.limiteAvancados}`
  }

  botoes.forEach((botao) =>
    botao.addEventListener('click', () => {
      if (jogo.puxar(Number(botao.dataset.j))) {
        botao.classList.remove('subiu')
        atualizarAlerta()
      }
    }),
  )

  // Cronômetro clampado: aba em segundo plano congela a partida em vez de
  // replayar a fila de escapes de uma vez (decisão da revisão da Task 4).
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
    for (const j of jogo.tick(t)) botoes[j]?.classList.add('subiu')
    atualizarAlerta()
    relogio.textContent = formatarMinuto(
      minutoFicticio(t, cfg.duracaoMs, cfg.minutoInicial, cfg.minutoFinal),
    )
    const { resultado } = jogo.estado()
    if (resultado) {
      terminar(resultado)
      return
    }
    quadro = requestAnimationFrame(frame)
  }
  quadro = requestAnimationFrame(frame)

  function desmontar(): void {
    terminado = true // neutraliza qualquer frame/clique tardio pós-Esc
    cancelAnimationFrame(quadro)
  }
  return desmontar
}
