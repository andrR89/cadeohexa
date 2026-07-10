# Fliperama do Sofrimento (v4) — mini-jogos das derrotas

**Data:** 2026-07-10 · **Status:** design aprovado em conversa; spec aguardando
revisão final do andre antes do plano de implementação (retomar daqui).

Mini-jogos que simulam as situações das eliminações. *Must have* do backlog do
andre. Todas as decisões abaixo foram tomadas com ele em brainstorm com visual
companion (mockups em `.superpowers/brainstorm/`, gitignored — o que vale é
esta spec).

## Regra de ouro dos jogos (decidida)

- **Difícil, mas vencível.**
- **Derrota** = placa solene "a história se repete", citando os fatos
  canônicos da eliminação (os mesmos de `src/data/copas.ts`).
- **Vitória** = revela um **"e se..."**: realidade alternativa de zoeira onde
  reescrever a história também cobra um preço.
- Partidas curtas: **15–30 segundos**, dificuldade crescente durante a partida.

## A seção

- Nova `<section id="fliperama" class="secao">` entre `#profecia` e `#quiz`
  no `index.html`; entra na nav de bolinhas (`src/data/secoes.ts`).
- Título: **"Fliperama do Sofrimento"**. Legenda: *"Reescreva a história.
  (Você não vai conseguir.)"*
- Três gabinetes (cards) com título, ano, ícone e botão **JOGAR**.
- Estatísticas locais por jogo via `localStorage`: *"Suas tentativas: N ·
  Histórias reescritas: N"*. **Sem backend.** Linha estática de zoeira no
  rodapé da seção: *"98,7% do país também não conseguiu."*

## O overlay

- JOGAR abre `<dialog>` tela-cheia (focus trap nativo, Esc fecha).
- Código de cada jogo é **chunk lazy** (`import()` no clique) — mesma
  filosofia do resto do site: a piada nunca espera o JS de jogo.
- Fim de partida: placa de derrota ou placa dourada do "e se...", com botões
  **"Tentar de novo"** e **"Aceitar a história"** (fecha).
- Todos os textos vêm de `src/data/fliperama.ts` — nunca hardcoded na UI.

## Arquitetura

- `src/data/fliperama.ts` — metadados e textos dos 3 jogos (título, ano,
  ícone, instruções, texto de derrota, texto do "e se...").
- `src/lib/jogos/` — **lógica pura, testável no Vitest, sem DOM**: janelas de
  timing, regra dos 3 avançados, spawns/colisão do catch, progressão de
  dificuldade, relógio de jogo (minutos fictícios ← segundos reais).
- `src/ui/fliperama.ts` — monta seção, gabinetes, overlay, stats locais.
- `src/ui/jogos/chuteira.ts`, `nao-sobe.ts`, `carletto.ts` — renderização e
  input de cada jogo (DOM + GSAP, **sem canvas**), contrato comum:
  `montar(el, aoTerminar: (resultado: 'derrota' | 'vitoria') => void)`.
- Input: **toque, mouse e teclado** (espaço/setas nos de timing e catch;
  Tab+Enter no NÃO SOBE!).
- `prefers-reduced-motion`: jogos continuam jogáveis; tremidas e decoração
  desligadas.

## Os três jogos (v1)

### 2006 · Amarre a Chuteira (Roberto Carlos)

QTE de timing: 4 ilhoses; em cada um, um marcador oscila e o jogador aperta
(toque/espaço) dentro da zona de acerto, que **encolhe a cada ilhós**. O Henry
atravessa o fundo da tela como timer global (~12s). Erro: cadarço arrebenta e
o ilhós atual recomeça — o Henry não recomeça.
**Derrota:** Henry marca sozinho no segundo pau. *"Ele ainda estava agachado."*
**E se vencer:** *"Chuteira amarrada, cruzamento cortado. O Brasil ainda
perdeu — uma finalização em 90 minutos não se resolve com cadarço. Mas o
Roberto Carlos dormiu em paz."*

### 2022 · NÃO SOBE! (ideia do andre)

Prorrogação, Brasil 1x0 na Croácia. Campo visto de cima, 10 jogadores atrás
da linha da bola; escapam pro ataque um a um, frequência crescente (no fim,
até o goleiro vai). Toque no jogador pra puxá-lo de volta. Relógio 105'→120'
em ~20s. **3 avançados ao mesmo tempo = contra-ataque, empate aos 117'.**
**Derrota:** *"Subiram. Contra-ataque, empate aos 117'. Nos pênaltis, o 5º
cobrador nunca foi chamado. Ele ainda aquece até hoje."*
**E se vencer:** *"Seguraram o 1x0! Classificados... e na semi, a Argentina
do Messi. O universo cobra caro por reescrever a história."*

### 2026 · Segura, Carletto! (Teoria do Chiclete, premissa do andre)

Premissa: o Brasil perdeu porque **o Ancelotti ficou sem chiclete**.
Catch: chicletes despencam do alto (arremessados do banco); o jogador move o
Ancelotti pela linha lateral (arrastar/mouse/setas) pra aparar cada um com a
boca. Acerto enche a barra **DESEMPENHO DA SELEÇÃO**; chiclete no gramado
esvazia. Iscas que travam o Carletto por 1s com cara de decepção: pastilha de
menta do departamento médico, mini-bandeira da Noruega. Relógio 0'→90+10' em
~25s; **dos 70' em diante caem dois chicletes ao mesmo tempo**. Barra zerada:
Haaland marca na hora.
**Derrota:** *"A HISTÓRIA SE REPETE. O último chiclete caiu no gramado e, com
ele, o Brasil. Sem chiclete não houve posse de bola; sem posse de bola não
houve vontade. Haaland fez dois. Vinícius Jr., escalado para o pênalti aos 14
minutos, foi visto se posicionando atrás do bandeirinha. O gol de honra saiu
aos 90+10, quando a torcida norueguesa já ensaiava a terceira remada viking
da noite. Neymar se aposentou ali mesmo, no vestiário. Descanse em paz,
desempenho da Seleção: você dependia de uma goma de mascar."*
**E se vencer:** *"E SE o preparador físico tivesse mira? Nesta realidade, o
Ancelotti não fica sem chiclete um segundo sequer: o Brasil tem 71% de posse,
Vinícius Jr. PEDE para bater o pênalti aos 14 e converte, e Haaland termina o
jogo pedindo a camisa — e um tablete. O hexa vem. O preço: a FIFA abre
investigação inédita por 'doping mandibular', o chiclete campeão é leiloado
por R$ 2,3 milhões (já mascado) e o Neymar, empolgado, desfaz a aposentadoria
e se anuncia titular para 2030. Toda vitória cobra seu preço."*

## Direção de arte: pixel art arcade (decidida)

- A seção assume estética de **fliperama retrô**: sprites em pixel art,
  scanlines sutis nos gabinetes — contraste **proposital** com o mármore
  solene do memorial. Textos de derrota/"e se" voltam ao tom solene.
- Assets via **PixelLab** (andre vai assinar; sprites animados consistentes —
  fal.ai/flux não serve pra spritesheet). Se o plano tiver API, integrar no
  claude-creds-vault.
- **A implementação NÃO bloqueia nos assets:** tudo nasce jogável com
  placeholders CSS/formas; sprites entram por cima depois.
- Pacote de sprites a gerar de uma vez (lista p/ sessão única no PixelLab):
  - Ancelotti de perfil, andando lateral + mascando (idle) + travado/decepção
  - Chiclete (tablete), pastilha de menta, mini-bandeira da Noruega
  - Henry correndo (ciclo lateral), chuteira/cadarço em close (4 estágios)
  - Jogador brasileiro genérico top-down (parado + correndo), goleiro
  - Haaland comemorando (derrotas de 2026), gramado/linha lateral tileável

## Testes e verificação

- Vitest: toda a lógica de `src/lib/jogos/` (janela de timing e encolhimento,
  regra dos 3 avançados, spawn/colisão/iscas do catch, relógio fictício,
  progressão de dificuldade) + dados completos (todo jogo tem derrota E "e
  se..." não vazios).
- E2E headless (Chromium + puppeteer-core, como na v3.2): abrir cada jogo,
  perder de propósito, conferir placa de derrota; conferir stats no
  localStorage; teclado.

## Fora de escopo da v1 (candidatos a v2)

- Os outros 3 jogos já conceituados: **2010 Contenha o Felipe Melo**
  (whack-a-mole reverso), **2014 Não tome o gol da Alemanha** (goleiro, 7
  chutes), **2018 Levante o Neymar** (levantar antes do contra-ataque).
- Conceitos reservas do chiclete (se quiser trocar/adicionar): "Não Estoura,
  Carlo" (inflar bola de chiclete na zona), "O Chiclete É do Mister"
  (roupeiro nega pedintes, Haaland de bigode postiço), "O Último Tablete",
  "Masca, Carletto!", "Míssil Tutti-Frutti" (estilingue no topete).
- Atalho "⏪ Reviver esta derrota" nas lápides da timeline apontando pro
  gabinete correspondente.
- Placar global real (backend/KV), card de compartilhamento de vitória.
