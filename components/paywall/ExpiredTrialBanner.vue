<template>
  <Transition name="expired-banner" appear>
    <div v-if="visible" class="expired-banner" role="region" aria-label="Prueba expirada">
      <div class="expired-banner__content">
        <Icon name="alert-triangle" class="expired-banner__icon" />
        <div class="expired-banner__text">
          <p class="expired-banner__message">{{ message }}</p>
          <p class="expired-banner__sub">Has perdido el acceso a funciones premium.</p>
        </div>
      </div>

      <div class="expired-banner__actions">
        <button v-if="showUpgradeButton" class="expired-banner__cta" @click="handleUpgrade">
          <Icon name="credit-card" class="cta__icon" />
          {{ ctaText }}
        </button>
        <button v-if="dismissible" type="button" class="expired-banner__close" :aria-label="closeAria" @click="dismiss">
          <Icon name="x" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
interface Props {
  /** Days since the trial expired (0 = today, 1 = ayer, 2+ = hace N días) */
  daysSinceExpiration?: number
  /** Whether the banner can be dismissed for this session */
  dismissible?: boolean
  /** Whether to show the upgrade CTA */
  showUpgradeButton?: boolean
  /** CTA text */
  ctaText?: string
  /** Force show regardless of previous dismissals */
  forceShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  daysSinceExpiration: 0,
  dismissible: true,
  showUpgradeButton: true,
  ctaText: 'Suscribirse para continuar'
})

const emit = defineEmits<{ 'upgrade-click': [] }>()

const STORAGE_KEY = 'expired-trial-banner-dismissed'

const wasDismissedThisSession = () => {
  try { return sessionStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}
const setDismissedThisSession = () => {
  try { sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
}

const visible = ref(true)

onMounted(() => {
  if (props.forceShow) return
  if (props.dismissible && wasDismissedThisSession()) {
    visible.value = false
  }
})

const { redirectToSubscription } = useAuth()

const closeAria = 'Cerrar advertencia de prueba expirada'

const message = computed(() => {
  const d = Number(props.daysSinceExpiration || 0)
  if (d <= 0) return 'Tu prueba gratuita ha expirado hoy.'
  if (d === 1) return 'Tu prueba gratuita expiró ayer.'
  return `Tu prueba gratuita expiró hace ${d} días.`
})

const handleUpgrade = () => {
  emit('upgrade-click')
  redirectToSubscription('expired-banner')
}

const dismiss = () => {
  setDismissedThisSession()
  visible.value = false
}
</script>

<style scoped>
.expired-banner {
  position: sticky;
  top: 64px;
  left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(135deg, var(--ds-destructive, #DC2626), #B91C1C);
  color: #fff;
  z-index: var(--z-sticky, 50);
}
.expired-banner__content { display: flex; align-items: center; gap: 8px; }
.expired-banner__icon { width: 20px; height: 20px; color: #fff; opacity: 0.9; }
.expired-banner__message { font-weight: 600; }
.expired-banner__sub { font-size: 0.875rem; opacity: 0.9; }

.expired-banner__actions { display: flex; align-items: center; gap: 8px; }
.expired-banner__cta {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 10px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.2);
  color: #fff; font-weight: 600; cursor: pointer;
}
.cta__icon { width: 16px; height: 16px; }

.expired-banner__close {
  width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: #fff; cursor: pointer; border-radius: 6px;
}
.expired-banner__close:hover { background: rgba(255,255,255,0.12); }

.expired-banner-enter-active,
.expired-banner-leave-active { transition: transform .2s ease, opacity .2s ease; }
.expired-banner-enter-from,
.expired-banner-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
