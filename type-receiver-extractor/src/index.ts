import * as fs from 'fs';
import * as path from 'path';
import { TypeReceiverExtractor } from './extractor';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npm run dev <input-folder> [output-file]');
    console.error('Example: npm run dev ./algorithms ./output.json');
    process.exit(1);
  }

  const inputFolder = args[0];
  const outputFile = args[1] || './type-receivers.json';

  if (!fs.existsSync(inputFolder)) {
    console.error(`Input folder does not exist: ${inputFolder}`);
    process.exit(1);
  }

  if (!fs.statSync(inputFolder).isDirectory()) {
    console.error(`Input path is not a directory: ${inputFolder}`);
    process.exit(1);
  }

  console.log(`Processing JSON files in: ${inputFolder}`);
  console.log(`Output will be written to: ${outputFile}`);

  const extractor = new TypeReceiverExtractor();
  
  try {
    const result = await extractor.extractFromFolder(inputFolder);
    
    // Write output
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    
    // Print statistics
    const stats = extractor.getStats();
    console.log(`\nExtraction completed successfully!`);
    console.log(`- Total unique types found: ${stats.totalTypes}`);
    console.log(`- Total files processed: ${stats.totalFiles}`);
    console.log(`- Errors encountered: ${stats.errors}`);
    
    if (stats.errors > 0) {
      console.log(`\nErrors:`);
      extractor.getErrors().forEach(error => console.log(`  ${error}`));
    }
    
    console.log(`\nResults written to: ${path.resolve(outputFile)}`);
    
  } catch (error) {
    console.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

main().catch(console.error);
