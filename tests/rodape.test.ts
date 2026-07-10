import { expect, test } from 'vitest'
import { htmlRodape } from '../src/ui/rodape'

test('rodapé linka o perfil e o repositório no GitHub', () => {
  const html = htmlRodape()
  expect(html).toContain('href="https://github.com/andrR89"')
  expect(html).toContain('href="https://github.com/andrR89/cadeohexa"')
})

test('links externos abrem em nova aba sem vazar o opener', () => {
  const links = htmlRodape().match(/<a\s[^>]*>/g) ?? []
  expect(links.length).toBe(2)
  for (const link of links) {
    expect(link).toContain('rel="noopener"')
    expect(link).toContain('target="_blank"')
  }
})

test('créditos citam a stack de verdade', () => {
  const html = htmlRodape()
  for (const tecnologia of ['Vite', 'GSAP', 'Cloudflare Pages']) {
    expect(html).toContain(tecnologia)
  }
})
