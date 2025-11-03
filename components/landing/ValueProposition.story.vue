<script setup lang="ts">
import ValueProposition from './ValueProposition.vue'
</script>

<template>
  <Story title="Landing/ValueProposition">
    <Variant title="Default">
      <ValueProposition />
    </Variant>
    
    <Variant title="Custom Title">
      <ValueProposition 
        title="¿Por qué elegir nuestro diccionario?"
      />
    </Variant>
    
    <Variant title="Custom Values">
      <ValueProposition 
        title="Beneficios únicos"
        :value-points="[
          'Interfaz intuitiva y fácil de usar.',
          'Base de datos actualizada constantemente.',
          'Soporte multiplataforma (web, móvil, desktop).',
          'Comunidad activa de hablantes nativos.',
          'Ejercicios interactivos para mejorar el aprendizaje.'
        ]"
      />
    </Variant>
    
    <Variant title="Short List">
      <ValueProposition 
        title="Ventajas principales"
        :value-points="[
          'Rápido y eficiente.',
          'Completamente gratuito.'
        ]"
      />
    </Variant>
  </Story>
</template>