<script setup>
const credentials = ref({
  username: "",
  password: "",
});
const error = ref(null);
const success = ref(null);
const loading = ref(false);
const showPassword = ref(false);
const router = useRouter();
const loginAttempts = ref(0);

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: credentials.value,
    });

    localStorage.setItem("user", JSON.stringify(response));
    loginAttempts.value = 0;
    success.value = "Đăng nhập thành công!";

    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/admin");
  } catch (err) {
    console.log("Lỗi đăng nhập:", err);
    loginAttempts.value++;
    error.value =
      err.data?.message ||
      "Đăng nhập không thành công, tài khoản hoặc mật khẩu không chính xác";
  } finally {
    loading.value = false;
  }
};

let resetTimer;
watch(loginAttempts, (newValue) => {
  if (newValue > 0) {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(
      () => {
        loginAttempts.value = 0;
      },
      5 * 60 * 1000
    );
  }
});

onUnmounted(() => {
  clearTimeout(resetTimer);
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div class="px-8 py-10">
        <h2 class="text-3xl font-bold text-center text-black mb-8">
          Đăng nhập hệ thống
        </h2>

        <!-- Thông báo lỗi -->
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

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-black">
              Tên đăng nhập
            </label>
            <input
              type="text"
              v-model="credentials.username"
              class="text-black mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-black">
              Mật khẩu
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="credentials.password"
                class="text-black mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <svg
                  class="h-5 w-5 text-gray-500 hover:text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    v-if="showPassword"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    v-if="showPassword"
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
            <div class="flex justify-end mt-2">
              <NuxtLink
                to="/admin/password"
                class="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Quên mật khẩu?
              </NuxtLink>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            Đăng nhập
          </button>
        </form>
      </div>

      <!-- Snackbar chỉ cho thông báo thành công -->
      <Snackbar :show="!!success" :message="success" type="success" />
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

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
