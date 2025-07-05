<template>
  <div class="dictionary-page">
    <!-- Hero Section -->
    <section class="hero mb-12 text-center">
      <h2 class="text-4xl font-bold mb-6 text-secondary">
        Bienvenido al Diccionario Español-Ndowe
      </h2>
      <p class="text-lg text-muted max-w-2xl mx-auto mb-8">
        Preserva y aprende el idioma Ndowe con nuestro diccionario offline. 
        Traduce palabras entre español y ndowe sin necesidad de conexión a internet.
      </p>
      
      <!-- Search Input (Placeholder) -->
      <div class="search-container max-w-lg mx-auto">
        <div class="relative">
          <input
            type="text"
            placeholder="Buscar palabra en español o ndowe..."
            class="input w-full pl-12 pr-4 text-lg"
            disabled
          >
          <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
            🔍
          </div>
        </div>
        <p class="text-sm text-muted mt-3">
          <em>Búsqueda disponible en próximas versiones</em>
        </p>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features">
      <h3 class="text-2xl font-semibold mb-8 text-center">
        Características
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Offline Feature -->
        <div class="card">
          <div class="card__body text-center">
            <div class="text-4xl mb-4">📱</div>
            <h4 class="font-semibold mb-3">Funciona sin Internet</h4>
            <p class="text-muted">
              Accede al diccionario completo sin conexión. Perfecto para estudiar en cualquier lugar.
            </p>
          </div>
        </div>
        
        <!-- Bilingual Feature -->
        <div class="card">
          <div class="card__body text-center">
            <div class="text-4xl mb-4">🔄</div>
            <h4 class="font-semibold mb-3">Bidireccional</h4>
            <p class="text-muted">
              Traduce del español al ndowe y viceversa. Búsqueda inteligente en ambos idiomas.
            </p>
          </div>
        </div>
        
        <!-- Cultural Feature -->
        <div class="card">
          <div class="card__body text-center">
            <div class="text-4xl mb-4">🌍</div>
            <h4 class="font-semibold mb-3">Preservación Cultural</h4>
            <p class="text-muted">
              Contribuye a mantener vivo el idioma ndowe para las futuras generaciones.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Installation Prompt (PWA) -->
    <section v-if="showInstallPrompt" class="install-prompt mt-12">
      <div class="card bg-secondary text-white">
        <div class="card__body text-center">
          <h4 class="font-semibold mb-3">¡Instala la aplicación!</h4>
          <p class="mb-6">
            Instala epàlwi-rèbbo en tu dispositivo para acceso rápido y función offline.
          </p>
          <button 
            @click="installApp"
            class="btn btn--primary bg-white text-secondary"
          >
            Instalar Aplicación
          </button>
        </div>
      </div>
    </section>
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

// PWA Installation (simplified for Phase 1)
const showInstallPrompt = ref(false)

// Install app function (placeholder)
const installApp = async () => {
  // Will be implemented in Phase 7
  console.log('PWA installation will be implemented in Phase 7')
}

// Log for development
onMounted(() => {
  if (process.dev) {
    console.log('Index page mounted')
  }
})
</script>

<style lang="scss" scoped>
.dictionary-page {
  animation: fadeIn 0.6s ease-out;
}

.hero {
  padding: var(--space-12) 0;
}

.search-container {
  position: relative;
}

.features {
  margin-bottom: var(--space-12);
}

.grid {
  display: grid;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .grid-cols-1.md\:grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

.install-prompt {
  animation: slideUp 0.5s ease-out;
}

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