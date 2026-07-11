import { expect, test } from 'vitest'
import { CONFIG_NAO_SOBE, criarNaoSobe, gerarEscapes, type ConfigNaoSobe } from '../../src/lib/jogos/nao-sobe'

const CFG: ConfigNaoSobe = {
  ...CONFIG_NAO_SOBE,
  jogadores: 5,
  duracaoMs: 10000,
  limiteAvancados: 3,
}

test('puxar de volta segura o time e o apito final é vitória', () => {
  const jogo = criarNaoSobe(CFG, [
    { tMs: 1000, jogador: 0 },
    { tMs: 2000, jogador: 1 },
    { tMs: 3000, jogador: 2 },
  ])
  expect(jogo.tick(2500)).toEqual([0, 1])
  expect(jogo.estado().resultado).toBe(null)
  expect(jogo.puxar(0)).toBe(true)
  expect(jogo.avancados()).toEqual([1])
  jogo.tick(3000)
  expect(jogo.avancados()).toEqual([1, 2])
  jogo.tick(10000)
  expect(jogo.estado().resultado).toBe('vitoria')
})

test('3 avançados ao mesmo tempo = contra-ataque = derrota', () => {
  const jogo = criarNaoSobe(CFG, [
    { tMs: 1000, jogador: 0 },
    { tMs: 2000, jogador: 1 },
    { tMs: 3000, jogador: 2 },
  ])
  jogo.tick(5000)
  expect(jogo.estado().resultado).toBe('derrota')
  expect(jogo.puxar(0)).toBe(false) // tarde demais
  expect(jogo.tick(6000)).toEqual([])
})

test('sorteado que já subiu escapa como o próximo da defesa (circular)', () => {
  const jogo = criarNaoSobe(CFG, [
    { tMs: 1000, jogador: 3 },
    { tMs: 2000, jogador: 3 },
  ])
  expect(jogo.tick(1000)).toEqual([3])
  expect(jogo.tick(2000)).toEqual([4])
})

test('puxar quem está na defesa não faz nada', () => {
  const jogo = criarNaoSobe(CFG, [])
  expect(jogo.puxar(0)).toBe(false)
})

test('gerarEscapes: frequência cresce e o goleiro só aparece no quarto final', () => {
  const escapes = gerarEscapes(CONFIG_NAO_SOBE, () => 0.99)
  expect(escapes.length).toBeGreaterThan(5)
  for (let i = 1; i < escapes.length; i++) {
    const anterior = escapes[i - 1].tMs
    expect(escapes[i].tMs).toBeGreaterThan(anterior)
    if (i >= 2) {
      // intervalos encolhem: dificuldade crescente
      expect(escapes[i].tMs - anterior).toBeLessThan(anterior - escapes[i - 2].tMs)
    }
    expect(escapes[i].tMs).toBeLessThan(CONFIG_NAO_SOBE.duracaoMs)
  }
  const goleiro = CONFIG_NAO_SOBE.jogadores - 1
  for (const e of escapes) {
    if (e.jogador === goleiro) {
      expect(e.tMs).toBeGreaterThan(CONFIG_NAO_SOBE.duracaoMs * 0.75)
    }
  }
  // com rng 0,99 o goleiro é sorteado assim que entra na roleta
  expect(escapes.some((e) => e.jogador === goleiro)).toBe(true)
})
