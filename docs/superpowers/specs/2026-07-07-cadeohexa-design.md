# Spec — "Cadê o Hexa?" (memorial interativo da espera pelo hexa)

Data: 2026-07-07 · Status: aguardando revisão do andre

## 1. Conceito

Site de zoação em página única, tom **falso-solene**: um "memorial nacional" à espera do sexto título mundial. O site se leva a sério de propósito (linguagem de placa de museu, documento oficial, luto cívico) — o humor vem do contraste. Todo o texto em pt-BR.

- **Nome/URL:** `cadeohexa` → `cadeohexa.pages.dev` (Cloudflare Pages, sem domínio próprio por ora).
- **Público:** brasileiro, chegando via link compartilhado no WhatsApp/X — o site precisa carregar rápido e entregar a piada em segundos.
- **Objetivos (nesta ordem):** (1) viralizar/divertir; (2) playground técnico de 3D e animação de scroll (referência: sites da Steam Summer Sale); (3) monetização futura por ads — fase 2, fora deste escopo.

## 2. Números-âncora (fonte única de verdade)

Todos calculados no cliente a partir de constantes de data, timezone `America/Sao_Paulo`:

- **A Espera:** dias desde **30/06/2002** (final de Yokohama, o penta).
- **Próxima tentativa:** countdown para a Copa 2030 (Espanha/Portugal/Marrocos, centenário). Data de abertura não confirmada pela FIFA → usar estimativa **08/06/2030** com nota: *"data estimada — a FIFA não confirmou, mas a espera sim"*. Constante isolada para ajuste em 1 linha quando a FIFA confirmar.
- Medidores absurdos derivam das mesmas constantes (ver §3.4).

## 3. Estrutura da página (scroll narrativo)

Página única; o scroll dirige câmera 3D e animações. Oito seções:

### 3.1 Herói
Cena 3D: taça dourada low-poly girando devagar sob facho de luz, fundo de mármore escuro (direção visual "Memorial de Mármore": preto profundo, dourado, serifa de placa de bronze). Contador gigante de dias com animação de contagem na chegada. Tagline solene rotativa ("Dia N. O povo mantém a fé."). O contador em texto renderiza **antes** do 3D carregar — a piada nunca espera o WebGL.

### 3.2 Próxima tentativa
Countdown para 2030 em linguagem de placa de bronze + a nota da data estimada.

### 3.3 Ala das Tentativas (linha do tempo 2006→2026)
Seis "lápides" de museu, uma por eliminação. Cada lápide: ano, algoz, epitáfio, 2–3 fatos/memes no verso (tap/hover expande). Conteúdo curado em `docs/pesquisa-zoacao.md`. Epitáfios:

| Copa | Algoz | Epitáfio |
|---|---|---|
| 2006 | França 0x1 | "O Quadrado Trágico. Uma finalização no gol em 90 minutos." |
| 2010 | Holanda 1x2 | "Felipe Melo participou dos três gols do jogo. Dois foram para a Holanda." |
| 2014 | Alemanha — | "O Incidente." (placar 1x7 revelado apenas em hover/tap) |
| 2018 | Bélgica 1x2 | "27 finalizações contra 9. Metade dos gols da Bélgica foi nossa." |
| 2022 | Croácia (pên.) | "Neymar guardado para o 5º pênalti. Não houve 5º pênalti." |
| 2026 | Noruega 1x2 | "Eliminados por um país com menos gente que a Grande Curitiba. Nas oitavas." |

Fechos da ala: estatística-âncora ("seis eliminações consecutivas para europeus; nenhum europeu eliminado em mata-mata desde 2002") e gancho para a Profecia ("com base na tendência, nosso departamento projeta:"). Restrições editoriais: nada envolvendo Bussunda; "Fernandão" não é meme documentado — não usar.

### 3.4 O que aconteceu enquanto esperávamos (medidores absurdos)
Contadores animados derivados das datas: presidentes do Brasil desde o penta, técnicos da seleção, iPhones lançados (todos — não existia iPhone no penta), gerações de console, Copas da Alemanha/Argentina/etc. no período, feriados informais perdidos. Dados em arquivo próprio com data-base de cada item.

### 3.5 A Profecia (Departamento de Projeções Estatísticas do Memorial)
Extrapolação "científica" de dois eixos: o algoz encolhe e a fase da queda piora. Apresentação: tabela solene + **gráfico log decrescente da população do algoz** (candidato a card compartilhável próprio). Rodapé: *"projeção por regressão linear da vergonha (R² = 0,97). A ciência não erra."* + notas de rodapé solenes (a meta da RoboCup é real e verificável).

| Copa | Sede | Algoz previsto | População | Nota |
|---|---|---|---|---|
| 2030 | Esp/Por/Mar | Islândia | 390 mil | Mais vulcões ativos que jogadores profissionais. Palmas vikings já ensaiadas. |
| 2034 | Arábia Saudita | Ilhas Faroé | 54 mil | Primeira seleção com mais ovelhas que torcedores. |
| 2038 | a definir | San Marino | 34 mil | Pior seleção do ranking FIFA quebra jejum milenar justamente contra nós. |
| 2042 | a definir | Vaticano | 764 | Gol de milagre aos 90+7. VAR não contesta decisão divina. |
| 2046 | a definir | Robôs da RoboCup | 22 robôs | Meta oficial do projeto era vencer humanos em 2050. Contra o Brasil, anteciparam. |
| 2050 | a definir | Seleção do Gemini | 1 modelo | A seleção do Claude Code, invicta, recusou o convite por falta de desafio. O Gemini alucinou um impedimento no próprio ataque, pediu desculpas duas vezes — e venceu de 2x1, com gol contra nosso. |

Eixo da fase (linha secundária da tabela): oitavas (2026) → fase de grupos → repescagem → Eliminatórias → amistoso preparatório → eliminado no sorteio. Texto final ajustável na implementação; a estrutura de dois eixos é fixa.

### 3.6 Quiz "Quanto você sofreu?"
8–10 perguntas derivadas da pesquisa (ex.: vilão de cada Copa, quem o Brasil não elimina desde 2002, minutos do Neymar no chão em 2018). Resultado = patente solene ("Sofredor Sênior — 6/10 vexames presenciados") que alimenta o gerador de card. Sem backend: pontuação no cliente.

### 3.7 Gerador de card
Canvas no navegador compõe imagem (contador do dia + patente do quiz, estética do memorial). Botão com Web Share API (compartilha imagem direto no WhatsApp em mobile) e fallback de download. Funciona sem ter feito o quiz (card só com o contador).

### 3.8 Rodapé
Placa de inauguração do memorial ("Inaugurado no dia 8.773 da espera"), créditos, e slot discreto reservado para futuro banner (vazio na fase 1).

## 4. Arquitetura e stack

- **Vite + TypeScript + Three.js** (vanilla, sem framework de UI — página única) + **GSAP ScrollTrigger** para scroll → câmera/animações.
- **Cloudflare Pages** (deploy) + **Pages Functions** em `/og`: gera a imagem OG do dia (contador renderizado) para o preview do link; meta tags apontam para ela. Cache com TTL até a virada do dia (`America/Sao_Paulo`).
- **Separação conteúdo/apresentação:** todo texto e dado em módulos próprios — `src/data/copas.ts`, `src/data/medidores.ts`, `src/data/profecia.ts`, `src/data/quiz.ts`, `src/data/datas.ts` (constantes-âncora). Mudar piada não toca em código de renderização.
- Unidades isoladas com interface clara: `contadores` (matemática de datas — funções puras), `cena3d` (Three.js, recebe progresso de scroll), `card` (canvas → blob), `og` (function). Cada uma testável/compreensível sozinha.

## 5. Performance e fallbacks (requisito, não polish)

- Primeira pintura com contador visível **< 1,5s em 4G**. 3D carrega depois, via dynamic import.
- Taça: geometria procedural ou GLTF **< 200 KB**; texturas mínimas; sem bibliotecas pesadas além de Three/GSAP.
- Sem WebGL ou `prefers-reduced-motion` → versão estática elegante (mesmos contadores e conteúdo; nenhuma seção depende do 3D para fazer sentido).
- Nada de popup, som com autoplay ou bloqueio de scroll.

## 6. Testes

- **Vitest** para: matemática de datas (dias da espera, countdown, cada medidor — casos de virada de dia e timezone `America/Sao_Paulo`), pontuação/patentes do quiz, e a function `/og` (resposta 200, content-type, número do dia correto para data mockada).
- 3D/animações/card visual: verificação manual (checklist no plano de implementação).

## 7. Fora de escopo (fase 2)

- Domínio próprio, AdSense, política de privacidade e consentimento LGPD (entram juntos, se houver tração).
- Analytics além do básico gratuito do Cloudflare.
- CMS/backend — conteúdo é código versionado.

## 8. Riscos e decisões registradas

- **Data da Copa 2030 é estimada** — constante isolada, nota de humor cobre a incerteza.
- **Piadas com pessoas reais:** manter o alvo em situações, não em caráter (linha editorial: zoação que o próprio torcedor compartilharia). Casos sensíveis listados em `docs/pesquisa-zoacao.md`.
- **Nome `cadeohexa` no pages.dev:** sujeito a disponibilidade do subdomínio; alternativa `esperandoohexa`.
