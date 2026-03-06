#!/bin/sh

npm run start -- \
  -e sdo \
  -i /home/alberto/phd/esmeta-extract-json/logs/extract/algos_json \
  -o /home/alberto/msc-thesis/ecma262-projectional-editor-scripts/spec-manipulator/out/es2025 \
  -b /home/alberto/phd/esmeta-extract-json/ecma262/biblio/biblio.json \
  -x src/sef/flatten-builtin-path.sef.json \
  -x src/sef/flatten-param-kind.sef.json \
  -x src/sef/flatten-else-phrasing-info.sef.json \
  -x src/sef/specialize-contains-condition.sef.json \
  -x src/sef/transform-record-expression.sef.json \
  -x src/sef/specialize-repeat-step.sef.json \
  -x src/sef/qualify-numeric-method-name.sef.json \
  -x src/sef/qualify-method-name.sef.json \
  -x src/sef/transform-type-check-condition.sef.json
