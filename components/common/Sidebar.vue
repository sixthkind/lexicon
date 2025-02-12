<template>
  <div class="flex h-screen k-item">
    <!-- Vertical Navigation -->
    <div class="w-48 border-r ">
      <div class="h-16 flex items-center px-6">
        <h2 class="text-lg font-semibold text-gray-800">_lexicon</h2>
      </div>
      <UVerticalNavigation
        :links="navigation"
        class="p-3"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();

// Navigation items
const navigation = [
  
];

// Determine which section to show based on route
const currentSection = computed(() => {
  const path = route.path;
  if (path.includes('/appointments')) return 'appointments';
  return 'members'; // default view
});
</script>

<style scoped>
/* Ensure the dashboard takes full height */
.h-screen {
  height: calc(100vh - 120px); /* Adjust based on your navbar height */
}
</style>
