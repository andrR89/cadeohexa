import { PERGUNTAS } from '../data/quiz'
import { calcularPatente, type Patente } from '../lib/quiz-logic'

let patenteAtual: Patente | null = null
export function obterPatente(): Patente | null {
  return patenteAtual
}

export function montarQuiz(el: HTMLElement): void {
  let indice = 0
  let acertos = 0

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
        el.querySelector<HTMLElement>('.consolo')!.hidden = false
        setTimeout(() => {
          indice++
          indice < PERGUNTAS.length ? renderizarPergunta() : renderizarResultado()
        }, 2200)
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
      renderizarPergunta()
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
  el.querySelector('#comecar')!.addEventListener('click', renderizarPergunta)
}
