Write a TypeScript project that, given the path of an input folder containing JSON files, and the path of an output folder, converts the files to XML and outputs them in the output folder. The output folder is created if it does not exist.

## Input
- **inputFolder**: Path to the folder containing JSON files
- **outputFolder**: Path to the output folder for XML files
- **algorithmExcludeFilter**: Set of Abstract Operation types to exclude (accepted values: "abstract operation", "numeric method", "concrete method", "internal method", "builtin method", "sdo")
- **excludeYet**: Boolean flag to exclude algorithms that contain YetStep or YetExpression elements
- **xslt**: Array of paths to SEF (Stylesheet Export Format) files to apply to each generated XML file (applied in order)

## Technical details
- Use the "json-xml-parse" library for JSON to XML conversion
- Use Saxon-JS for XSLT 3.0 transformations
- JSON keys whose value is a JS primitive value type will become an attribute of the parent node. The name of the attribute will be the key.
- Filter JSON files based on their `Algorithm.head` object property key and `algorithmExcludeFilter`: exclude files if the filter includes "abstract operation" and the key is "AbstractOperationHead", or if the filter includes "numeric method" and the key is "NumericMethodHead", or if the filter includes "concrete method" and the key is "ConcreteMethodHead", or if the filter includes "internal method" and the key is "InternalMethodHead", or if the filter includes "builtin method" and the key is "BuiltinMethodHead", or if the filter includes "sdo" and the key is "SyntaxDirectedOperationHead"
- If `excludeYet` is true, exclude algorithms that contain YetStep or YetExpression elements (using JSONPath queries `$.Algorithm.body..YetStep` and `$.Algorithm.body..YetExpression`)
- XSLT transformations are applied sequentially in the order specified by the user after XML generation but before writing to disk
- XSLT files must be compiled to SEF (Stylesheet Export Format) before use. Compile using: `npx xslt3 -t -xsl:src/xslt/flatten-builtin-path.xsl -export:src/sef/flatten-builtin-path.sef.json -nogo -relocate:on`
- Multiple XSLT transformations can be chained together by providing multiple SEF file paths

## XSLT Compilation Example
To compile an XSLT file to SEF format for use with this tool:

```bash
# Compile a single XSLT file
npx xslt3 -t -xsl:src/xslt/rule.xsl -export:src/sef/rule.sef.json -nogo -relocate:on
```