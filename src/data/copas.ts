export interface Copa {
  ano: number
  algoz: string
  placar: string
  placarOculto?: boolean // 2014: revela só em interação
  fase: string
  epitafio: string
  fatos: string[]
  imagem: string // retrato-memorial em /public/img, formato "elim-<ano>-<algoz>.jpg"
}

export const COPAS: Copa[] = [
  {
    ano: 2006, algoz: 'França', placar: '0x1', fase: 'quartas de final',
    epitafio: 'O Quadrado Trágico. Uma finalização no gol em 90 minutos.',
    fatos: [
      'Roberto Carlos amarrava a chuteira enquanto Henry marcava o gol da eliminação.',
      'O Quadrado Mágico jogou junto uma única vez em 18 jogos de Eliminatórias.',
      'Zidane deu chapéu no Ronaldo jogando lesionado na coxa.',
    ],
    imagem: '/img/elim-2006-franca.jpg',
  },
  {
    ano: 2010, algoz: 'Holanda', placar: '1x2', fase: 'quartas de final',
    epitafio: 'Felipe Melo participou dos três gols do jogo. Dois foram para a Holanda.',
    fatos: [
      'Assistência, primeiro gol contra da história da Seleção em Copas e expulsão — tudo no mesmo jogo.',
      'A virada veio em 8 minutos; o gol de cabeça foi do Sneijder, o menor jogador em campo (1,70m).',
      'A comunidade "Felipe Melo me deve um feriado" juntou 10 mil pessoas no Orkut em dias.',
    ],
    imagem: '/img/elim-2010-holanda.jpg',
  },
  {
    ano: 2014, algoz: 'Alemanha', placar: '1x7', placarOculto: true, fase: 'semifinal, em casa',
    epitafio: 'O Incidente.',
    fatos: [
      '4 gols entre os minutos 23 e 29. O replay de um gol foi interrompido por outro gol.',
      'Klose quebrou o recorde do Ronaldo ali, com o Ronaldo no estádio comentando.',
      '35,6 milhões de tweets — o maior evento de zoação da história da internet brasileira.',
    ],
    imagem: '/img/elim-2014-alemanha.jpg',
  },
  {
    ano: 2018, algoz: 'Bélgica', placar: '1x2', fase: 'quartas de final',
    epitafio: '27 finalizações contra 9. Metade dos gols da Bélgica foi nossa.',
    fatos: [
      'O primeiro gol belga foi gol contra do Fernandinho — que também estava em campo no Incidente de 2014.',
      'Neymar passou 13min50s da Copa deitado no gramado. O planeta rolou junto: #NeymarChallenge.',
      'Messi, Cristiano Ronaldo e Neymar foram eliminados na mesma semana. Só um deles rolando.',
    ],
    imagem: '/img/elim-2018-belgica.jpg',
  },
  {
    ano: 2022, algoz: 'Croácia', placar: '1(2)x(4)1', fase: 'quartas de final, nos pênaltis',
    epitafio: 'Neymar guardado para o 5º pênalti. Não houve 5º pênalti.',
    fatos: [
      'Caímos invictos no tempo normal, com mais posse de bola. A estatística consola. O placar não.',
      'Dias antes, um gato chamado Hexa foi arremessado da mesa na coletiva. Tire suas conclusões.',
      'O time que dançou em cada gol da fase de grupos não teve o que dançar nas quartas.',
    ],
    imagem: '/img/elim-2022-croacia.jpg',
  },
  {
    ano: 2026, algoz: 'Noruega', placar: '1x2', fase: 'OITAVAS de final',
    epitafio: 'Eliminados por um país com menos gente que a Grande Curitiba. Nas oitavas.',
    fatos: [
      'Pênalti perdido aos 14 minutos; dois gols do Haaland; gol de honra aos 90+10.',
      'Neymar se aposentou da Seleção no mesmo estádio em que estreou, 16 anos antes. "Acabou."',
      'A torcida deles remou. A nossa assistiu. Sexta eliminação consecutiva para europeus.',
    ],
    imagem: '/img/elim-2026-noruega.jpg',
  },
]

export const FECHO_DA_ALA =
  'Seis eliminações consecutivas para europeus. Nenhum europeu eliminado em mata-mata desde 2002. ' +
  'Com base na tendência, nosso Departamento de Projeções apresenta a seguir o futuro.'
