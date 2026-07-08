import { describe, expect, test } from 'vitest'
import {
  diasEntre, hojeEmSaoPaulo, diasDaEspera, diasAteProximaCopa, formatarDias, partesDaEspera,
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

describe('partesDaEspera', () => {
  test('N anos exatos após a âncora, à meia-noite de SP, zera o resto', () => {
    // 2024-06-30T03:00:00Z = 2024-06-30T00:00:00 em SP (UTC-3, sem horário de verão em junho)
    expect(partesDaEspera(new Date('2024-06-30T03:00:00Z'))).toEqual({
      anos: 22, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0,
    })
  })

  test('empréstimo de mês: âncora é 30/06, cruzar para julho ainda não fecha um mês', () => {
    // 2002-07-15T03:00:00Z = 2002-07-15T00:00:00 em SP
    expect(partesDaEspera(new Date('2002-07-15T03:00:00Z'))).toEqual({
      anos: 0, meses: 0, dias: 15, horas: 0, minutos: 0, segundos: 0,
    })
  })

  test('horas/minutos/segundos batem com o relógio de parede de SP', () => {
    // 2020-08-15T17:32:18Z = 2020-08-15T14:32:18 em SP
    expect(partesDaEspera(new Date('2020-08-15T17:32:18Z'))).toEqual({
      anos: 18, meses: 1, dias: 16, horas: 14, minutos: 32, segundos: 18,
    })
  })

  test('empréstimo de dia usa fevereiro bissexto (2004) — 29 dias', () => {
    // 2004-03-05T03:00:00Z = 2004-03-05T00:00:00 em SP
    expect(partesDaEspera(new Date('2004-03-05T03:00:00Z'))).toEqual({
      anos: 1, meses: 8, dias: 4, horas: 0, minutos: 0, segundos: 0,
    })
  })

  test('empréstimo de dia usa fevereiro não bissexto (2003) — 28 dias', () => {
    // 2003-03-05T03:00:00Z = 2003-03-05T00:00:00 em SP; mesma data-alvo do teste
    // anterior um ano antes, mas fevereiro de 2003 tem só 28 dias (não bissexto)
    expect(partesDaEspera(new Date('2003-03-05T03:00:00Z'))).toEqual({
      anos: 0, meses: 8, dias: 3, horas: 0, minutos: 0, segundos: 0,
    })
  })

  test('nunca retorna componentes negativos', () => {
    const partes = partesDaEspera(new Date('2026-07-08T15:00:00Z'))
    for (const v of Object.values(partes)) {
      expect(v).toBeGreaterThanOrEqual(0)
    }
  })

  test('1º de março de ano não-bissexto: empréstimo de dias em laço (regressão)', () => {
    // Âncora 30/06; alvo 01/03 exige déficit de dias que fevereiro não-bissexto
    // (28 dias) não cobre num único empréstimo — precisa emprestar de janeiro também.
    // 2003-03-01T03:00:00Z = 2003-03-01T00:00:00 em SP
    expect(partesDaEspera(new Date('2003-03-01T03:00:00Z'))).toEqual({
      anos: 0, meses: 7, dias: 30, horas: 0, minutos: 0, segundos: 0,
    })
    // 2027-03-01T15:00:00Z = 2027-03-01T12:00:00 em SP — caso que dispararia no site
    expect(partesDaEspera(new Date('2027-03-01T15:00:00Z'))).toEqual({
      anos: 24, meses: 7, dias: 30, horas: 12, minutos: 0, segundos: 0,
    })
  })

  test('propriedade: nenhum componente negativo em 2002–2042 (força bruta)', () => {
    // Varre um instante por dia (12:00 SP = 15:00 UTC) e confirma o invariante.
    // 12:00 SP nunca cai em transição de fuso, então a data-alvo é sempre limpa.
    let inicio = Date.UTC(2002, 5, 30, 15, 0, 0) // 30/06/2002 12:00 SP
    const fim = Date.UTC(2042, 11, 31, 15, 0, 0)
    let negativos = 0
    for (let t = inicio; t <= fim; t += 86_400_000) {
      const partes = partesDaEspera(new Date(t))
      for (const v of Object.values(partes)) {
        if (v < 0) negativos++
      }
    }
    expect(negativos).toBe(0)
  })
})
