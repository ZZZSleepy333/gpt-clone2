<script setup>
const { data: qas, refresh } = await useFetch("/api/qa");
const formData = ref({
  question: "",
  answer: "",
  keyword: [],
});
const editingId = ref(null);
const error = ref(null);
const success = ref(null);

const handleSubmit = async () => {
  try {
    error.value = null;
    success.value = null;

    if (editingId.value) {
      await $fetch(`/api/qa/${editingId.value}`, {
        method: "PUT",
        body: formData.value,
      });
      success.value = "Cập nhật câu hỏi thành công!";
    } else {
      await $fetch("/api/qa", {
        method: "POST",
        body: formData.value,
      });
      success.value = "Thêm câu hỏi mới thành công!";
    }

    formData.value = { question: "", answer: "", keyword: [] };
    editingId.value = null;
    refresh();

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (error) {
    error.value = "Có lỗi xảy ra khi lưu dữ liệu";
    console.error("Error saving data:", error);
  }
};

const handleDelete = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    try {
      await $fetch(`/api/qa/${id}`, { method: "DELETE" });
      success.value = "Xóa câu hỏi thành công!";
      refresh();

      setTimeout(() => {
        success.value = null;
      }, 3000);
    } catch (error) {
      error.value = "Có lỗi xảy ra khi xóa";
      console.error("Error deleting:", error);
    }
  }
};

const handleEdit = (item) => {
  formData.value = {
    question: item.question,
    answer: item.answer,
    keyword: item.keyword,
  };
  editingId.value = item._id;
};

const initSampleData = async () => {
  try {
    const response = await $fetch("/api/qa/seed", {
      method: "POST",
    });
    console.log(response.message);
    refresh();
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};

// Tự động khởi tạo khi load trang
onMounted(() => {
  initSampleData();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <AdminNavBar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Quản lý câu hỏi</h2>

        <!-- Form -->
        <form
          @submit.prevent="handleSubmit"
          class="space-y-6 bg-gray-50 p-6 rounded-lg"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Câu hỏi</label
            >
            <input
              type="text"
              v-model="formData.question"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Câu trả lời</label
            >
            <textarea
              v-model="formData.answer"
              rows="4"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Keywords</label
            >
            <input
              type="text"
              v-model="formData.keyword"
              @input="formData.keyword = $event.target.value.split(',')"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập keywords, phân cách bằng dấu phẩy"
            />
          </div>

          <button
            type="submit"
            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            {{ editingId ? "Cập nhật" : "Thêm mới" }}
          </button>
        </form>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-blue-500 to-indigo-600">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Câu hỏi
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Câu trả lời
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Keywords
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Người tạo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Thời gian tạo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Cập nhật bởi
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Thời gian cập nhật
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in qas" :key="item._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-pre-wrap">
                <span class="text-black">{{ item.question }}</span>
              </td>
              <td class="px-6 py-4 whitespace-pre-wrap">
                <span class="text-black">{{ item.answer }}</span>
              </td>
              <td class="px-6 py-4 whitespace-pre-wrap">
                <span class="text-black">{{ item.keyword.join(", ") }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-black">{{
                  item.createdByName || item.createdBy
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-black">{{
                  new Date(item.createdAt).toLocaleString()
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-black">{{
                  item.updatedByName || item.updatedBy
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-black">{{
                  new Date(item.updatedAt).toLocaleString()
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="handleEdit(item)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                >
                  Sửa
                </button>
                <button
                  @click="handleDelete(item._id)"
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
</template>

<style>
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
