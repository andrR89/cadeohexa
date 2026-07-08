import { PROFECIA, RODAPE_PROFECIA } from '../data/profecia'

export function montarProfecia(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">A Profecia · Departamento de Projeções Estatísticas</p>
    <p class="legenda">A cada Copa, o algoz encolhe e a queda chega mais cedo. Extrapolamos.</p>
    ${graficoDaVergonha()}
    <div class="lapides">
      ${PROFECIA.map(
        (p) => `
        <article class="placa lapide">
          <p class="rotulo">${p.ano} · ${p.sede} · queda prevista: ${p.fase}</p>
          <h3>${p.algoz} <small>(${p.populacaoRotulo})</small></h3>
          <p class="epitafio">${p.nota}</p>
        </article>`,
      ).join('')}
    </div>
    <p class="legenda fecho">${RODAPE_PROFECIA}</p>
  `
}

function graficoDaVergonha(): string {
  const larg = 640, alt = 220, margem = 40
  const anos = PROFECIA.map((p) => p.ano)
  const xDe = (ano: number) =>
    margem + ((ano - anos[0]) / (anos[anos.length - 1] - anos[0])) * (larg - 2 * margem)
  const logMax = Math.log10(390_000)
  const yDe = (pop: number) => margem + (1 - Math.log10(Math.max(pop, 1)) / logMax) * (alt - 2 * margem)
  const pontos = PROFECIA.map((p) => `${xDe(p.ano)},${yDe(p.populacao)}`).join(' ')
  return `
    <svg viewBox="0 0 ${larg} ${alt}" class="grafico-vergonha" role="img"
         aria-label="População do algoz por Copa, em escala logarítmica decrescente">
      <polyline points="${pontos}" fill="none" stroke="var(--ouro)" stroke-width="2" />
      ${PROFECIA.map(
        (p) => `
        <circle cx="${xDe(p.ano)}" cy="${yDe(p.populacao)}" r="4" fill="var(--ouro-vivo)" />
        <text x="${xDe(p.ano)}" y="${alt - 12}" text-anchor="middle" class="tique">${p.ano}</text>`,
      ).join('')}
    </svg>`
}
