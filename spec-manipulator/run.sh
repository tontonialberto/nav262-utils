#!/bin/sh

npm run start -- \
    -i ../../../esmeta-extract-json/logs/extract/algos_json \
    -b src/biblio/biblio-es2024.json \
    -o out/algos_no_sdo \
    -e "sdo" \
    -x src/sef/flatten-builtin-path.sef.json \
    -x src/sef/flatten-param-kind.sef.json \
    -x src/sef/flatten-else-phrasing-info.sef.json \
    -x src/sef/specialize-contains-condition.sef.json \
    -x src/sef/transform-record-expression.sef.json \
    -x src/sef/specialize-repeat-step.sef.json \
    -x src/sef/qualify-numeric-method-name.sef.json \
    -x src/sef/qualify-method-name.sef.json \
    -x src/sef/transform-type-check-condition.sef.json
