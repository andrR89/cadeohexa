import { ImageResponse } from 'workers-og'
import { diasDaEspera, formatarDias } from '../src/lib/contadores'
import { ogHtml } from '../src/lib/og-template'

export const onRequest: PagesFunction = async () => {
  const dias = formatarDias(diasDaEspera(new Date()))
  const img = new ImageResponse(ogHtml(dias), { width: 1200, height: 630 })
  // Não passar headers no options: o workers-og embute um Cache-Control
  // próprio (max-age=31536000) e o preenchimento de Headers COMBINA os dois
  // valores em vez de substituir — a resposta sairia com header duplo e um
  // cache poderia segurar o contador por um ano. Reconstruir a Response e
  // usar headers.set() garante um único valor limpo.
  const res = new Response(img.body, img)
  res.headers.set('Cache-Control', 'public, max-age=3600')
  return res
}
