export interface Previsao {
  ano: number
  sede: string
  algoz: string
  populacao: number
  populacaoRotulo: string
  fase: string
  nota: string
}

export const PROFECIA: Previsao[] = [
  {
    ano: 2030, sede: 'Espanha/Portugal/Marrocos', algoz: 'Islândia', populacao: 390_000, populacaoRotulo: '390 mil',
    fase: 'fase de grupos',
    nota: 'Mais vulcões ativos que jogadores profissionais. As palmas vikings já estão ensaiadas.',
  },
  {
    ano: 2034, sede: 'Arábia Saudita', algoz: 'Ilhas Faroé', populacao: 54_000, populacaoRotulo: '54 mil',
    fase: 'repescagem intercontinental',
    nota: 'Primeira seleção da história com mais ovelhas que torcedores.',
  },
  {
    ano: 2038, sede: 'a definir', algoz: 'San Marino', populacao: 34_000, populacaoRotulo: '34 mil',
    fase: 'Eliminatórias',
    nota: 'A pior seleção do ranking FIFA quebra um jejum milenar justamente contra nós. Estatisticamente inevitável.',
  },
  {
    ano: 2042, sede: 'a definir', algoz: 'Vaticano', populacao: 764, populacaoRotulo: '764',
    fase: 'amistoso preparatório',
    nota: 'Gol de milagre aos 90+7. O VAR não pode contestar decisão divina. O Papa decreta feriado.',
  },
  {
    ano: 2046, sede: 'a definir', algoz: 'Robôs da RoboCup', populacao: 22, populacaoRotulo: '22 robôs',
    fase: 'sorteio dos grupos',
    nota: 'A meta oficial do projeto era vencer os campeões humanos em 2050. Contra o Brasil, anteciparam.*',
  },
  {
    ano: 2050, sede: 'a definir', algoz: 'Seleção do Gemini', populacao: 1, populacaoRotulo: '1 modelo',
    fase: 'antes da convocação',
    nota: 'A seleção do Claude Code, invicta, recusou o convite por falta de desafio. O Gemini alucinou um impedimento no próprio ataque, pediu desculpas duas vezes — e venceu de 2x1, com gol contra nosso.',
  },
]

export const RODAPE_PROFECIA =
  'Projeção por regressão linear da vergonha (R² = 0,97). A ciência não erra. ' +
  '*A meta da RoboCup para 2050 é real e verificável. Nós conferimos. Duas vezes.'
