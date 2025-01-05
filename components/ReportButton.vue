<template>
  <div>
    <button
      @click="showReportModal = true"
      class="text-red-400 hover:text-red-500"
    >
      <i class="fas fa-flag"></i>
    </button>

    <Modal v-if="showReportModal" @close="showReportModal = false">
      <form @submit.prevent="submitReport" class="space-y-4">
        <h3 class="text-lg font-bold text-red-500 text-center">
          Báo cáo tin nhắn
        </h3>
        <div>
          <textarea
            v-model="reason"
            rows="4"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black bg-white"
            placeholder="Nhập lý do báo cáo..."
            required
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="showReportModal = false"
            class="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 flex items-center gap-2"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="animate-spin">
              <i class="fas fa-circle-notch"></i>
            </span>
            {{ isLoading ? "Đang gửi..." : "Gửi báo cáo" }}
          </button>
        </div>
      </form>
    </Modal>

    <Snackbar :show="showSnackbar" message="Báo cáo đã được gửi thành công!" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Modal from "./Modal.vue";
import Snackbar from "./Snackbar.vue";

const showReportModal = ref(false);
const showSnackbar = ref(false);
const reason = ref("");
const isLoading = ref(false);

const props = defineProps({
  messageId: String,
  userMessage: String,
  botMessage: String,
});

async function submitReport() {
  try {
    isLoading.value = true;

    const reportData = {
      userId: localStorage.getItem("chatId"),
      reason: reason.value,
      userMessage: props.userMessage,
      botMessage: props.botMessage,
    };

    console.log("Dữ liệu báo cáo sẽ gửi:", reportData);

    await $fetch("/api/reports", {
      method: "POST",
      body: reportData,
    });

    showReportModal.value = false;
    reason.value = "";
    showSnackbar.value = true;
    setTimeout(() => {
      showSnackbar.value = false;
    }, 3000);
  } catch (error) {
    console.error("Error submitting report:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>
