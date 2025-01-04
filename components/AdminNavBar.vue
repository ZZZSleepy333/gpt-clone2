<script setup>
const router = useRouter();
const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));

const handleLogout = () => {
  localStorage.removeItem("user");
  router.push("/login");
};
</script>

<template>
  <nav class="bg-white shadow-md mb-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <NuxtLink
            to="/admin"
            class="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Quản lý Q&A
          </NuxtLink>
          <NuxtLink
            v-if="user.role === 'manager'"
            to="/admin/users"
            class="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Quản lý tài khoản
          </NuxtLink>
          <NuxtLink
            to="/admin/reports"
            class="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Danh sách báo cáo
          </NuxtLink>
        </div>
        <div class="flex items-center">
          <button
            @click="handleLogout"
            class="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
