import { ImageResponse } from 'workers-og'
import { diasDaEspera, formatarDias } from '../src/lib/contadores'
import { ogHtml } from '../src/lib/og-template'

export const onRequest: PagesFunction = async () => {
  const dias = formatarDias(diasDaEspera(new Date()))
  return new ImageResponse(ogHtml(dias), {
    width: 1200,
    height: 630,
    headers: { 'cache-control': 'public, max-age=3600' },
  })
}
