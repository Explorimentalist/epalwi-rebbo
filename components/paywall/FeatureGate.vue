<template>
  <div class="feature-gate">
    <!-- Loading state while auth initializes -->
    <div v-if="!ready" class="feature-gate__loading" role="status" aria-live="polite">
      <Icon name="loader" class="loading-icon" />
      <span class="sr-only">Comprobando suscripción…</span>
    </div>

    <!-- Allowed content (active, trial, or grace if enabled) -->
    <template v-else-if="allowed">
      <slot />
    </template>

    <!-- Fallback rendering for blocked users -->
    <template v-else>
      <!-- Consumer-provided fallback takes priority -->
      <slot name="fallback">
        <!-- Component prop fallback -->
        <component v-if="fallbackComponent" :is="fallbackComponent" :feature="feature" @upgrade-click="emit('upgrade-click')" />

        <!-- Default fallback: SubscriptionRequired -->
        <SubscriptionRequired v-else :feature="feature" mode="inline" @upgrade-click="emit('upgrade-click')" />
      </slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  feature?: string
  /** Optional custom fallback component (e.g., SubscriptionRequired) */
  fallbackComponent?: any
  /** Allow access during grace period (default true) */
  allowGrace?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  allowGrace: true
})

const emit = defineEmits<{ 'upgrade-click': [] }>()

const authStore = useAuthStore()
const { canAccessFeatures, isInGracePeriod } = useAuth()

const ready = computed(() => (authStore as any).initialized?.value ?? true)
const allowed = computed(() => canAccessFeatures.value || (props.allowGrace && isInGracePeriod.value))
</script>

<style scoped>
.feature-gate__loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ds-muted-foreground, #6b7280);
}
.loading-icon {
  width: 18px; height: 18px;
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
</style>
