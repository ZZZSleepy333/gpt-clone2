<script setup>
const props = defineProps({
  message: String,
  type: {
    type: String,
    default: "success",
  },
  show: Boolean,
});
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="show"
      :class="[
        'fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50',
        type === 'success' ? 'bg-green-500' : 'bg-red-500',
      ]"
    >
      <p class="text-white whitespace-nowrap">{{ message }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px) translateX(-50%);
  opacity: 0;
}
</style>
