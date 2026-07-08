import { COPAS, FECHO_DA_ALA } from '../data/copas'

export function montarTimeline(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">Ala das Tentativas · 2006–2026</p>
    <div class="lapides">
      ${COPAS.map(
        (c) => `
        <article class="placa lapide" data-ano="${c.ano}">
          <p class="rotulo">${c.ano} · ${c.fase}</p>
          <h3>${c.algoz} ${c.placarOculto ? `<button class="revelar" aria-label="revelar placar de ${c.ano}">†</button><span class="placar oculto">${c.placar}</span>` : c.placar}</h3>
          <p class="epitafio">“${c.epitafio}”</p>
          <ul class="fatos">${c.fatos.map((f) => `<li>${f}</li>`).join('')}</ul>
        </article>`,
      ).join('')}
    </div>
    <p class="legenda fecho">${FECHO_DA_ALA}</p>
  `
  el.querySelectorAll<HTMLButtonElement>('.revelar').forEach((btn) =>
    btn.addEventListener('click', () => {
      const alvo = btn.nextElementSibling as HTMLElement
      alvo.classList.remove('oculto')
      alvo.setAttribute('tabindex', '-1')
      alvo.focus()
      btn.hidden = true
    }),
  )
}
