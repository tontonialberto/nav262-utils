import { promises as fs } from 'fs';
import path from 'path';
import { jsXml } from 'json-xml-parse';
import { JSONPath } from 'jsonpath-plus';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// @ts-ignore
import SaxonJS from 'saxon-js';

type AlgorithmType = "abstract operation" | "numeric method" | "concrete method" | "internal method" | "builtin method" | "sdo";

const ALGORITHM_TYPE_TO_HEAD_KEY: Record<AlgorithmType, string> = {
  "abstract operation": "AbstractOperationHead",
  "numeric method": "NumericMethodHead",
  "concrete method": "ConcreteMethodHead",
  "internal method": "InternalMethodHead",
  "builtin method": "BuiltinHead",
  "sdo": "SyntaxDirectedOperationHead"
};

async function applyXsltTransformation(xmlContent: string, xsltPath: string): Promise<string> {
  try {
    // Read the XSLT file
    const xsltContent = await fs.readFile(xsltPath, 'utf-8');

    // Apply the transformation using Saxon-JS
    const result = SaxonJS.transform({
      sourceText: xmlContent,
      stylesheetInternal: JSON.parse(xsltContent),
      destination: 'serialized'
    });

    if (result.principalResult) {
      return result.principalResult as string;
    } else {
      throw new Error('XSLT transformation produced no result');
    }
  } catch (error) {
    throw new Error(`XSLT transformation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function applyMultipleXsltTransformations(xmlContent: string, xsltPaths: string[]): Promise<string> {
  let transformedXml = xmlContent;

  for (const xsltPath of xsltPaths) {
    try {
      transformedXml = await applyXsltTransformation(transformedXml, xsltPath);
      console.log(`  Applied XSLT: ${path.basename(xsltPath)}`);
    } catch (error) {
      throw new Error(`Failed to apply XSLT ${path.basename(xsltPath)}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return transformedXml;
}

function isPrimitive(value: any): boolean {
  return value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean';
}

function transformJsonToXmlStructure(obj: any): any {
  if (isPrimitive(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformJsonToXmlStructure(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    const attributes: any = {};

    // Separate primitive values (to become attributes) from complex values
    for (const [key, value] of Object.entries(obj)) {
      if (isPrimitive(value)) {
        attributes[key] = value;
      } else {
        result[key] = transformJsonToXmlStructure(value);
      }
    }

    // Avoid [object Object] text content on nodes without children
    if (Object.keys(result).length == 0) {
      result['#'] = {};
    }

    // If we have attributes, add them to the result with '@' prefix (json-xml-parse convention)
    if (Object.keys(attributes).length > 0) {
      result['@'] = attributes;
    }


    return result;
  }

  return obj;
}

async function shouldExcludeByAlgorithmType(json: any, algorithmExcludeFilter: AlgorithmType[]): Promise<boolean> {
  if (!algorithmExcludeFilter || algorithmExcludeFilter.length === 0) {
    return false;
  }

  const excludedHeadKeys = algorithmExcludeFilter.map(type => ALGORITHM_TYPE_TO_HEAD_KEY[type]);
  const head = json.Algorithm?.head;
  if (head) {
    const headKey = Object.keys(head)[0];
    return excludedHeadKeys.includes(headKey);
  }
  return false;
}

async function shouldExcludeByYetElements(json: any): Promise<boolean> {
  const yetSteps = JSONPath({ path: '$.Algorithm.body..YetStep', json });
  const yetExpressions = JSONPath({ path: '$.Algorithm.body..YetExpression', json });
  return yetSteps.length > 0 || yetExpressions.length > 0;
}

async function filterAlgorithmFiles(files: string[], algorithmExcludeFilter: AlgorithmType[], excludeYet: boolean): Promise<string[]> {
  const filesToKeepPromises = files.map(async (file) => {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(content);

      // Filter by algorithm type
      if (await shouldExcludeByAlgorithmType(json, algorithmExcludeFilter)) {
        return false;
      }

      // Filter by YetStep/YetExpression
      if (excludeYet && await shouldExcludeByYetElements(json)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error processing file ${file} during filtering:`, error);
      return false;
    }
  });

  const filesToKeep = await Promise.all(filesToKeepPromises);
  return files.filter((_, index) => filesToKeep[index]);
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore if exists
  }
}

async function convertJsonFolderToXml(inputDir: string, outputDir: string, algorithmExcludeFilter: AlgorithmType[], excludeYet: boolean, xsltPaths: string[]) {
  await ensureDir(outputDir);
  let files = await fs.readdir(inputDir);
  files = files.filter(file => file.endsWith('.json')).map(file => path.join(inputDir, file));

  files = await filterAlgorithmFiles(files, algorithmExcludeFilter, excludeYet);

  for (const file of files) {
    const outputPath = path.join(outputDir, path.basename(file).replace(/\.json$/, '.xml'));
    try {
      const jsonContent = await fs.readFile(file, 'utf-8');
      const jsonObj = JSON.parse(jsonContent);
      const transformedObj = transformJsonToXmlStructure(jsonObj);
      let xml = jsXml.toXmlString(transformedObj);

      // Apply XSLT transformations if any are specified
      try {
        xml = await applyMultipleXsltTransformations(xml, xsltPaths);
        console.log(`Applied ${xsltPaths.length} XSLT transformation(s) to: ${path.basename(file)}`);
      } catch (xsltError) {
        console.error(`XSLT transformation failed for ${path.basename(file)}:`, xsltError instanceof Error ? xsltError.message : String(xsltError));
        console.log(`Continuing with original XML for: ${path.basename(file)}`);
      }

      await fs.writeFile(outputPath, xml, 'utf-8');
      console.log(`Converted: ${path.basename(file)} -> ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`Failed to convert ${path.basename(file)}:`, err);
    }
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      description: 'Input folder containing JSON files',
      type: 'string',
      demandOption: true,
    })
    .option('output', {
      alias: 'o',
      description: 'Output folder for XML files',
      type: 'string',
      demandOption: true,
    })
    .option('algorithmExcludeFilter', {
      alias: 'e',
      description: `A set of Abstract Operation types to exclude. Possible values: ${Object.keys(ALGORITHM_TYPE_TO_HEAD_KEY).join(', ')}`,
      type: 'array',
      choices: Object.keys(ALGORITHM_TYPE_TO_HEAD_KEY),
      default: [],
    })
    .option('excludeYet', {
      alias: 'y',
      description: 'Exclude algorithms that contain YetStep or YetExpression elements',
      type: 'boolean',
      default: false,
    })
    .option('xslt', {
      alias: 'x',
      description: 'Paths to SEF (Stylesheet Export Format) files to apply to each generated XML file (applied in order). XSLT files must be compiled to SEF format using: npx xslt3 -t -xsl:path/to/file.xsl -export:path/to/file.sef.json -nogo -relocate:on',
      type: 'array',
      string: true,
      default: [],
    })
    .help()
    .alias('help', 'h')
    .argv;

  await convertJsonFolderToXml(argv.input, argv.output, argv.algorithmExcludeFilter as AlgorithmType[], argv.excludeYet, argv.xslt || []);
}

main();
