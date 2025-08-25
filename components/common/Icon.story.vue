<script setup lang="ts">
import Icon from './Icon.vue'

// Define the story meta
const meta = {
  title: 'Common/Icon',
  component: Icon,
  tags: ['autodocs'],
}

// Define the available sizes and icons for controls
const sizes = ['sm', 'base', 'md', 'lg', 'xl'] as const
const commonIcons = [
  'search', 'menu', 'user', 'settings', 'heart', 'star', 
  'mail', 'bell', 'home', 'bookmark', 'share', 'download',
  'check', 'x', 'arrow-left', 'arrow-right', 'loader',
  'refresh-cw', 'edit', 'trash', 'plus', 'minus'
]
</script>

<template>
  <Story 
    :meta="meta"
    :layout="{ type: 'grid', width: '100%' }"
  >
    <!-- Default Icon -->
    <Variant title="Default">
      <Icon name="search" />
    </Variant>

    <!-- Size Variants -->
    <Variant title="Sizes">
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-center gap-2">
          <Icon name="search" size="sm" />
          <span class="text-xs">sm (12px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="search" size="base" />
          <span class="text-xs">base (16px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="search" size="md" />
          <span class="text-xs">md (20px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="search" size="lg" />
          <span class="text-xs">lg (24px)</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Icon name="search" size="xl" />
          <span class="text-xs">xl (32px)</span>
        </div>
      </div>
    </Variant>

    <!-- Icon Gallery -->
    <Variant title="Icon Gallery">
      <div class="grid grid-cols-6 gap-4">
        <div 
          v-for="iconName in commonIcons" 
          :key="iconName"
          class="flex flex-col items-center gap-2 p-2 border rounded hover:bg-gray-50"
        >
          <Icon :name="iconName" size="md" />
          <span class="text-xs">{{ iconName }}</span>
        </div>
      </div>
    </Variant>

    <!-- Interactive States -->
    <Variant title="Interactive States">
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Hover Effects:</span>
          <Icon name="heart" size="md" class="hover:text-red-500 cursor-pointer transition-colors" />
          <Icon name="star" size="md" class="hover:text-yellow-500 cursor-pointer transition-colors" />
          <Icon name="bookmark" size="md" class="hover:text-blue-500 cursor-pointer transition-colors" />
        </div>
        
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Loading:</span>
          <Icon name="loader" size="md" class="animate-spin" />
          <Icon name="refresh-cw" size="md" class="animate-spin" />
        </div>
      </div>
    </Variant>

    <!-- Customizable Playground -->
    <Variant title="Playground" :init-state="{ iconName: 'search', size: 'md' }">
      <template #default="{ state }">
        <div class="flex flex-col items-center gap-4">
          <Icon :name="state.iconName" :size="state.size" />
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">
            &lt;Icon name="{{ state.iconName }}" size="{{ state.size }}" /&gt;
          </code>
        </div>
      </template>
      
      <template #controls="{ state }">
        <HstSelect
          v-model="state.iconName"
          title="Icon"
          :options="commonIcons"
        />
        <HstSelect
          v-model="state.size"
          title="Size"
          :options="sizes"
        />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.story-variant {
  padding: 24px;
}
</style> 