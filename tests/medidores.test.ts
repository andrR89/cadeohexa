import { expect, test } from 'vitest'
import { MEDIDORES, anosDeEspera } from '../src/data/medidores'

const ref = new Date('2026-07-07T15:00:00Z')

test('anos de espera completos desde o penta', () => {
  expect(anosDeEspera(ref)).toBe(24)
  expect(anosDeEspera(new Date('2026-06-29T15:00:00Z'))).toBe(23) // véspera do aniversário
})

test('todo medidor produz valor positivo e tem rótulo e nota', () => {
  for (const m of MEDIDORES) {
    expect(m.valor(ref), m.id).toBeGreaterThan(0)
    expect(m.rotulo.length, m.id).toBeGreaterThan(0)
    expect(m.nota.length, m.id).toBeGreaterThan(0)
  }
})

test('valores conferidos na data de referência', () => {
  const porId = Object.fromEntries(MEDIDORES.map((m) => [m.id, m.valor(ref)]))
  expect(porId['mandatos']).toBe(5)
  expect(porId['tecnicos']).toBe(10)
  expect(porId['copas-perdidas']).toBe(6)
  expect(porId['campeoes-na-fila']).toBe(5)
})
