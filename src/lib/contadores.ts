import { DATA_PENTA, DATA_COPA_2030_ESTIMADA, TIMEZONE_BR } from '../data/datas'

const MS_POR_DIA = 86_400_000

export function hojeEmSaoPaulo(agora: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE_BR }).format(agora)
}

export function diasEntre(deISO: string, ateISO: string): number {
  const [y1, m1, d1] = deISO.split('-').map(Number)
  const [y2, m2, d2] = ateISO.split('-').map(Number)
  // Math.round é só rede de segurança — ambos os lados são meia-noite UTC, a divisão já é inteira (não é compensação de DST)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / MS_POR_DIA)
}

export function diasDaEspera(agora: Date): number {
  return diasEntre(DATA_PENTA, hojeEmSaoPaulo(agora))
}

export function diasAteProximaCopa(agora: Date): number {
  return Math.max(0, diasEntre(hojeEmSaoPaulo(agora), DATA_COPA_2030_ESTIMADA))
}

export function formatarDias(n: number): string {
  return n.toLocaleString('pt-BR')
}
