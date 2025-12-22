<script setup lang="ts">
// @ts-nocheck
import type { Variant } from 'histoire/client'

function logEvent(eventName: string) {
  console.log(`Button event: ${eventName}`)
}
</script>

<template>
  <Story
    title="Design System V2/ButtonV2"
    :layout="{
      type: 'grid',
      width: '100%',
    }"
  >
    <!-- Primary variant examples -->
    <Variant title="Primary Buttons">
      <div class="ds-space-y-4">
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="primary" size="sm" @click="logEvent('primary-sm')">
            Small Primary
          </ButtonV2>
          <ButtonV2 variant="primary" size="md" @click="logEvent('primary-md')">
            Medium Primary
          </ButtonV2>
          <ButtonV2 variant="primary" size="lg" @click="logEvent('primary-lg')">
            Large Primary
          </ButtonV2>
        </div>
        
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="primary" :loading="true">
            Loading
          </ButtonV2>
          <ButtonV2 variant="primary" :disabled="true">
            Disabled
          </ButtonV2>
          <ButtonV2 variant="primary" full-width>
            Full Width
          </ButtonV2>
        </div>
      </div>
    </Variant>

    <!-- Secondary variant examples -->
    <Variant title="Secondary Buttons">
      <div class="ds-space-y-4">
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="secondary" size="sm">
            Small Secondary
          </ButtonV2>
          <ButtonV2 variant="secondary" size="md">
            Medium Secondary
          </ButtonV2>
          <ButtonV2 variant="secondary" size="lg">
            Large Secondary
          </ButtonV2>
        </div>
        
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="secondary" :loading="true">
            Loading
          </ButtonV2>
          <ButtonV2 variant="secondary" :disabled="true">
            Disabled
          </ButtonV2>
        </div>
      </div>
    </Variant>

    <!-- Ghost variant examples -->
    <Variant title="Ghost Buttons">
      <div class="ds-space-y-4">
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="ghost" size="sm">
            Small Ghost
          </ButtonV2>
          <ButtonV2 variant="ghost" size="md">
            Medium Ghost
          </ButtonV2>
          <ButtonV2 variant="ghost" size="lg">
            Large Ghost
          </ButtonV2>
        </div>
        
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="ghost" :loading="true">
            Loading
          </ButtonV2>
          <ButtonV2 variant="ghost" :disabled="true">
            Disabled
          </ButtonV2>
        </div>
      </div>
    </Variant>

    <!-- Destructive variant examples -->
    <Variant title="Destructive Buttons">
      <div class="ds-space-y-4">
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="destructive" size="sm">
            Delete
          </ButtonV2>
          <ButtonV2 variant="destructive" size="md">
            Remove Account
          </ButtonV2>
          <ButtonV2 variant="destructive" size="lg">
            Permanent Delete
          </ButtonV2>
        </div>
        
        <div class="ds-flex ds-items-center gap-4">
          <ButtonV2 variant="destructive" :loading="true">
            Deleting...
          </ButtonV2>
          <ButtonV2 variant="destructive" :disabled="true">
            Cannot Delete
          </ButtonV2>
        </div>
      </div>
    </Variant>

    <!-- Dark mode demonstration -->
    <Variant title="Dark Mode Support">
      <div class="dark p-ds-2 bg-ds-background rounded-ds-lg">
        <div class="ds-space-y-4">
          <p class="ds-text-body text-ds-foreground mb-4">
            Dark mode automatically switches all colors:
          </p>
          <div class="ds-flex ds-items-center gap-4">
            <ButtonV2 variant="primary">
              Primary Dark
            </ButtonV2>
            <ButtonV2 variant="secondary">
              Secondary Dark
            </ButtonV2>
            <ButtonV2 variant="ghost">
              Ghost Dark
            </ButtonV2>
            <ButtonV2 variant="destructive">
              Destructive Dark
            </ButtonV2>
          </div>
        </div>
      </div>
    </Variant>

    <!-- Design System Comparison -->
    <Variant title="Legacy vs New System">
      <div class="ds-space-y-6">
        <div>
          <h3 class="ds-text-display-xs mb-4 text-ds-foreground">
            Legacy Button (Old System)
          </h3>
          <button class="bg-secondary text-primary px-4 py-2 rounded shadow">
            Legacy Button
          </button>
        </div>
        
        <div>
          <h3 class="ds-text-display-xs mb-4 text-ds-foreground">
            ButtonV2 (New System)
          </h3>
          <ButtonV2 variant="primary">
            New Button
          </ButtonV2>
        </div>
        
        <div class="ds-card">
          <div class="ds-card-header">
            <h4 class="ds-card-title">Key Improvements</h4>
          </div>
          <ul class="ds-text-body-sm text-ds-muted-foreground space-y-2">
            <li>✅ Better color contrast (OKLCH)</li>
            <li>✅ Smooth hover animations</li>
            <li>✅ Built-in loading states</li>
            <li>✅ Automatic dark mode</li>
            <li>✅ Better accessibility (focus states)</li>
            <li>✅ Consistent sizing system</li>
          </ul>
        </div>
      </div>
    </Variant>

    <!-- Interactive playground -->
    <Variant title="Interactive Playground" :controls="{
      variant: {
        type: 'select',
        default: 'primary',
        options: ['primary', 'secondary', 'ghost', 'destructive']
      },
      size: {
        type: 'select', 
        default: 'md',
        options: ['sm', 'md', 'lg']
      },
      loading: {
        type: 'boolean',
        default: false
      },
      disabled: {
        type: 'boolean',
        default: false
      },
      fullWidth: {
        type: 'boolean',
        default: false
      }
    }">
      <template #default="{ state }">
        <div class="p-ds-2">
          <ButtonV2 
            :variant="state.variant"
            :size="state.size"
            :loading="state.loading"
            :disabled="state.disabled"
            :full-width="state.fullWidth"
            @click="logEvent('playground-click')"
          >
            {{ state.loading ? 'Loading...' : 'Playground Button' }}
          </ButtonV2>
          
          <div class="mt-ds-1 p-ds-1 bg-ds-muted rounded-ds-sm">
            <code class="ds-text-body-sm">
              &lt;ButtonV2 
              variant="{{ state.variant }}"
              size="{{ state.size }}"
              {{ state.loading ? ':loading="true"' : '' }}
              {{ state.disabled ? ':disabled="true"' : '' }}
              {{ state.fullWidth ? 'full-width' : '' }}
              &gt;
            </code>
          </div>
        </div>
      </template>
    </Variant>
  </Story>
</template>

<style>
/* Ensure Histoire can see our design system styles */
@import url('~/assets/styles/main.scss');

/* Override Histoire's default styles for this story */
.histoire-story {
  font-family: var(--ds-font-sans) !important;
}
</style>