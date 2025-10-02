# Type Receiver Extractor

A TypeScript tool that processes JSON algorithm files to extract typing information for three specific method types.

## Installation

```bash
npm install
```

## Usage

```bash
# Development mode
npm run dev <input-folder> [output-file]

# Build and run
npm run build
npm start <input-folder> [output-file]
```

## Examples

```bash
# Extract from algorithms folder to default output
npm run dev ./algorithms

# Extract with custom output file
npm run dev ./algorithms ./custom-output.json
```

## Output Format

The tool generates a JSON file with the following structure:

```json
{
  "concrete method receivers": [
    {
      "type": "a Declarative Environment Record",
      "appearsIn": ["file1", "file2"]
    }
  ],
  "numeric method receivers": [...],
  "internal method receivers": [...]
}
```

## Method Types Extracted

- **Numeric methods**: `Algorithm.head.NumericMethodHead.baseTy`
- **Internal methods**: `Algorithm.head.InternalMethodHead.receiver.Param.ty`
- **Concrete methods**: `Algorithm.head.ConcreteMethodHead.receiver.Param.ty`
