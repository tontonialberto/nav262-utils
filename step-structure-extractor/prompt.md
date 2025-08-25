# ESMeta AST Step Structure Extractor

Write a TypeScript project that analyzes the ESMeta Abstract Syntax Tree of the Abstract Operations of the ECMA-262 specification and extracts all the possible cases of a given language construct.

## Input
- **algorithmsFolder**: Path to the folder containing the ESMeta ASTs of the Abstract Operations
- **algorithmExcludeFilter**: Set of Abstract Operation types to exclude (accepted values: "abstract operation", "numeric method", "concrete method", "internal method", "builtin method", "sdo")
- **step**: The type name of a step in the ESMeta language

## Output
Generates a file containing all different cases for the given step type.

## Algorithm
1. Initialize an empty list called `occurrences`
2. Filter JSON files in the folder based on their `Algorithm.head` object property key and `algorithmExcludeFilter`: exclude files if the filter includes "abstract operation" and the key is "AbstractOperationHead", or if the filter includes "numeric method" and the key is "NumericMethodHead", or if the filter includes "concrete method" and the key is "ConcreteMethodHead", or if the filter includes "internal method" and the key is "InternalMethodHead", or if the filter includes "builtin method" and the key is "BuiltinMethodHead", or if the filter includes "sdo" and the key is "SyntaxDirectedOperationHead"
3. For each remaining JSON file: search using JSONPath query `$.Algorithm.body..<type name of the step>`, then for each result transform its subtree by replacing primitive values with their type names (e.g., `{"name": "foo", "value": true}` becomes `{"name": "string", "value": "boolean"}`), then check if `occurrences` already contains an element with the same "step" structure and add the algorithm name to its "appearsIn" property, otherwise add a new element with "step" (the transformed subtree) and "appearsIn" (array with the algorithm name)

## Example
**Input**: folder '/path/to/folder', step 'LetStep'

**Output**:
```json
[
  {
    "step": {
      "LetStep": {
        "variable": {
          "Variable": {
            "name": "string"
          }
        },
        "expr": {
          "ReturnIfAbruptExpression": {
            "expr": {
              "InvokeAbstractOperationExpression": {
                "name": "string",
                "args": [
                  {
                    "ReferenceExpression": {
                      "ref": {
                        "Variable": {
                          "Variable": {
                            "name": "string"
                          }
                        }
                      }
                    }
                  },
                  {
                    "EnumLiteral": {
                      "name": "string"
                    }
                  }
                ]
              }
            },
            "check": "boolean"
          }
        }
      }
    },
    "appearsIn": [
      "ValidateIntegerTypedArray"
    ]
  }
]
```