# ESMeta AST Step Structure Extractor

Write a TypeScript project that analyzes the ESMeta Abstract Syntax Tree of the Abstract Operations of the ECMA-262 specification and extracts all the possible cases of a given language construct.

## Input
- **algorithmsFolder**: Path to the folder containing the ESMeta ASTs of the Abstract Operations
- **algorithmExcludeFilter**: Set of Abstract Operation types to exclude (accepted values: "abstract operation", "numeric method", "concrete method", "internal method", "builtin method", "sdo")
- **step**: The type name of a concept in the ESMeta language

## Output
Generates two files:
1. **resources/steps/<concept>.json**: Contains all different structural cases for the given concept type
2. **resources/parents/<concept>.json**: Contains all different parent-role combinations where the concept appears

## Algorithm

### Step Structure Extraction
1. Initialize an empty list called `occurrences`
2. Filter JSON files in the folder based on their `Algorithm.head` object property key and `algorithmExcludeFilter`: exclude files if the filter includes "abstract operation" and the key is "AbstractOperationHead", or if the filter includes "numeric method" and the key is "NumericMethodHead", or if the filter includes "concrete method" and the key is "ConcreteMethodHead", or if the filter includes "internal method" and the key is "InternalMethodHead", or if the filter includes "builtin method" and the key is "BuiltinMethodHead", or if the filter includes "sdo" and the key is "SyntaxDirectedOperationHead"
3. For each remaining JSON file: search using JSONPath query `$.Algorithm.body..<type name of the step>`, then for each result transform its subtree by replacing primitive values with their type names (e.g., `{"name": "foo", "value": true}` becomes `{"name": "string", "value": "boolean"}`), then check if `occurrences` already contains an element with the same "step" structure and add the algorithm name to its "appearsIn" property, otherwise add a new element with "step" (the transformed subtree) and "appearsIn" (array with the algorithm name)
4. Output results to `resources/steps/<concept>.json`

### Parent and Role Extraction
1. Initialize an empty list called `occurrences`
2. Filter JSON files in the folder using the same algorithm exclude filter as above
3. For each remaining JSON file: search using JSONPath query `$.Algorithm.body..<type name of the step>` with `resultType: 'pointer'` to get the path to each occurrence
4. For each result path: filter out array index segments (segments that are only digits) from the path, then extract the last two non-index segments before the concept name to get `<parentConcept>.<role>` (e.g., from path `/Algorithm/body/IfStep/thenStep/SetStep`, extract `IfStep.thenStep`)
5. Check if `occurrences` already contains an element with the same "parentAndRole" string and add the algorithm name to its "appearsIn" property, otherwise add a new element with "parentAndRole" and "appearsIn" (array with the algorithm name)
6. Output results to `resources/parents/<concept>.json`

## Example
**Input**: folder '/path/to/folder', step 'LetStep'

**Output (resources/steps/LetStep.json)**:
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

**Output (resources/parents/LetStep.json)**:
```json
[
  {
    "parentAndRole": "IfStep.thenStep",
    "appearsIn": [
      "ValidateIntegerTypedArray",
      "GetArrayBufferMaxByteLengthOption"
    ]
  },
  {
    "parentAndRole": "IfStep.elseStep",
    "appearsIn": [
      "AtomicCompareExchangeInSharedBlock"
    ]
  }
]
```