import * as THREE from 'three'
import { criarTaca } from './taca'

export function podeRodar3D(): boolean {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const c = document.createElement('canvas')
  // three r163+ exige WebGL2 — aceitar WebGL1 aqui seria falso positivo.
  return !!c.getContext('webgl2')
}

export function iniciarCena(canvas: HTMLCanvasElement): {
  taca: THREE.Mesh
  camera: THREE.PerspectiveCamera
  pausar: () => void
  retomar: () => void
} {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

  const cena = new THREE.Scene()
  cena.fog = new THREE.Fog(0x0a0805, 6, 14)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
  camera.position.set(0, 0.4, 6)

  const taca = criarTaca()
  cena.add(taca)

  const facho = new THREE.SpotLight(0xfff0c0, 260, 20, Math.PI / 7, 0.45)
  facho.position.set(0, 7, 2)
  facho.target = taca
  cena.add(facho, new THREE.AmbientLight(0x2a2115, 2))

  function redimensionar(): void {
    renderer.setSize(innerWidth, innerHeight, false)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', redimensionar)
  redimensionar()

  function renderizar(): void {
    taca.rotation.y += 0.004
    renderer.render(cena, camera)
  }
  renderer.setAnimationLoop(renderizar)

  // Depois que a taça afunda no fundo (scroll.ts), a cena só mostra neblina —
  // pausar o loop evita gastar GPU renderizando frames que ninguém vê.
  function pausar(): void {
    renderer.setAnimationLoop(null)
  }
  function retomar(): void {
    renderer.setAnimationLoop(renderizar)
  }

  return { taca, camera, pausar, retomar }
}
