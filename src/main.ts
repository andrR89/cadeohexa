import { montarHeroi } from './ui/hero'
import { montarCountdown } from './ui/countdown'
import { montarTimeline } from './ui/timeline'
import { montarMedidores } from './ui/medidores'
import { montarProfecia } from './ui/profecia'
import { montarQuiz } from './ui/quiz'
import { montarCard } from './ui/card'
import { diasDaEspera, formatarDias } from './lib/contadores'

// O contador aparece antes de qualquer coisa — a piada nunca espera o WebGL.
montarHeroi(document.querySelector('#heroi')!)
montarCountdown(document.querySelector('#proxima-tentativa')!)
montarTimeline(document.querySelector('#ala-das-tentativas')!)
montarMedidores(document.querySelector('#medidores')!)
montarProfecia(document.querySelector('#profecia')!)
montarQuiz(document.querySelector('#quiz')!)
montarCard(document.querySelector('#card')!)

const rodape = document.querySelector<HTMLElement>('#placa-final')!
rodape.innerHTML = `
  <div class="placa">
    <p class="rotulo">Placa de inauguração</p>
    <p>Este memorial foi inaugurado no dia ${formatarDias(diasDaEspera(new Date()))} da espera.</p>
    <p class="legenda">Ele será demolido em caso de hexa. Ninguém aqui está com pressa de demolir.</p>
  </div>
  <div id="slot-apoio" aria-hidden="true"></div>
`

// 3D por último e só se der: a piada nunca espera o WebGL.
const canvas3d = document.querySelector<HTMLCanvasElement>('#cena3d')!
import('./cena3d')
  .then(({ podeRodar3D, iniciarCena }) => {
    if (!podeRodar3D()) {
      canvas3d.remove()
      document.body.classList.add('sem-3d')
      return
    }
    iniciarCena(canvas3d)
  })
  .catch(() => {
    // Chunk não carregou ou WebGL falhou (GPU bloqueada etc.): fica o gradiente.
    canvas3d.remove()
    document.body.classList.add('sem-3d')
  })
