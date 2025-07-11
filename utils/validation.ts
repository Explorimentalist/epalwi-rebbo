/**
 * Validation Utilities
 * Reusable validation functions for forms and inputs
 */

export type ValidationResult = {
  isValid: boolean
  message: string | null
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { isValid: false, message: 'El email es requerido' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'El email no es válido' }
  }
  
  return { isValid: true, message: null }
}

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string = 'Este campo'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} es requerido` }
  }
  
  return { isValid: true, message: null }
}

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number): ValidationResult => {
  if (value.length < minLength) {
    return { isValid: false, message: `Debe tener al menos ${minLength} caracteres` }
  }
  
  return { isValid: true, message: null }
}

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'La contraseña es requerida' }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
  }
  
  return { isValid: true, message: null }
}