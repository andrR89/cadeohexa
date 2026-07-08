import { diasDaEspera, formatarDias } from '../lib/contadores'
import { obterPatente } from './quiz'

const L = 1080, A = 1080

export function montarCard(el: HTMLElement): void {
  el.innerHTML = `
    <p class="rotulo">Ateste publicamente o seu luto</p>
    <canvas id="canvas-card" width="${L}" height="${A}"></canvas>
    <div>
      <button class="solene" id="compartilhar">Compartilhar</button>
      <button class="solene" id="baixar">Baixar</button>
    </div>
  `
  const canvas = el.querySelector<HTMLCanvasElement>('#canvas-card')!
  desenhar(canvas)
  document.addEventListener('patente-emitida', () => desenhar(canvas))

  el.querySelector('#compartilhar')!.addEventListener('click', async () => {
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'))
    const arquivo = new File([blob], 'cadeohexa.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo], title: 'Cadê o Hexa?' }).catch(() => {})
    } else {
      baixar(canvas)
    }
  })
  el.querySelector('#baixar')!.addEventListener('click', () => baixar(canvas))
}

function baixar(canvas: HTMLCanvasElement): void {
  const a = document.createElement('a')
  a.download = 'cadeohexa.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

function desenhar(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!
  const dias = formatarDias(diasDaEspera(new Date()))
  const patente = obterPatente()

  const fundo = ctx.createRadialGradient(L / 2, A * 0.3, 80, L / 2, A / 2, A * 0.8)
  fundo.addColorStop(0, '#1c1810')
  fundo.addColorStop(1, '#0a0805')
  ctx.fillStyle = fundo
  ctx.fillRect(0, 0, L, A)
  ctx.strokeStyle = '#6e5c38'
  ctx.strokeRect(40, 40, L - 80, A - 80)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#8a7245'
  ctx.font = '32px Georgia'
  ctx.fillText('M E M O R I A L   D A   E S P E R A', L / 2, 180)

  ctx.fillStyle = '#f0d693'
  ctx.font = 'bold 220px Georgia'
  ctx.fillText(dias, L / 2, 520)

  ctx.fillStyle = '#b39558'
  ctx.font = '44px Georgia'
  ctx.fillText('dias sem o hexa', L / 2, 600)

  if (patente) {
    ctx.fillStyle = '#d4af5f'
    ctx.font = 'italic 48px Georgia'
    ctx.fillText(patente.titulo, L / 2, 760)
    ctx.font = '36px Georgia'
    ctx.fillText(patente.placar, L / 2, 820)
  }

  ctx.fillStyle = '#6e5c38'
  ctx.font = '30px Georgia'
  ctx.fillText('cadeohexa.pages.dev', L / 2, A - 90)
}
