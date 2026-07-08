// Duas exigências do workers-og/satori, verificadas contra o workerd real:
// todo <div> precisa de display:flex explícito, e o fundo precisa de
// 100vw/100vh (percentuais não resolvem sem pai dimensionado e cobrem só
// parte do canvas). Quebras de linha no atributo style não são problema.
export function ogHtml(diasFormatado: string): string {
  return `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
              width:100vw;height:100vh;background:#0a0805;color:#d4af5f;font-family:Georgia;">
    <div style="display:flex;font-size:28px;letter-spacing:12px;color:#8a7245;">MEMORIAL DA ESPERA</div>
    <div style="display:flex;font-size:190px;font-weight:700;color:#f0d693;margin:10px 0;">${diasFormatado}</div>
    <div style="display:flex;font-size:40px;color:#b39558;">dias sem o hexa</div>
    <div style="display:flex;font-size:26px;color:#6e5c38;margin-top:30px;">cadeohexa.pages.dev</div>
  </div>`
}
