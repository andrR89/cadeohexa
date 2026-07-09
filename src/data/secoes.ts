/** Seções navegáveis pela nav de bolinhas. O título vira o nome acessível
 * (aria-label) de cada bolinha — nunca deixar como "•". */
export interface Secao {
  id: string
  titulo: string
}

export const SECOES: readonly Secao[] = [
  { id: 'heroi', titulo: 'Início' },
  { id: 'proxima-tentativa', titulo: 'Próxima tentativa' },
  { id: 'ala-das-tentativas', titulo: 'Ala das Tentativas' },
  { id: 'medidores', titulo: 'Medidores da espera' },
  { id: 'profecia', titulo: 'A Profecia' },
  { id: 'quiz', titulo: 'Quiz' },
  { id: 'card', titulo: 'Seu card' },
]
