export interface Previsao {
  ano: number
  sede: string
  algoz: string
  populacao: number
  populacaoRotulo: string
  rankingFifa: string
  fase: string
  imagem: string
  nota: string
}

export const PROFECIA: Previsao[] = [
  {
    ano: 2030, sede: 'Espanha/Portugal/Marrocos', algoz: 'Islândia', populacao: 390_000,
    populacaoRotulo: '390 mil habitantes', rankingFifa: '72º', fase: 'fase de grupos',
    imagem: '/img/prof-2030-islandia.webp',
    nota: 'Mais vulcões ativos que jogadores profissionais. As palmas vikings já estão ensaiadas.',
  },
  {
    ano: 2034, sede: 'Arábia Saudita', algoz: 'Ilhas Faroé', populacao: 54_000,
    populacaoRotulo: '54 mil habitantes', rankingFifa: '141º', fase: 'repescagem intercontinental',
    imagem: '/img/prof-2034-faroe.webp',
    nota: 'Primeira seleção da história com mais ovelhas que torcedores.',
  },
  {
    ano: 2038, sede: 'a definir', algoz: 'San Marino', populacao: 34_000,
    populacaoRotulo: '34 mil habitantes', rankingFifa: '210º — último colocado do mundo', fase: 'Eliminatórias',
    imagem: '/img/prof-2038-sanmarino.webp',
    nota: 'Literalmente a pior seleção do ranking FIFA quebra um jejum de décadas sem vitórias justamente contra nós. Estatisticamente inevitável.',
  },
  {
    ano: 2042, sede: 'a definir', algoz: 'Vaticano', populacao: 764,
    populacaoRotulo: '764 habitantes', rankingFifa: 'sem ranking (nem filiado à FIFA)', fase: 'amistoso preparatório',
    imagem: '/img/prof-2042-vaticano.webp',
    nota: 'Gol de milagre aos 90+7. O VAR não pode contestar decisão divina. O Papa decreta feriado.',
  },
  {
    ano: 2046, sede: 'a definir', algoz: 'Morecambe FC', populacao: 30,
    populacaoRotulo: '30 — o elenco profissional inteiro',
    rankingFifa: 'clube (a FIFA ampliou a Copa para 512 vagas e ficou sem países)', fase: '64-avos de final',
    imagem: '/img/prof-2046-morecambe.webp',
    nota: 'A Copa de 512 seleções. Sem países suficientes no planeta, a FIFA passou a convocar clubes. O Morecambe FC — quarta divisão inglesa, mascote camarão — eliminou o Brasil nos 64-avos e voltou de ônibus no mesmo dia: tinha jogo do campeonato no sábado. Décima primeira eliminação consecutiva para europeus; a tradição resiste até quando o adversário é clube.',
  },
  {
    ano: 2050, sede: 'a definir', algoz: 'Seleção das IAs', populacao: 2,
    populacaoRotulo: '2 modelos', rankingFifa: 'fora do ranking (formas de vida não-humanas)',
    fase: 'antes mesmo da convocação',
    imagem: '/img/prof-2050-ias.webp',
    nota: 'A seleção das IAs. O Claude subiu mais alto que a zaga e fez de cabeça. O Gemini, para fechar o caixão, tentou o segundo duas vezes — alucinou um impedimento, pediu desculpas, e na segunda fez. 2x0. A máquina não sente nada; ainda assim aprendeu a zoar.',
  },
]

export const RODAPE_PROFECIA =
  'Projeção por regressão linear da vergonha (R² = 0,97). A ciência não erra. ' +
  '(A Copa de 512 seleções ainda é ficção — a de 2026 teve 48. Por enquanto.)'
