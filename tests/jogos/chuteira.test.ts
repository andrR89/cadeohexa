import { expect, test } from 'vitest'
import { criarChuteira, dentroDaZona, posicaoMarcador } from '../../src/lib/jogos/chuteira'

test('marcador oscila em onda triangular 0→1→0', () => {
  expect(posicaoMarcador(0, 1100)).toBe(0)
  expect(posicaoMarcador(275, 1100)).toBe(0.5)
  expect(posicaoMarcador(550, 1100)).toBe(1)
  expect(posicaoMarcador(825, 1100)).toBe(0.5)
  expect(posicaoMarcador(1100, 1100)).toBe(0)
})

test('zona de acerto é centrada no meio do trilho', () => {
  expect(dentroDaZona(0.5, 0)).toBe(true)
  expect(dentroDaZona(0.68, 0.18)).toBe(true)
  expect(dentroDaZona(0.69, 0.18)).toBe(false)
})

test('4 acertos no centro vencem antes do Henry', () => {
  const jogo = criarChuteira()
  const periodo = jogo.config.periodoMs
  for (let i = 0; i < 4; i++) {
    // periodo/4 + i*periodo: o marcador está exatamente no centro (0,5)
    expect(jogo.apertar(periodo / 4 + i * periodo)).toBe('acerto')
  }
  expect(jogo.estado()).toEqual({ ilhos: 4, resultado: 'vitoria' })
})

test('erro não avança o ilhós — o cadarço arrebenta mas o jogo segue', () => {
  const jogo = criarChuteira()
  expect(jogo.apertar(0)).toBe('erro') // marcador em 0, longe do centro
  expect(jogo.estado()).toEqual({ ilhos: 0, resultado: null })
})

test('Henry chegando é derrota, e depois disso nada mais acontece', () => {
  const jogo = criarChuteira()
  jogo.tick(jogo.config.duracaoHenryMs)
  expect(jogo.estado().resultado).toBe('derrota')
  expect(jogo.apertar(jogo.config.duracaoHenryMs + 100)).toBe(null)
})

test('vitória não é sobrescrita por um tick tardio do Henry', () => {
  const jogo = criarChuteira()
  const periodo = jogo.config.periodoMs
  for (let i = 0; i < 4; i++) jogo.apertar(periodo / 4 + i * periodo)
  jogo.tick(99999)
  expect(jogo.estado().resultado).toBe('vitoria')
})
