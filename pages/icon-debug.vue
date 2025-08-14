<template>
  <div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold">Icon Debug Page</h1>
    
    <!-- Test 1: Direct NuxtIcon usage -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Test 1: Direct NuxtIcon Usage</h2>
      <div class="space-y-2">
        <div class="flex items-center gap-4">
          <span>heroicons:magnifying-glass:</span>
          <NuxtIcon name="heroicons:magnifying-glass" size="24" />
        </div>
        <div class="flex items-center gap-4">
          <span>heroicons:user:</span>
          <NuxtIcon name="heroicons:user" size="24" />
        </div>
        <div class="flex items-center gap-4">
          <span>heroicons:home:</span>
          <NuxtIcon name="heroicons:home" size="24" />
        </div>
      </div>
    </div>

    <!-- Test 2: Our Icon component wrapper -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Test 2: Our Icon Component Wrapper</h2>
      <div class="space-y-2">
        <div class="flex items-center gap-4">
          <span>search (mapped to heroicons:magnifying-glass):</span>
          <AppIcon name="search" size="md" />
        </div>
        <div class="flex items-center gap-4">
          <span>user (mapped to heroicons:user):</span>
          <AppIcon name="user" size="md" />
        </div>
        <div class="flex items-center gap-4">
          <span>home (mapped to heroicons:home):</span>
          <AppIcon name="home" size="md" />
        </div>
      </div>
    </div>

    <!-- Test 3: Alternative icon formats -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Test 3: Alternative Icon Formats</h2>
      <div class="space-y-2">
        <div class="flex items-center gap-4">
          <span>i-heroicons-magnifying-glass:</span>
          <NuxtIcon name="i-heroicons-magnifying-glass" size="24" />
        </div>
        <div class="flex items-center gap-4">
          <span>lucide:search:</span>
          <NuxtIcon name="lucide:search" size="24" />
        </div>
        <div class="flex items-center gap-4">
          <span>mdi:magnify:</span>
          <NuxtIcon name="mdi:magnify" size="24" />
        </div>
      </div>
    </div>

    <!-- Test 4: Raw SVG fallback -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Test 4: Raw SVG Fallback</h2>
      <div class="flex items-center gap-4">
        <span>Raw SVG:</span>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
    </div>

    <!-- Test 5: Check if icons are loading -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">Test 5: Icon Loading Check</h2>
      <div class="space-y-2">
        <div>Check browser console for errors</div>
        <div>Check network tab for icon requests</div>
        <div>Inspect HTML for rendered SVG elements</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta for debugging
useSeoMeta({
  title: 'Icon Debug - epàlwi-rèbbo',
  description: 'Debug page for icon display issues'
})
</script>
