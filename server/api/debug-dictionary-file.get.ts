/**
 * Debug Dictionary File Access
 * Tests if dictionary file can be read on Vercel
 * GET /api/debug-dictionary-file
 */

import { join } from 'path'
import { readFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Debug [debug-dictionary-file]: Testing dictionary file access')
    
    const result = {
      timestamp: new Date().toISOString(),
      currentWorkingDirectory: process.cwd(),
      attemptedPath: '',
      fileExists: false,
      canRead: false,
      fileSize: 0,
      isValidJSON: false,
      error: null as string | null,
      entries: 0,
      metadata: null as any
    }
    
    // Test the same path the dictionary endpoint uses
    const dataPath = join(process.cwd(), 'server/data/diccionario_consolidado.json')
    result.attemptedPath = dataPath
    
    console.log('🔧 Debug [debug-dictionary-file]: Attempting to read:', dataPath)
    console.log('🔧 Debug [debug-dictionary-file]: Working directory:', process.cwd())
    
    try {
      const fileContent = await readFile(dataPath, 'utf-8')
      result.canRead = true
      result.fileSize = fileContent.length
      
      console.log('✅ Debug [debug-dictionary-file]: File read successful, size:', fileContent.length)
      
      // Test JSON parsing
      try {
        const data = JSON.parse(fileContent)
        result.isValidJSON = true
        
        if (data.metadata) {
          result.metadata = data.metadata
        }
        
        if (data.entries && Array.isArray(data.entries)) {
          result.entries = data.entries.length
        }
        
        console.log('✅ Debug [debug-dictionary-file]: JSON parsing successful')
        console.log('✅ Debug [debug-dictionary-file]: Entries found:', result.entries)
      } catch (jsonError: any) {
        result.error = `JSON parsing failed: ${jsonError.message}`
        console.error('❌ Debug [debug-dictionary-file]: JSON parsing failed:', jsonError.message)
      }
      
    } catch (readError: any) {
      result.error = `File read failed: ${readError.message}`
      result.canRead = false
      console.error('❌ Debug [debug-dictionary-file]: File read failed:', readError.message)
      console.error('❌ Debug [debug-dictionary-file]: Error code:', readError.code)
    }
    
    return { success: true, debug: result }
    
  } catch (error: any) {
    console.error('❌ Debug [debug-dictionary-file]: Unexpected error:', error)
    return {
      success: false,
      debug: {
        timestamp: new Date().toISOString(),
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack
      }
    }
  }
})