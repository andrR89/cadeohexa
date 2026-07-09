#!/usr/bin/env bash
#
# Task V7 — Otimização das imagens do memorial.
#
# Converte os retratos-memoriais (JPEGs originais de 768x1024 / 1024x1024, ~3,6 MB
# no total) para WebP redimensionado (~900px), gravando em public/img/.
#
# É idempotente e re-executável: lê os originais de DUAS pastas e (re)gera os
# .webp em public/img/:
#   1. ORIGEM (assets/img-fonte/, gitignorada) — os JPEGs da v2; se a pasta não
#      existir (ex.: clone novo), o script os restaura direto do git, a partir
#      da ref REF_ORIGINAIS.
#   2. FONTES_VERSIONADAS (assets/fontes/, rastreada) — originais pós-v2 que não
#      existem em nenhum outro objeto do git. Têm PRECEDÊNCIA: se um arquivo de
#      mesmo nome-base existir nas duas pastas, vale o versionado (a tag da v2
#      pode conter uma versão antiga dele, ex.: taca-heroi).
# Quem manda pro deploy são só os .webp.
#
# ⚠️  ARQUIVO ÚNICO DOS ORIGINAIS: como os JPEGs saíram da árvore de trabalho, a
#     ÚNICA cópia versionada deles é o objeto git apontado pela tag anotada
#     `imagens-originais-v2` (commit 6878b12). A tag existe pra esse objeto
#     sobreviver a squash-merge / exclusão de branch / git gc — um SHA solto seria
#     órfão e coletado. Consequências práticas:
#       - A tag é LOCAL até ser publicada: rode `git push origin imagens-originais-v2`
#         senão ela (e o acesso aos originais) não existe pra mais ninguém / na CI.
#       - Um clone raso (`--depth=1`) pode não ter o objeto; use o clone completo
#         ou `git fetch --tags` antes de rodar o restaurar_origem.
#     Se a tag for perdida e os originais sumirem, re-semeie assets/img-fonte/ à mão
#     (as imagens geradas por IA, 768x1024 / 1024x1024) e rode o script de novo.
#
# Uso:
#   ./scripts/otimizar-imagens.sh
#   ORIGEM=/outro/caminho QUALIDADE=82 ./scripts/otimizar-imagens.sh
#
# Requer: ImageMagick 7 (`magick`) com suporte a WebP (libwebp).
#
# Parâmetros de conversão (definidos por experimento — ver relatório da V7):
#   -resize '900x900>'  cabe a imagem numa caixa 900x900 sem NUNCA ampliar (o '>'
#                    garante isso); limita as DUAS dimensões, então um source
#                    paisagem futuro não escapa com largura solta. No-op de recorte
#                    pros sources atuais (retrato/quadrado até 1024px de altura):
#                    768x1024 -> 675x900, 1024x1024 -> 900x900 (aspecto preservado).
#   -strip           remove metadados EXIF/ICC.
#   -quality 78 + webp:method=6  melhor razão peso/qualidade sem banding visível
#                    nos degradês dourados das molduras.
set -euo pipefail
shopt -s nullglob

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGEM="${ORIGEM:-$RAIZ/assets/img-fonte}"
# Fontes versionadas (assets/fontes) têm precedência sobre as restauradas da
# tag: são originais que não existem em nenhum outro objeto do git.
FONTES_VERSIONADAS="${FONTES_VERSIONADAS:-$RAIZ/assets/fontes}"
DESTINO="$RAIZ/public/img"
QUALIDADE="${QUALIDADE:-78}"
REF_ORIGINAIS="${REF_ORIGINAIS:-imagens-originais-v2}"

restaurar_origem() {
  echo "Origem não encontrada em $ORIGEM — restaurando os JPEGs originais do git ($REF_ORIGINAIS)…"
  mkdir -p "$ORIGEM"
  git -C "$RAIZ" archive "$REF_ORIGINAIS" public/img \
    | tar -x -C "$ORIGEM" --strip-components=2
}

# Falha cedo e claro se o conversor não existe — antes de restaurar a origem, pra
# não deixar a árvore num estado meio-feito.
command -v magick > /dev/null || { echo "erro: ImageMagick 7 (magick) não encontrado" >&2; exit 1; }

if ! compgen -G "$ORIGEM/*.jpg" > /dev/null; then
  restaurar_origem
fi

mkdir -p "$DESTINO"
total=0

converter() {
  local origem="$1"
  local nome saida bytes
  nome="$(basename "${origem%.*}")"
  saida="$DESTINO/$nome.webp"
  magick "$origem" -resize '900x900>' -strip -quality "$QUALIDADE" -define webp:method=6 "$saida"
  bytes=$(stat -c%s "$saida")
  total=$((total + bytes))
  printf '  %-28s %5d KB\n' "$nome.webp" "$((bytes / 1024))"
}

# 1) restauradas/locais
for origem in "$ORIGEM"/*.jpg; do
  [ -e "$origem" ] || continue
  nome="$(basename "${origem%.*}")"
  # pulada se houver fonte versionada com o mesmo nome (ela é a verdade)
  if compgen -G "$FONTES_VERSIONADAS/$nome.*" > /dev/null; then continue; fi
  converter "$origem"
done

# 2) versionadas (jpg ou png)
for origem in "$FONTES_VERSIONADAS"/*.{jpg,png}; do
  [ -e "$origem" ] || continue
  converter "$origem"
done
printf 'Total em %s: %d KB (%d arquivos)\n' "$DESTINO" "$((total / 1024))" "$(ls -1 "$DESTINO"/*.webp | wc -l)"
