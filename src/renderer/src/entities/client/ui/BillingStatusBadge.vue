<script setup lang="ts">
import { computed } from 'vue';
import type { BillingStatus } from '@preload/types';

const props = defineProps<{ status: BillingStatus }>();

const colorClasses = computed<string>(() => {
  switch (props.status) {
    case 'Paid':
      return 'bg-green-100 text-green-700';
    case 'Partially Paid':
      return 'bg-amber-100 text-amber-700';
    case 'Trial':
      return 'bg-sky-100 text-sky-700';
    case 'Unpaid':
    default:
      return 'bg-red-100 text-red-700';
  }
});
</script>

<template>
  <span :class="['rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', colorClasses]">
    {{ status }}
  </span>
</template>
