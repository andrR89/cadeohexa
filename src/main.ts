import { montarHeroi } from './ui/hero'
import { montarCountdown } from './ui/countdown'

// O contador aparece antes de qualquer coisa — a piada nunca espera o WebGL.
montarHeroi(document.querySelector('#heroi')!)
montarCountdown(document.querySelector('#proxima-tentativa')!)
