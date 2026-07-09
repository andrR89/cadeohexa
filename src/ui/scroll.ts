import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ligarNavegacaoSuave } from './navegacao'

gsap.registerPlugin(ScrollTrigger)

/** Amarra o scroll da página ao parallax da taça do herói e revela as seções. */
export function ligarScroll(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Inércia. Vive dentro do guard de reduced-motion: quem pediu menos movimento
  // fica com a rolagem nativa do navegador, que é a experiência correta.
  const lenis = new Lenis()
  // Sem estas duas linhas o ScrollTrigger continua lendo a posição nativa e os
  // reveals disparam nas alturas erradas.
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000))
  gsap.ticker.lagSmoothing(0)

  ligarNavegacaoSuave((alvo) => lenis.scrollTo(alvo))

  // Deriva sutil da taça do herói: sem scale (que estourava o enquadramento) e
  // com menos de um terço da translação anterior (yPercent 20 → 6).
  gsap.to('.heroi-taca', {
    yPercent: 6,
    ease: 'none',
    scrollTrigger: { trigger: '#heroi', start: 'top top', end: 'bottom top', scrub: 0.6 },
  })

  // Fade único da seção inteira. O reveal antigo animava cada filho com stagger,
  // o que produzia um pisca-pisca em cascata. Um fade curto é mais sóbrio e
  // combina com o tom de memorial.
  document.querySelectorAll<HTMLElement>('.secao').forEach((secao) => {
    // Seções já visíveis no boot não devem piscar: o gsap.from zeraria a
    // opacidade de algo que o usuário já está lendo. O corte espelha o start
    // do trigger ('top 70%') — só revela o que ainda vem.
    if (secao.getBoundingClientRect().top < innerHeight * 0.7) return
    gsap.from(secao, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: secao, start: 'top 70%' },
    })
  })
}
