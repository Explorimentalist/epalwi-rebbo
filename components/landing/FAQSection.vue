<template>
  <FAQComponent
    title="Preguntas Frecuentes"
    :faqs="faqs"
  />
</template>

<script setup lang="ts">
import type { FAQ } from '~/components/common/FAQComponent.vue'

const faqs: FAQ[] = [
  {
    question: "¿Cuántos días hay de prueba?",
    answer: "Hay 14 días de prueba gratis para que pruebes el diccionario sin compromiso."
  },
  {
    question: "¿Puedo cancelar mi subscripción en cualquier momento?",
    answer: "Sí. Puedes cancelar cuando quieras desde tu cuenta sin cargos ocultos."
  },
  {
    question: "¿Hay una versión iOS o Android de la app?",
    answer: "No, Epàlwi‑Rèbbo aún no está disponible en iOS o en Android, pero estamos trabajando en ello."
  },
  {
    question: "¿Qué hago si no encuentro una palabra?",
    answer: "Ve al apartado de sugerencias y sugerir palabras en la app o contacta con nosotros para añadirla al diccionario."
  },
  {
    question: "¿Con quién contacto si tengo algún problema?",
    answer: "Visita la sección de contacto o escribe a soporte@epalwi‑rebbo.com y te ayudaremos."
  }
]
</script>

