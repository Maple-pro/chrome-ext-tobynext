#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

for command in node pnpm zip unzip; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing required command: $command" >&2
    exit 1
  fi
done

version=$(node -p "require('./package.json').version")
pnpm test
pnpm build

if [[ ! -f dist/manifest.json ]]; then
  echo 'Build did not produce dist/manifest.json' >&2
  exit 1
fi

node -e "const m = require('./dist/manifest.json'); if (m.version !== process.argv[1]) { throw new Error('Built manifest version does not match package.json') }" "$version"

mkdir -p release
archive="release/tobynext-${version}.zip"
(
  cd dist
  zip -q -r -FS "../$archive" .
)

unzip -tq "$archive" >/dev/null
unzip -p "$archive" manifest.json >/dev/null
echo "Created $archive"
