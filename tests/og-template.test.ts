import { expect, test } from 'vitest'
import { ogHtml } from '../src/lib/og-template'

test('template OG contém o contador formatado e a marca', () => {
  const html = ogHtml('8.773')
  expect(html).toContain('8.773')
  expect(html).toContain('dias sem o hexa')
  expect(html).toContain('cadeohexa')
})
