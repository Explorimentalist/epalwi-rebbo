<script setup lang="ts">
// @ts-nocheck
import EmptyState from './EmptyState.vue'
</script>

<template>
  <Story 
    title="Common/EmptyState"
    :layout="{ type: 'single', iframe: false }"
  >
    <Variant title="Default">
      <EmptyState />
    </Variant>

    <Variant title="With Custom Message">
      <EmptyState 
        title="No results found"
        message="Try adjusting your search terms"
      />
    </Variant>

    <Variant title="With Action">
      <EmptyState 
        title="Nothing here yet"
        message="Get started by adding your first item"
        action-text="Add Item"
        @action="() => alert('Action clicked!')"
      />
    </Variant>
  </Story>
</template> 