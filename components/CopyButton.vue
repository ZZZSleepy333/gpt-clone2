<template>
  <div>
    <button @click="copyText" class="hover:text-blue-500">
      <i class="fas fa-copy"></i>
    </button>

    <Snackbar :show="showSnackbar" message="Đã sao chép vào clipboard!" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Snackbar from "./Snackbar.vue";

const showSnackbar = ref(false);

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(props.text);
    showSnackbar.value = true;
    setTimeout(() => {
      showSnackbar.value = false;
    }, 3000);
  } catch (err) {
    console.error("Failed to copy text:", err);
  }
};
</script>
