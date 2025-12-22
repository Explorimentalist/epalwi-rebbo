<template>
  <section class="social-proof">
    <div class="social-proof-content">
      <div class="endorsement-heading">
        <h3 class="ds-text-display-sm heading-white">Respaldado por expertos</h3>
      </div>
      <blockquote class="testimonial">
        <p class="testimonial-text">
          "Con el respaldo de Mutudu Vyanga, autor de 
          'La Gramática de la lengua Ndowe' y expresidente de 
          la asociación Rhombe."
        </p>
      </blockquote>
    </div>
  </section>
</template>

<script setup lang="ts">
// No props needed for this static component
</script>

<style lang="scss" scoped>
.social-proof {
  padding: var(--ds-spacing-8) var(--ds-spacing-2);
  background: var(--ds-primary);
  position: relative;
  overflow: hidden;

}

.social-proof-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.endorsement-heading {
  text-align: center;
  margin-bottom: var(--ds-spacing-4);
}

.heading-white {
  color: white;
}



.testimonial {
  margin: 0;
  position: relative;
}

.testimonial-text {
  font-size: var(--ds-font-size-xs);
  line-height: 1.5;
  color: white;
  font-weight: 300;
  font-style: italic;
  margin: 0;
  padding: var(--ds-spacing-1) 0;
  max-width: 600px;
  margin: 0 auto;
}


/* Responsive Design */
@media (max-width: 640px) {
  .social-proof {
    padding: var(--ds-spacing-6) var(--ds-spacing-1);
  }


  .testimonial-text {
    font-size: var(--ds-font-size-copy-16);
    padding: var(--ds-spacing-2) var(--ds-spacing-1);
  }

}

@media (max-width: 479px) {
  .testimonial-text {
    font-size: var(--ds-font-size-copy-14);
  }
}
</style>