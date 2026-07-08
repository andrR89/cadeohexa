export interface OpcaoQuiz { texto: string; correta: boolean }
export interface PerguntaQuiz { texto: string; opcoes: OpcaoQuiz[]; consolo: string }

export const PERGUNTAS: PerguntaQuiz[] = [
  {
    texto: 'No gol que nos eliminou em 2006, Roberto Carlos estava…',
    opcoes: [
      { texto: 'Marcando o Henry', correta: false },
      { texto: 'Amarrando a chuteira', correta: true },
      { texto: 'Cobrando falta', correta: false },
    ],
    consolo: 'O cadarço está bem, obrigado por perguntar.',
  },
  {
    texto: 'Em 2010, Felipe Melo participou de quantos dos 3 gols do jogo?',
    opcoes: [
      { texto: '1', correta: false },
      { texto: '2', correta: false },
      { texto: 'Todos os 3 (assistência, gol contra e clima)', correta: true },
    ],
    consolo: 'Ele ainda nos deve um feriado.',
  },
  {
    texto: 'Em 2014, quantos gols a Alemanha marcou entre os minutos 23 e 29?',
    opcoes: [
      { texto: '2', correta: false },
      { texto: '3', correta: false },
      { texto: '4', correta: true },
    ],
    consolo: 'O replay de um gol foi interrompido por outro gol. Isso aconteceu.',
  },
  {
    texto: 'Quanto tempo o Neymar passou deitado no gramado na Copa de 2018?',
    opcoes: [
      { texto: 'Uns 3 minutos', correta: false },
      { texto: 'Quase 14 minutos', correta: true },
      { texto: 'Meia hora', correta: false },
    ],
    consolo: 'O mundo inteiro rolou junto. #NeymarChallenge.',
  },
  {
    texto: 'Em 2022, quem foi guardado para o 5º pênalti — que nunca chegou?',
    opcoes: [
      { texto: 'Neymar', correta: true },
      { texto: 'Casemiro', correta: false },
      { texto: 'Pedro', correta: false },
    ],
    consolo: 'O momento de maior pressão segue aguardando.',
  },
  {
    texto: 'Que animal amaldiçoou a Seleção na coletiva de 2022?',
    opcoes: [
      { texto: 'Um pombo', correta: false },
      { texto: 'Um gato', correta: true },
      { texto: 'Uma capivara', correta: false },
    ],
    consolo: 'Batizado de Hexa. Arremessado da mesa. Nunca mais fomos os mesmos.',
  },
  {
    texto: 'Qual foi a última vez que o Brasil eliminou um europeu em mata-mata de Copa?',
    opcoes: [
      { texto: '2010', correta: false },
      { texto: '2006', correta: false },
      { texto: '2002', correta: true },
    ],
    consolo: 'Seis eliminações seguidas para europeus desde então. A tendência é científica.',
  },
  {
    texto: 'Neymar estreou pela Seleção em 2010 e se despediu em 2026. Em qual estádio aconteceram os dois?',
    opcoes: [
      { texto: 'Maracanã', correta: false },
      { texto: 'MetLife Stadium', correta: true },
      { texto: 'Camp Nou', correta: false },
    ],
    consolo: '"Começou aqui e terminei aqui. Acabou." Nunca saia de Nova Jersey.',
  },
]
