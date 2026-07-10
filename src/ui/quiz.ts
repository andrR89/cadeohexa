import { PERGUNTAS } from '../data/quiz'
import { calcularPatente, type Patente } from '../lib/quiz-logic'

let patenteAtual: Patente | null = null
export function obterPatente(): Patente | null {
  return patenteAtual
}

export function montarQuiz(el: HTMLElement): void {
  let indice = 0
  let acertos = 0

  const reduzirMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const JANELA_CONSOLO = 2200
  const DURACAO_SAIDA = 250

  /** Crossfade entre placas: anima a saída, troca o conteúdo, anima a entrada.
   * Sob reduced-motion troca na hora — a transition CSS não rodaria e os 250ms
   * virariam espera morta. */
  function trocarPlaca(renderizar: () => void): void {
    if (reduzirMovimento()) {
      renderizar()
      return
    }
    el.classList.add('quiz-saindo')
    setTimeout(() => {
      el.classList.remove('quiz-saindo')
      el.classList.add('quiz-entrando')
      renderizar()
      el.addEventListener('animationend', () => el.classList.remove('quiz-entrando'), { once: true })
    }, DURACAO_SAIDA)
  }

  function renderizarPergunta(): void {
    const p = PERGUNTAS[indice]
    el.innerHTML = `
      <p class="rotulo">Exame Oficial de Sofrimento · ${indice + 1}/${PERGUNTAS.length}</p>
      <div class="placa" aria-live="polite">
        <h3 tabindex="-1">${p.texto}</h3>
        <div class="opcoes">
          ${p.opcoes.map((o, i) => `<button class="solene opcao" data-i="${i}">${o.texto}</button>`).join('')}
        </div>
        <p class="legenda consolo" hidden>${p.consolo}</p>
      </div>
    `
    el.querySelector<HTMLElement>('h3')!.focus()
    el.querySelectorAll<HTMLButtonElement>('.opcao').forEach((btn) =>
      btn.addEventListener('click', () => {
        const escolhida = p.opcoes[Number(btn.dataset.i)]
        if (escolhida.correta) acertos++
        el.querySelectorAll<HTMLButtonElement>('.opcao').forEach((b, i) => {
          b.disabled = true
          if (p.opcoes[i].correta) b.classList.add('correta')
          else if (b === btn) b.classList.add('errada')
        })
        // Errou: a placa inteira treme — o estádio sentiu. A classe pode ficar,
        // a placa morre na próxima troca de innerHTML.
        if (!escolhida.correta) el.querySelector('.placa')?.classList.add('placa-tremida')
        el.querySelector<HTMLElement>('.consolo')!.hidden = false
        setTimeout(
          () => {
            indice++
            trocarPlaca(indice < PERGUNTAS.length ? renderizarPergunta : renderizarResultado)
          },
          // O crossfade vive DENTRO da janela de 2,2s: a saída começa 250ms antes.
          reduzirMovimento() ? JANELA_CONSOLO : JANELA_CONSOLO - DURACAO_SAIDA,
        )
      }),
    )
  }

  function renderizarResultado(): void {
    patenteAtual = calcularPatente(acertos)
    el.innerHTML = `
      <p class="rotulo">Diploma de Sofrimento</p>
      <div class="placa" aria-live="polite">
        <h3 tabindex="-1">${patenteAtual.titulo}</h3>
        <p class="epitafio">${patenteAtual.placar}</p>
        <p class="legenda">${patenteAtual.descricao}</p>
        <button class="solene" id="refazer">Sofrer novamente</button>
      </div>
    `
    el.querySelector<HTMLElement>('h3')!.focus()
    el.querySelector('#refazer')!.addEventListener('click', () => {
      indice = 0
      acertos = 0
      trocarPlaca(renderizarPergunta)
    })
    document.dispatchEvent(new CustomEvent('patente-emitida'))
  }

  el.innerHTML = `
    <p class="rotulo">Exame Oficial de Sofrimento</p>
    <div class="placa">
      <h3>Quanto você sofreu?</h3>
      <p class="legenda">${PERGUNTAS.length} perguntas. Suas cicatrizes serão avaliadas por uma banca solene.</p>
      <button class="solene" id="comecar">Iniciar o exame</button>
    </div>
  `
  el.querySelector('#comecar')!.addEventListener('click', () => trocarPlaca(renderizarPergunta))
}
