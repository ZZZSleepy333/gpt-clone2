<script setup>
const user = ref(JSON.parse(localStorage.getItem("user") || "{}"));

const qas = ref([]);
const loading = ref(false);

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await $fetch("/api/qa", {
      headers: {
        authorization: JSON.stringify(user.value),
      },
    });

    qas.value = response;
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = "Có lỗi khi tải dữ liệu";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const formData = ref({
  question: "",
  answer: "",
  keyword: "",
});
const editingId = ref(null);
const error = ref(null);
const success = ref(null);

const currentPage = ref(1);
const itemsPerPage = 10;

const sortBy = ref("");
const sortDirection = ref("asc");
const searchQuery = ref("");

const filteredAndSortedQas = computed(() => {
  let result = [...qas.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.createdBy.toLowerCase().includes(query)
    );
  }

  if (sortBy.value) {
    result.sort((a, b) => {
      let aVal = a[sortBy.value];
      let bVal = b[sortBy.value];

      if (sortBy.value === "createdAt" || sortBy.value === "updatedAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortDirection.value === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  return result;
});

const paginatedQas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedQas.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil((qas.value?.length || 0) / itemsPerPage);
});

const truncateText = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const isFormValid = computed(() => {
  return (
    formData.value.question?.trim() &&
    formData.value.answer?.trim() &&
    formData.value.keyword?.trim()
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = "Vui lòng điền đầy đủ thông tin";
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const processedData = {
      ...formData.value,
      keyword: formData.value.keyword
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
    };

    if (editingId.value) {
      await $fetch(`/api/qa/${editingId.value}`, {
        method: "PUT",
        headers: {
          authorization: JSON.stringify(user.value),
        },
        body: processedData,
      });
      success.value = "Cập nhật câu hỏi thành công!";
    } else {
      await $fetch("/api/qa", {
        method: "POST",
        headers: {
          authorization: JSON.stringify(user.value),
          "Content-Type": "application/json",
        },
        body: processedData,
      });
      success.value = "Thêm câu hỏi mới thành công!";
    }

    setTimeout(() => {
      success.value = null;
    }, 3000);

    await fetchData();

    formData.value = { question: "", answer: "", keyword: "" };
    editingId.value = null;
  } catch (err) {
    console.error("Error in handleSubmit:", err);
    error.value = "Có lỗi xảy ra khi lưu dữ liệu";
    setTimeout(() => {
      error.value = null;
    }, 3000);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  formData.value = { question: "", answer: "", keyword: "" };
  editingId.value = null;
  error.value = null;
  success.value = null;
};

const handleDelete = async (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    try {
      await $fetch(`/api/qa/${id}`, {
        method: "DELETE",
        headers: {
          authorization: JSON.stringify(user.value),
        },
      });
      success.value = "Xóa câu hỏi thành công!";
      await fetchData();

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
    keyword: Array.isArray(item.keyword)
      ? item.keyword.join(", ")
      : item.keyword || "",
  };
  editingId.value = item._id;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = column;
    sortDirection.value = "asc";
  }
};
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
              >Câu hỏi <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              v-model="formData.question"
              required
              placeholder="Nhập câu hỏi"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Câu trả lời <span class="text-red-500">*</span></label
            >
            <textarea
              v-model="formData.answer"
              rows="4"
              required
              placeholder="Nhập câu trả lời"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Từ khóa <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              v-model="formData.keyword"
              required
              placeholder="Nhập từ khóa, phân cách bằng dấu phẩy"
              class="text-black w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Các từ khóa cách nhau bởi dấu phẩy (,)
            </p>
          </div>

          <div class="flex space-x-4">
            <button
              type="submit"
              :disabled="!isFormValid || loading"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              {{ editingId ? "Cập nhật" : "Thêm mới" }}
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

      <!-- Table -->
      <div class="mb-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm..."
          class="text-black bg-white w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gradient-to-r from-blue-500 to-indigo-600">
            <tr>
              <th
                @click="handleSort('question')"
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
              >
                Câu hỏi
                <span v-if="sortBy === 'question'" class="ml-1">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                @click="handleSort('answer')"
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
              >
                Câu trả lời
                <span v-if="sortBy === 'answer'" class="ml-1">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                @click="handleSort('createdBy')"
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
              >
                Người tạo
                <span v-if="sortBy === 'createdBy'" class="ml-1">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                @click="handleSort('createdAt')"
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
              >
                Ngày tạo
                <span v-if="sortBy === 'createdAt'" class="ml-1">
                  {{ sortDirection === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Người cập nhật
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Ngày cập nhật
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
              v-for="item in paginatedQas"
              :key="item._id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <span class="text-black" :title="item.question">
                  {{ truncateText(item.question, 50) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-black" :title="item.answer">
                  {{ truncateText(item.answer, 50) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-black">{{ item.createdBy }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-black">{{ formatDate(item.createdAt) }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-black">{{ item.updatedBy }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-black">{{ formatDate(item.updatedAt) }}</span>
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

        <!-- Pagination -->
        <div
          class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div
            class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm text-gray-700">
                Hiển thị
                <span class="font-medium">{{
                  (currentPage - 1) * itemsPerPage + 1
                }}</span>
                đến
                <span class="font-medium">{{
                  Math.min(currentPage * itemsPerPage, qas?.length || 0)
                }}</span>
                trong tổng số
                <span class="font-medium">{{ qas?.length || 0 }}</span>
                kết quả
              </p>
            </div>
            <div>
              <nav
                class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              >
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span class="sr-only">Previous</span>
                  &larr;
                </button>
                <span
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  {{ currentPage }} / {{ totalPages }}
                </span>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span class="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <Snackbar :show="!!success" :message="success" type="success" />
    <Snackbar :show="!!error" :message="error" type="error" />
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
