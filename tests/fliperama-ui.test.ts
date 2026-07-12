import { expect, test } from 'vitest'
import { JOGOS } from '../src/data/fliperama'
import { gabineteHTML, telaFimHTML, telaInstrucoesHTML } from '../src/ui/fliperama'

test('gabinete tem ano, título, stats e botão JOGAR endereçável', () => {
  const html = gabineteHTML(JOGOS[0], { tentativas: 2, vitorias: 0 })
  expect(html).toContain('2006')
  expect(html).toContain('Amarre a Chuteira')
  expect(html).toContain('Suas tentativas: 2 · Histórias reescritas: 0')
  expect(html).toContain('data-jogo="chuteira"')
  expect(html).toContain('JOGAR')
})

test('tela de instruções tem o texto e os dois botões', () => {
  const html = telaInstrucoesHTML(JOGOS[1])
  expect(html).toContain(JOGOS[1].instrucoes)
  expect(html).toContain('id="comecar-jogo"')
  expect(html).toContain('id="fechar-jogo"')
})

test('derrota mostra a placa solene; vitória mostra o "e se..." dourado', () => {
  const derrota = telaFimHTML(JOGOS[2], 'derrota')
  expect(derrota).toContain('placa-derrota')
  expect(derrota).toContain(JOGOS[2].derrota.texto)
  const vitoria = telaFimHTML(JOGOS[2], 'vitoria')
  expect(vitoria).toContain('placa-e-se')
  expect(vitoria).toContain(JOGOS[2].eSe.texto)
  for (const html of [derrota, vitoria]) {
    expect(html).toContain('id="tentar-de-novo"')
    expect(html).toContain('id="aceitar"')
  }
})
