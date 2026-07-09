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
 * estatísticas rotuladas). É a camada "vitrine" — o `.lapides` logo abaixo é o
 * arquivo completo, sempre presente, que já cobre a mesma informação pra quem
 * não usa mouse/toque no gráfico. */
function detalheHTML(p: Previsao): string {
  return `
    <img
      class="profecia-detalhe-imagem"
      src="${p.imagem}"
      alt="${p.algoz}, Copa de ${p.ano}"
      loading="lazy"
      width="1024"
      height="1024"
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
 * nota. Não depende de nenhuma interação além da montagem inicial do
 * componente — é o conteúdo "de arquivo", completo para leitor de tela,
 * mobile e qualquer visitante que não toque no gráfico. */
function cardHTML(p: Previsao): string {
  return `
    <article class="placa lapide" data-ano="${p.ano}">
      <img
        class="lapide-retrato-profecia"
        src="${p.imagem}"
        alt="${p.algoz}, Copa de ${p.ano}"
        loading="lazy"
        width="1024"
        height="1024"
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
    <svg viewBox="0 0 ${larg} ${alt}" class="grafico-vergonha" role="img"
         aria-label="Gráfico: população do algoz por Copa, em escala logarítmica decrescente — de ${primeiro.populacaoRotulo} em ${primeiro.ano} a ${ultimo.populacaoRotulo} em ${ultimo.ano}. Cada ponto é interativo e abre os detalhes da profecia.">
      <polyline points="${pontos}" fill="none" stroke="var(--ouro)" stroke-width="2" />
      ${PROFECIA.map(
        (p, i) => `
        <g class="ponto-vergonha" tabindex="0" role="button" data-i="${i}"
           aria-label="Ver profecia de ${p.ano}: ${p.algoz}"
           aria-pressed="${i === 0 ? 'true' : 'false'}"
           aria-controls="profecia-detalhe">
          <circle class="ponto-alvo" cx="${xDe(p.ano)}" cy="${yDe(p.populacao)}" r="14" />
          <circle class="ponto-nucleo" cx="${xDe(p.ano)}" cy="${yDe(p.populacao)}" r="4" />
        </g>
        <text x="${xDe(p.ano)}" y="${alt - 12}" text-anchor="middle" class="tique">${p.ano}</text>`,
      ).join('')}
    </svg>
    <p class="legenda grafico-legenda">
      Eixo vertical: população do algoz (escala logarítmica — quanto mais baixo, menor o povo que nos elimina).
      Passe o mouse, toque ou use Tab e Enter em cada ponto para abrir os detalhes.
    </p>
  `
}

/** Camada de interatividade do gráfico: cada ponto é focável/clicável e, ao
 * ganhar hover, foco ou clique/toque, atualiza o painel de destaque acima da
 * galeria. Pura melhoria progressiva — o SVG e a galeria completa já existem
 * no HTML montado, então nada aqui é necessário pra ver o conteúdo. */
function ligarGraficoInterativo(el: HTMLElement): void {
  const pontos = el.querySelectorAll<SVGGElement>('.ponto-vergonha')
  const painelEl = el.querySelector<HTMLElement>('#profecia-detalhe')
  const cards = el.querySelectorAll<HTMLElement>('.lapides .lapide')
  if (!painelEl || pontos.length === 0) return
  const painel: HTMLElement = painelEl

  function selecionar(indice: number): void {
    const previsao = PROFECIA[indice]
    if (!previsao) return
    pontos.forEach((ponto, i) => {
      const ativo = i === indice
      ponto.classList.toggle('selecionado', ativo)
      ponto.setAttribute('aria-pressed', String(ativo))
    })
    cards.forEach((card) => {
      card.classList.toggle('lapide-selecionada', card.dataset.ano === String(previsao.ano))
    })
    painel.innerHTML = detalheHTML(previsao)
  }

  pontos.forEach((ponto, i) => {
    ponto.addEventListener('pointerenter', () => selecionar(i))
    ponto.addEventListener('focus', () => selecionar(i))
    ponto.addEventListener('click', () => selecionar(i))
    ponto.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault()
        selecionar(i)
      }
    })
  })
}
