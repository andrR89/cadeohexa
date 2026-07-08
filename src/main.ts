import { montarHeroi } from './ui/hero'
import { montarCountdown } from './ui/countdown'
import { montarTimeline } from './ui/timeline'
import { montarMedidores } from './ui/medidores'

// O contador aparece antes de qualquer coisa — a piada nunca espera o WebGL.
montarHeroi(document.querySelector('#heroi')!)
montarCountdown(document.querySelector('#proxima-tentativa')!)
montarTimeline(document.querySelector('#ala-das-tentativas')!)
montarMedidores(document.querySelector('#medidores')!)
