/**
 * Dictionary Data Module
 * Imports dictionary data as a module to ensure it's included in Vercel deployment
 */

import dictionaryData from './diccionario_consolidado.json'
import type { DictionaryData } from '~/types/dictionary'

// Export the dictionary data with proper typing
export const dictionary: DictionaryData = dictionaryData as DictionaryData

// Export helper functions
export function getDictionaryEntries() {
  return dictionary.entries
}

export function getDictionaryMetadata() {
  return dictionary.metadata
}

export function getDictionarySize() {
  return dictionary.entries?.length || 0
}