import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Amarra o scroll da página ao parallax da taça do herói e revela as seções. */
export function ligarScroll(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // A taça (imagem) do herói deriva sutilmente conforme rola o primeiro viewport.
  gsap.to('.heroi-taca', {
    yPercent: 20,
    scale: 1.06,
    ease: 'none',
    scrollTrigger: { trigger: '#heroi', start: 'top top', end: 'bottom top', scrub: 0.6 },
  })

  // Revelação solene de cada seção.
  document.querySelectorAll<HTMLElement>('.secao').forEach((secao) => {
    // Seções já visíveis no boot (herói, deep link no meio da página) não devem
    // piscar: o gsap.from zeraria a opacidade de algo que o usuário já está lendo.
    // O corte espelha o start do trigger ('top 70%') — só revela o que ainda vem.
    if (secao.getBoundingClientRect().top < innerHeight * 0.7) return
    gsap.from(secao.children, {
      opacity: 0, y: 40, stagger: 0.12, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: secao, start: 'top 70%' },
    })
  })
}
