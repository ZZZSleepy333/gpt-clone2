<script setup>
definePageMeta({
  middleware: "auth",
});

const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));
const formData = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const error = ref(null);
const success = ref(false);

const handleSubmit = async () => {
  try {
    error.value = null;
    success.value = false;

    // Validate passwords match
    if (formData.value.newPassword !== formData.value.confirmPassword) {
      error.value = "Mật khẩu mới không khớp";
      return;
    }

    if (formData.value.newPassword.length < 6) {
      error.value = "Mật khẩu mới phải có ít nhất 6 ký tự";
      return;
    }

    await $fetch(`/api/users/${user.value.id}/password`, {
      method: "PUT",
      body: {
        currentPassword: formData.value.currentPassword,
        newPassword: formData.value.newPassword,
      },
    });

    success.value = true;
    formData.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err) {
    error.value = err.data?.message || "Có lỗi xảy ra";
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <AdminNavBar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Đổi mật khẩu</h2>

        <div
          v-if="error"
          class="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="success"
          class="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded animate-fade-in-out"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">Đổi mật khẩu thành công!</p>
            </div>
          </div>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-6 bg-gray-50 p-6 rounded-lg max-w-md"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              v-model="formData.currentPassword"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              v-model="formData.newPassword"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              v-model="formData.confirmPassword"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.from-blue-50 {
  --tw-gradient-from: #eff6ff;
  --tw-gradient-stops: var(--tw-gradient-from),
    var(--tw-gradient-to, rgb(239 246 255 / 0));
}

.to-indigo-100 {
  --tw-gradient-to: #e0e7ff;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.animate-fade-in-out {
  animation: fadeInOut 3s ease-in-out;
}
</style>
