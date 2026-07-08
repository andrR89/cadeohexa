export function ogHtml(diasFormatado: string): string {
  // Sem espaço/quebra de linha antes do <div> raiz: satori/workers-og cria um
  // nó implícito em volta do HTML retornado, e um text node de whitespace ali
  // vira um 2º filho sem "display" explícito — o parser rejeita com
  // "Expected <div> to have explicit display: flex or display: none".
  // O atributo style também precisa ficar em uma única linha: o parser de
  // atributos do workers-og é baseado em regex (não é um parser CSS de
  // verdade) e uma quebra de linha no meio do style faz ele não reconhecer
  // o "display:flex", disparando o mesmo erro por engano.
  // width/height em 100vw/100vh (não 100%): não há um elemento pai com
  // tamanho definido para a porcentagem resolver contra — sem isso o fundo
  // só preenche uma fração da imagem 1200x630.
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100vw;height:100vh;background:#0a0805;color:#d4af5f;font-family:Georgia;">
    <div style="display:flex;font-size:28px;letter-spacing:12px;color:#8a7245;">MEMORIAL DA ESPERA</div>
    <div style="display:flex;font-size:190px;font-weight:700;color:#f0d693;margin:10px 0;">${diasFormatado}</div>
    <div style="display:flex;font-size:40px;color:#b39558;">dias sem o hexa</div>
    <div style="display:flex;font-size:26px;color:#6e5c38;margin-top:30px;">cadeohexa.pages.dev</div>
  </div>`
}
