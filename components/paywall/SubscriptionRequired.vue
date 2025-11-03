<template>
  <div :class="containerClasses" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
    <div class="paywall__card">
      <div class="paywall__header">
        <Icon :name="headerIcon" class="paywall__icon" />
        <h2 id="paywall-title" class="paywall__title">{{ resolvedTitle }}</h2>
        <p class="paywall__subtitle">{{ subtitle }}</p>
      </div>

      <ul v-if="benefits.length" class="paywall__benefits">
        <li v-for="b in benefits" :key="b" class="paywall__benefit">
          <Icon name="check" class="benefit__icon" />
          <span>{{ b }}</span>
        </li>
      </ul>

      <slot />

      <div class="paywall__actions">
        <slot name="actions">
          <button v-if="showUpgrade" class="paywall__cta" @click="onUpgrade">
            <Icon name="credit-card" class="cta__icon" />
            {{ ctaText }}
          </button>
          <button class="paywall__secondary" @click="onLogin">
            <Icon name="arrow-right-on-rectangle" class="secondary__icon" />
            Iniciar sesión
          </button>
        </slot>
      </div>

      <p v-if="!hideSupport" class="paywall__support">
        ¿Tienes una suscripción y no puedes acceder?
        <a href="mailto:soporte@epalwi.app" class="paywall__link">Contacta soporte</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  feature?: string
  mode?: 'overlay' | 'inline'
  showUpgrade?: boolean
  title?: string
  hideSupport?: boolean
  ctaText?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'inline',
  showUpgrade: true,
  hideSupport: false,
  ctaText: 'Suscribirse ahora'
})

const emit = defineEmits<{ 'upgrade-click': [] }>()

const { redirectToSubscription, redirectToLogin } = useAuth()
const route = useRoute()

const resolvedTitle = computed(() => props.title || 'Suscripción requerida')
const headerIcon = computed(() => (props.mode === 'overlay' ? 'lock' : 'shield'))

const subtitle = computed(() => {
  return props.feature
    ? `La función “${props.feature}” es parte de la versión premium.`
    : 'Esta sección es parte de la versión premium.'
})

const benefits = computed(() => [
  'Acceso completo al diccionario',
  'Búsqueda offline',
  'Actualizaciones continuas'
])

const containerClasses = computed(() => [
  'paywall',
  props.mode === 'overlay' ? 'paywall--overlay' : 'paywall--inline'
])

const onUpgrade = () => {
  emit('upgrade-click')
  redirectToSubscription('paywall')
}

const onLogin = () => {
  redirectToLogin(route.fullPath)
}
</script>

<style scoped>
.paywall {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paywall--overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 24px;
}

.paywall--inline {
  padding: 16px;
}

.paywall__card {
  width: 100%;
  max-width: 560px;
  background: var(--ds-card, #fff);
  color: var(--ds-foreground, #111);
  border: 1px solid var(--ds-border, #e5e7eb);
  border-radius: var(--ds-radius, 12px);
  box-shadow: var(--ds-shadow-md, 0 8px 24px rgba(0,0,0,0.08));
  padding: 20px;
}

.paywall__header { text-align: center; margin-bottom: 12px; }
.paywall__icon { width: 28px; height: 28px; color: var(--ds-primary, #D45B41); }
.paywall__title { font-size: 1.25rem; margin-top: 8px; margin-bottom: 4px; }
.paywall__subtitle { color: var(--ds-muted-foreground, #6b7280); font-size: 0.95rem; }

.paywall__benefits { margin: 12px 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.paywall__benefit { display: flex; gap: 8px; align-items: center; }
.benefit__icon { width: 16px; height: 16px; color: var(--ds-primary, #D45B41); }

.paywall__actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; justify-content: center; }
.paywall__cta { 
  display: inline-flex; align-items: center; gap: 6px; 
  background: var(--ds-primary, #D45B41); color: #fff; border: 1px solid var(--ds-primary, #D45B41);
  height: 40px; padding: 0 14px; border-radius: var(--ds-radius, 10px); cursor: pointer; font-weight: 600;
}
.paywall__cta:hover { opacity: 0.95; }
.cta__icon { width: 18px; height: 18px; }

.paywall__secondary { 
  display: inline-flex; align-items: center; gap: 6px; 
  background: transparent; color: var(--ds-primary, #D45B41); border: 1px solid var(--ds-border, #e5e7eb);
  height: 40px; padding: 0 12px; border-radius: var(--ds-radius, 10px); cursor: pointer; font-weight: 500;
}
.secondary__icon { width: 18px; height: 18px; }

.paywall__support { margin-top: 12px; text-align: center; font-size: 0.875rem; color: var(--ds-muted-foreground, #6b7280); }
.paywall__link { color: var(--ds-primary, #D45B41); text-decoration: underline; }
</style>
