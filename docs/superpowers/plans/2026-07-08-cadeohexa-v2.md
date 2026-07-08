# "Cadê o Hexa?" — v2 (redesign a partir do feedback do andre)

> v1 está no ar em https://cadeohexa.pages.dev. Este é o redesign pedido em 08/07/2026.
> Executar via superpowers:subagent-driven-development (implementador + revisão spec + revisão qualidade).

## Decisões travadas (com o andre)
- **Imagens:** geradas por IA (fal.ai/flux). 12 já geradas e commitadas em `public/img/` (6 `elim-*`, 6 `prof-*`), estilo "retrato memorial / pintura solene em moldura dourada". Taça de teste em scratchpad (regenerar 1–2 variações no herói).
- **Taça do herói:** imagem gerada + leve parallax/flutuação no scroll (NÃO 3D). → **remover three.js/cena3d por completo** (mata o chunk de 521 kB). GSAP fica, só pra scroll/parallax/reveal.
- **Contador:** anos · meses · dias · horas (· min · seg) correndo AO VIVO no herói.
- **Fundo:** mármore com textura + vinheta + facho de luz (fim do preto chapado).
- **Ala das Tentativas:** linha do tempo CRONOLÓGICA, cada derrota com seu retrato (`elim-*`).
- **Medidores:** mais itens — PlayStations lançados, o que morreu no período (Orkut, MSN Messenger, etc.).
- **Profecia:** gráfico INTERATIVO (hover mostra imagem `prof-*` + **ranking FIFA + população** — resolve o "(390.000)?" sem rótulo). **2046 = Copa de 512 times**, a FIFA sem países chama clube; Brasil cai nos 64-avos pro **Figueirense**. **2050 = seleção das IAs**: Claude faz de cabeça, Gemini tenta 2× pra fechar o caixão.
- Manter tudo que já passou nas 30+ revisões do v1 (a11y, reduced-motion, timezone SP, conteúdo em src/data/, contraste AA).

## Tarefas
- **V1 — Contador ao vivo expandido (TDD):** `contadores.ts` ganha `partesDaEspera(agora): {anos,meses,dias,horas,min,seg}` (matemática civil em timezone SP, testada). Herói renderiza as partes e faz tick a cada 1s (rAF/setInterval), respeitando reduced-motion (sem "flip" agressivo, mas o número atualiza).
- **V2 — Herói taça-imagem + parallax; remover three.js:** apagar `src/cena3d/`, tirar import dinâmico e `#cena3d` do index/main; herói com `<img>` da taça + camada de fundo mármore, parallax sutil no scroll (GSAP). Fallback reduced-motion: imagem estática.
- **V3 — Fundo global:** CSS de mármore (textura/gradiente radial + vinheta + facho). Sem preto chapado; manter contraste AA do texto.
- **V4 — Ala das Tentativas cronológica:** `copas.ts` ganha `imagem` por copa; UI vira timeline vertical com marcos por ano, cada card com retrato `elim-*`, placar e epitáfio; entrada encadeada no scroll. Manter o "†" que revela o 7×1.
- **V5 — Medidores expandidos:** `medidores.ts` ganha itens novos (PlayStations lançados desde 2002, serviços que morreram: Orkut 2014, MSN 2013, etc.) com números verificáveis; UI já existe (grade com count-up).
- **V6 — Profecia interativa:** `profecia.ts` reescrita (add `rankingFifa`, rótulos claros de população, imagem `prof-*`, 2046 Figueirense, 2050 IAs com o enredo Claude/Gemini). UI: gráfico com pontos clicáveis/hover que mostram card com imagem + ranking + população; curva da vergonha mantida.
- **V7 — Otimização de imagens:** resize/compressão (ex.: 800–1000px, webp com fallback jpg) + `loading="lazy"` + `width/height` pra não dar layout shift.
- **V8 — Scroll cinematográfico sem three.js:** GSAP ScrollTrigger só pra parallax do herói + reveals encadeados; remover o acoplamento com câmera/taça 3D.
- **V9 — Verificação final v2 + redeploy:** suíte + build (sem chunk three) + checklist manual + `wrangler pages deploy`.

## Riscos/notas
- Peso das imagens: 12×~300 kB. V7 é obrigatória; lazy-load tudo abaixo da dobra.
- Contador ao vivo: cuidado com drift/reduced-motion; tick de 1s é suficiente.
- Remoção do three.js simplifica muito o scroll — revisar que reduced-motion e fallback continuam corretos.
