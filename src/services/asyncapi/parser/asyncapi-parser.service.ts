import YAML from 'yaml';
import { ControllerResponse } from '@/models/ControllerResponse';
import { AsyncAPIDocument } from '../models/asyncapi.types';
import extractChannelGroups from './channel-extractor';

function resolveRef(root: any, ref: string): any {
  const path = ref.replace(/^#\//, '').split('/');
  let current = root;
  path.some((segment) => {
    current = current?.[segment];
    return current === undefined;
  });
  return current;
}

function dereferenceObject(
  root: any,
  obj: any,
  visited: Set<any> = new Set(),
  refStack: Set<string> = new Set(),
): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (visited.has(obj)) return obj;
  visited.add(obj);

  if (obj.$ref && typeof obj.$ref === 'string') {
    if (refStack.has(obj.$ref)) {
      const refName = obj.$ref.replace(/^#\/components\/schemas\//, '');
      return { type: 'object', title: refName, _circularRef: obj.$ref };
    }
    const resolved = resolveRef(root, obj.$ref);
    if (resolved) {
      refStack.add(obj.$ref);
      const result = dereferenceObject(root, JSON.parse(JSON.stringify(resolved)), new Set(), refStack);
      refStack.delete(obj.$ref);
      return result;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => dereferenceObject(root, item, visited, refStack));
  }

  const result: any = {};
  Object.keys(obj).forEach((key) => {
    result[key] = dereferenceObject(root, obj[key], visited, refStack);
  });
  return result;
}

function parseAsyncApiContent(content: string): AsyncAPIDocument {
  const trimmed = content.trim();
  let parsed: any;

  if (trimmed.startsWith('{')) {
    parsed = JSON.parse(trimmed);
  } else {
    parsed = YAML.parse(trimmed);
  }

  return dereferenceObject(parsed, parsed) as AsyncAPIDocument;
}

export class AsyncApiParserService {
  private parsedDocument: AsyncAPIDocument | null = null;

  private rawDocument: AsyncAPIDocument | null = null;

  parseFile(fileContent: string): ControllerResponse[] {
    const trimmed = fileContent.trim();
    if (trimmed.startsWith('{')) {
      this.rawDocument = JSON.parse(trimmed) as AsyncAPIDocument;
    } else {
      this.rawDocument = YAML.parse(trimmed) as AsyncAPIDocument;
    }

    const parsed = parseAsyncApiContent(fileContent);
    this.parsedDocument = parsed;
    return extractChannelGroups(parsed, this.rawDocument);
  }

  getParsedDocument(): AsyncAPIDocument | null {
    return this.parsedDocument;
  }

  getRawDocument(): AsyncAPIDocument | null {
    return this.rawDocument;
  }
}

export default new AsyncApiParserService();
