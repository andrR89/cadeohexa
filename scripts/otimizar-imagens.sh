#!/usr/bin/env bash
#
# Task V7 — Otimização das imagens do memorial.
#
# Converte os retratos-memoriais (JPEGs originais de 768x1024 / 1024x1024, ~3,6 MB
# no total) para WebP redimensionado (~900px), gravando em public/img/.
#
# É idempotente e re-executável: lê os JPEGs de uma pasta de ORIGEM e (re)gera os
# .webp em public/img/. Os originais NÃO ficam versionados na árvore de trabalho
# (ver .gitignore) — quem manda pro deploy são só os .webp. Se a pasta de origem
# não existir (ex.: clone novo), o script restaura os originais direto do histórico
# do git no commit REF_ORIGINAIS.
#
# Uso:
#   ./scripts/otimizar-imagens.sh
#   ORIGEM=/outro/caminho QUALIDADE=82 ./scripts/otimizar-imagens.sh
#
# Requer: ImageMagick 7 (`magick`) com suporte a WebP (libwebp).
#
# Parâmetros de conversão (definidos por experimento — ver relatório da V7):
#   -resize 'x900>'  limita a altura a 900px sem NUNCA ampliar (o '>' garante isso);
#                    768x1024 -> 675x900, 1024x1024 -> 900x900 (aspecto preservado).
#   -strip           remove metadados EXIF/ICC.
#   -quality 78 + webp:method=6  melhor razão peso/qualidade sem banding visível
#                    nos degradês dourados das molduras.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGEM="${ORIGEM:-$RAIZ/assets/img-fonte}"
DESTINO="$RAIZ/public/img"
QUALIDADE="${QUALIDADE:-78}"
REF_ORIGINAIS="${REF_ORIGINAIS:-6878b12}"

restaurar_origem() {
  echo "Origem não encontrada em $ORIGEM — restaurando os JPEGs originais do git ($REF_ORIGINAIS)…"
  mkdir -p "$ORIGEM"
  git -C "$RAIZ" archive "$REF_ORIGINAIS" public/img \
    | tar -x -C "$ORIGEM" --strip-components=2
}

if ! compgen -G "$ORIGEM/*.jpg" > /dev/null; then
  restaurar_origem
fi

mkdir -p "$DESTINO"
total=0
for origem in "$ORIGEM"/*.jpg; do
  nome="$(basename "${origem%.jpg}")"
  saida="$DESTINO/$nome.webp"
  magick "$origem" -resize 'x900>' -strip -quality "$QUALIDADE" -define webp:method=6 "$saida"
  bytes=$(stat -c%s "$saida")
  total=$((total + bytes))
  printf '  %-28s %5d KB\n' "$nome.webp" "$((bytes / 1024))"
done
printf 'Total em %s: %d KB (%d arquivos)\n' "$DESTINO" "$((total / 1024))" "$(ls -1 "$DESTINO"/*.webp | wc -l)"
