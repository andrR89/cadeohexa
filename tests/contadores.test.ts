import { describe, expect, test } from 'vitest'
import {
  diasEntre, hojeEmSaoPaulo, diasDaEspera, diasAteProximaCopa, formatarDias,
} from '../src/lib/contadores'
import { DATA_PENTA, DATA_COPA_2030_ESTIMADA } from '../src/data/datas'

describe('diasEntre', () => {
  test('conta dias inteiros entre datas ISO', () => {
    expect(diasEntre('2002-06-30', '2002-07-01')).toBe(1)
    expect(diasEntre('2002-06-30', '2003-06-30')).toBe(365)
    expect(diasEntre('2004-02-28', '2004-03-01')).toBe(2) // bissexto
  })
})

describe('hojeEmSaoPaulo', () => {
  test('vira o dia à meia-noite de São Paulo, não de UTC', () => {
    // 02:59 UTC = 23:59 do dia anterior em SP (UTC-3)
    expect(hojeEmSaoPaulo(new Date('2026-07-08T02:59:00Z'))).toBe('2026-07-07')
    expect(hojeEmSaoPaulo(new Date('2026-07-08T03:00:00Z'))).toBe('2026-07-08')
  })
})

describe('contadores do site', () => {
  const meioDiaSP = new Date('2026-07-07T15:00:00Z') // 12:00 em SP
  test('dias da espera desde o penta (30/06/2002)', () => {
    expect(diasDaEspera(meioDiaSP)).toBe(8773)
  })
  test('dias até a Copa 2030 (estimada 08/06/2030)', () => {
    expect(diasAteProximaCopa(meioDiaSP)).toBe(1432)
    // nunca negativo depois da data
    expect(diasAteProximaCopa(new Date('2031-01-01T15:00:00Z'))).toBe(0)
  })
  test('formata em pt-BR', () => {
    expect(formatarDias(8773)).toBe('8.773')
  })
})

describe('constantes-âncora', () => {
  test('datas âncora são ISO válidas (protege edições futuras)', () => {
    expect(Number.isFinite(diasEntre(DATA_PENTA, DATA_COPA_2030_ESTIMADA))).toBe(true)
    expect(diasEntre(DATA_PENTA, DATA_COPA_2030_ESTIMADA)).toBeGreaterThan(0)
  })
})
