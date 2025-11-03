<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <h3 class="logo-text">epàlwi-rèbbo</h3>
        </div>
        <p class="footer-description">
          Diccionario español-ndowe para la preservacion de nuestro idioma.
        </p>
      </div>
      
      <div class="footer-section">
        <h4 class="ds-card-title footer-title">Enlaces Rápidos</h4>
        <div class="footer-links">
          <NuxtLink to="/" class="footer-link">Inicio</NuxtLink>
          <NuxtLink to="/subscription/plans" class="footer-link">Planes</NuxtLink>
          <NuxtLink to="/auth/signup" class="footer-link">Crear Cuenta</NuxtLink>
          <NuxtLink to="/auth/login" class="footer-link">Iniciar Sesión</NuxtLink>
        </div>
      </div>
      
      <div class="footer-section">
        <h4 class="ds-card-title footer-title">Soporte</h4>
        <div class="footer-links">
          <NuxtLink to="/sugerencias" class="footer-link">Sugerencias</NuxtLink>
          <NuxtLink to="/privacy" class="footer-link">Privacidad</NuxtLink>
          <NuxtLink to="/terms" class="footer-link">Términos y Condiciones</NuxtLink>
          <a href="mailto:Ngatye@hey-oko.com" class="footer-link">Email: Ngatye@hey-oko.com</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p class="footer-copyright">
        © 2025 epàlwi-rèbbo. Todos los derechos reservados.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component - no props needed for now
</script>

<style lang="scss" scoped>
.footer {
  background: var(--ds-primary); // Terracotta color (#D45B41)
  color: white;
  padding: var(--ds-spacing-4) var(--ds-spacing-2) var(--ds-spacing-2);
  margin-top: var(--ds-spacing-6);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ds-spacing-8);
  max-width: 1200px;
  margin: 0 auto var(--ds-spacing-8);
}

.footer-section {
  .footer-logo {
    margin-bottom: var(--ds-spacing-2);
    
    .logo-text {
      font-family: var(--ds-font-display);
      font-size: var(--ds-font-size-s);
      font-weight: 500;
      color: white;
      margin: 0;
      letter-spacing: -0.02em;
    }
  }
  
  .footer-title {
    font-size: var(--ds-font-size-copy-16); // 14px - appropriate for footer sections
    font-weight: 500; // Consistent with global heading weight
    margin-bottom: var(--ds-spacing-1);
    color: white;
    letter-spacing: 0.05em;
  }
  
  .footer-description {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    font-size: var(--ds-font-size-copy-14);
    max-width: 280px;
  }
  
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-1);
    
    .footer-link {
      color: rgba(255, 255, 255, 0.9);
      font-size: var(--ds-font-size-copy-14);
      font-weight: 400;
      text-decoration: none;
      transition: all var(--ds-duration) var(--ds-ease);
      
      &:hover {
        color: white;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--ds-spacing-6);
  text-align: center;
  
  .footer-preservation {
    color: rgba(255, 255, 255, 0.95);
    font-size: var(--ds-font-size-copy-16);
    font-weight: 600; // Emphasize the mission statement
    margin-bottom: var(--ds-spacing-1);
    line-height: 1.4;
    font-style: italic;
  }
  
  .footer-copyright {
    color: rgba(255, 255, 255, 0.7);
    font-size: var(--ds-font-size-copy-12);
    font-weight: 400;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: left;
  }
  
  .footer-section {
    .footer-links {
      align-items: flex-start;
    }
  }
  
  .footer-bottom {
    text-align: left;
  }
}
</style>
