import { expect, test } from 'vitest'
import { CHAVE_STATS, lerStats, registrarPartida } from '../../src/lib/jogos/stats'

function storageFake(inicial: Record<string, string> = {}) {
  const mapa = new Map(Object.entries(inicial))
  return {
    getItem: (chave: string) => mapa.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void mapa.set(chave, valor),
  }
}

test('storage vazio = stats zeradas', () => {
  expect(lerStats(storageFake())).toEqual({})
})

test('registrarPartida acumula tentativas e vitórias por jogo', () => {
  const storage = storageFake()
  expect(registrarPartida(storage, 'chuteira', 'derrota')).toEqual({
    chuteira: { tentativas: 1, vitorias: 0 },
  })
  registrarPartida(storage, 'chuteira', 'vitoria')
  registrarPartida(storage, 'carletto', 'derrota')
  expect(lerStats(storage)).toEqual({
    chuteira: { tentativas: 2, vitorias: 1 },
    carletto: { tentativas: 1, vitorias: 0 },
  })
})

test('JSON corrompido não derruba o jogo — stats voltam zeradas', () => {
  const storage = storageFake({ [CHAVE_STATS]: '{isso não é json' })
  expect(lerStats(storage)).toEqual({})
})

test('storage que lança (modo privado/bloqueado) também não derruba', () => {
  const quebrado = {
    getItem: (): string | null => {
      throw new Error('bloqueado')
    },
    setItem: (): void => {
      throw new Error('bloqueado')
    },
  }
  expect(lerStats(quebrado)).toEqual({})
  expect(registrarPartida(quebrado, 'chuteira', 'vitoria')).toEqual({
    chuteira: { tentativas: 1, vitorias: 1 },
  })
})
