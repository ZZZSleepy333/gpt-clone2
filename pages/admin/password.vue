<script setup>
const formData = ref({
  username: "",
  newPassword: "",
  confirmPassword: "",
});

const error = ref(null);
const success = ref(false);
const loading = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarType = ref("success");

const passwordsMatch = computed(() => {
  return formData.value.newPassword === formData.value.confirmPassword;
});

const handleSubmit = async () => {
  try {
    if (formData.value.newPassword.length < 6) {
      error.value = "Mật khẩu phải có ít nhất 6 ký tự";
      return;
    }

    if (!passwordsMatch.value) {
      error.value = "Mật khẩu xác nhận không khớp với mật khẩu mới";
      return;
    }

    loading.value = true;
    error.value = null;

    const response = await $fetch("/api/users/reset-password", {
      method: "PUT",
      body: {
        username: formData.value.username,
        newPassword: formData.value.newPassword,
      },
    });

    if (response.error || response.statusCode >= 400) {
      throw createError({
        statusCode: response.statusCode || 400,
        message: response.message || "Có lỗi xảy ra khi đặt lại mật khẩu",
      });
    }

    success.value = true;
    snackbarMessage.value = "Đặt lại mật khẩu thành công!";
    snackbarType.value = "success";
    showSnackbar.value = true;

    formData.value = {
      username: "",
      newPassword: "",
      confirmPassword: "",
    };

    setTimeout(() => {
      showSnackbar.value = false;
      navigateTo("/login");
    }, 3000);
  } catch (err) {
    console.error("Reset password error:", err);

    error.value = err.message || "Có lỗi xảy ra khi đặt lại mật khẩu";

    let snackbarError = "";
    switch (err.statusCode) {
      case 404:
        snackbarError = "Tài khoản không tồn tại";
        break;
      case 400:
        snackbarError = "Không thể đặt lại mật khẩu";
        break;
      case 500:
        snackbarError = "Lỗi hệ thống";
        break;
      default:
        snackbarError = "Có lỗi xảy ra";
    }

    snackbarMessage.value = snackbarError;
    snackbarType.value = "error";
    showSnackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  navigateTo("/login");
};

watch(
  () => formData.value.confirmPassword,
  (newVal) => {
    if (newVal && !passwordsMatch.value) {
      error.value = "Mật khẩu xác nhận không khớp với mật khẩu mới";
    } else {
      error.value = null;
    }
  }
);

watch(
  () => formData.value.newPassword,
  (newVal) => {
    if (newVal.length > 0 && newVal.length < 6) {
      error.value = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (formData.value.confirmPassword && !passwordsMatch.value) {
      error.value = "Mật khẩu xác nhận không khớp với mật khẩu mới";
    } else {
      error.value = null;
    }
  }
);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div
      class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div
        class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden p-6"
      >
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
          Đặt lại mật khẩu
        </h2>

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
              <p class="text-sm text-green-700">
                Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...
              </p>
            </div>
          </div>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-6 bg-gray-50 p-6 rounded-lg"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
              <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="formData.username"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
              <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="formData.newPassword"
                class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showNewPassword = !showNewPassword"
              >
                <svg
                  class="h-5 w-5 text-gray-500 hover:text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    v-if="showNewPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    v-if="showNewPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
              <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="formData.confirmPassword"
                required
                placeholder="Nhập lại mật khẩu mới"
                :class="[
                  'text-black w-full px-4 py-3 bg-white border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  {
                    'border-red-500':
                      formData.confirmPassword && !passwordsMatch,
                    'border-gray-300':
                      !formData.confirmPassword || passwordsMatch,
                  },
                ]"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  class="h-5 w-5 text-gray-500 hover:text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    v-if="showConfirmPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    v-if="showConfirmPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
            <p
              v-if="formData.confirmPassword && !passwordsMatch"
              class="mt-1 text-sm text-red-600"
            >
              Mật khẩu xác nhận không khớp với mật khẩu mới
            </p>
          </div>

          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="mr-2">
                <svg
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              Đặt lại mật khẩu
            </button>

            <button
              type="button"
              @click="handleCancel"
              class="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <Snackbar
    :show="showSnackbar"
    :message="snackbarMessage"
    :type="snackbarType"
  />
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
