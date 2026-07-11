export type IdJogo = 'chuteira' | 'nao-sobe' | 'carletto'

export interface PlacaFim {
  titulo: string
  texto: string
}

export interface JogoFliperama {
  id: IdJogo
  ano: number
  titulo: string
  icone: string // emoji placeholder até os sprites do PixelLab
  chamada: string // uma linha no gabinete
  instrucoes: string // tela de instruções, antes do COMEÇAR
  derrota: PlacaFim
  eSe: PlacaFim
}

export const TITULO_SECAO = 'Fliperama do Sofrimento'
export const LEGENDA_SECAO = 'Reescreva a história. (Você não vai conseguir.)'
export const RODAPE_SECAO = '98,7% do país também não conseguiu.'

export function textoStats(tentativas: number, vitorias: number): string {
  return `Suas tentativas: ${tentativas} · Histórias reescritas: ${vitorias}`
}

export const JOGOS: readonly JogoFliperama[] = [
  {
    id: 'chuteira',
    ano: 2006,
    titulo: 'Amarre a Chuteira',
    icone: '👟',
    chamada: 'Quatro ilhoses entre o Roberto Carlos e a paz.',
    instrucoes:
      'França, 2006. O cruzamento vem aí e a chuteira está aberta. Aperte ' +
      'AMARRAR (toque ou espaço) quando o marcador estiver na zona dourada — ' +
      'são quatro ilhoses, e a zona encolhe a cada um. Se errar, o cadarço ' +
      'arrebenta e o ilhós recomeça. O Henry não recomeça.',
    derrota: {
      titulo: 'A HISTÓRIA SE REPETE',
      texto:
        'O cadarço arrebentou e o Henry apareceu sozinho no segundo pau. ' +
        'Ele ainda estava agachado. Foi a única finalização no gol em 90 ' +
        'minutos — e bastou.',
    },
    eSe: {
      titulo: 'E SE...',
      texto:
        'Chuteira amarrada, cruzamento cortado. O Brasil ainda perdeu — uma ' +
        'finalização em 90 minutos não se resolve com cadarço. Mas o Roberto ' +
        'Carlos dormiu em paz.',
    },
  },
  {
    id: 'nao-sobe',
    ano: 2022,
    titulo: 'NÃO SOBE!',
    icone: '⛔',
    chamada: 'Prorrogação contra a Croácia. Ninguém. Sobe.',
    instrucoes:
      'Prorrogação, Brasil 1×0 na Croácia. A regra é uma: NÃO SOBE. Toque ' +
      '(ou Tab + Enter) em cada jogador que escapar pro ataque pra puxá-lo ' +
      'de volta. Três na frente ao mesmo tempo e vem o contra-ataque. ' +
      'Segure até os 120 minutos — no fim, até o goleiro tenta.',
    derrota: {
      titulo: 'A HISTÓRIA SE REPETE',
      texto:
        "Subiram. Contra-ataque, empate aos 117'. Nos pênaltis, o 5º " +
        'cobrador nunca foi chamado. Ele ainda aquece até hoje.',
    },
    eSe: {
      titulo: 'E SE...',
      texto:
        'Seguraram o 1×0! Classificados... e na semifinal, a Argentina do ' +
        'Messi. O universo cobra caro por reescrever a história.',
    },
  },
  {
    id: 'carletto',
    ano: 2026,
    titulo: 'Segura, Carletto!',
    icone: '🍬',
    chamada: 'A Teoria do Chiclete: a Seleção só joga enquanto ele masca.',
    instrucoes:
      'Oitavas, Brasil × Noruega. A ciência é clara: a Seleção só joga ' +
      'enquanto o Ancelotti masca. Arraste o Carletto (ou use ← →) pra ' +
      'aparar com a boca os chicletes arremessados do banco. Chiclete no ' +
      'gramado derruba o DESEMPENHO DA SELEÇÃO; pastilha de menta e ' +
      'bandeirinha da Noruega travam o mister por um segundo. Barra zerada, ' +
      'o Haaland marca. Aguente até os 90+10.',
    derrota: {
      titulo: 'A HISTÓRIA SE REPETE',
      texto:
        'O último chiclete caiu no gramado e, com ele, o Brasil. Sem ' +
        'chiclete não houve posse de bola; sem posse de bola não houve ' +
        'vontade. Haaland fez dois. Vinícius Jr., escalado para o pênalti ' +
        'aos 14 minutos, foi visto se posicionando atrás do bandeirinha. O ' +
        'gol de honra saiu aos 90+10, quando a torcida norueguesa já ' +
        'ensaiava a terceira remada viking da noite. Neymar se aposentou ' +
        'ali mesmo, no vestiário. Descanse em paz, desempenho da Seleção: ' +
        'você dependia de uma goma de mascar.',
    },
    eSe: {
      titulo: 'E SE...',
      texto:
        'E se o preparador físico tivesse mira? Nesta realidade, o ' +
        'Ancelotti não fica sem chiclete um segundo sequer: o Brasil tem ' +
        '71% de posse, Vinícius Jr. PEDE para bater o pênalti aos 14 e ' +
        'converte, e Haaland termina o jogo pedindo a camisa — e um ' +
        'tablete. O hexa vem. O preço: a FIFA abre investigação inédita ' +
        "por 'doping mandibular', o chiclete campeão é leiloado por R$ 2,3 " +
        'milhões (já mascado) e o Neymar, empolgado, desfaz a ' +
        'aposentadoria e se anuncia titular para 2030. Toda vitória cobra ' +
        'seu preço.',
    },
  },
]
