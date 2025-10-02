You need a bash script that processes JSON algorithm files to extract typing information for three specific method types:

- Numeric methods: Extract type from Algorithm.head.NumericMethodHead.baseTy
- Internal methods: Extract type from Algorithm.head.InternalMethodHead.receiver.Param.ty
- Concrete methods: Extract type from Algorithm.head.ConcreteMethodHead.receiver.Param.ty

Requirements:

- Input: A folder containing JSON algorithm files
- Output: A JSON file with organized typing information
- Process only JSON files matching the specified JSONPath structures
- Group results by method type with file names and extracted types
- Include summary statistics
- Handle errors gracefully for invalid JSON files

Example output: 
```json

{
    "concrete method receivers": [
        {
            "type": "a Declarative Environment Record",
            "appearsIn": [
                "Record[DeclarativeEnvironmentRecord].DeleteBinding",
                ...
            ]
        },
        ...
    ],
    "numeric method receivers": [
        ...
    ],
    "internal method receivers": [
        ...
    ]
}
```