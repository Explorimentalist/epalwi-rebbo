<template>
  <FAQComponent
    title="Problemas Comunes"
    :faqs="faqs"
  />
</template>

<script setup lang="ts">
import type { FAQ } from '~/components/common/FAQComponent.vue'

const faqs: FAQ[] = [
  {
    question: "¿Por qué se canceló mi pago?",
    answer: "Los pagos pueden cancelarse por varios motivos: tarjeta rechazada, fondos insuficientes, o cancelación manual durante el proceso."
  },
  {
    question: "¿Se me cobrará algo?",
    answer: "No, no se realizará ningún cargo. Solo se cobra cuando el pago es exitoso y completo."
  },
  {
    question: "¿Puedo usar otra tarjeta?",
    answer: "Sí, puedes intentar con cualquier tarjeta de crédito o débito válida. También puedes probar con PayPal u otros métodos disponibles."
  },
  {
    question: "¿Qué hago si el pago sigue fallando?",
    answer: "Verifica que tu tarjeta tenga fondos suficientes, que no esté vencida, y que los datos sean correctos. Si persiste el problema, contacta a tu banco o a nuestro soporte."
  },
  {
    question: "¿Puedo seguir usando la prueba gratuita?",
    answer: "Sí, tu período de prueba gratuita de 14 días sigue activo. Puedes continuar usando todas las funciones durante este tiempo."
  }
]
</script>

