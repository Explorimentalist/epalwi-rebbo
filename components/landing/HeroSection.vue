<template>
  <section class="hero-section">
    <!-- Background Image -->
    <div class="hero-background" aria-hidden="true"></div>
    
    <!-- Hero Visual / Mockup Image -->
    <!-- <div class="hero-visual" v-if="props.mockupImage">
      <img
        :src="props.mockupImage"
        :alt="props.mockupAlt"
        decoding="async"
        fetchpriority="high"
        class="hero-image"
      />
    </div> -->

    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-headline">
          {{ headline }}
        </h1>
        
        <p class="hero-subheading">
          {{ subheading }}
        </p>
        
        <div class="hero-actions">
          <ButtonV2
            @click="handlePrimaryCTA"
            :aria-label="primaryCtaAriaLabel"
            size="lg"
          >
            {{ primaryCtaText }}
          </ButtonV2>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  headline?: string
  subheading?: string
  primaryCtaText?: string
  primaryCtaAriaLabel?: string
  mockupImage?: string
  mockupAlt?: string
}

const props = withDefaults(defineProps<Props>(), {
  headline: 'Aprende Ndowe',
  subheading: 'El primer diccionario online traductor Español-Ndowe palabra por palabra. Es hora de preservar tu lengua',
  primaryCtaText: 'Prueba Epàlwi‑Rèbbo gratis',
  primaryCtaAriaLabel: 'Comenzar prueba gratuita de 14 días',
  mockupImage: '/icons/icon-512x512.png',
  mockupAlt: 'Epàlwi-Rèbbo Dictionary App - Spanish to Ndowe translation interface showing search results and language toggle'
})

const emit = defineEmits<{
  primaryCta: []
}>()

const handlePrimaryCTA = () => {
  emit('primaryCta')
}
</script>

<style lang="scss" scoped>
// 🎬 PROFESSIONAL HERO SECTION - Double Play Studio Inspired
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
  padding: 60px 48px 120px;
  
  // Full-screen Background
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: #1a1a1a; // Fallback color
    background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop&crop=center&q=80');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        135deg, 
        rgba(0, 0, 0, 0.6) 0%, 
        rgba(0, 0, 0, 0.3) 100%
      );
    }
  }
  
  // // Visual mockup layered above background and below content
  // .hero-visual {
  //   position: absolute;
  //   right: 48px;
  //   bottom: 0;
  //   z-index: 10;
  //   pointer-events: none;
  //   display: flex;
  //   align-items: flex-end;
  //   justify-content: center;
  //   max-height: 80vh;
    
  //   .hero-image {
  //     display: block;
  //     max-height: 80vh;
  //     width: auto;
  //     height: auto;
  //     object-fit: contain;
  //     filter: drop-shadow(0 24px 48px rgba(0,0,0,0.45));
  //     border-radius: 20px;
  //   }
  // }
  
  // Hero Container
  .hero-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }
  
  // Hero Content - Left Aligned like Double Play
  .hero-content {
    max-width: 600px;
    animation: fadeInUp 0.8s ease-out 0.3s both;
    position: relative;
    z-index: 3;
    
    // Clean, Professional Headline
    .hero-headline {
      font-family: var(--ds-font-display);
      font-size: var(--ds-font-size-l);
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: white;
      margin-bottom: var(--ds-spacing-2);
      text-rendering: optimizeLegibility;
    }
    
    // Clean Subheading
    .hero-subheading {
      font-family: var(--ds-font-sans);
      font-size: var(--ds-font-size-copy-18);
      font-weight: 400;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: var(--ds-spacing-4);
      max-width: 500px;
    }
  }
  
  // Hero Actions - Clean Button
  .hero-actions {
    animation: fadeInUp 0.8s ease-out 0.5s both;
  }
}

/* 📱 Responsive Design - Clean & Professional */

// Mobile (≤768px)
@media (max-width: 768px) {
  .hero-section {
    padding: 80px 24px 60px;
    min-height: 90vh;
    
    // .hero-visual {
    //   position: absolute;
    //   right: 12px;
    //   bottom: -12px;
    //   max-height: 40vh;
    //   z-index: 5; // visible above background, below text
      
    //   .hero-image {
    //     max-height: 40vh;
    //     border-radius: 16px;
    //   }
    // }

    .hero-content {
      max-width: 100%;
      
      .hero-headline {
        font-size: var(--ds-font-size-m);
        margin-bottom: var(--ds-spacing-1);
      }
      
      .hero-subheading {
        font-size: var(--ds-font-size-copy-16);
        margin-bottom: var(--ds-spacing-3);
        max-width: 100%;
      }
    }
    
  }
}

// Tablet (768px-1024px)
@media (min-width: 768px) {
  .hero-section {
    padding: 100px 40px 80px;
    
    // .hero-visual {
    //   right: 32px;
    //   max-height: 65vh;
    //   z-index: 8;
      
    //   .hero-image { max-height: 65vh; }
    // }

    .hero-content {
      max-width: 560px;
      
      .hero-headline {
        font-size: var(--ds-font-size-l);
        margin-bottom: var(--ds-spacing-2);
      }
      
      .hero-subheading {
        font-size: var(--ds-font-size-copy-18);
        margin-bottom: var(--ds-spacing-3);
      }
    }
    
  }
}

// Desktop (≥1024px) 
@media (min-width: 1024px) {
  .hero-section {
    padding: 120px 48px 80px;
    
    // .hero-visual {
    //   right: 48px;
    //   max-height: 80vh;
      
    //   .hero-image { max-height: 80vh; }
    // }

    .hero-content {
      max-width: 600px;
      
      .hero-headline {
        font-size: var(--ds-font-size-l);
      }
      
      .hero-subheading {
        font-size: var(--ds-font-size-copy-18);
      }
    }
  }
}

/* ✨ Clean Animation System */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🎨 Accessibility: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .hero-content,
  .hero-actions {
    animation: none !important;
  }
  
  .hero-cta-primary {
    transition: none !important;
  }
  
  .hero-cta-primary:hover {
    transform: none !important;
  }
}
</style>