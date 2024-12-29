<script setup>
const credentials = ref({
  username: "",
  password: "",
});
const error = ref(null);
const router = useRouter();
const loginAttempts = ref(0);

const handleSubmit = async () => {
  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: credentials.value,
    });

    localStorage.setItem("user", JSON.stringify(response));
    loginAttempts.value = 0;
    router.push("/admin");
  } catch (error) {
    loginAttempts.value++;
    error.value = error.data?.message || "Đăng nhập thất bại";
  }
};

const initSampleData = async () => {
  try {
    const response = await $fetch("/api/seed", {
      method: "POST",
    });
    console.log(response.message);
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// Tự động khởi tạo khi load trang
onMounted(() => {
  initSampleData();
});

// Tính năng tự động reset số lần đăng nhập sai sau 5 phút
let resetTimer;
watch(loginAttempts, (newValue) => {
  if (newValue > 0) {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(
      () => {
        loginAttempts.value = 0;
      },
      5 * 60 * 1000
    ); // 5 phút
  }
});

onUnmounted(() => {
  clearTimeout(resetTimer);
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="px-8 py-10">
        <h2 class="text-3xl font-bold text-center text-black mb-8">
          Đăng nhập hệ thống
        </h2>

        <!-- Thông báo -->
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
            <input
              type="password"
              v-model="credentials.password"
              class="text-black mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
