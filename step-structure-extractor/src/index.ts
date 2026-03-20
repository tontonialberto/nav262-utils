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

interface ParentAndRoleOccurrence {
  parentAndRole: string;
  appearsIn: string[];
}

interface ConceptOccurrence {
  concept: string;
  occurrences: number;
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
  files = files.filter(file => !file.endsWith('RunJobs.json'));  
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

async function analyzeParentAndRole(algorithmsFolder: string, stepType: string, algorithmExcludeFilter: AlgorithmType[]): Promise<ParentAndRoleOccurrence[]> {
  const occurrences: ParentAndRoleOccurrence[] = [];
  let files = await glob(`${algorithmsFolder}/**/*.json`);

  files = await filterAlgorithmFiles(files, algorithmExcludeFilter);

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(content);
      const algorithmName = path.basename(file, '.json');

      const results = JSONPath({ path: `$.Algorithm.body..${stepType}`, json, resultType: 'pointer' });

      for (const result of results) {
        if (typeof result === 'string') {
          // Filter out array index segments (segments that are only digits)
          const pathSegments = result.split('/').filter(segment => !/^\d+$/.test(segment));
          const parts = pathSegments.slice(-3, -1);
          if (parts.length === 2) {
            const parentAndRole = parts.join('.');

            const existingOccurrence = occurrences.find((o) => o.parentAndRole === parentAndRole);

            if (existingOccurrence) {
              if (!existingOccurrence.appearsIn.includes(algorithmName)) {
                existingOccurrence.appearsIn.push(algorithmName);
              }
            } else {
              occurrences.push({
                parentAndRole,
                appearsIn: [algorithmName],
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return occurrences;
}

function isUpperCase(str: string): boolean {
  return str.length > 0 && str.charAt(0) === str.charAt(0).toUpperCase() && /^[A-Z]/.test(str);
}

function collectConcepts(obj: any, concepts: Map<string, number>): void {
  if (obj === null || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectConcepts(item, concepts);
    }
    return;
  }

  // Process object keys
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (isUpperCase(key)) {
        concepts.set(key, (concepts.get(key) || 0) + 1);
      }
      collectConcepts(obj[key], concepts);
    }
  }
}

async function analyzeConcepts(algorithmsFolder: string, algorithmExcludeFilter: AlgorithmType[]): Promise<ConceptOccurrence[]> {
  const conceptsMap = new Map<string, number>();
  let files = await glob(`${algorithmsFolder}/**/*.json`);

  files = await filterAlgorithmFiles(files, algorithmExcludeFilter);

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(content);

      collectConcepts(json, conceptsMap);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  // Convert map to sorted array (by occurrences descending, then by name ascending)
  const concepts: ConceptOccurrence[] = Array.from(conceptsMap.entries())
    .map(([concept, occurrences]) => ({ concept, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences || a.concept.localeCompare(b.concept));

  return concepts;
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
      demandOption: false,
    })
    .option('analyzeConcepts', {
      alias: 'c',
      description: 'Analyze and count all uppercase concept names in the specification',
      type: 'boolean',
      default: false,
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

  const { algorithmsFolder, step, analyzeConcepts: shouldAnalyzeConcepts, algorithmExcludeFilter } = argv;

  try {
    if (shouldAnalyzeConcepts) {
      // Analyze concepts
      const statsDir = path.join('stats');
      await fs.mkdir(statsDir, { recursive: true });

      const concepts = await analyzeConcepts(algorithmsFolder, algorithmExcludeFilter as AlgorithmType[]);
      const conceptsOutputPath = path.join(statsDir, 'concepts.json');
      await fs.writeFile(conceptsOutputPath, JSON.stringify(concepts, null, 2));
      console.log(`Concepts analysis complete. Results saved to ${conceptsOutputPath}`);
      console.log(`Found ${concepts.length} unique concepts.`);
    } else {
      // Original step analysis
      if (!step) {
        console.error('Error: --step is required when not using --analyzeConcepts');
        process.exit(1);
      }

      // Ensure output directories exist
      const stepsDir = path.join('resources', 'steps');
      const parentsDir = path.join('resources', 'parents');
      await fs.mkdir(stepsDir, { recursive: true });
      await fs.mkdir(parentsDir, { recursive: true });

      // Analyze step structures
      const occurrences = await analyze(algorithmsFolder, step, algorithmExcludeFilter as AlgorithmType[]);
      const stepsOutputPath = path.join(stepsDir, `${step}.json`);
      await fs.writeFile(stepsOutputPath, JSON.stringify(occurrences, null, 2));
      console.log(`Step analysis complete. Results saved to ${stepsOutputPath}`);

      // Analyze parent and role structures
      const parentAndRoleOccurrences = await analyzeParentAndRole(algorithmsFolder, step, algorithmExcludeFilter as AlgorithmType[]);
      const parentsOutputPath = path.join(parentsDir, `${step}.json`);
      await fs.writeFile(parentsOutputPath, JSON.stringify(parentAndRoleOccurrences, null, 2));
      console.log(`Parent and role analysis complete. Results saved to ${parentsOutputPath}`);
    }
  } catch (error) {
    console.error('An error occurred during analysis:', error);
  }
}


main();
