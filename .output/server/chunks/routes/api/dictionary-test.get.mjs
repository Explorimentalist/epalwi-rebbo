import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'firebase-functions';

const dictionaryTest_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const projectRoot = process.cwd();
    const dataPath = join(projectRoot, "server/data/diccionario_consolidado.json");
    console.log("\u{1F4CD} Project root:", projectRoot);
    console.log("\u{1F4C1} Data path:", dataPath);
    const fileContent = await readFile(dataPath, "utf-8");
    const preview = fileContent.substring(0, 1e3);
    const data = JSON.parse(fileContent);
    return {
      success: true,
      info: {
        projectRoot,
        dataPath,
        fileSize: fileContent.length,
        preview,
        metadata: data.metadata,
        entriesCount: ((_a = data.entries) == null ? void 0 : _a.length) || 0
      }
    };
  } catch (error) {
    console.error("\u274C Test API error:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0,
        projectRoot: process.cwd()
      }
    };
  }
});

export { dictionaryTest_get as default };
//# sourceMappingURL=dictionary-test.get.mjs.map
