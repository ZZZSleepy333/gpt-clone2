<script setup>
definePageMeta({
  middleware: ["auth", "manager-only"],
});

const { data: users, refresh } = await useFetch("/api/users");
const formData = ref({
  username: "",
  displayName: "",
  password: "",
  role: "staff",
});
const editingId = ref(null);
const error = ref(null);
const success = ref(null);

const handleSubmit = async () => {
  try {
    error.value = null;
    success.value = null;

    if (editingId.value) {
      await $fetch(`/api/users/${editingId.value}`, {
        method: "PUT",
        body: formData.value,
      });
      success.value = "Cập nhật tài khoản thành công!";
    } else {
      await $fetch("/api/users", {
        method: "POST",
        body: formData.value,
      });
      success.value = "Thêm tài khoản mới thành công!";
    }

    formData.value = {
      username: "",
      displayName: "",
      password: "",
      role: "staff",
    };
    editingId.value = null;
    refresh();

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (err) {
    error.value = err.data?.message || "Có lỗi xảy ra";
  }
};

const handleEdit = (user) => {
  formData.value = {
    username: user.username,
    displayName: user.displayName,
    password: "",
    role: user.role,
  };
  editingId.value = user._id;
};

const handleDelete = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    try {
      await $fetch(`/api/users/${id}`, { method: "DELETE" });
      success.value = "Xóa tài khoản thành công!";
      refresh();

      setTimeout(() => {
        success.value = null;
      }, 3000);
    } catch (err) {
      error.value = err.data?.message || "Có lỗi xảy ra";
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <AdminNavBar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Quản lý tài khoản</h2>

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
              <p class="text-sm text-green-700">{{ success }}</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form
          @submit.prevent="handleSubmit"
          class="space-y-6 bg-gray-50 p-6 rounded-lg mb-8"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
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
              Tên hiển thị
            </label>
            <input
              type="text"
              v-model="formData.displayName"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              v-model="formData.password"
              :required="!editingId"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p v-if="editingId" class="mt-1 text-sm text-gray-500">
              Để trống nếu không muốn thay đổi mật khẩu
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              v-model="formData.role"
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            {{ editingId ? "Cập nhật" : "Thêm mới" }}
          </button>
        </form>

        <!-- Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-blue-500 to-indigo-600">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Tên đăng nhập
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Tên hiển thị
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Vai trò
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="user in users"
                :key="user._id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                  {{ user.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                  {{ user.displayName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                  {{ user.role === "manager" ? "Quản lý" : "Nhân viên" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="handleEdit(user)"
                    class="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                  >
                    Sửa
                  </button>
                  <button
                    @click="handleDelete(user._id)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-200"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
