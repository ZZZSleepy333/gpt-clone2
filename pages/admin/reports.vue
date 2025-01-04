<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <AdminNavBar />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Danh sách báo cáo</h2>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-blue-500 to-indigo-600">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Thời gian
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Người báo cáo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Lý do
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Trạng thái
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
                v-for="report in reports"
                :key="report._id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(report.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ report.userId }}
                </td>
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
                  <button
                    @click="showDetails(report)"
                    class="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    v-if="report.status === 'pending'"
                    @click="markAsResolved(report._id)"
                    class="text-green-600 hover:text-green-900 transition-colors duration-200"
                  >
                    Đánh dấu đã xử lý
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết -->
    <Modal v-if="selectedReport" @close="selectedReport = null">
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">Chi tiết báo cáo</h3>
        <div class="space-y-4">
          <div>
            <p class="font-medium">Tin nhắn người dùng:</p>
            <p class="mt-1 text-gray-600">{{ selectedReport.userMessage }}</p>
          </div>
          <div>
            <p class="font-medium">Phản hồi của bot:</p>
            <p class="mt-1 text-gray-600">{{ selectedReport.botMessage }}</p>
          </div>
          <div>
            <p class="font-medium">Lý do báo cáo:</p>
            <p class="mt-1 text-gray-600">{{ selectedReport.reason }}</p>
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

// Lấy danh sách báo cáo
async function fetchReports() {
  try {
    reports.value = await $fetch("/api/reports");
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
}

// Đánh dấu đã xử lý
async function markAsResolved(id) {
  try {
    await $fetch(`/api/reports/${id}`, {
      method: "PATCH",
      body: { status: "resolved" },
    });
    success.value = "Đã cập nhật trạng thái báo cáo";
    await fetchReports();
    setTimeout(() => {
      success.value = null;
    }, 3000);
  } catch (error) {
    console.error("Error updating report:", error);
    error.value = "Có lỗi xảy ra khi cập nhật";
    setTimeout(() => {
      error.value = null;
    }, 3000);
  }
}

// Hiển thị chi tiết báo cáo
function showDetails(report) {
  selectedReport.value = report;
}

// Format date
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

// Truncate text
const truncateText = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
};

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
