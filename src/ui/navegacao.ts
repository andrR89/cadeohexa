import { SECOES } from '../data/secoes'

/** Nav de bolinhas: uma âncora real por seção. Âncoras de verdade dão a
 * semântica de graça — teclado, foco, clique do meio, histórico — sem
 * reimplementar nada. Sem IntersectionObserver, só se perde o destaque da
 * seção corrente. O scroll suave é ligado depois, no chunk de scroll, via
 * ligarNavegacaoSuave(). */
export function montarNavegacao(el: HTMLElement): void {
  el.innerHTML = `
    <ul class="nav-secoes-lista">
      ${SECOES.map(
        (s) => `
        <li>
          <a class="nav-bolinha" href="#${s.id}" data-secao="${s.id}" aria-label="${s.titulo}">
            <span class="nav-bolinha-marca" aria-hidden="true"></span>
          </a>
        </li>`,
      ).join('')}
    </ul>
  `
  ligarScrollSpy(el)
}

/** Marca a bolinha da seção corrente com aria-current. Se o navegador não tiver
 * IntersectionObserver, as bolinhas seguem sendo âncoras funcionais — só sem
 * destaque. Mesma degradação de src/ui/timeline.ts. */
function ligarScrollSpy(el: HTMLElement): void {
  if (typeof IntersectionObserver === 'undefined') return
  const bolinhas = new Map<string, HTMLAnchorElement>()
  el.querySelectorAll<HTMLAnchorElement>('.nav-bolinha').forEach((a) => {
    bolinhas.set(a.dataset.secao!, a)
  })

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        bolinhas.forEach((a, id) => {
          const ativa = id === e.target.id
          a.classList.toggle('nav-bolinha-ativa', ativa)
          if (ativa) a.setAttribute('aria-current', 'true')
          else a.removeAttribute('aria-current')
        })
      }
    },
    // Uma faixa estreita no meio da tela: a seção que a cruza é a "corrente".
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  )

  SECOES.forEach(({ id }) => {
    const secao = document.getElementById(id)
    if (secao) observador.observe(secao)
  })
}

/** Chamado só pelo chunk de scroll, quando o Lenis está de pé. Sem isso, as
 * bolinhas continuam funcionando como âncoras nativas. */
export function ligarNavegacaoSuave(irPara: (alvo: HTMLElement) => void): void {
  document.querySelectorAll<HTMLAnchorElement>('.nav-bolinha').forEach((a) => {
    a.addEventListener('click', (evento) => {
      // Modifier-clicks (nova aba/janela) e botões que não o esquerdo ficam
      // com o comportamento nativo da âncora — é o que o usuário pediu.
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || evento.button !== 0)
        return
      const alvo = document.getElementById(a.dataset.secao!)
      if (!alvo) return
      evento.preventDefault()
      // pushState não dispara o salto nativo: preserva o histórico e o deep
      // link, que o preventDefault acima tinha engolido. O guard evita empilhar
      // entradas idênticas ao clicar a mesma bolinha — âncora nativa não empilha.
      if (a.hash !== location.hash) history.pushState(null, '', a.hash)
      // O foco acompanha a navegação. Sem isto, Enter na bolinha rola a página
      // mas o próximo Tab cai na bolinha seguinte, não no conteúdo da seção.
      alvo.tabIndex = -1
      alvo.focus({ preventScroll: true })
      irPara(alvo)
    })
  })
}
