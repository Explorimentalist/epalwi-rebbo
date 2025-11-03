<script setup lang="ts">
import HowItWorks from './HowItWorks.vue'
</script>

<template>
  <Story title="Landing/HowItWorks">
    <Variant title="Default">
      <HowItWorks />
    </Variant>
    
    <Variant title="Custom Title">
      <HowItWorks 
        title="Pasos para empezar"
      />
    </Variant>
    
    <Variant title="Simple Steps">
      <HowItWorks 
        title="Proceso fácil"
        :steps="[
          'Regístrate gratis.',
          'Busca cualquier palabra.',
          'Disfruta aprendiendo.'
        ]"
      />
    </Variant>
    
    <Variant title="Detailed Steps">
      <HowItWorks 
        title="Guía completa de uso"
        :steps="[
          'Crea tu cuenta personal con email o Google.',
          'Explora las diferentes secciones del diccionario.',
          'Utiliza los filtros avanzados para búsquedas precisas.',
          'Guarda tus palabras favoritas en listas personales.',
          'Practica con ejercicios interactivos diarios.',
          'Conecta con otros estudiantes en la comunidad.',
          'Evalúa tu progreso con estadísticas detalladas.'
        ]"
      />
    </Variant>
  </Story>
</template>