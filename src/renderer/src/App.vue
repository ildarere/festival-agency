<script setup lang="ts">
import AppSidebar from '@renderer/shared/ui/AppSidebar.vue';
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-50">
    <AppSidebar />
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
