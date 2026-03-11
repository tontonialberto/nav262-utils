#!/bin/bash
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: VERSION parameter is required."
  exit 1
fi

echo "Extracting target: $VERSION"
# Extract ASTs
cd /esmeta
esmeta extract -extract:log -extract:target="$VERSION"

# Generate biblio.json
cd /esmeta/ecma262
git checkout $VERSION # Checkout the specific version of the spec to ensure we get the correct biblio.json
export PUPPETEER_SKIP_DOWNLOAD=true # Skip Puppeteer download since we won't use it in this context. Also avoid install process hanging.
npm install
npx ecmarkup --verbose spec.html --write-biblio biblio/biblio.json /dev/null

# Normalize ASTs
cd /ecma262-projectional-editor-scripts/spec-manipulator
npm run start -- -e sdo -i "$ESMETA_HOME"/logs/extract/algos_json -o out/"$VERSION" -b "$ESMETA_HOME"/ecma262/biblio/biblio.json -x src/sef/flatten-builtin-path.sef.json -x src/sef/flatten-param-kind.sef.json -x src/sef/flatten-else-phrasing-info.sef.json -x src/sef/specialize-contains-condition.sef.json -x src/sef/transform-record-expression.sef.json -x src/sef/specialize-repeat-step.sef.json -x src/sef/qualify-numeric-method-name.sef.json -x src/sef/qualify-method-name.sef.json -x src/sef/transform-type-check-condition.sef.json