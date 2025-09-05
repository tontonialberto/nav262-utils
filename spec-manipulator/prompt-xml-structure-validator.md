Write a TypeScript project that, given the path of an input folder containing XML files, checks whether each file complies with a specific alternating tag structure and outputs all violations to a report file.

## Input
- **inputFolder**: Path to the folder containing XML files
- **outputFile**: Path to the output file for the violations report

## Structure Rules
- The root node tag must start with an uppercase letter.
- Every child of the root must have a tag name starting with a lowercase letter.
- Every child of those children must have a tag name starting with an uppercase letter.
- This alternating sequence of uppercase and lowercase tag names repeats for each level until the leaves of the tree.
- The `head` tag and all its content are ignored during validation.

## Output
- The output file contains, for each violation:
  - The name of the file
  - The XML path where the violation occurs
  - The line at which the violation occurs (if available)
  - The pair of consecutive tags that violate the structure, including the expected and actual case

## Technical details
- Use the "xml2js" library to parse XML files.
- Traverse the XML tree recursively, checking the alternating case rule for each tag.
- Skip validation for any `head` tag and its descendants.
- Collect all violations and write them to the output file in a readable format.