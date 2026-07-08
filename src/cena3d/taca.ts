import * as THREE from 'three'

/** Perfil de revolução da taça (x = raio, y = altura). Low-poly de propósito. */
const PERFIL: Array<[number, number]> = [
  [0.00, 0.00], [0.85, 0.00], [0.85, 0.12], [0.35, 0.20], [0.22, 0.55],
  [0.16, 0.85], [0.30, 1.15], [0.62, 1.45], [0.72, 1.80], [0.58, 2.10],
  [0.30, 2.28], [0.00, 2.32],
]

export function criarTaca(): THREE.Mesh {
  const pontos = PERFIL.map(([x, y]) => new THREE.Vector2(x, y))
  const geometria = new THREE.LatheGeometry(pontos, 48)
  const material = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.92, roughness: 0.28,
  })
  const taca = new THREE.Mesh(geometria, material)
  taca.position.y = -1.1
  return taca
}
