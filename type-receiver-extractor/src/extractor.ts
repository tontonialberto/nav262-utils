import * as fs from 'fs';
import * as path from 'path';
import { JSONPath } from 'jsonpath-plus';
import { AlgorithmFile, TypeInfo, ExtractorOutput } from './types';

export class TypeReceiverExtractor {
  private results: Map<string, Set<string>> = new Map();
  private errors: string[] = [];

  async extractFromFolder(folderPath: string): Promise<ExtractorOutput> {
    const jsonFiles = this.getJsonFiles(folderPath);
    
    for (const filePath of jsonFiles) {
      try {
        await this.processFile(filePath);
      } catch (error) {
        this.errors.push(`Error processing ${filePath}: ${error}`);
        console.warn(`Skipping ${filePath}: ${error}`);
      }
    }

    return this.generateOutput();
  }

  private getJsonFiles(folderPath: string): string[] {
    const files = fs.readdirSync(folderPath);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(folderPath, file));
  }

  private async processFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf8');
    const data: AlgorithmFile = JSON.parse(content);
    const fileName = path.basename(filePath, '.json');

    // Extract numeric method types
    const numericTypes = JSONPath({ path: '$.Algorithm.head.NumericMethodHead.baseTy', json: data });
    for (const type of numericTypes) {
      this.addResult('numeric', type, fileName);
    }

    // Extract internal method types
    const internalTypes = JSONPath({ path: '$.Algorithm.head.InternalMethodHead.receiver.Param.ty', json: data });
    for (const type of internalTypes) {
      this.addResult('internal', type, fileName);
    }

    // Extract concrete method types
    const concreteTypes = JSONPath({ path: '$.Algorithm.head.ConcreteMethodHead.receiver.Param.ty', json: data });
    for (const type of concreteTypes) {
      this.addResult('concrete', type, fileName);
    }
  }

  private addResult(category: string, type: string, fileName: string): void {
    const key = `${category}:${type}`;
    if (!this.results.has(key)) {
      this.results.set(key, new Set());
    }
    this.results.get(key)!.add(fileName);
  }

  private generateOutput(): ExtractorOutput {
    const output: ExtractorOutput = {
      "concrete method receivers": [],
      "numeric method receivers": [],
      "internal method receivers": []
    };

    for (const [key, fileNames] of this.results) {
      const [category, type] = key.split(':');
      const typeInfo: TypeInfo = {
        type,
        appearsIn: Array.from(fileNames).sort()
      };

      switch (category) {
        case 'concrete':
          output["concrete method receivers"].push(typeInfo);
          break;
        case 'numeric':
          output["numeric method receivers"].push(typeInfo);
          break;
        case 'internal':
          output["internal method receivers"].push(typeInfo);
          break;
      }
    }

    // Sort by type name
    output["concrete method receivers"].sort((a, b) => a.type.localeCompare(b.type));
    output["numeric method receivers"].sort((a, b) => a.type.localeCompare(b.type));
    output["internal method receivers"].sort((a, b) => a.type.localeCompare(b.type));

    return output;
  }

  getErrors(): string[] {
    return this.errors;
  }

  getStats(): { totalTypes: number; totalFiles: number; errors: number } {
    const totalFiles = new Set<string>();
    for (const fileNames of this.results.values()) {
      for (const fileName of fileNames) {
        totalFiles.add(fileName);
      }
    }

    return {
      totalTypes: this.results.size,
      totalFiles: totalFiles.size,
      errors: this.errors.length
    };
  }
}
