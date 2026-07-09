import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SECOES } from '../src/data/secoes'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

describe('SECOES', () => {
  it('tem pelo menos uma seção e nenhum id repetido', () => {
    expect(SECOES.length).toBeGreaterThan(0)
    const ids = SECOES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todo id existe como <section> no index.html', () => {
    for (const { id } of SECOES) {
      expect(html).toContain(`<section id="${id}"`)
    }
  })

  it('todo título é não-vazio (vira o nome acessível da bolinha)', () => {
    for (const { titulo } of SECOES) {
      expect(titulo.trim().length).toBeGreaterThan(0)
    }
  })
})
