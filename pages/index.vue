<template>
  <div class="landing-page">
    <!-- Navigation Bar -->
    <NavigationBar current-page="/" />
    
    <!-- Hero Section -->
    <section class="hero text-center">
      <h1 class="hero-title">
        Bienvenido al Diccionario Español-Ndowe
      </h1>
      <p class="hero-subtitle">
        Preserva y aprende el idioma Ndowe con nuestro diccionario offline. 
        Traduce palabras entre español y ndowe sin necesidad de conexión a internet.
      </p>
      

      <!-- Hero Subtitle (Moved below CTA buttons) -->
      <p class="hero-subtitle-moved">
        Preserva y aprende el idioma Ndowe con nuestro diccionario offline. 
        Traduce palabras entre español y ndowe sin necesidad de conexión a internet.
      </p>
    </section>
    
    <!-- Features Section -->
    <section class="features">
      <h3 class="features-title">
        Características Principales
      </h3>
      
      <div class="features-grid">
        <!-- Offline Feature -->
        <div class="feature-card">
          <h4 class="feature-title">Funciona sin Internet</h4>
          <p class="feature-description">
            Accede al diccionario completo sin conexión. Perfecto para estudiar en cualquier lugar.
          </p>
        </div>
        
        <!-- Bilingual Feature -->
        <div class="feature-card">
          <h4 class="feature-title">Bidireccional</h4>
          <p class="feature-description">
            Traduce del español al ndowe y viceversa. Búsqueda inteligente en ambos idiomas.
          </p>
        </div>
        
        <!-- Cultural Feature -->
        <div class="feature-card">
          <h4 class="feature-title">Preservación Cultural</h4>
          <p class="feature-description">
            Contribuye a mantener vivo el idioma ndowe para las futuras generaciones.
          </p>
        </div>
      </div>
    </section>
    
    <!-- Subscription Plans Section -->
    <section class="subscription-plans">
      <h3 class="subscription-plans-title">
        Elige tu Plan
      </h3>
      <p class="subscription-plans-subtitle">
        Comienza tu prueba gratuita de 14 días. Cancela cuando quieras.
      </p>
      
      <div class="plans-grid">
        <PricingCard
          :plan="{
            id: 'monthly',
            title: 'Plan Mensual',
            price: 1,
            period: 'por mes',
            features: [
              'Acceso completo al diccionario',
              'Búsqueda offline',
              'Sin anuncios',
              'Cancela cuando quieras'
            ],
            icon: 'credit-card',
            popular: false,
            savings: 0,
            priceId: 'price_monthly'
          }"
          @plan-selected="handlePlanSelection"
        />
        
        <PricingCard
          :plan="{
            id: 'annual',
            title: 'Plan Anual',
            price: 8.97,
            period: 'por año',
            features: [
              'Acceso completo al diccionario',
              'Búsqueda offline',
              'Sin anuncios',
              'Cancela cuando quieras',
              'Ahorras €3.03 al año'
            ],
            icon: 'trophy',
            popular: true,
            savings: 3.03,
            priceId: 'price_annual'
          }"
          @plan-selected="handlePlanSelection"
        />
      </div>
    </section>
    

    
    <!-- Installation Prompt (PWA) -->
    <section v-if="showInstallPrompt" class="install-prompt">
      <div class="install-card">
        <Icon name="download" class="install-icon" />
        <h4 class="install-title">¡Instala la aplicación!</h4>
        <p class="install-description">
          Instala epàlwi-rèbbo en tu dispositivo para acceso rápido y función offline.
        </p>
        <button 
          @click="installApp"
          class="install-button"
        >
          <Icon name="download" class="button-icon" />
          Instalar Aplicación
        </button>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4 class="footer-title">epàlwi-rèbbo</h4>
          <p class="footer-description">
            Preservando el idioma Ndowe para las futuras generaciones
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">Enlaces Rápidos</h4>
          <div class="footer-links">
            <NuxtLink to="/dictionary" class="footer-link">Diccionario</NuxtLink>
            <NuxtLink to="/subscription/plans" class="footer-link">Planes</NuxtLink>
            <NuxtLink to="/auth/signup" class="footer-link">Crear Cuenta</NuxtLink>
            <NuxtLink to="/auth/login" class="footer-link">Iniciar Sesión</NuxtLink>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">Soporte</h4>
          <div class="footer-links">
            <NuxtLink to="/help" class="footer-link">Centro de Ayuda</NuxtLink>
            <NuxtLink to="/contact" class="footer-link">Contacto</NuxtLink>
            <NuxtLink to="/privacy" class="footer-link">Privacidad</NuxtLink>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="footer-copyright">
          © 2024 epàlwi-rèbbo. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Diccionario Español-Ndowe | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Diccionario offline español-ndowe para preservar el idioma. Funciona sin internet.' 
    }
  ]
})

// Auth store for conditional rendering
const authStore = useAuthStore()

// PWA Installation (simplified for Phase 1)
const showInstallPrompt = ref(false)

// Install app function (placeholder)
const installApp = async () => {
  // Will be implemented in Phase 7
  console.log('PWA installation will be implemented in Phase 7')
}

// Handle plan selection
const handlePlanSelection = (plan: any) => {
  console.log('Plan selected:', plan)
  // Navigate to subscription plans page for full flow
  navigateTo('/subscription/plans')
}

// Log for development
onMounted(() => {
  if (process.dev) {
    console.log('Landing page mounted')
    console.log('Auth state:', authStore.isAuthenticated)
  }
})
</script>

<style lang="scss" scoped>
.landing-page {
  animation: fadeIn 0.6s ease-out;
  min-height: 100vh;
}

/* Hero Section */
.hero {
  padding: var(--space-16) var(--space-6) var(--space-12);
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-primary) 100%);
  text-align: center;
}

.hero-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-6);
  line-height: var(--line-height-tight);
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--color-text-muted);
  max-width: 800px;
  margin: 0 auto var(--space-10);
  line-height: var(--line-height-normal);
}

.hero-subtitle-moved {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  max-width: 800px;
  margin: var(--space-8) auto 0;
  line-height: var(--line-height-normal);
  text-align: center;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-bottom: var(--space-12);
  flex-wrap: wrap;
}

.hero-button {
  height: var(--space-12);
  padding: 0 var(--space-8);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all 0.15s ease-in-out;
  
  .button-icon {
    width: 20px;
    height: 20px;
  }
  
  &.primary {
    background: var(--color-secondary);
    color: white;
    
    &:hover {
      background: var(--color-secondary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }
  
  &.secondary {
    background: transparent;
    color: var(--color-secondary);
    border: 2px solid var(--color-secondary);
    
    &:hover {
      background: var(--color-secondary);
      color: white;
      transform: translateY(-2px);
    }
  }
}



/* Features Section */
.features {
  padding: var(--space-16) var(--space-6);
  background: var(--color-primary);
}

.features-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-12);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
}

.feature-card {
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  padding: var(--space-8);
  text-align: center;
  transition: all 0.15s ease-in-out;
  border: 1px solid var(--color-border);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-secondary);
  }
}



.feature-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.feature-description {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
  line-height: var(--line-height-normal);
}



/* Subscription Plans Section */
.subscription-plans {
  padding: var(--space-16) var(--space-6);
  background: var(--color-primary);
}

.subscription-plans-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-4);
}

.subscription-plans-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: var(--space-12);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
  max-width: 800px;
  margin: 0 auto var(--space-12);
}



/* Install Prompt */
.install-prompt {
  padding: var(--space-12) var(--space-6);
  background: var(--color-primary);
}

.install-card {
  background: var(--color-secondary);
  color: white;
  border-radius: var(--border-radius-lg);
  padding: var(--space-8);
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.install-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-4);
}

.install-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-4);
}

.install-description {
  margin-bottom: var(--space-6);
  line-height: var(--line-height-normal);
}

.install-button {
  height: var(--space-11);
  padding: 0 var(--space-6);
  background: white;
  color: var(--color-secondary);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  .button-icon {
    width: 16px;
    height: 16px;
  }
}



/* Footer */
.footer {
  background: var(--color-text);
  color: white;
  padding: var(--space-12) var(--space-6) var(--space-6);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto var(--space-8);
}

.footer-section {
  .footer-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-4);
  }
  
  .footer-description {
    color: rgba(255, 255, 255, 0.8);
    line-height: var(--line-height-normal);
  }
  
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    
    .footer-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: color 0.15s ease-in-out;
      
      &:hover {
        color: white;
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--space-6);
  text-align: center;
  
  .footer-copyright {
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--font-size-sm);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-4xl);
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
    
    .hero-button {
      width: 100%;
      max-width: 300px;
    }
  }
  
  .features-grid,
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 