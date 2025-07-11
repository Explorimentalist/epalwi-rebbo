/**
 * Simple Dictionary Test API Endpoint
 * Tests basic file reading and path resolution
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Test path resolution
    const projectRoot = process.cwd()
    const dataPath = join(projectRoot, 'server/data/diccionario_consolidado.json')
    
    console.log('📍 Project root:', projectRoot)
    console.log('📁 Data path:', dataPath)
    
    // Check if file exists by attempting to read first 1000 characters
    const fileContent = await readFile(dataPath, 'utf-8')
    const preview = fileContent.substring(0, 1000)
    
    // Parse minimal metadata
    const data = JSON.parse(fileContent)
    
    return {
      success: true,
      info: {
        projectRoot,
        dataPath,
        fileSize: fileContent.length,
        preview: preview,
        metadata: data.metadata,
        entriesCount: data.entries?.length || 0
      }
    }
    
  } catch (error) {
    console.error('❌ Test API error:', error)
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        projectRoot: process.cwd()
      }
    }
  }
}) 