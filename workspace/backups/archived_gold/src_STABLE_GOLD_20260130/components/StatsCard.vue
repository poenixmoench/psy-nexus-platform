<template>
  <div
    class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 transform hover:scale-105"
    :class="cardBorderClass"
    role="status"
    :aria-label="`${label}: ${value}`"
  >
    <div class="flex items-center justify-between">
      <div class="text-4xl" :class="iconColorClass">
        {{ icon }}
      </div>

      <div class="text-right flex-1 ml-4">
        <p class="text-2xl md:text-3xl font-bold text-gray-900">
          {{ value }}
        </p>
        <p class="text-xs md:text-sm font-medium text-gray-600 mt-2">
          {{ label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  status: 'total' | 'success' | 'failed' | 'pending'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Statistik',
  value: 0,
  status: 'total'
})

const iconMap: Record<string, string> = {
  total: '📊',
  success: '✅',
  failed: '❌',
  pending: '⏳'
}

const icon = computed(() => iconMap[props.status] || '📈')

const cardBorderClass = computed(() => {
  const classes: Record<string, string> = {
    total: 'border-t-4 border-gray-400',
    success: 'border-t-4 border-green-500',
    failed: 'border-t-4 border-red-500',
    pending: 'border-t-4 border-yellow-500'
  }
  return classes[props.status] || classes.total
})

const iconColorClass = computed(() => {
  const classes: Record<string, string> = {
    total: 'text-gray-400',
    success: 'text-green-500',
    failed: 'text-red-500',
    pending: 'text-yellow-500'
  }
  return classes[props.status] || classes.total
})
</script>

<style scoped>
/* Tailwind */
</style>
