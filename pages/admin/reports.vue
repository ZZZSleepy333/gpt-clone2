<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <AdminNavBar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Danh sách báo cáo</h2>

        <!-- Thêm Search bar -->
        <div class="mb-4">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm..."
            class="text-black bg-white w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-blue-500 to-indigo-600">
              <tr>
                <th
                  @click="handleSort('createdAt')"
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
                >
                  Thời gian
                  <span v-if="sortBy === 'createdAt'" class="ml-1">
                    {{ sortDirection === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th
                  @click="handleSort('reason')"
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
                >
                  Lý do
                  <span v-if="sortBy === 'reason'" class="ml-1">
                    {{ sortDirection === "asc" ? "↑" : "↓" }}
                  </span>
                </th>
                <th
                  @click="handleSort('status')"
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-600"
                >
                  Trạng thái
                  <span v-if="sortBy === 'status'" class="ml-1">
                    {{ sortDirection === "asc" ? "↑" : "↓" }}
                  </span>
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
                v-for="report in paginatedReports"
                :key="report._id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(report.createdAt) }}
                </td>
                <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ report.userId }}
                </td> -->
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ truncateText(report.reason, 50) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'px-2 py-1 text-xs font-medium rounded-full': true,
                      'bg-yellow-100 text-yellow-800':
                        report.status === 'pending',
                      'bg-green-100 text-green-800':
                        report.status === 'resolved',
                    }"
                  >
                    {{ report.status === "pending" ? "Chờ xử lý" : "Đã xử lý" }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-4">
                    <button
                      @click="showDetails(report)"
                      class="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      v-if="report.status === 'pending'"
                      @click="markAsResolved(report._id)"
                      class="text-green-600 hover:text-green-900 transition-colors duration-200 disabled:opacity-50"
                      :disabled="loadingReportId === report._id"
                    >
                      <span v-if="loadingReportId === report._id">
                        <span class="inline-block animate-spin mr-2">⌛</span>
                      </span>
                      {{
                        loadingReportId === report._id
                          ? "Đang xử lý..."
                          : "Đánh dấu đã xử lý"
                      }}
                    </button>
                    <button
                      v-if="report.status === 'resolved'"
                      @click="handleDelete(report._id)"
                      class="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Xóa
                    </button>
                  </div>
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
                    Math.min(
                      currentPage * itemsPerPage,
                      filteredAndSortedReports.length
                    )
                  }}</span>
                  trong tổng số
                  <span class="font-medium">{{
                    filteredAndSortedReports.length
                  }}</span>
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
    </div>

    <!-- Modal chi tiết -->
    <Modal v-if="selectedReport" @close="selectedReport = null">
      <div class="p-4 text-black">
        <h3 class="text-lg font-bold mb-4 text-center">Chi tiết báo cáo</h3>
        <div class="space-y-4">
          <div>
            <p class="font-medium">Tin nhắn người dùng:</p>
            <p class="mt-1 text-gray-600">
              {{ truncateText(selectedReport.userMessage) }}
            </p>
          </div>
          <div>
            <p class="font-medium">Phản hồi của bot:</p>
            <p class="mt-1 text-gray-600">
              {{ truncateText(selectedReport.botMessage) }}
            </p>
          </div>
          <div>
            <p class="font-medium">Lý do báo cáo:</p>
            <p class="mt-1 text-gray-600">
              {{ truncateText(selectedReport.reason) }}
            </p>
          </div>
          <div>
            <p class="font-medium">Thời gian báo cáo:</p>
            <p class="mt-1 text-gray-600">
              {{ formatDate(selectedReport.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Snackbar -->
    <Snackbar :show="!!success" :message="success" type="success" />
    <Snackbar :show="!!error" :message="error" type="error" />
  </div>
</template>

<script setup>
const reports = ref([]);
const selectedReport = ref(null);
const success = ref(null);
const error = ref(null);
const loadingReportId = ref(null);
const searchQuery = ref("");
const sortBy = ref("");
const sortDirection = ref("asc");
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredAndSortedReports = computed(() => {
  let result = [...reports.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (report) =>
        report.reason.toLowerCase().includes(query) ||
        report.userMessage.toLowerCase().includes(query) ||
        report.botMessage.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query)
    );
  }

  if (sortBy.value) {
    result.sort((a, b) => {
      let aVal = a[sortBy.value];
      let bVal = b[sortBy.value];

      if (sortBy.value === "createdAt") {
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

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedReports.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedReports.value.length / itemsPerPage);
});

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

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = column;
    sortDirection.value = "asc";
  }
};

async function fetchReports() {
  try {
    reports.value = await $fetch("/api/reports");
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
}

async function markAsResolved(id) {
  loadingReportId.value = id;
  try {
    if (!id) {
      throw new Error("ID không hợp lệ");
    }

    const response = await $fetch(`/api/reports/${id}`, {
      method: "PUT",
      body: { status: "resolved" },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response) {
      const index = reports.value.findIndex((r) => r._id === id);
      if (index !== -1) {
        reports.value[index] = { ...reports.value[index], status: "resolved" };
      }

      success.value = "Đã cập nhật trạng thái báo cáo thành công";
    }
  } catch (err) {
    console.error("Error updating report:", err);

    if (err.response) {
      error.value =
        err.response._data?.message ||
        "Lỗi server: Không thể cập nhật trạng thái";
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = "Có lỗi xảy ra khi cập nhật trạng thái";
    }
  } finally {
    loadingReportId.value = null;
    if (error.value) {
      setTimeout(() => {
        error.value = null;
      }, 3000);
    }
    if (success.value) {
      setTimeout(() => {
        success.value = null;
      }, 3000);
    }
  }
}

function showDetails(report) {
  selectedReport.value = report;
}

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

const truncateText = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
};

async function handleDelete(id) {
  const report = reports.value.find((r) => r._id === id);

  if (!report || report.status !== "resolved") {
    error.value = "Chỉ có thể xóa báo cáo đã được xử lý";
    setTimeout(() => {
      error.value = null;
    }, 3000);
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
    return;
  }

  try {
    await $fetch(`/api/reports/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    reports.value = reports.value.filter((report) => report._id !== id);
    success.value = "Đã xóa báo cáo thành công";

    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (err) {
    console.error("Error deleting report:", err);
    error.value = "Có lỗi xảy ra khi xóa báo cáo";

    setTimeout(() => {
      error.value = null;
    }, 3000);
  }
}

onMounted(() => {
  fetchReports();
});
</script>

<style>
.from-blue-50 {
  --tw-gradient-from: #eff6ff;
  --tw-gradient-stops: var(--tw-gradient-from),
    var(--tw-gradient-to, rgb(239 246 255 / 0));
}

.to-indigo-100 {
  --tw-gradient-to: #e0e7ff;
}
</style>
