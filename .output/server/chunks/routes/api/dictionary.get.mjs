import { d as defineEventHandler, s as setHeader, b as getMethod, c as createError, g as getHeader, e as setResponseStatus } from '../../nitro/nitro.mjs';
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

let cachedDictionary = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1e3;
async function loadDictionaryFromFile() {
  try {
    const dataPath = join(process.cwd(), "server/data/diccionario_consolidado.json");
    const fileContent = await readFile(dataPath, "utf-8");
    const data = JSON.parse(fileContent);
    if (!data.metadata || !data.entries || !Array.isArray(data.entries)) {
      throw new Error("Invalid dictionary data structure");
    }
    console.log(`\u{1F4DA} Dictionary loaded: ${data.metadata.total_entries} entries`);
    return data;
  } catch (error) {
    console.error("\u274C Failed to load dictionary:", error);
    throw error;
  }
}
async function getDictionaryData() {
  const now = Date.now();
  if (cachedDictionary && now - cacheTimestamp < CACHE_DURATION) {
    console.log("\u{1F4D6} Serving cached dictionary data");
    return cachedDictionary;
  }
  console.log("\u{1F504} Loading fresh dictionary data");
  cachedDictionary = await loadDictionaryFromFile();
  cacheTimestamp = now;
  return cachedDictionary;
}
const dictionary_get = defineEventHandler(async (event) => {
  try {
    if (false) ;
    if (getMethod(event) === "OPTIONS") {
      return { success: true };
    }
    if (getMethod(event) !== "GET") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method Not Allowed"
      });
    }
    const data = await getDictionaryData();
    setHeader(event, "Content-Type", "application/json");
    setHeader(event, "Cache-Control", "public, max-age=600");
    const etag = `"${data.metadata.version}-${data.metadata.total_entries}"`;
    setHeader(event, "ETag", etag);
    const ifNoneMatch = getHeader(event, "if-none-match");
    if (ifNoneMatch === etag) {
      setResponseStatus(event, 304);
      return { success: true, cached: true };
    }
    console.log(`\u{1F4E4} Serving dictionary API: ${data.metadata.total_entries} entries`);
    return {
      success: true,
      data,
      cached: cachedDictionary === data && Date.now() - cacheTimestamp > 0,
      version: data.metadata.version
    };
  } catch (error) {
    console.error("\u274C Dictionary API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        success: false,
        error: errorMessage
      }
    });
  }
});

export { dictionary_get as default };
//# sourceMappingURL=dictionary.get.mjs.map
