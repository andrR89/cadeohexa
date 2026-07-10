# Spec — Animações do quiz ("Cadê o Hexa?" v3.1)

> Pedido do andre (09/07/2026), pós-v3: "o quiz deveria ter animações quando acerta,
> erra e muda de pergunta. O resto tá top." Tom escolhido: **solene com pitada de
> zoeira** — segue o memorial, com a tremida de erro como único momento explícito.

## Decisões

- **CSS puro** (keyframes/transitions em `src/styles/main.css`); `src/ui/quiz.ts` só
  orquestra classes e timing. GSAP fica fora: vive no chunk dinâmico de scroll e o
  quiz está no chunk principal — importar lá incharia o bundle que carrega o contador.
- **Reduced-motion de graça:** o bloco `@media (prefers-reduced-motion: reduce)`
  existente já zera `animation`/`transition`; nenhuma animação nova pode depender de
  JS pra ser desligada. Comportamento sob reduced-motion = o atual (estático).

## Os quatro momentos

1. **Acerto** — a opção `.correta` ganha um pulso de brilho dourado: box-shadow que
   incha e assenta, ~0,6s, 2 batidas, por cima do fundo dourado já existente.
2. **Erro** — a **`.placa` inteira treme** (~0,3s, translateX de poucos px — "o
   estádio sentiu") enquanto a `.errada` esmaece pra 0,35 via transition; a correta
   se revela com o mesmo pulso dourado (revelação já existe hoje, ganha só o brilho).
3. **Consolo** — em vez do flip seco do atributo `hidden`, fade-in com leve subida
   (~0,4s).
4. **Troca de pergunta** — crossfade: a placa atual sai (fade + desce ~8px, ~0,25s),
   o `innerHTML` troca, a nova entra (fade + sobe, ~0,3s). Vale também para a tela de
   resultado e para o "Sofrer novamente". O foco continua indo pro `h3` após a troca.

## O que NÃO muda

- Dados em `src/data/quiz.ts`; lógica de `calcularPatente`; evento `patente-emitida`.
- `aria-live="polite"` na placa; ordem de foco.
- Janela total de 2,2s entre resposta e próxima pergunta (o crossfade vive dentro dela).
- Testes: mudança 100% de apresentação — sem teste novo (suíte é node-only, sem DOM).

## Critérios de aceite

1. Acertar: pulso dourado na opção certa; consolo entra em fade.
2. Errar: placa treme, escolhida esmaece suave, certa pulsa dourado; consolo em fade.
3. Troca de pergunta/resultado/refazer: crossfade, sem flash de conteúdo cru.
4. Reduced-motion: nada anima; fluxo funcional idêntico ao atual.
5. Sem dependência nova; chunk principal sem crescimento relevante (< +1 kB gzip).
6. 29/29 testes, `tsc --noEmit` limpo, build ✓.
