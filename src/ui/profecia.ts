import { PROFECIA, RODAPE_PROFECIA, type Previsao } from '../data/profecia'

export function montarProfecia(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">A Profecia · Departamento de Projeções Estatísticas</p>
    <p class="legenda">A cada Copa, o algoz encolhe e a queda chega mais cedo. Extrapolamos.</p>
    ${graficoDaVergonha()}
    <div class="profecia-detalhe" id="profecia-detalhe" aria-live="polite">
      ${detalheHTML(PROFECIA[0])}
    </div>
    <div class="lapides">
      ${PROFECIA.map((p) => cardHTML(p)).join('')}
    </div>
    <p class="legenda fecho">${RODAPE_PROFECIA}</p>
  `
  ligarGraficoInterativo(el)
}

/** Painel de destaque: mostra a profecia selecionada no gráfico (imagem +
 * estatísticas rotuladas). Com o gráfico interativo de pé é a ÚNICA camada de
 * conteúdo visível — a galeria `.lapides` fica oculta (rede de segurança da
 * interatividade; ver o docblock de cardHTML). */
function detalheHTML(p: Previsao): string {
  return `
    <img
      class="profecia-detalhe-imagem"
      src="${p.imagem}"
      alt="${p.algoz}, Copa de ${p.ano}"
      loading="lazy"
      width="900"
      height="900"
    />
    <div class="profecia-detalhe-texto">
      <p class="rotulo">${p.ano} · ${p.sede}</p>
      <h3>${p.algoz}</h3>
      ${statsHTML(p)}
      <p class="epitafio">${p.nota}</p>
    </div>
  `
}

function statsHTML(p: Previsao): string {
  return `
    <dl class="stats-profecia">
      <div><dt>População</dt><dd>${p.populacaoRotulo}</dd></div>
      <div><dt>Ranking FIFA</dt><dd>${p.rankingFifa}</dd></div>
      <div><dt>Queda prevista</dt><dd>${p.fase}</dd></div>
    </dl>
  `
}

/** Galeria completa: as 6 profecias com imagem + estatísticas rotuladas +
 * nota. É a rede de segurança da interatividade — entra no DOM já na montagem
 * e só some (display:none) na última linha de ligarGraficoInterativo(), depois
 * de toda a fiação ligada; se essa fiação falhar ou nunca rodar, os 6 cards
 * continuam visíveis e nenhum conteúdo se perde. Com o gráfico funcionando, o
 * conteúdo vem só do painel aria-live, ativado ponto a ponto. */
function cardHTML(p: Previsao): string {
  return `
    <article class="placa lapide">
      <img
        class="lapide-retrato-profecia"
        src="${p.imagem}"
        alt="${p.algoz}, Copa de ${p.ano}"
        loading="lazy"
        width="900"
        height="900"
      />
      <p class="rotulo">${p.ano} · ${p.sede}</p>
      <h3>${p.algoz}</h3>
      ${statsHTML(p)}
      <p class="epitafio">${p.nota}</p>
    </article>`
}

function graficoDaVergonha(): string {
  const larg = 640, alt = 220, margem = 40
  const anos = PROFECIA.map((p) => p.ano)
  const anoMin = Math.min(...anos), anoMax = Math.max(...anos)
  const xDe = (ano: number) => margem + ((ano - anoMin) / (anoMax - anoMin)) * (larg - 2 * margem)
  const logMax = Math.log10(Math.max(...PROFECIA.map((p) => p.populacao)))
  const yDe = (pop: number) => margem + (1 - Math.log10(Math.max(pop, 1)) / logMax) * (alt - 2 * margem)
  const pontos = PROFECIA.map((p) => `${xDe(p.ano)},${yDe(p.populacao)}`).join(' ')
  const primeiro = PROFECIA[0]!
  const ultimo = PROFECIA[PROFECIA.length - 1]!
  return `
    <svg viewBox="0 0 ${larg} ${alt}" class="grafico-vergonha" role="group"
         aria-label="Gráfico: população do algoz por Copa, em escala logarítmica decrescente — de ${primeiro.populacaoRotulo} em ${primeiro.ano} a ${ultimo.populacaoRotulo} em ${ultimo.ano}. Cada ponto é interativo e abre os detalhes da profecia.">
      <polyline points="${pontos}" fill="none" stroke="var(--ouro)" stroke-width="2" />
      ${PROFECIA.map(
        (p, i) => `
        <g class="ponto-vergonha${i === 0 ? ' selecionado' : ''}" tabindex="0" role="button" data-i="${i}"
           aria-label="Ver profecia de ${p.ano}: ${p.algoz}"
           aria-pressed="${i === 0 ? 'true' : 'false'}"
           aria-controls="profecia-detalhe">
          <circle class="ponto-alvo" cx="${xDe(p.ano)}" cy="${yDe(p.populacao)}" r="22" />
          <circle class="ponto-nucleo" cx="${xDe(p.ano)}" cy="${yDe(p.populacao)}" r="4" />
        </g>
        <text x="${xDe(p.ano)}" y="${alt - 12}" text-anchor="middle" class="tique">${p.ano}</text>`,
      ).join('')}
    </svg>
    <p class="legenda grafico-legenda">
      Eixo vertical: população do algoz (escala logarítmica — quanto mais baixo, menor o povo que nos elimina).
      Clique, toque ou use Tab e Enter em cada ponto para abrir os detalhes.
    </p>
  `
}

/** Camada de interatividade do gráfico: cada ponto é focável/clicável e, ao ser
 * ativado (clique/toque, Enter ou Espaço), atualiza o painel de destaque acima
 * da galeria. Hover e foco dão apenas a prévia visual (realce do ponto, via CSS
 * :hover/:focus-visible) — de propósito NÃO mexem no painel, que é uma região
 * aria-live: assim, tabular pelos 6 pontos não dispara 6 anúncios no leitor de
 * tela; o conteúdo só é anunciado na ativação explícita. Por fim, esconde a
 * galeria, que vira redundante com o painel funcionando (rede de segurança;
 * ver o docblock de cardHTML). */
function ligarGraficoInterativo(el: HTMLElement): void {
  const pontos = el.querySelectorAll<SVGGElement>('.ponto-vergonha')
  const painelEl = el.querySelector<HTMLElement>('#profecia-detalhe')
  if (!painelEl || pontos.length === 0) return
  const painel: HTMLElement = painelEl
  let atual = 0

  function selecionar(indice: number): void {
    // Reativar o ponto já selecionado não deve reescrever a região aria-live
    // (o conteúdo já está na tela) — evita um anúncio redundante no leitor de tela.
    if (indice === atual) return
    const previsao = PROFECIA[indice]
    if (!previsao) return
    atual = indice
    pontos.forEach((ponto, i) => {
      const ativo = i === indice
      ponto.classList.toggle('selecionado', ativo)
      ponto.setAttribute('aria-pressed', String(ativo))
    })
    painel.innerHTML = detalheHTML(previsao)
  }

  pontos.forEach((ponto, i) => {
    // Só ativação explícita mexe no painel aria-live. Hover/foco = prévia visual
    // (realce do ponto) resolvida no CSS, sem listener aqui.
    ponto.addEventListener('click', () => selecionar(i))
    ponto.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault()
        selecionar(i)
      }
    })
  })

  // Escondida por último — só depois de todos os listeners ligados. Se qualquer
  // passo acima falhar, a galeria continua visível (ver o docblock de cardHTML).
  el.querySelector<HTMLElement>('.lapides')?.classList.add('lapides-ocultas')
}
