/** Créditos do memorial. Função pura (string) para o Vitest testar sem DOM. */
export function htmlRodape(): string {
  return `
    <div class="rodape-creditos">
      <p class="legenda">
        Feito com mágoa e TypeScript por
        <a href="https://github.com/andrR89" target="_blank" rel="noopener">@andrR89</a>
        ·
        <a href="https://github.com/andrR89/cadeohexa" target="_blank" rel="noopener">código aberto pra quem quiser auditar o sofrimento</a>
      </p>
      <p class="legenda rodape-stack">Vite · GSAP · Cloudflare Pages</p>
    </div>
  `
}
