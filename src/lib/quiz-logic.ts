import { PERGUNTAS } from '../data/quiz'

export interface Patente { titulo: string; placar: string; descricao: string }

const TOTAL = PERGUNTAS.length

const FAIXAS: Array<{ min: number; titulo: string; descricao: string }> = [
  { min: 8, titulo: 'Doutor em Vexames, Honoris Causa', descricao: 'Presenciou tudo. Lembra de tudo. Não superou nada.' },
  { min: 6, titulo: 'Sofredor Sênior', descricao: 'Sabe de cor o que preferia esquecer.' },
  { min: 3, titulo: 'Sofredor Júnior', descricao: 'Sofreu, mas ainda dorme à noite.' },
  { min: 0, titulo: 'Torcedor de Novela', descricao: 'Só chega para a final. Invejável.' },
]

export function calcularPatente(acertos: number): Patente {
  const pontos = Math.max(0, Math.min(Math.floor(acertos), TOTAL))
  const faixa = FAIXAS.find((f) => pontos >= f.min)!
  return { titulo: faixa.titulo, placar: `${pontos}/${TOTAL} vexames presenciados`, descricao: faixa.descricao }
}
