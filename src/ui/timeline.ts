import { COPAS, FECHO_DA_ALA } from '../data/copas'

export function montarTimeline(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">Ala das Tentativas · 2006–2026</p>
    <div class="lapides">
      ${COPAS.map(
        (c) => `
        <article class="placa lapide" data-ano="${c.ano}">
          <p class="rotulo">${c.ano} · ${c.fase}</p>
          <h3>${c.algoz} ${c.placarOculto ? `<button class="revelar" aria-label="revelar placar">†</button><span class="placar oculto">${c.placar}</span>` : c.placar}</h3>
          <p class="epitafio">“${c.epitafio}”</p>
          <ul class="fatos">${c.fatos.map((f) => `<li>${f}</li>`).join('')}</ul>
        </article>`,
      ).join('')}
    </div>
    <p class="legenda fecho">${FECHO_DA_ALA}</p>
  `
  el.querySelector('.revelar')?.addEventListener('click', (ev) => {
    const alvo = (ev.currentTarget as HTMLElement).nextElementSibling!
    alvo.classList.remove('oculto')
    ;(ev.currentTarget as HTMLElement).remove()
  })
}
