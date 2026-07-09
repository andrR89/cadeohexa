import { diasDaEspera } from '../lib/contadores'

export interface Medidor {
  id: string
  rotulo: string
  valor: (agora: Date) => number
  nota: string
}

export function anosDeEspera(agora: Date): number {
  return Math.floor(diasDaEspera(agora) / 365.2425)
}

// Listas fixas: atualizar exige mexer só aqui.
const MANDATOS_DESDE_O_PENTA = ['Lula I–II (2003)', 'Dilma I–II (2011)', 'Temer (2016)', 'Bolsonaro (2019)', 'Lula III (2023)']
const TECNICOS_DESDE_O_PENTA = ['Parreira', 'Dunga', 'Mano Menezes', 'Felipão (de novo)', 'Dunga (de novo)', 'Tite', 'Ramon Menezes (interino)', 'Fernando Diniz (interino)', 'Dorival Jr.', 'Ancelotti']
// Atualizar com o campeão de 2026 após a final (19/07/2026).
const CAMPEOES_NA_NOSSA_FRENTE = ['Itália 2006', 'Espanha 2010', 'Alemanha 2014', 'França 2018', 'Argentina 2022']
const PLAYSTATIONS_DESDE_O_PENTA = ['PS3 (2006)', 'PS4 (2013)', 'PS5 (2020)']
const SERVICOS_MORTOS_NA_ESPERA = ['Orkut (2004–2014)', 'MSN Messenger (2013)', 'Google+ (2019)', 'Vine (2017)', 'Adobe Flash Player (2020)']
const MEGAEVENTOS_SEDIADOS_NA_ESPERA = ['Copa 2014', 'Rio 2016']

export const MEDIDORES: Medidor[] = [
  {
    id: 'dias', rotulo: 'dias de espera', valor: (a) => diasDaEspera(a),
    nota: 'Contados um a um. Conferimos.',
  },
  {
    id: 'mandatos', rotulo: 'presidências da República', valor: () => MANDATOS_DESDE_O_PENTA.length,
    nota: 'Um presidente voltou na esperança de ver o hexa. Ainda nada.',
  },
  {
    id: 'tecnicos', rotulo: 'passagens de técnico pela Seleção', valor: () => TECNICOS_DESDE_O_PENTA.length,
    nota: 'Duas passagens repetidas e dois interinos. A definição de insistência.',
  },
  {
    id: 'iphones', rotulo: 'gerações de iPhone lançadas', valor: (a) => Math.max(0, anosDeEspera(a) - 5),
    nota: 'Todas. O iPhone não existia quando fomos campeões.',
  },
  {
    id: 'playstations', rotulo: 'consoles PlayStation lançados desde o penta', valor: () => PLAYSTATIONS_DESDE_O_PENTA.length,
    nota: 'O PlayStation 2 ainda era o console do momento. De lá pra cá vieram PS3, PS4 e PS5 — três gerações inteiras.',
  },
  {
    id: 'servicos-mortos', rotulo: 'serviços de internet que morreram na espera', valor: () => SERVICOS_MORTOS_NA_ESPERA.length,
    nota: 'O Orkut nasceu (2004) e morreu (2014) inteirinho dentro da espera. MSN, Google+, Vine e o Flash também não aguentaram.',
  },
  {
    id: 'copas-perdidas', rotulo: 'Copas disputadas sem título', valor: () => 6,
    nota: '2006, 2010, 2014, 2018, 2022, 2026. A coleção completa.',
  },
  {
    id: 'campeoes-na-fila', rotulo: 'países que levantaram a taça na nossa frente', valor: () => CAMPEOES_NA_NOSSA_FRENTE.length,
    nota: 'A Argentina inclusive. Em dezembro de 2022. Doeu digitar isso.',
  },
  {
    id: 'megaeventos-sediados', rotulo: 'megaeventos sediados no Brasil na espera', valor: () => MEGAEVENTOS_SEDIADOS_NA_ESPERA.length,
    nota: 'Copa 2014 e Olimpíada 2016. Num levamos 7; no outro o ouro no futebol veio — só que ouro olímpico não mata a saudade do hexa.',
  },
]
