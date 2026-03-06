# Concepts Analysis Feature

## Overview
The `step-structure-extractor` now includes functionality to analyze and count all uppercase node names (concepts) appearing in the ECMA-262 specification JSON files.

## Usage

### Analyze Concepts
To analyze all concepts in the specification:

```bash
npm run start -- --algorithmsFolder <path-to-json-folder> --analyzeConcepts
```

Or using the short flag:

```bash
npm run start -- -f <path-to-json-folder> -c
```

### Optional: Exclude Algorithm Types
You can exclude specific algorithm types from the analysis:

```bash
npm run start -- -f <path-to-json-folder> -c -e sdo "builtin method"
```

Available algorithm types to exclude:
- `abstract operation`
- `numeric method`
- `concrete method`
- `internal method`
- `builtin method`
- `sdo`

## Output

The analysis creates a file at `step-structure-extractor/stats/concepts.json` with the following structure:

```json
[
  {
    "concept": "Algorithm",
    "occurrences": 1234
  },
  {
    "concept": "IfStep",
    "occurrences": 567
  },
  ...
]
```

The concepts are sorted by:
1. Number of occurrences (descending)
2. Concept name (alphabetically, ascending)

## How It Works

1. **Concept Detection**: A concept is any JSON object key that starts with an uppercase letter (matches regex `/^[A-Z]/`)
2. **Recursive Traversal**: The analyzer recursively traverses all JSON files in the specified folder
3. **Counting**: Each occurrence of a concept name is counted across all files
4. **Filtering**: You can optionally exclude certain algorithm types from the analysis

## Examples

### Basic analysis
```bash
npm run start -- -f ../esmeta/algorithms -c
```

### Exclude SDOs and builtin methods
```bash
npm run start -- -f ../esmeta/algorithms -c -e sdo "builtin method"
```

## Original Functionality

The original step analysis functionality is still available. To use it, simply omit the `--analyzeConcepts` flag and provide a step type:

```bash
npm run start -- -f <path-to-json-folder> -s IfStep
```
