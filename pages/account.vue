<template>
  <div class="account-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Mi Cuenta</h1>
        <p class="page-subtitle">
          Gestiona tu perfil y configuración
        </p>
      </div>

      <!-- Profile Section -->
      <div class="profile-section">
        <div class="profile-header">
          <div class="profile-avatar">
            <Icon name="user" class="avatar-icon" />
          </div>
          <div class="profile-info">
            <h3 class="profile-name">{{ userProfile.name || userProfile.email }}</h3>
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
          <h3 class="status-title">Estado de Suscripción</h3>
          <NuxtLink to="/subscription/manage" class="manage-link">
            Gestionar
          </NuxtLink>
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
        <h3 class="settings-title">Configuración de Cuenta</h3>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <Icon name="bell" class="setting-icon" />
              <div class="setting-content">
                <h4 class="setting-name">Notificaciones</h4>
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
                <h4 class="setting-name">Idioma</h4>
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
                <h4 class="setting-name">Tema Oscuro</h4>
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
                <h4 class="setting-name">Sincronización Offline</h4>
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
            </button>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="privacy-section">
        <h3 class="privacy-title">Datos y Privacidad</h3>
        
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
        <h3 class="support-title">Soporte y Ayuda</h3>
        
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

// Auth store
const authStore = useAuthStore()

// State
const showEditModal = ref(false)
const isSaving = ref(false)
const isSyncing = ref(false)

// Mock data - replace with real data from your backend
const userProfile = ref({
  name: 'Usuario Ejemplo',
  email: 'usuario@ejemplo.com'
})

const subscriptionInfo = ref({
  plan: 'Plan Anual',
  nextBilling: '15 de Enero, 2025'
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
  if (authStore.isTrialActive) return 'En Prueba'
  if (authStore.isSubscriptionActive) return 'Activo'
  return 'Inactivo'
})

const subscriptionStatusClass = computed(() => {
  if (authStore.isTrialActive) return 'status-trial'
  if (authStore.isSubscriptionActive) return 'status-active'
  return 'status-inactive'
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
    
    // Mock sync - replace with real implementation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Offline data synced successfully')
    
  } catch (error) {
    console.error('Error syncing offline data:', error)
  } finally {
    isSyncing.value = false
  }
}

const exportData = () => {
  // Implement data export
  console.log('Exporting data...')
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
  window.open('/help', '_blank')
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
