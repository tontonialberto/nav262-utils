import { promises as fs } from 'fs';
import path from 'path';
import * as xml2js from 'xml2js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface Violation {
  file: string;
  parentTag: string;
  childTag: string;
  expectedCase: 'uppercase' | 'lowercase';
  actualCase: 'uppercase' | 'lowercase';
  path: string;
}

function startsWithUppercase(str: string): boolean {
  return str.length > 0 && str[0] >= 'A' && str[0] <= 'Z';
}

function startsWithLowercase(str: string): boolean {
  return str.length > 0 && str[0] >= 'a' && str[0] <= 'z';
}

function getCase(str: string): 'uppercase' | 'lowercase' | 'other' {
  if (startsWithUppercase(str)) return 'uppercase';
  if (startsWithLowercase(str)) return 'lowercase';
  return 'other';
}

function validateNode(
  node: any,
  tagName: string,
  expectedCase: 'uppercase' | 'lowercase',
  currentPath: string,
  violations: Violation[],
  fileName: string,
  depth: number
): void {
  // Skip head tag and all its content
  if (tagName === 'head') {
    return;
  }

  const actualCase = getCase(tagName);
  
  // Check if current node violates the expected case
  if (actualCase !== expectedCase && actualCase !== 'other') {
    violations.push({
      file: fileName,
      parentTag: currentPath.split('/').slice(-2, -1)[0] || 'root',
      childTag: tagName,
      expectedCase,
      actualCase,
      path: currentPath
    });
  }

  // If node has children, validate them recursively
  if (typeof node === 'object' && node !== null) {
    for (const [childTagName, childNode] of Object.entries(node)) {
      // Skip attributes (they start with $) and head tags
      if (childTagName.startsWith('$') || childTagName === 'head') continue;
      
      const childPath = `${currentPath}/${childTagName}`;
      const nextExpectedCase = expectedCase === 'uppercase' ? 'lowercase' : 'uppercase';
      
      if (Array.isArray(childNode)) {
        // Handle multiple children with same tag name
        childNode.forEach((child, index) => {
          validateNode(child, childTagName, nextExpectedCase, `${childPath}[${index}]`, violations, fileName, depth + 1);
        });
      } else {
        validateNode(childNode, childTagName, nextExpectedCase, childPath, violations, fileName, depth + 1);
      }
    }
  }
}

async function validateXmlFile(filePath: string): Promise<Violation[]> {
  const violations: Violation[] = [];
  const fileName = path.basename(filePath);
  
  try {
    const xmlContent = await fs.readFile(filePath, 'utf-8');
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: false,
      explicitChildren: false
    });
    
    const result = await parser.parseStringPromise(xmlContent);
    
    // Get root element
    const rootTagName = Object.keys(result)[0];
    const rootNode = result[rootTagName];
    
    // Root should start with uppercase
    if (!startsWithUppercase(rootTagName)) {
      violations.push({
        file: fileName,
        parentTag: 'document',
        childTag: rootTagName,
        expectedCase: 'uppercase',
        actualCase: getCase(rootTagName) as 'uppercase' | 'lowercase',
        path: `/${rootTagName}`
      });
    }
    
    // Validate children of root (should be lowercase)
    if (typeof rootNode === 'object' && rootNode !== null) {
      for (const [childTagName, childNode] of Object.entries(rootNode)) {
        if (childTagName.startsWith('$') || childTagName === 'head') continue; // Skip attributes and head tags
        
        const childPath = `/${rootTagName}/${childTagName}`;
        
        if (Array.isArray(childNode)) {
          childNode.forEach((child, index) => {
            validateNode(child, childTagName, 'lowercase', `${childPath}[${index}]`, violations, fileName, 1);
          });
        } else {
          validateNode(childNode, childTagName, 'lowercase', childPath, violations, fileName, 1);
        }
      }
    }
    
  } catch (error) {
    console.error(`Error parsing XML file ${fileName}:`, error);
  }
  
  return violations;
}

async function validateXmlFiles(inputDir: string, outputFile: string): Promise<void> {
  const violations: Violation[] = [];
  
  try {
    const files = await fs.readdir(inputDir);
    const xmlFiles = files.filter(file => file.endsWith('.xml'));
    
    console.log(`Found ${xmlFiles.length} XML files to validate...`);
    
    for (const file of xmlFiles) {
      const filePath = path.join(inputDir, file);
      const fileViolations = await validateXmlFile(filePath);
      violations.push(...fileViolations);
    }
    
    // Write violations to output file
    const violationLines = violations.map(v => 
      `${v.file}: ${v.path} - Expected ${v.expectedCase} but found ${v.actualCase} for tag "${v.childTag}" (parent: "${v.parentTag}")`
    );
    
    const output = violations.length > 0 
      ? `Found ${violations.length} violations:\n\n${violationLines.join('\n')}`
      : 'No violations found. All XML files comply with the structure.';
    
    await fs.writeFile(outputFile, output, 'utf-8');
    console.log(`Validation complete. Results written to ${outputFile}`);
    console.log(`Total violations: ${violations.length}`);
    
  } catch (error) {
    console.error('Error during validation:', error);
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      description: 'Input folder containing XML files',
      type: 'string',
      demandOption: true,
    })
    .option('output', {
      alias: 'o',
      description: 'Output file for violations report',
      type: 'string',
      demandOption: true,
    })
    .help()
    .alias('help', 'h')
    .argv;

  await validateXmlFiles(argv.input, argv.output);
}

main();
