import { expect, test } from 'vitest'
import { formatarMinuto, minutoFicticio } from '../../src/lib/jogos/relogio'

test('minutoFicticio mapeia linearmente e clampa nas pontas', () => {
  expect(minutoFicticio(0, 20000, 105, 120)).toBe(105)
  expect(minutoFicticio(10000, 20000, 105, 120)).toBe(112) // floor(112,5)
  expect(minutoFicticio(20000, 20000, 105, 120)).toBe(120)
  expect(minutoFicticio(99999, 20000, 105, 120)).toBe(120)
  expect(minutoFicticio(-50, 20000, 105, 120)).toBe(105)
})

test('formatarMinuto: prorrogação é minuto puro; acréscimo usa 90+X', () => {
  expect(formatarMinuto(73)).toBe("73'")
  expect(formatarMinuto(112)).toBe("112'")
  expect(formatarMinuto(90, 90)).toBe("90'")
  expect(formatarMinuto(95, 90)).toBe("90+5'")
  expect(formatarMinuto(100, 90)).toBe("90+10'")
})
