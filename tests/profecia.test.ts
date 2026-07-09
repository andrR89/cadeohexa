import { expect, test } from 'vitest'
import { PROFECIA } from '../src/data/profecia'

test('toda profecia tem imagem e ranking FIFA preenchidos', () => {
  for (const p of PROFECIA) {
    expect(p.imagem.length, String(p.ano)).toBeGreaterThan(0)
    expect(p.rankingFifa.length, String(p.ano)).toBeGreaterThan(0)
    expect(p.populacaoRotulo.length, String(p.ano)).toBeGreaterThan(0)
  }
})

test('população do algoz cai estritamente a cada Copa (a curva da vergonha nunca sobe)', () => {
  for (let i = 1; i < PROFECIA.length; i++) {
    expect(PROFECIA[i]!.populacao, String(PROFECIA[i]!.ano)).toBeLessThan(PROFECIA[i - 1]!.populacao)
  }
})

test('temos as 6 Copas da profecia, de 2030 a 2050, e o Morecambe/IAs entram em 2046/2050', () => {
  expect(PROFECIA.length).toBe(6)
  expect(PROFECIA.map((p) => p.ano)).toEqual([2030, 2034, 2038, 2042, 2046, 2050])
  expect(PROFECIA.find((p) => p.ano === 2046)?.algoz).toBe('Morecambe FC')
  expect(PROFECIA.find((p) => p.ano === 2050)?.algoz).toBe('Seleção das IAs')
})
