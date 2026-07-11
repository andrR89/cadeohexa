import { expect, test } from 'vitest'
import { JOGOS, LEGENDA_SECAO, RODAPE_SECAO, TITULO_SECAO, textoStats } from '../src/data/fliperama'

test('são exatamente os 3 jogos da spec, na ordem cronológica', () => {
  expect(JOGOS.map((j) => j.id)).toEqual(['chuteira', 'nao-sobe', 'carletto'])
  expect(JOGOS.map((j) => j.ano)).toEqual([2006, 2022, 2026])
})

test('todo jogo tem os textos completos — derrota E "e se..." (regra de ouro da spec)', () => {
  for (const j of JOGOS) {
    for (const texto of [j.titulo, j.icone, j.chamada, j.instrucoes,
      j.derrota.titulo, j.derrota.texto, j.eSe.titulo, j.eSe.texto]) {
      expect(texto.trim().length, `${j.id}`).toBeGreaterThan(0)
    }
    expect(j.derrota.texto).not.toBe(j.eSe.texto)
  }
})

test('a placa de derrota é solene e a de vitória cobra o preço', () => {
  for (const j of JOGOS) expect(j.derrota.titulo).toBe('A HISTÓRIA SE REPETE')
  expect(JOGOS[2].eSe.texto).toContain('doping mandibular')
})

test('textos da seção e linha de stats', () => {
  expect(TITULO_SECAO).toBe('Fliperama do Sofrimento')
  expect(LEGENDA_SECAO).toContain('Você não vai conseguir')
  expect(RODAPE_SECAO).toContain('98,7%')
  expect(textoStats(3, 1)).toBe('Suas tentativas: 3 · Histórias reescritas: 1')
})
