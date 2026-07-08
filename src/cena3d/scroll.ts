import type * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Controles do loop de render, devolvidos por `iniciarCena`. */
interface ControleCena {
  pausar: () => void
  retomar: () => void
}

/** Amarra o scroll da página à câmera/taça e revela as seções. */
export function ligarScroll(taca: THREE.Mesh, camera: THREE.PerspectiveCamera, cena: ControleCena): void {
  // A câmera se afasta e sobe conforme o memorial se revela.
  gsap.to(camera.position, {
    z: 10, y: 2.2,
    ease: 'none',
    scrollTrigger: { trigger: '#proxima-tentativa', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
  })
  // A taça desce ao fundo depois do countdown — o museu segue sem ela.
  gsap.to(taca.position, {
    y: -6,
    ease: 'none',
    scrollTrigger: {
      trigger: '#ala-das-tentativas',
      start: 'top bottom',
      end: 'top center',
      scrub: 0.6,
      // A partir daqui a taça só existe afundada na neblina — nada visível se move.
      // Pausar o setAnimationLoop economiza GPU/bateria até o usuário rolar de volta;
      // como o GSAP já mantém as posições atualizadas via scrub, o retomar() em
      // onEnterBack renderiza o estado certo no primeiro frame, sem "flash" de frame velho.
      onLeave: () => cena.pausar(),
      onEnterBack: () => cena.retomar(),
    },
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
