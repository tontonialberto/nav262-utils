import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import { JSONPath } from 'jsonpath-plus';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import _ from 'lodash';

interface Occurrence {
  step: any;
  appearsIn: string[];
}

function transformPrimitiveValues(obj: any): any {
  if (obj === null) {
    return 'null';
  }
  if (typeof obj === 'string') {
    return 'string';
  }
  if (typeof obj === 'boolean') {
    return 'boolean';
  }
  if (typeof obj === 'number') {
    return 'number';
  }
  if (typeof obj === 'undefined') {
    return 'undefined';
  }
  if (Array.isArray(obj)) {
    return obj.map(transformPrimitiveValues);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = transformPrimitiveValues(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

type AlgorithmType = "abstract operation" | "numeric method" | "concrete method" | "internal method" | "builtin method" | "sdo";

const ALGORITHM_TYPE_TO_HEAD_KEY: Record<AlgorithmType, string> = {
    "abstract operation": "AbstractOperationHead",
    "numeric method": "NumericMethodHead",
    "concrete method": "ConcreteMethodHead",
    "internal method": "InternalMethodHead",
    "builtin method": "BuiltinHead",
    "sdo": "SyntaxDirectedOperationHead"
};

async function filterAlgorithmFiles(files: string[], algorithmExcludeFilter: AlgorithmType[]): Promise<string[]> {
    if (!algorithmExcludeFilter || algorithmExcludeFilter.length === 0) {
        return files;
    }

    const excludedHeadKeys = algorithmExcludeFilter.map(type => ALGORITHM_TYPE_TO_HEAD_KEY[type]);
    
    const filesToKeepPromises = files.map(async (file) => {
        try {
            const content = await fs.readFile(file, 'utf-8');
            const json = JSON.parse(content);
            const head = json.Algorithm?.head;
            if (head) {
                const headKey = Object.keys(head)[0];
                return !excludedHeadKeys.includes(headKey);
            }
            return false;
        } catch (error) {
            console.error(`Error processing file ${file} during filtering:`, error);
            return false;
        }
    });

    const filesToKeep = await Promise.all(filesToKeepPromises);
    return files.filter((_, index) => filesToKeep[index]);
}

async function analyze(algorithmsFolder: string, stepType: string, algorithmExcludeFilter: AlgorithmType[]): Promise<Occurrence[]> {
  const occurrences: Occurrence[] = [];
  let files = await glob(`${algorithmsFolder}/**/*.json`);

  files = await filterAlgorithmFiles(files, algorithmExcludeFilter);

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(content);
      const algorithmName = path.basename(file, '.json');

      const results = JSONPath({ path: `$.Algorithm.body..${stepType}`, json });

      for (const result of results) {
        const transformedStep = transformPrimitiveValues({ [stepType]: result });

        const existingOccurrence = occurrences.find((o) =>
          _.isEqual(o.step, transformedStep)
        );

        if (existingOccurrence) {
          if (!existingOccurrence.appearsIn.includes(algorithmName)) {
            existingOccurrence.appearsIn.push(algorithmName);
          }
        } else {
          occurrences.push({
            step: transformedStep,
            appearsIn: [algorithmName],
          });
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return occurrences;
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('algorithmsFolder', {
      alias: 'f',
      description: 'The path of the folder containing the ESMeta ASTs of the Abstract Operations',
      type: 'string',
      demandOption: true,
    })
    .option('step', {
      alias: 's',
      description: 'The type name of a step in the ESMeta language',
      type: 'string',
      demandOption: true,
    })
    .option('output', {
        alias: 'o',
        description: 'The output file path',
        type: 'string',
        demandOption: true,
    })
    .option('algorithmExcludeFilter', {
        alias: 'e',
        description: `A set of Abstract Operation types to exclude`,
        type: 'array',
        choices: Object.keys(ALGORITHM_TYPE_TO_HEAD_KEY),
        default: [],
    })
    .help()
    .alias('help', 'h')
    .argv;

  const { algorithmsFolder, step, output, algorithmExcludeFilter } = argv;

  try {
    const occurrences = await analyze(algorithmsFolder, step, algorithmExcludeFilter as AlgorithmType[]);
    await fs.writeFile(output, JSON.stringify(occurrences, null, 2));
    console.log(`Analysis complete. Results saved to ${output}`);
  } catch (error) {
    console.error('An error occurred during analysis:', error);
  }
}


main();
