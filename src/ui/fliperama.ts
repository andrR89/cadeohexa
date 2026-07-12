import {
  JOGOS, LEGENDA_SECAO, RODAPE_SECAO, TITULO_SECAO, textoStats,
  type IdJogo, type JogoFliperama,
} from '../data/fliperama'
import { lerStats, registrarPartida, type StatsJogo } from '../lib/jogos/stats'
import type { MontarJogo, ResultadoJogo } from '../lib/jogos/tipos'

/** Cada jogo é um chunk lazy: o import() só dispara no COMEÇAR — a piada
 * nunca espera o JS de jogo (mesma filosofia do scroll e da profecia). */
const CARREGADORES: Record<IdJogo, () => Promise<{ montar: MontarJogo }>> = {
  chuteira: () => import('./jogos/chuteira'),
  'nao-sobe': () => import('./jogos/nao-sobe'),
  carletto: () => import('./jogos/carletto'),
}

/* Builders puros de HTML (testáveis sem DOM — padrão do rodape.ts). */

export function gabineteHTML(jogo: JogoFliperama, stats: StatsJogo): string {
  return `
    <article class="gabinete" data-jogo="${jogo.id}">
      <p class="gabinete-icone" aria-hidden="true">${jogo.icone}</p>
      <p class="rotulo">${jogo.ano}</p>
      <h3>${jogo.titulo}</h3>
      <p class="legenda">${jogo.chamada}</p>
      <p class="legenda gabinete-stats">${textoStats(stats.tentativas, stats.vitorias)}</p>
      <button class="solene jogar" data-jogo="${jogo.id}">JOGAR</button>
    </article>`
}

export function telaInstrucoesHTML(jogo: JogoFliperama): string {
  return `
    <div class="fliperama-tela">
      <p class="rotulo">${jogo.ano} · ${jogo.titulo}</p>
      <p class="fliperama-instrucoes">${jogo.instrucoes}</p>
      <div class="fliperama-botoes">
        <button class="solene" id="comecar-jogo">COMEÇAR</button>
        <button class="solene" id="fechar-jogo">Voltar</button>
      </div>
    </div>`
}

export function telaFimHTML(jogo: JogoFliperama, resultado: ResultadoJogo): string {
  const placa = resultado === 'vitoria' ? jogo.eSe : jogo.derrota
  return `
    <div class="fliperama-tela">
      <div class="placa ${resultado === 'vitoria' ? 'placa-e-se' : 'placa-derrota'}">
        <h3 tabindex="-1">${placa.titulo}</h3>
        <p>${placa.texto}</p>
      </div>
      <div class="fliperama-botoes">
        <button class="solene" id="tentar-de-novo">Tentar de novo</button>
        <button class="solene" id="aceitar">Aceitar a história</button>
      </div>
    </div>`
}

export function montarFliperama(el: HTMLElement): void {
  const stats = lerStats(localStorage)
  el.innerHTML = `
    <p class="rotulo">${TITULO_SECAO}</p>
    <p class="legenda">${LEGENDA_SECAO}</p>
    <div class="gabinetes">
      ${JOGOS.map((j) => gabineteHTML(j, stats[j.id] ?? { tentativas: 0, vitorias: 0 })).join('')}
    </div>
    <p class="legenda fecho">${RODAPE_SECAO}</p>
    <dialog class="fliperama-overlay" aria-label="Fliperama do Sofrimento" data-lenis-prevent></dialog>
  `
  const dialog = el.querySelector<HTMLDialogElement>('.fliperama-overlay')!
  let desmontarJogo: (() => void) | null = null
  // Token de geração: um comecar() antigo que resolver depois de Esc+reabrir
  // não pode montar num palco morto nem sequestrar o overlay da partida nova.
  let execucao = 0

  // Esc (cancel nativo), "Voltar", "Desistir" e "Aceitar a história" caem
  // todos aqui: desmonta o jogo (idempotente) e limpa o overlay — os chunks
  // de jogo dependem desta limpeza pra neutralizar a subtree deles.
  dialog.addEventListener('close', () => {
    desmontarJogo?.()
    desmontarJogo = null
    dialog.innerHTML = ''
  })

  function atualizarStats(): void {
    const atuais = lerStats(localStorage)
    el.querySelectorAll<HTMLElement>('.gabinete').forEach((gabinete) => {
      const id = gabinete.dataset.jogo ?? ''
      const s = atuais[id] ?? { tentativas: 0, vitorias: 0 }
      const linha = gabinete.querySelector('.gabinete-stats')
      if (linha) linha.textContent = textoStats(s.tentativas, s.vitorias)
    })
  }

  async function comecar(jogo: JogoFliperama): Promise<void> {
    const token = ++execucao
    desmontarJogo?.()
    desmontarJogo = null
    dialog.innerHTML = `
      <div class="fliperama-tela">
        <div class="fliperama-topo">
          <p class="rotulo">${jogo.ano} · ${jogo.titulo}</p>
          <button class="solene" id="fechar-jogo">Desistir</button>
        </div>
        <div class="fliperama-palco" tabindex="-1"></div>
      </div>`
    dialog.querySelector('#fechar-jogo')!.addEventListener('click', () => dialog.close())
    const palco = dialog.querySelector<HTMLElement>('.fliperama-palco')!
    palco.focus()
    try {
      const { montar } = await CARREGADORES[jogo.id]()
      if (!dialog.open || token !== execucao) return // Esc/reabertura durante o carregamento
      desmontarJogo = montar(palco, (resultado) => {
        desmontarJogo = null // o jogo já se desmontou antes de avisar
        registrarPartida(localStorage, jogo.id, resultado)
        atualizarStats()
        dialog.innerHTML = telaFimHTML(jogo, resultado)
        dialog.querySelector<HTMLElement>('h3')?.focus()
        dialog.querySelector('#tentar-de-novo')!.addEventListener('click', () => void comecar(jogo))
        dialog.querySelector('#aceitar')!.addEventListener('click', () => dialog.close())
      })
    } catch {
      // Chunk não carregou (rede): degrada com mensagem, nunca quebra a página.
      palco.innerHTML =
        '<p class="legenda">O gabinete travou. Como tudo neste memorial, a culpa não foi sua: recarregue e tente de novo.</p>'
    }
  }

  function abrir(jogo: JogoFliperama): void {
    dialog.innerHTML = telaInstrucoesHTML(jogo)
    dialog.showModal()
    dialog.querySelector('#comecar-jogo')!.addEventListener('click', () => void comecar(jogo))
    dialog.querySelector('#fechar-jogo')!.addEventListener('click', () => dialog.close())
  }

  el.querySelectorAll<HTMLButtonElement>('.jogar').forEach((botao) =>
    botao.addEventListener('click', () => {
      const jogo = JOGOS.find((j) => j.id === botao.dataset.jogo)
      if (jogo) abrir(jogo)
    }),
  )
}
