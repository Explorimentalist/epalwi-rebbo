<template>
  <div class="account-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="ds-text-display-lg">Mi Cuenta</h1>
        <p class="page-subtitle">
          Gestiona tu perfil y configuración
        </p>
      </div>

      <!-- Preferencias (V2) -->
      <div class="preferences-section">
        <h2 class="ds-text-display-sm">Preferencias</h2>
        <p class="pref-subtitle">Idioma por defecto del diccionario y notificaciones por email.</p>

        <div class="pref-group">
          <label class="pref-label">Idioma por defecto del diccionario</label>
          <select class="pref-select" v-model="defaultLanguage" :disabled="prefSaving">
            <option value="español">Español</option>
            <option value="ndowe">Ndowe</option>
          </select>
          <p class="pref-help">Se usará al abrir el diccionario por primera vez.</p>
        </div>

        <div class="pref-group">
          <label class="pref-label">Notificaciones por email</label>
          <div class="pref-switches">
            <label class="pref-switch">
              <input type="checkbox" class="notif-product" v-model="notificationsProduct" :disabled="prefSaving" />
              <span>Novedades del producto</span>
            </label>
            <label class="pref-switch">
              <input type="checkbox" class="notif-tips" v-model="notificationsTips" :disabled="prefSaving" />
              <span>Consejos del idioma</span>
            </label>
          </div>
          <p class="pref-help">Recibirás únicamente correos seleccionados si activas estas opciones.</p>
          <p v-if="prefsError && (prefsError as any).value" class="pref-error">No se pudo guardar: {{ (prefsError as any).value }}</p>
        </div>
      </div>

      <!-- Profile Section -->
      <div class="profile-section">
        <div class="profile-header">
          <div class="profile-avatar">
            <Icon name="user" class="avatar-icon" />
          </div>
          <div class="profile-info">
            <h2 class="ds-text-display-xs">{{ userProfile.name || userProfile.email }}</h2>
            <p class="profile-email">{{ userProfile.email }}</p>
            <div class="profile-status">
              <span class="status-badge" :class="subscriptionStatusClass">
                {{ subscriptionStatusText }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="profile-actions">
          <button
            @click="editProfile"
            class="profile-button"
          >
            <Icon name="pencil" class="button-icon" />
            Editar Perfil
          </button>
        </div>
      </div>

      <!-- Subscription Status -->
      <div class="subscription-status-card">
        <div class="status-header">
          <h2 class="ds-text-display-sm">Estado de Suscripción</h2>
          <div class="status-actions-inline">
            <NuxtLink to="/subscription/manage" class="manage-link">
              Gestionar
            </NuxtLink>
            <button class="portal-button" @click="goToCustomerPortal">
              <Icon name="document-text" class="ds-btn-icon-element" />
              Portal de Suscripción
            </button>
          </div>
        </div>
        
        <div class="status-content">
          <div class="status-item">
            <span class="status-label">Plan:</span>
            <span class="status-value">{{ subscriptionInfo.plan }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Estado:</span>
            <span class="status-value" :class="subscriptionStatusClass">
              {{ subscriptionStatusText }}
            </span>
          </div>
          <div v-if="trialInfoText" class="status-item">
            <span class="status-label">Prueba:</span>
            <span class="status-value">{{ trialInfoText }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Próximo cobro:</span>
            <span class="status-value">{{ subscriptionInfo.nextBilling }}</span>
          </div>
        </div>
        
        <div class="status-actions">
          <NuxtLink to="/subscription/plans" class="upgrade-button">
            <Icon name="arrow-up" class="button-icon" />
            Cambiar Plan
          </NuxtLink>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="settings-section">
        <h2 class="ds-text-display-sm">Configuración de Cuenta</h2>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <Icon name="bell" class="setting-icon" />
              <div class="setting-content">
                <h3 class="ds-text-display-xs">Notificaciones</h3>
                <p class="setting-description">
                  Gestiona tus preferencias de notificaciones
                </p>
              </div>
            </div>
            <button
              @click="toggleNotifications"
              class="setting-toggle"
              :class="{ 'active': settings.notifications }"
            >
              <div class="toggle-slider"></div>
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <Icon name="globe" class="setting-icon" />
              <div class="setting-content">
                <h3 class="ds-text-display-xs">Idioma</h3>
                <p class="setting-description">
                  Cambia el idioma de la interfaz
                </p>
              </div>
            </div>
            <select
              v-model="settings.language"
              class="setting-select"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <Icon name="moon" class="setting-icon" />
              <div class="setting-content">
                <h3 class="ds-text-display-xs">Tema Oscuro</h3>
                <p class="setting-description">
                  Cambia entre tema claro y oscuro
                </p>
              </div>
            </div>
            <button
              @click="toggleDarkMode"
              class="setting-toggle"
              :class="{ 'active': settings.darkMode }"
            >
              <div class="toggle-slider"></div>
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <Icon name="wifi" class="setting-icon" />
              <div class="setting-content">
                <h3 class="ds-text-display-xs">Sincronización Offline</h3>
                <p class="setting-description">
                  Gestiona la sincronización de datos offline
                </p>
              </div>
            </div>
            <button
              @click="syncOfflineData"
              class="sync-button"
              :class="{ 'syncing': isSyncing }"
            >
              <Icon v-if="isSyncing" name="loader" class="sync-icon" />
              <span v-else>Sincronizar</span>
              <span v-if="(pendingCount as any)?.value > 0" class="pending-badge">{{ (pendingCount as any).value }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="privacy-section">
        <h2 class="ds-text-display-sm">Datos y Privacidad</h2>
        
        <div class="privacy-actions">
          <button
            @click="exportData"
            class="privacy-button"
          >
            <Icon name="arrow-down-tray" class="button-icon" />
            Exportar Mis Datos
          </button>
          
          <button
            @click="deleteAccount"
            class="privacy-button danger"
          >
            <Icon name="trash" class="button-icon" />
            Eliminar Cuenta
          </button>
        </div>
      </div>

      <!-- Support & Help -->
      <div class="support-section">
        <h2 class="ds-text-display-sm">Soporte y Ayuda</h2>
        
        <div class="support-actions">
          <button
            @click="contactSupport"
            class="support-button"
          >
            <Icon name="question-mark-circle" class="button-icon" />
            Contactar Soporte
          </button>
          
          <button
            @click="viewHelpCenter"
            class="support-button secondary"
          >
            <Icon name="book-open" class="button-icon" />
            Centro de Ayuda
          </button>
          
          <button
            @click="viewPrivacyPolicy"
            class="support-button tertiary"
          >
            <Icon name="shield-check" class="button-icon" />
            Política de Privacidad
          </button>
        </div>
      </div>

      <!-- Logout Section -->
      <div class="logout-section">
        <button
          @click="logout"
          class="logout-button"
        >
          <Icon name="arrow-right-on-rectangle" class="button-icon" />
          Cerrar Sesión
        </button>
      </div>
  </div>

  <!-- Edit Profile Modal -->
    <Modal
      v-model="showEditModal"
      title="Editar Perfil"
      :show-close-button="true"
    >
      <div class="edit-profile-form">
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input
            v-model="editForm.name"
            type="text"
            class="form-input"
            placeholder="Tu nombre"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            class="form-input"
            placeholder="tu@email.com"
            disabled
          />
          <p class="form-help">El email no se puede cambiar</p>
        </div>
        
        <div class="form-actions">
          <button
            @click="saveProfile"
            class="save-button"
            :disabled="isSaving"
          >
            <Icon v-if="isSaving" name="loader" class="save-icon" />
            {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
          <button
            @click="showEditModal = false"
            class="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
    
    <!-- Sync Toast -->
    <div v-if="showSyncToast" class="sync-toast">{{ syncToast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePreferences } from '~/composables/usePreferences'
import { useSearchHistory } from '~/services/searchHistory'
definePageMeta({ authRequired: true })

// Page metadata
useHead({
  title: 'Mi Cuenta | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Gestiona tu perfil y configuración de cuenta.' 
    }
  ]
})

onMounted(() => {
  // Load preferences for preview
  try { loadPreferences() } catch {}
})

// Auth & subscription
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const { isInGracePeriod, graceDaysRemaining, redirectToSubscription } = useAuth()

// State
const showEditModal = ref(false)
const isSaving = ref(false)
const isSyncing = ref(false)

// Preferences preview and updates
const { prefs, loadPreferences, updatePreferences, error: prefsError, pendingCount } = usePreferences()
const prefSaving = ref(false)
const syncToast = ref('')
const showSyncToast = ref(false)
const prefPreview = computed(() => ({
  defaultLanguage: (prefs as any).value?.defaultLanguage || 'español',
  notifications: {
    productUpdates: Boolean((prefs as any).value?.notifications?.productUpdates),
    languageTips: Boolean((prefs as any).value?.notifications?.languageTips)
  }
}))

// Two-way binding for default language
const defaultLanguage = computed({
  get: () => (prefs as any).value?.defaultLanguage || 'español',
  set: (val: any) => {
    prefSaving.value = true
    Promise.resolve(updatePreferences({ defaultLanguage: val }))
      .finally(() => { prefSaving.value = false })
  }
})

// Two-way bindings for notifications
const notificationsProduct = computed({
  get: () => Boolean((prefs as any).value?.notifications?.productUpdates),
  set: (val: boolean) => {
    const current = ((prefs as any).value?.notifications) || {}
    prefSaving.value = true
    Promise.resolve(updatePreferences({ notifications: { ...current, productUpdates: val } }))
      .finally(() => { prefSaving.value = false })
  }
})

const notificationsTips = computed({
  get: () => Boolean((prefs as any).value?.notifications?.languageTips),
  set: (val: boolean) => {
    const current = ((prefs as any).value?.notifications) || {}
    prefSaving.value = true
    Promise.resolve(updatePreferences({ notifications: { ...current, languageTips: val } }))
      .finally(() => { prefSaving.value = false })
  }
})

// Mock data - replace with real data from your backend
const userProfile = ref({
  name: 'Usuario Ejemplo',
  email: 'usuario@ejemplo.com'
})

const subscriptionInfo = computed(() => {
  const sub: any = (subscriptionStore as any).userSubscription?.value
  const plan = sub?.planId ? (sub.planId.includes('annual') ? 'Plan Anual' : 'Plan Mensual') : 'Sin plan'
  const next = (subscriptionStore as any).nextBillingDate?.value as Date | null
  const nextBilling = next ? next.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
  return { plan, nextBilling }
})

const settings = ref({
  notifications: true,
  language: 'es',
  darkMode: false
})

// Edit form
const editForm = ref({
  name: userProfile.value.name,
  email: userProfile.value.email
})

// Computed properties
const subscriptionStatusText = computed(() => {
  if ((authStore as any).isSubscriptionActive?.value) return 'Activo'
  if ((authStore as any).isTrialActive?.value) return 'En Prueba'
  if (isInGracePeriod.value) return 'Periodo de Gracia'
  return 'Expirado'
})

const subscriptionStatusClass = computed(() => {
  if ((authStore as any).isSubscriptionActive?.value) return 'status-active'
  if ((authStore as any).isTrialActive?.value) return 'status-trial'
  if (isInGracePeriod.value) return 'status-warning'
  return 'status-inactive'
})

const trialInfoText = computed(() => {
  if ((authStore as any).isTrialActive?.value) {
    const days = (authStore as any).trialDaysRemaining?.value || 0
    return days === 1 ? '1 día de prueba restante' : `${days} días de prueba restantes`
  }
  if (isInGracePeriod.value) {
    const days = graceDaysRemaining.value
    return days === 1 ? 'Periodo de gracia: 1 día restante' : `Periodo de gracia: ${days} días restantes`
  }
  return ''
})

// Methods
const editProfile = () => {
  editForm.value.name = userProfile.value.name
  editForm.value.email = userProfile.value.email
  showEditModal.value = true
}

const saveProfile = async () => {
  try {
    isSaving.value = true
    
    // Mock API call - replace with real implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    userProfile.value.name = editForm.value.name
    showEditModal.value = false
    
    // Show success message
    console.log('Profile updated successfully')
    
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    isSaving.value = false
  }
}

const toggleNotifications = () => {
  settings.value.notifications = !settings.value.notifications
}

const toggleDarkMode = () => {
  settings.value.darkMode = !settings.value.darkMode
}

const syncOfflineData = async () => {
  try {
    isSyncing.value = true
    // Flush any pending preference writes
    try {
      const { flushPending } = usePreferences()
      await flushPending()
    } catch {}

    // Trigger a history merge/load
    try {
      const { load } = useSearchHistory()
      await load()
    } catch {}

    console.log('Offline data synced successfully')
    syncToast.value = 'Sincronizado'
    showSyncToast.value = true
    setTimeout(() => { showSyncToast.value = false }, 1200)
  } catch (error) {
    console.error('Error syncing offline data:', error)
    syncToast.value = 'Error al sincronizar'
    showSyncToast.value = true
    setTimeout(() => { showSyncToast.value = false }, 1500)
  } finally {
    isSyncing.value = false
  }
}

const exportData = () => {
  // Implement data export
  console.log('Exporting data...')
}

const goToCustomerPortal = async () => {
  const url = await subscriptionStore.getCustomerPortalUrl()
  if (url) {
    window.location.href = url
  } else {
    // Fallback to plans page
    redirectToSubscription('account-portal')
  }
}

const deleteAccount = () => {
  // Implement account deletion with confirmation
  if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
    console.log('Deleting account...')
  }
}

const contactSupport = () => {
  window.open('mailto:soporte@epalwi-rebbo.com', '_blank')
}

const viewHelpCenter = () => {
  window.open('/sugerencias', '_blank')
}

const viewPrivacyPolicy = () => {
  window.open('/privacy', '_blank')
}

const logout = async () => {
  try {
    await authStore.signOut()
    navigateTo('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style lang="scss" scoped>
.account-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--space-8) 0;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-10);
  
  .page-title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .page-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
}

.profile-section {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
  
  .profile-header {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    margin-bottom: var(--space-6);
    
    .profile-avatar {
      width: 80px;
      height: 80px;
      background: var(--color-secondary);
      border-radius: var(--border-radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      
      .avatar-icon {
        width: 40px;
        height: 40px;
        color: white;
      }
    }
    
    .profile-info {
      flex: 1;
      
      .profile-name {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-2);
      }
      
      .profile-email {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        margin-bottom: var(--space-3);
      }
      
      .status-badge {
        padding: var(--space-2) var(--space-4);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        
        &.status-trial {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }
        
        &.status-active {
          background: var(--color-success-light);
          color: var(--color-success);
        }
        
        &.status-inactive {
          background: var(--color-error-light);
          color: var(--color-error);
        }
      }
    }
  }
  
  .profile-actions {
    .profile-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      background: transparent;
      color: var(--color-secondary);
      border: 1px solid var(--color-secondary);
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .button-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        background: var(--color-secondary);
        color: white;
      }
    }
  }
}

.subscription-status-card {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    gap: var(--space-4);
    
    .status-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    
    .manage-link {
      color: var(--color-secondary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .status-actions-inline {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .portal-button {
      height: var(--space-10);
      padding: 0 var(--space-4);
      background: transparent;
      color: var(--color-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      &:hover { background: var(--color-surface); }
    }
  }
  
  .status-content {
    margin-bottom: var(--space-6);
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .status-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
      }
      
      .status-value {
        font-size: var(--font-size-sm);
        color: var(--color-text);
        font-weight: var(--font-weight-semibold);
        
        &.status-trial {
          color: var(--color-warning);
        }
        
        &.status-active {
          color: var(--color-success);
        }
        
        &.status-inactive {
          color: var(--color-error);
        }
      }
    }
  }
  
  .status-actions {
    .upgrade-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      transition: all 0.15s ease-in-out;
      
      .button-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        background: var(--color-secondary-dark);
        transform: translateY(-1px);
      }
    }
  }
}

.preferences-section {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  margin-bottom: var(--space-8);

  .pref-subtitle { color: var(--color-text-muted); margin: var(--space-2) 0 var(--space-4); }
  .pref-group { margin-bottom: var(--space-5); }
  .pref-label { display: block; font-weight: var(--font-weight-medium); margin-bottom: var(--space-2); }
  .pref-select { height: var(--space-10); padding: 0 var(--space-4); border: 1px solid var(--color-border); border-radius: var(--border-radius); background: var(--color-surface); }
  .pref-switches { display: grid; gap: var(--space-3); }
  .pref-switch { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-sm); }
  .pref-error { color: var(--color-error); font-size: var(--font-size-sm); margin-top: var(--space-2); }
}

/* Sync toast */
.sync-toast {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: var(--color-secondary);
  color: white;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  font-size: var(--font-size-sm);
}

.pending-badge {
  margin-left: 8px;
  background: var(--color-warning);
  color: white;
  border-radius: 9999px;
  padding: 2px 6px;
  font-size: 12px;
}

.settings-section {
  margin-bottom: var(--space-8);
  
  .settings-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
  }
  
  .settings-list {
    .setting-item {
      background: var(--color-primary);
      border-radius: var(--border-radius);
      padding: var(--space-6);
      margin-bottom: var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .setting-info {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        
        .setting-icon {
          width: 24px;
          height: 24px;
          color: var(--color-secondary);
        }
        
        .setting-content {
          .setting-name {
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text);
            margin-bottom: var(--space-1);
          }
          
          .setting-description {
            font-size: var(--font-size-sm);
            color: var(--color-text-muted);
            line-height: var(--line-height-normal);
          }
        }
      }
      
      .setting-toggle {
        width: 48px;
        height: 24px;
        background: var(--color-border);
        border: none;
        border-radius: var(--border-radius-full);
        cursor: pointer;
        position: relative;
        transition: all 0.15s ease-in-out;
        
        .toggle-slider {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: var(--border-radius-full);
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.15s ease-in-out;
        }
        
        &.active {
          background: var(--color-secondary);
          
          .toggle-slider {
            left: 26px;
          }
        }
      }
      
      .setting-select {
        height: var(--space-8);
        padding: 0 var(--space-3);
        background: var(--color-primary);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        font-size: var(--font-size-sm);
        cursor: pointer;
        
        &:focus {
          outline: none;
          border-color: var(--color-secondary);
        }
      }
      
      .sync-button {
        height: var(--space-8);
        padding: 0 var(--space-4);
        background: var(--color-secondary);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        
        &:hover:not(:disabled) {
          background: var(--color-secondary-dark);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        &.syncing {
          .sync-icon {
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
          }
        }
      }
    }
  }
}

.privacy-section {
  margin-bottom: var(--space-8);
  
  .privacy-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
  }
  
  .privacy-actions {
    display: flex;
    gap: var(--space-4);
    
    .privacy-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      background: transparent;
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .button-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        border-color: var(--color-secondary);
        color: var(--color-secondary);
      }
      
      &.danger {
        color: var(--color-error);
        border-color: var(--color-error);
        
        &:hover {
          background: var(--color-error);
          color: white;
        }
      }
    }
  }
}

.support-section {
  margin-bottom: var(--space-8);
  
  .support-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
  }
  
  .support-actions {
    display: flex;
    gap: var(--space-4);
    
    .support-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .button-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        background: var(--color-secondary-dark);
        transform: translateY(-1px);
      }
      
      &.secondary {
        background: transparent;
        color: var(--color-secondary);
        border: 1px solid var(--color-secondary);
        
        &:hover {
          background: var(--color-secondary);
          color: white;
        }
      }
      
      &.tertiary {
        background: transparent;
        color: var(--color-text-muted);
        border: 1px solid var(--color-border);
        
        &:hover {
          background: var(--color-text-muted);
          color: white;
        }
      }
    }
  }
}

.logout-section {
  text-align: center;
  
  .logout-button {
    height: var(--space-10);
    padding: 0 var(--space-6);
    background: transparent;
    color: var(--color-error);
    border: 1px solid var(--color-error);
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    
    .button-icon {
      width: 16px;
      height: 16px;
    }
    
    &:hover {
      background: var(--color-error);
      color: white;
    }
  }
}

.edit-profile-form {
  .form-group {
    margin-bottom: var(--space-6);
    
    .form-label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
      margin-bottom: var(--space-2);
    }
    
    .form-input {
      width: 100%;
      height: var(--space-10);
      padding: 0 var(--space-4);
      background: var(--color-primary);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      
      &:focus {
        outline: none;
        border-color: var(--color-secondary);
      }
      
      &:disabled {
        background: var(--color-background);
        color: var(--color-text-muted);
        cursor: not-allowed;
      }
    }
    
    .form-help {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-top: var(--space-2);
    }
  }
  
  .form-actions {
    display: flex;
    gap: var(--space-4);
    
    .save-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .save-icon {
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
      }
      
      &:hover:not(:disabled) {
        background: var(--color-secondary-dark);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    .cancel-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      background: transparent;
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      
      &:hover {
        background: var(--color-text-muted);
        color: white;
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .privacy-actions,
  .support-actions {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .page-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
