import { defineSetupVue3 } from '@histoire/plugin-vue'
import { createPinia } from 'pinia'

export const setupVue3 = defineSetupVue3(({ app }) => {
  // Add Pinia for state management
  const pinia = createPinia()
  app.use(pinia)
  
  // Global CSS imports
  import('./assets/styles/main.scss')
  
  // Global component registration for components used in stories
  // This allows auto-import of components like in Nuxt
  const components = import.meta.glob('./components/**/*.vue', { eager: true })
  
  Object.entries(components).forEach(([path, component]) => {
    const componentName = path.split('/').pop()?.replace('.vue', '')
    if (componentName && typeof component === 'object' && component !== null && 'default' in component) {
      app.component(componentName, (component as any).default)
    }
  })
}) 