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

export interface PartesEspera {
  anos: number
  meses: number
  dias: number
  horas: number
  minutos: number
  segundos: number
}

interface PartesData {
  ano: number
  mes: number
  dia: number
  hora: number
  minuto: number
  segundo: number
}

// Âncora da espera: 30/06/2002, 00:00:00 no relógio de São Paulo (fim de Yokohama).
const ANCORA: PartesData = { ano: 2002, mes: 6, dia: 30, hora: 0, minuto: 0, segundo: 0 }

const FORMATADOR_PARTES_SP = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE_BR,
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function partesEmSaoPaulo(agora: Date): PartesData {
  const partes = FORMATADOR_PARTES_SP.formatToParts(agora)
  const mapa: Record<string, string> = {}
  for (const { type, value } of partes) mapa[type] = value
  // Algumas implementações de Intl formatam meia-noite como "24" em vez de "00"
  // mesmo com hour12:false — normaliza para não estourar o dia.
  const hora = Number(mapa.hour) % 24
  return {
    ano: Number(mapa.year),
    mes: Number(mapa.month),
    dia: Number(mapa.day),
    hora,
    minuto: Number(mapa.minute),
    segundo: Number(mapa.second),
  }
}

// Dias no mês `mes` (1-indexado) do ano `ano`; dia 0 do mês seguinte = último dia do mês atual.
// Respeita bissexto automaticamente (fevereiro em ano bissexto tem 29).
function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

/**
 * Decompõe o tempo decorrido desde a âncora do penta (30/06/2002, 00:00 em SP)
 * até `agora` em anos/meses/dias/horas/minutos/segundos "de calendário civil",
 * com empréstimo (subtração campo a campo, pedindo emprestado do campo maior
 * quando o menor fica negativo — o mesmo esquema usado para calcular idade).
 *
 * A matemática é feita direto nos componentes do relógio de parede de São Paulo,
 * sem conversão de fuso: tanto a âncora (junho/2002) quanto qualquer `agora`
 * caem em UTC-3 (junho está fora da antiga janela de horário de verão de SP, e
 * o Brasil não tem mais horário de verão desde 2019), então não há correção de
 * offset a fazer — é aritmética de calendário pura.
 */
export function partesDaEspera(agora: Date): PartesEspera {
  const alvo = partesEmSaoPaulo(agora)

  let segundos = alvo.segundo - ANCORA.segundo
  let minutos = alvo.minuto - ANCORA.minuto
  let horas = alvo.hora - ANCORA.hora
  let dias = alvo.dia - ANCORA.dia
  let meses = alvo.mes - ANCORA.mes
  let anos = alvo.ano - ANCORA.ano

  if (segundos < 0) { segundos += 60; minutos -= 1 }
  if (minutos < 0) { minutos += 60; horas -= 1 }
  if (horas < 0) { horas += 24; dias -= 1 }
  // Empréstimo de dias em laço: um único mês pode não cobrir o déficit quando o
  // mês emprestado é curto (ex.: fevereiro não-bissexto = 28 dias e o déficit é
  // 29, em 1º de março). O laço pede emprestado meses sucessivos até zerar o
  // negativo — o mês seguinte (janeiro, 31 dias) sempre fecha a conta.
  let mesRef = alvo.mes
  let anoRef = alvo.ano
  while (dias < 0) {
    meses -= 1
    mesRef -= 1
    if (mesRef === 0) { mesRef = 12; anoRef -= 1 }
    dias += diasNoMes(anoRef, mesRef)
  }
  if (meses < 0) { meses += 12; anos -= 1 }

  return { anos, meses, dias, horas, minutos, segundos }
}
