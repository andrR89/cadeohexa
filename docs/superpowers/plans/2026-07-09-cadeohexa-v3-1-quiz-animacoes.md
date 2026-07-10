# Animações do Quiz (v3.1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar feedback animado ao quiz — pulso dourado no acerto, tremida da placa no erro, consolo em fade e crossfade na troca de pergunta — sem peso novo no bundle.

**Architecture:** CSS puro (keyframes/transitions em `src/styles/main.css`); `src/ui/quiz.ts` só orquestra classes e timing. GSAP fica fora: vive no chunk de scroll e o quiz está no chunk principal. O bloco global de `prefers-reduced-motion` já zera `animation`/`transition`, então tudo desliga de graça — o JS só precisa pular a espera da animação de saída.

**Tech Stack:** Vite 8, TypeScript 6, CSS puro. Sem dependência nova.

**Spec:** `docs/superpowers/specs/2026-07-09-cadeohexa-v3-1-quiz-animacoes.md`

## Contexto que o implementador precisa saber

- Branch `dev/site`, raiz `/home/andre/Workspace/hexa-site`. **Sem remote — nunca `git push`.**
- Testes: `npx vitest run` (node, sem jsdom — **não criar teste de DOM**). Typecheck: `npx tsc --noEmit`. Build: `npx vite build`.
- Estado atual do quiz (`src/ui/quiz.ts`, 73 linhas): `renderizarPergunta()` troca `el.innerHTML` seco; clique marca `.correta`/`.errada`, mostra o `.consolo` (atributo `hidden`) e agenda a próxima pergunta com `setTimeout(…, 2200)`. CSS atual: `.opcao.correta { border-color: var(--ouro-vivo); background: var(--ouro); color: var(--marmore-0) }` e `.opcao.errada { opacity: 0.35 }` (main.css ~321-322).
- **Ler `src/styles/main.css` antes de editar**: conferir se `.opcao`/`.solene` já têm `transition` (se tiver, mesclar, não duplicar) e onde fica o bloco de reduced-motion.
- Não deployar.

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/styles/main.css` (modificar) | Keyframes e classes de animação do quiz, junto dos estilos `.opcao` existentes. |
| `src/ui/quiz.ts` (modificar) | Orquestração: `trocarPlaca()`, classe de tremida no erro, timing. |

---

### Task 1: Animações do quiz

**Files:**
- Modify: `src/styles/main.css` (junto de `.opcao.correta`/`.opcao.errada`, ~linha 321)
- Modify: `src/ui/quiz.ts`

- [x] **Step 1: CSS — keyframes e classes**

Adicionar junto aos estilos do quiz (adaptar se `.opcao` já tiver `transition`):

```css
/* Animações do quiz — CSS puro de propósito: o quiz vive no chunk principal e o
   GSAP no chunk de scroll. O bloco global de prefers-reduced-motion zera
   animation/transition, então tudo aqui desliga de graça. */

/* Acerto (e revelação da certa no erro): pulso dourado, 2 batidas que assentam. */
@keyframes pulso-dourado {
  0%   { box-shadow: 0 0 0 0 rgba(212, 175, 95, 0.55); }
  45%  { box-shadow: 0 0 0 9px rgba(212, 175, 95, 0); }
  60%  { box-shadow: 0 0 0 0 rgba(212, 175, 95, 0.35); }
  100% { box-shadow: 0 0 0 6px rgba(212, 175, 95, 0); }
}
.opcao.correta { animation: pulso-dourado 0.6s ease-out; }

/* Erro: a placa inteira treme — o estádio sentiu. */
@keyframes tremida {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
.placa-tremida { animation: tremida 0.3s ease-in-out; }

/* A escolhida errada esmaece suave (a opacidade final 0.35 já existe em .opcao.errada). */
.opcao { transition: opacity 0.4s ease; }

/* Consolo: fade-in com leve subida em vez do flip seco do hidden. */
@keyframes surgir {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.consolo:not([hidden]) { animation: surgir 0.4s ease-out; }

/* Troca de pergunta/resultado: crossfade da placa. A classe de saída anima via
   transition (o conteúdo ainda é o antigo); a de entrada via keyframe (o
   conteúdo acabou de ser trocado). */
.quiz-saindo .placa { opacity: 0; transform: translateY(8px); transition: opacity 0.25s ease-in, transform 0.25s ease-in; }
.quiz-entrando .placa { animation: surgir 0.3s ease-out; }
```

- [x] **Step 2: quiz.ts — orquestração da troca**

No topo de `montarQuiz` (depois de `let acertos = 0`):

```ts
  const reduzirMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const JANELA_CONSOLO = 2200
  const DURACAO_SAIDA = 250

  /** Crossfade entre placas: anima a saída, troca o conteúdo, anima a entrada.
   * Sob reduced-motion troca na hora — a transition CSS não rodaria e os 250ms
   * virariam espera morta. */
  function trocarPlaca(renderizar: () => void): void {
    if (reduzirMovimento()) {
      renderizar()
      return
    }
    el.classList.add('quiz-saindo')
    setTimeout(() => {
      el.classList.remove('quiz-saindo')
      el.classList.add('quiz-entrando')
      renderizar()
      el.addEventListener('animationend', () => el.classList.remove('quiz-entrando'), { once: true })
    }, DURACAO_SAIDA)
  }
```

- [x] **Step 3: quiz.ts — usar a troca e a tremida**

No handler de clique da opção:
- se a escolhida for errada, tremer a placa: `if (!escolhida.correta) el.querySelector('.placa')?.classList.add('placa-tremida')` (a classe pode ficar — a placa morre na troca de innerHTML).
- o agendamento da próxima vira:

```ts
        setTimeout(
          () => {
            indice++
            trocarPlaca(indice < PERGUNTAS.length ? renderizarPergunta : renderizarResultado)
          },
          // O crossfade vive DENTRO da janela de 2,2s: a saída começa 250ms antes.
          reduzirMovimento() ? JANELA_CONSOLO : JANELA_CONSOLO - DURACAO_SAIDA,
        )
```

E os dois pontos de (re)início trocam com crossfade também:
- `#comecar`: `addEventListener('click', () => trocarPlaca(renderizarPergunta))`
- `#refazer`: dentro do handler, `trocarPlaca(renderizarPergunta)` no lugar de `renderizarPergunta()`

O foco no `h3` já acontece dentro de `renderizarPergunta`/`renderizarResultado` — não mexer.

- [x] **Step 4: Verificação**

```bash
npx vitest run && npx tsc --noEmit && npx vite build
```

Esperado: 29/29, tsc limpo, build ✓. Comparar o chunk principal com o baseline
(27,24 kB / 10,6 kB gzip): crescimento tem de ficar **abaixo de +1 kB gzip**.

Checagem estática: `grep -n "quiz-saindo\|quiz-entrando\|placa-tremida\|pulso-dourado\|surgir" src/styles/main.css src/ui/quiz.ts` — cada classe usada no TS existe no CSS e vice-versa.

- [x] **Step 5: Commitar**

```bash
git add src/styles/main.css src/ui/quiz.ts docs/superpowers/specs/2026-07-09-cadeohexa-v3-1-quiz-animacoes.md docs/superpowers/plans/2026-07-09-cadeohexa-v3-1-quiz-animacoes.md
git commit -m "feat(v3.1): quiz animado — pulso dourado no acerto, tremida no erro, crossfade entre perguntas"
```

## Riscos

- `.opcao { transition: opacity }` pode conflitar com transition existente de `.solene`/`.opcao` — mesclar propriedades, não sobrescrever.
- `animationend` da entrada borbulha da `.placa`; com `{ once: true }` registrado logo após `renderizar()`, o primeiro `animationend` é o da própria entrada (as animações de opção só rodam após clique). Se algum keyframe futuro rodar no boot da placa, revisar.
- Focar o `h3` durante a animação de entrada é seguro (foco não depende de opacidade), mas conferir no preview que não há scroll-jump.
