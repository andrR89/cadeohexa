import { expect, test } from 'vitest'
import { PERGUNTAS } from '../src/data/quiz'
import { calcularPatente } from '../src/lib/quiz-logic'

test('quiz tem 8 perguntas com exatamente 1 correta cada', () => {
  expect(PERGUNTAS).toHaveLength(8)
  for (const p of PERGUNTAS) {
    expect(p.opcoes.filter((o) => o.correta), p.texto).toHaveLength(1)
    expect(p.opcoes.length).toBeGreaterThanOrEqual(3)
  }
})

test('patentes cobrem toda a faixa 0..8 e são crescentes em sofrimento', () => {
  expect(calcularPatente(0).titulo).toBe('Torcedor de Novela')
  expect(calcularPatente(2).titulo).toBe('Torcedor de Novela')
  expect(calcularPatente(3).titulo).toBe('Sofredor Júnior')
  expect(calcularPatente(5).titulo).toBe('Sofredor Júnior')
  expect(calcularPatente(6).titulo).toBe('Sofredor Sênior')
  expect(calcularPatente(7).titulo).toBe('Sofredor Sênior')
  expect(calcularPatente(8).titulo).toBe('Doutor em Vexames, Honoris Causa')
})

test('patente carrega o placar no formato N/8', () => {
  expect(calcularPatente(6).placar).toBe('6/8 vexames presenciados')
})

test('entradas fora da faixa são clampadas', () => {
  expect(calcularPatente(-1).titulo).toBe('Torcedor de Novela')
  expect(calcularPatente(99).titulo).toBe('Doutor em Vexames, Honoris Causa')
})
