<script setup lang="ts">
import HeroSection from './HeroSection.vue'
</script>

<template>
  <Story title="Landing/HeroSection" :layout="{ type: 'fullscreen' }">
    <Variant title="Default">
      <HeroSection 
        @primary-cta="() => console.log('Primary CTA clicked')"
        @secondary-cta="() => console.log('Secondary CTA clicked')"
      />
    </Variant>
    
    <Variant title="Custom Content">
      <HeroSection 
        headline="¡Aprende Ndowe Hoy!"
        subheading="Descubre el idioma de Guinea Ecuatorial con nuestro diccionario interactivo y herramientas de aprendizaje."
        primary-cta-text="Comenzar Ahora"
        secondary-cta-text="Explorar Diccionario"
        @primary-cta="() => console.log('Custom Primary CTA clicked')"
        @secondary-cta="() => console.log('Custom Secondary CTA clicked')"
      />
    </Variant>
    
    <Variant title="No Visual">
      <HeroSection 
        @primary-cta="() => console.log('Primary CTA clicked')"
        @secondary-cta="() => console.log('Secondary CTA clicked')"
      />
    </Variant>
  </Story>
</template>