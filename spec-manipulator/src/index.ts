import { promises as fs } from 'fs';
import path from 'path';
import { jsXml } from 'json-xml-parse';
import { JSONPath } from 'jsonpath-plus';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

type AlgorithmType = "abstract operation" | "numeric method" | "concrete method" | "internal method" | "builtin method" | "sdo";

const ALGORITHM_TYPE_TO_HEAD_KEY: Record<AlgorithmType, string> = {
  "abstract operation": "AbstractOperationHead",
  "numeric method": "NumericMethodHead",
  "concrete method": "ConcreteMethodHead",
  "internal method": "InternalMethodHead",
  "builtin method": "BuiltinHead",
  "sdo": "SyntaxDirectedOperationHead"
};

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

async function convertJsonFolderToXml(inputDir: string, outputDir: string, algorithmExcludeFilter: AlgorithmType[], excludeYet: boolean) {
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
      const xml = jsXml.toXmlString(transformedObj);
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
    .help()
    .alias('help', 'h')
    .argv;

  await convertJsonFolderToXml(argv.input, argv.output, argv.algorithmExcludeFilter as AlgorithmType[], argv.excludeYet);
}

main();
