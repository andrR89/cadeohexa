import { COPAS, FECHO_DA_ALA } from '../data/copas'

export function montarTimeline(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">Ala das Tentativas · 2006–2026</p>
    <div class="linha-tempo">
      ${COPAS.map(
        (c) => `
        <div class="linha-tempo-item pre-reveal" data-ano="${c.ano}">
          <span class="linha-tempo-no" aria-hidden="true">${String(c.ano).slice(2)}</span>
          <article class="placa lapide">
            <img
              class="linha-tempo-retrato"
              src="${c.imagem}"
              alt="${c.algoz}, ${c.ano}"
              loading="lazy"
              width="768"
              height="1024"
            />
            <p class="rotulo">${c.ano} · ${c.fase}</p>
            <h3>${c.algoz} ${c.placarOculto ? `<button class="revelar" aria-label="revelar placar de ${c.ano}">†</button><span class="placar oculto">${c.placar}</span>` : c.placar}</h3>
            <p class="epitafio">“${c.epitafio}”</p>
            <ul class="fatos">${c.fatos.map((f) => `<li>${f}</li>`).join('')}</ul>
          </article>
        </div>`,
      ).join('')}
    </div>
    <p class="legenda fecho">${FECHO_DA_ALA}</p>
  `
  ligarRevelarPlacar(el)
  ligarRevelacaoDaLinhaDoTempo(el)
}

/** Botão "†" de 2014: revela o placar oculto (1x7), move o foco e some — preservado tal qual. */
function ligarRevelarPlacar(el: HTMLElement): void {
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

/** Revelação item a item conforme a linha do tempo entra na tela: cada
 * `.linha-tempo-item` ganha `.visivel` sozinho, sem depender do scroll.ts.
 * Usa threshold 0 + rootMargin inferior negativo — o reveal dispara quando a
 * BORDA SUPERIOR do item cruza ~85% da altura da tela, independente da altura
 * do item. (Com threshold fracionário, um item mais alto que a viewport — em
 * telas baixas, iframes, split-screen — nunca atingiria a razão e ficaria
 * preso invisível, já que só damos unobserve no sucesso.) */
function ligarRevelacaoDaLinhaDoTempo(el: HTMLElement): void {
  const itens = el.querySelectorAll<HTMLElement>('.linha-tempo-item')
  const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (semMovimento || typeof IntersectionObserver === 'undefined') {
    itens.forEach((item) => item.classList.add('visivel'))
    return
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        observador.unobserve(e.target)
        e.target.classList.add('visivel')
      }
    },
    { threshold: 0, rootMargin: '0px 0px -15% 0px' },
  )
  itens.forEach((item) => observador.observe(item))
}
