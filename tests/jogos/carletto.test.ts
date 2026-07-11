import { expect, test } from 'vitest'
import {
  CONFIG_CARLETTO, criarCarletto, gerarItens, yDoItem,
  type ConfigCarletto, type ItemQueda,
} from '../../src/lib/jogos/carletto'

const CFG: ConfigCarletto = {
  ...CONFIG_CARLETTO,
  duracaoMs: 10000,
  quedaMs: 1000,
  yBoca: 0.8,
  raioBoca: 0.1,
  barraInicial: 50,
  ganhoCaptura: 10,
  perdaChao: 20,
  travaMs: 1000,
}

const chiclete = (id: number, x: number, tSpawnMs: number): ItemQueda =>
  ({ id, tipo: 'chiclete', x, tSpawnMs, duracaoQuedaMs: 1000 })

test('chiclete na boca enche a barra; capturado some do ar e não cai no chão', () => {
  const jogo = criarCarletto(CFG, [chiclete(0, 0.5, 0)])
  expect(jogo.noAr(500).map((i) => i.id)).toEqual([0])
  const eventos = jogo.tick(800, 0.5) // y = 0,8 = linha da boca
  expect(eventos.capturados.map((i) => i.id)).toEqual([0])
  expect(jogo.barra()).toBe(60)
  expect(jogo.noAr(900)).toEqual([])
  expect(jogo.tick(1100, 0.5).noChao).toEqual([])
})

test('chiclete no gramado esvazia a barra — e a decisão na boca é única', () => {
  const jogo = criarCarletto(CFG, [chiclete(0, 0.9, 0)])
  jogo.tick(800, 0.2) // longe: escapou
  expect(jogo.barra()).toBe(50)
  const eventos = jogo.tick(1000, 0.9) // mover depois não conserta
  expect(eventos.noChao.map((i) => i.id)).toEqual([0])
  expect(jogo.barra()).toBe(30)
})

test('isca capturada trava o Carletto e o chiclete seguinte escapa', () => {
  const itens: ItemQueda[] = [
    { id: 0, tipo: 'menta', x: 0.5, tSpawnMs: 0, duracaoQuedaMs: 1000 },
    chiclete(1, 0.5, 500),
  ]
  const jogo = criarCarletto(CFG, itens)
  jogo.tick(800, 0.5) // pega a menta: trava até 1800
  expect(jogo.travadoAte()).toBe(1800)
  expect(jogo.barra()).toBe(50) // isca não mexe na barra
  jogo.tick(1300, 0.5) // chiclete cruza a boca travada: escapa
  const eventos = jogo.tick(1500, 0.5)
  expect(eventos.noChao.map((i) => i.id)).toEqual([1])
  expect(jogo.barra()).toBe(30)
})

test('isca no gramado não faz nada', () => {
  const jogo = criarCarletto(CFG, [{ id: 0, tipo: 'bandeira', x: 0.5, tSpawnMs: 0, duracaoQuedaMs: 1000 }])
  jogo.tick(800, 0.0)
  jogo.tick(1000, 0.0)
  expect(jogo.barra()).toBe(50)
  expect(jogo.estado().resultado).toBe(null)
})

test('barra zerada = Haaland marca na hora; sobreviver com barra = e se...', () => {
  const derrotado = criarCarletto({ ...CFG, barraInicial: 20 }, [chiclete(0, 0.9, 0)])
  derrotado.tick(800, 0.0)
  derrotado.tick(1000, 0.0)
  expect(derrotado.barra()).toBe(0)
  expect(derrotado.estado().resultado).toBe('derrota')

  const vencedor = criarCarletto(CFG, [])
  vencedor.tick(10000, 0.5)
  expect(vencedor.estado().resultado).toBe('vitoria')
})

test('barra tem teto em 100', () => {
  const jogo = criarCarletto({ ...CFG, barraInicial: 95 }, [chiclete(0, 0.5, 0)])
  jogo.tick(800, 0.5)
  expect(jogo.barra()).toBe(100)
})

test('gerarItens: ordenado, e dos 70 minutos em diante caem dois por vez', () => {
  const cfg: ConfigCarletto = { ...CFG, chanceIsca: 0, intervaloInicialMs: 1000, intervaloFinalMs: 1000 }
  const itens = gerarItens(cfg, () => 0.5)
  const tDupla = (cfg.minutoChuvaDupla / cfg.minutoFinal) * cfg.duracaoMs
  for (let i = 1; i < itens.length; i++) {
    expect(itens[i].tSpawnMs).toBeGreaterThanOrEqual(itens[i - 1].tSpawnMs)
  }
  const porSpawn = new Map<number, number>()
  for (const item of itens) porSpawn.set(item.tSpawnMs, (porSpawn.get(item.tSpawnMs) ?? 0) + 1)
  for (const [t, quantos] of porSpawn) {
    expect(quantos, `spawn em ${t}`).toBe(t >= tDupla ? 2 : 1)
  }
  // todo item tem tempo de chegar ao chão antes do apito
  const ultimo = itens[itens.length - 1]
  expect(ultimo.tSpawnMs + ultimo.duracaoQuedaMs).toBeLessThanOrEqual(cfg.duracaoMs)
})

test('gerarItens respeita a chance de isca', () => {
  const soIscas = gerarItens({ ...CFG, chanceIsca: 1 }, () => 0.4)
  // com rng 0,4 < 0,5 a isca sorteada é a menta; as duplas da reta final são sempre chiclete
  expect(soIscas.filter((i) => i.tipo === 'menta').length).toBeGreaterThan(0)
  expect(soIscas.filter((i) => i.tipo === 'bandeira')).toEqual([])
  const soChicletes = gerarItens({ ...CFG, chanceIsca: 0 }, () => 0.4)
  expect(soChicletes.every((i) => i.tipo === 'chiclete')).toBe(true)
})

test('yDoItem: 0 no spawn, 1 no chão', () => {
  const item = chiclete(0, 0.5, 2000)
  expect(yDoItem(item, 2000)).toBe(0)
  expect(yDoItem(item, 2500)).toBe(0.5)
  expect(yDoItem(item, 3000)).toBe(1)
})

test('barra zerada no meio do quadro é derrota — sem resgate no mesmo tick', () => {
  const jogo = criarCarletto({ ...CFG, barraInicial: 18 }, [
    chiclete(0, 0.9, 0), // vai pro chão aos 1000
    chiclete(1, 0.5, 200), // cruza a boca aos 1000 — não pode salvar
  ])
  jogo.tick(800, 0.2) // 0 escapou da boca; 1 ainda caindo
  const eventos = jogo.tick(1000, 0.5)
  expect(eventos.noChao.map((i) => i.id)).toEqual([0])
  expect(jogo.barra()).toBe(0)
  expect(jogo.estado().resultado).toBe('derrota')
})
