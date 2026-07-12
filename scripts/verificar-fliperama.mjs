// scripts/verificar-fliperama.mjs
// E2E headless do Fliperama (padrão da v3.2): Chromium do sistema + puppeteer-core.
// Uso: npm run build && npx vite preview --port 4173 &  → node scripts/verificar-fliperama.mjs
import puppeteer from 'puppeteer-core'

const URL_BASE = process.env.URL_BASE ?? 'http://localhost:4173'
const CAPTURAS = process.env.CAPTURAS ?? '.'
let falhas = 0
const checar = (nome, ok, extra = '') => {
  console.log(`${ok ? '✅' : '❌'} ${nome}${extra ? ` — ${extra}` : ''}`)
  if (!ok) falhas++
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
})

try {
  const page = await browser.newPage()
  const errosPagina = []
  page.on('pageerror', (erro) => errosPagina.push(String(erro)))
  await page.setViewport({ width: 1280, height: 900 })
  await page.goto(URL_BASE, { waitUntil: 'networkidle0' })

  // Seção e nav
  checar('seção #fliperama com 3 gabinetes',
    (await page.$$eval('#fliperama .gabinete', (g) => g.length)) === 3)
  checar('bolinha da nav aponta pra #fliperama',
    (await page.$('#nav-secoes a[href="#fliperama"]')) !== null)
  // captura a própria seção (rola até ela e dispara o reveal) — não o topo da página
  const secao = await page.$('#fliperama')
  await secao.scrollIntoViewIfNeeded()
  await new Promise((r) => setTimeout(r, 700)) // deixa o reveal (GSAP) assentar
  await secao.screenshot({ path: `${CAPTURAS}/fliperama-secao.png` })
  await page.evaluate(() => window.scrollTo(0, 0))

  // Chuteira: abrir, começar, perder de propósito (Henry chega em ~12s)
  await page.click('.jogar[data-jogo="chuteira"]')
  checar('overlay abre com instruções',
    (await page.$eval('.fliperama-overlay', (d) => d.open)) === true &&
    (await page.$('#comecar-jogo')) !== null)
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-chuteira')
  checar('chuteira montada', true)
  await page.keyboard.press('Space') // teclado registra aperto sem quebrar
  await page.waitForSelector('.placa-derrota', { timeout: 16000 })
  checar('placa de derrota da chuteira cita o agachamento',
    (await page.$eval('.placa-derrota', (p) => p.textContent ?? '')).includes('agachado'))
  await page.screenshot({ path: `${CAPTURAS}/fliperama-derrota-2006.png` })

  // Tentar de novo remonta; Esc fecha no meio da partida
  await page.click('#tentar-de-novo')
  await page.waitForSelector('.jogo-chuteira')
  checar('tentar de novo remonta o jogo', true)
  await page.keyboard.press('Escape')
  checar('Esc fecha o overlay no meio da partida',
    (await page.$eval('.fliperama-overlay', (d) => !d.open)) === true)

  // Stats: 1 partida terminada (a abandonada no Esc não conta)
  const stats = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('fliperama-stats-v1') ?? '{}'))
  checar('stats registram só a partida terminada',
    stats.chuteira?.tentativas === 1 && stats.chuteira?.vitorias === 0,
    JSON.stringify(stats))
  checar('gabinete mostra as stats atualizadas',
    (await page.$eval('.gabinete[data-jogo="chuteira"] .gabinete-stats',
      (e) => e.textContent ?? '')).includes('Suas tentativas: 1'))

  // NÃO SOBE!: sem puxar ninguém, o contra-ataque vem (~6,6s: 3º escape)
  await page.click('.jogar[data-jogo="nao-sobe"]')
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-nao-sobe')
  await page.waitForSelector('.placa-derrota', { timeout: 24000 })
  checar('derrota do NÃO SOBE! cita os 117 minutos',
    (await page.$eval('.placa-derrota', (p) => p.textContent ?? '')).includes('117'))
  await page.keyboard.press('Escape')

  // Carletto: parado no meio, a partida termina de um jeito ou de outro
  await page.click('.jogar[data-jogo="carletto"]')
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-carletto')
  await page.screenshot({ path: `${CAPTURAS}/fliperama-carletto.png` })
  await page.waitForFunction(
    () => document.querySelector('.placa-derrota, .placa-e-se') !== null,
    { timeout: 32000 })
  checar('Carletto termina com placa de fim (derrota ou e-se)', true)
  await page.keyboard.press('Escape')

  // === EXTRA 3 (revisão Task 10): Esc nas instruções e reabrir OUTRO jogo ===
  // sanidade da máquina de estados do overlay (token de geração).
  await page.click('.jogar[data-jogo="chuteira"]')
  await page.waitForSelector('#comecar-jogo') // instruções da chuteira
  await page.keyboard.press('Escape')
  await page.waitForFunction(() =>
    !document.querySelector('.fliperama-overlay')?.open)
  await page.click('.jogar[data-jogo="carletto"]')
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-carletto')
  checar('Esc nas instruções e reabrir outro jogo monta o novo', true)
  await page.keyboard.press('Escape')

  // === EXTRA 4 (revisão Task 8): teclado no NÃO SOBE! — Tab + Enter sem quebrar ===
  await page.click('.jogar[data-jogo="nao-sobe"]')
  await page.click('#comecar-jogo')
  await page.waitForSelector('.jogo-nao-sobe')
  const errosAntes = errosPagina.length
  await page.keyboard.press('Tab') // foca um jogador (botões são focáveis)
  await page.keyboard.press('Enter') // ativa o puxão (ninguém subiu ainda: no-op)
  const overlayAberto = await page.$eval('.fliperama-overlay', (d) => d.open)
  const jogoVivo = (await page.$('.jogo-nao-sobe')) !== null
  checar('teclado no NÃO SOBE! (Tab+Enter) não quebra e mantém o overlay',
    overlayAberto && jogoVivo && errosPagina.length === errosAntes,
    `erros=${errosPagina.length - errosAntes}`)
  await page.keyboard.press('Escape')

  // reduced-motion: continua jogável
  const page2 = await browser.newPage()
  await page2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page2.goto(URL_BASE, { waitUntil: 'networkidle0' })
  await page2.click('.jogar[data-jogo="chuteira"]')
  await page2.click('#comecar-jogo')
  await page2.waitForSelector('.jogo-chuteira')
  checar('reduced-motion: jogo monta e roda', true)
  await page2.keyboard.press('Escape')
  await page2.close()

  // === EXTRA 1 (revisão Task 8): mobile 360px — 10 botões do NÃO SOBE! sem corte ===
  const pageMobile = await browser.newPage()
  await pageMobile.setViewport({ width: 360, height: 740 })
  await pageMobile.goto(URL_BASE, { waitUntil: 'networkidle0' })
  await pageMobile.click('.jogar[data-jogo="nao-sobe"]')
  await pageMobile.click('#comecar-jogo')
  await pageMobile.waitForSelector('.nao-sobe-jogador')
  const layout = await pageMobile.$eval('.nao-sobe-campo', (campo) => {
    const c = campo.getBoundingClientRect()
    const botoes = [...campo.querySelectorAll('.nao-sobe-jogador')]
    const dentro = botoes.every((b) => {
      const r = b.getBoundingClientRect()
      return r.left >= c.left - 0.5 && r.right <= c.right + 0.5
    })
    return { total: botoes.length, dentro }
  })
  checar('360px: 10 botões do NÃO SOBE! renderizam sem corte horizontal',
    layout.total === 10 && layout.dentro, JSON.stringify(layout))
  await pageMobile.keyboard.press('Escape')
  await pageMobile.close()

  // === EXTRA 2 (revisão Task 10): overlay rola sob viewport curto (data-lenis-prevent) ===
  const pageCurto = await browser.newPage()
  await pageCurto.setViewport({ width: 380, height: 320 }) // estreito+curto: força o texto mais longo a estourar o dialog
  await pageCurto.goto(URL_BASE, { waitUntil: 'networkidle0' })
  await pageCurto.click('.jogar[data-jogo="carletto"]') // instruções mais longas
  await pageCurto.waitForSelector('.fliperama-instrucoes')
  const rolagem = await pageCurto.$eval('.fliperama-overlay', (d) => {
    const antes = { sh: d.scrollHeight, ch: d.clientHeight, oy: getComputedStyle(d).overflowY }
    d.scrollTop = 9999
    return { ...antes, scrollTop: d.scrollTop }
  })
  checar('overlay rola sob viewport curto (data-lenis-prevent não bloqueia)',
    rolagem.sh > rolagem.ch && rolagem.scrollTop > 0, JSON.stringify(rolagem))
  await pageCurto.close()
} finally {
  await browser.close()
}

console.log(falhas ? `\n${falhas} checagem(ns) falharam` : '\ntudo verde')
process.exit(falhas ? 1 : 0)
