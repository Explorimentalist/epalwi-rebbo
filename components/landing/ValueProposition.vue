<template>
  <section class="value-proposition">
    <div class="value-container">
      <h2 class="ds-text-display-sm">
        {{ title }}
      </h2>

      <div class="value-content">
        <AnimatedParagraph 
          class="value-text" 
          :paragraph="content" 
          :offsetStart="0.65" 
          :offsetEnd="-0.75" 
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '¿Por qué Epàlwi‑Rèbbo?',
})

const content = `Epalwi-Rebbo nace con mi tio Próspero Mambo Matala Esua, el cual dedicó innumerables horas, a codificar y escribir las palabras de este diccionario. Con mi padre Evaristo Oko Kongwe, definieron la Grámatica de la Lengua Ndowe que ayuda a todos los pueblos que florecen del Ndowe a poder expresarse con una normativa que apoya la naturaleza del lenguaje Ndowe. El diccionario sigue esa normativa.  Pensado en todos los fines de semana que mi padre y mi tio se pasaron decodificando la lengua Ndowe, no he podido dejar que ese esfuerzo se desvaneciera.  Así que durante horas muertas los fines de semana, he creado Epalwi Rebbo.

Epalwi Rebo está dirigido a apoyar a todo Ndowe (mayoritariamente en la diáspora) a familiarizarse con su lengua y por que no transmitir ese conocimiento a las nuevas generaciones.

Epalwi Rebbo traduce una palabra en lo que tardas en escribir. Funciona aunque no estés online. Si quieres usarlo te puedes subscribir por €1 al mes. Hay un periodo de 14 días de prueba.

Epalwi rebbo no es un proyecto aislado, queremos que evolucione. Aún quedan muchas palabras que añadir y queremos que se puedan formar frases algún día. Ayuda a nuestra preservación cultural.`
</script>

<style lang="scss" scoped>
.value-proposition {
  // Design System V2 - Modern background and spacing
  padding: var(--ds-spacing-10) var(--ds-spacing-2);
  background: var(--ds-card);
  border-top: 1px solid var(--ds-border);
  
  .value-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .value-content {
    max-width: 800px;
    margin: var(--ds-spacing-2) auto 0;
  }

  .value-text {
    font-family: var(--ds-font-sans);
    font-size: var(--ds-font-size-xs); /* 32px from design system */
    color: var(--ds-foreground);
    line-height: 1.5em;
    white-space: pre-wrap; /* Preserve line breaks in provided text */
  }
}

/* Responsive Design - Design System V2 */
@media (max-width: 768px) {
  .value-proposition {
    padding: var(--ds-spacing-8) var(--ds-spacing-2);

    .value-text { font-size: var(--ds-font-size-xs); }
  }
}

@media (min-width: 1024px) {
  .value-proposition {
    padding: var(--ds-spacing-10) var(--ds-spacing-3);

    .value-text { font-size: var(--ds-font-size-xs); }
  }
}

/* Design System V2 Animations */
@keyframes ds-slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ds-slideLeft {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Reduced motion support - Design System V2 */
@media (prefers-reduced-motion: reduce) {
  .section-title,
  .value-item {
    animation: none !important;
  }
  
  .value-item:hover {
    transition: none !important;
    transform: none !important;
  }
}
</style>
