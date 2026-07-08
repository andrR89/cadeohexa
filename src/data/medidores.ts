import { diasDaEspera, hojeEmSaoPaulo, diasEntre } from '../lib/contadores'
import { DATA_PENTA } from './datas'

export interface Medidor {
  id: string
  rotulo: string
  valor: (agora: Date) => number
  nota: string
}

export function anosDeEspera(agora: Date): number {
  return Math.floor(diasEntre(DATA_PENTA, hojeEmSaoPaulo(agora)) / 365.2425)
}

// Listas fixas: atualizar exige mexer só aqui.
const MANDATOS_DESDE_O_PENTA = ['Lula I–II (2003)', 'Dilma I–II (2011)', 'Temer (2016)', 'Bolsonaro (2019)', 'Lula III (2023)']
const TECNICOS_DESDE_O_PENTA = ['Parreira', 'Dunga', 'Mano Menezes', 'Felipão (de novo)', 'Dunga (de novo)', 'Tite', 'Ramon Menezes (interino)', 'Dorival Jr.', 'Ancelotti']
const CAMPEOES_NA_NOSSA_FRENTE = ['Itália 2006', 'Espanha 2010', 'Alemanha 2014', 'França 2018', 'Argentina 2022']

export const MEDIDORES: Medidor[] = [
  {
    id: 'dias', rotulo: 'dias de espera', valor: (a) => diasDaEspera(a),
    nota: 'Contados um a um. Conferimos.',
  },
  {
    id: 'mandatos', rotulo: 'mandatos presidenciais', valor: () => MANDATOS_DESDE_O_PENTA.length,
    nota: 'Um presidente voltou na esperança de ver o hexa. Ainda nada.',
  },
  {
    id: 'tecnicos', rotulo: 'passagens de técnico pela Seleção', valor: () => TECNICOS_DESDE_O_PENTA.length,
    nota: 'Duas delas repetidas. A definição de insistência.',
  },
  {
    id: 'iphones', rotulo: 'gerações de iPhone lançadas', valor: (a) => Math.max(0, anosDeEspera(a) - 5),
    nota: 'Todas. O iPhone não existia quando fomos campeões.',
  },
  {
    id: 'copas-perdidas', rotulo: 'Copas disputadas sem título', valor: () => 6,
    nota: '2006, 2010, 2014, 2018, 2022, 2026. A coleção completa.',
  },
  {
    id: 'campeoes-na-fila', rotulo: 'países que levantaram a taça na nossa frente', valor: () => CAMPEOES_NA_NOSSA_FRENTE.length,
    nota: 'A Argentina inclusive. Em dezembro de 2022. Doeu digitar isso.',
  },
]
