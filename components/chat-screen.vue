<template>
  <div class="flex flex-col h-screen">
    <Header />
    <div
      class="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden"
    >
      <div class="h-full flex flex-col">
        <!-- Chat messages area -->
        <div class="flex-1 overflow-y-auto p-4" ref="scrollContainer">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex flex-col"
            ref="messageContainer"
          >
            <!-- User message -->
            <div
              v-if="message.userMessage !== ''"
              class="flex justify-end mb-4"
            >
              <div
                class="max-w-[80%] lg:max-w-[60%] bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md p-4"
              >
                <pre class="whitespace-pre-wrap">{{ message.userMessage }}</pre>
              </div>
            </div>

            <!-- Bot message -->
            <div class="flex flex-col space-y-2 mb-4">
              <div
                class="max-w-[80%] lg:max-w-[60%] bg-white rounded-lg shadow-md p-4"
              >
                <pre class="whitespace-pre-wrap text-gray-800">{{
                  message.botMessage.snippet
                }}</pre>
              </div>
              <div
                v-if="message.botMessage.title !== ''"
                class="max-w-[80%] lg:max-w-[60%] bg-white rounded-lg shadow-md p-4"
              >
                <p class="text-gray-800">
                  Bạn có thể xem thêm thông tin tại:
                  <a
                    :href="message.botMessage.link"
                    class="text-blue-600 hover:text-blue-800 underline visited:text-purple-600"
                  >
                    {{ message.botMessage.title }}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex justify-center my-4">
            <div class="flex space-x-2">
              <div
                class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              ></div>
              <div
                class="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"
              ></div>
              <div
                class="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"
              ></div>
            </div>
          </div>
        </div>

        <!-- Input area - Fixed at bottom -->
        <div class="bg-white border-t border-gray-200 p-4">
          <div class="max-w-7xl mx-auto flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              class="text-white flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập câu hỏi của bạn..."
              @keyup.enter="handleClickSearch"
            />
            <button
              @click="handleClickSearch"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js" setup>
import { defineComponent, onMounted, ref, provide } from "vue";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/pagination";

import { useSendMessage } from "~/composables/useSendMessage.js";
import { useFiltering } from "~/composables/useFiltering";
import { useModalStore } from "~/stores/modal";
import { useMessageStore } from "~/stores/useMessageStore";
import { useChatIDStore } from "~/stores/useChatID";
import { getJson } from "serpapi";
const modalStore = useModalStore();

const { sendMessage, newMessage, messages, isLoading } = useSendMessage();
const { search, fetchAllSnippets } = useFiltering();
const ChatIDStore = useChatIDStore();

const data = ref(null);

const config = useRuntimeConfig();
//const isLoading = ref(true);
const messageStore = useMessageStore();

defineComponent({
  name: "CibTelegramPlane",
});

const conversationId = localStorage.getItem("chatId");
onMounted(async () => {
  const userId = localStorage.getItem("chatId");

  if (userId) {
    await messageStore.fetchMessagesByUserID();
    messages.value = messageStore.messages;
    console.log(userId);
    await nextTick();
    setTimeout(() => {
      smoothScrollToBottom();
    }, 200);
  } else {
    console.error("Không có userId");
  }
});
// onMounted(async () => {
//   try {
//     const response = await axios.get(
//       "https://script.google.com/macros/s/AKfycbzIs7xRy3VUkgx9A5kGcAypP3tBPH8sXAs7TVF9mBygVJsO9lXy7VRDMUc2o5kg2v2sFw/exec"
//     );
//     const platform = response.data.map((errorCode) => errorCode.Platform);

//     platformChoiceOption.value = [...new Set(platform)];
//     data.value = response.data;
//     console.log(response.data);
//   } catch (error) {
//     console.error("Lỗi khi tải dữ liệu:", error);
//   } finally {
//     isLoading.value = false;
//     FilteredData.value = data.value;
//   }
// });

provide("data", data);

const windowWidth = ref(window.innerWidth);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value < 965 && modalStore.sidebar_visible) {
    modalStore.sidebar_visible = false;
    modalStore.sidebar_auto_hidden = true;
  } else if (windowWidth.value >= 965 && modalStore.sidebar_auto_hidden) {
    modalStore.sidebar_visible = true;
    modalStore.sidebar_auto_hidden = false;
  }
};

import { useSearch } from "~/composables/useSearch";

const { searchGoogle } = useSearch();
let results = null; // Lưu trữ kết quả trả về

// Hàm xử lý tìm kiếm
const handleSearch = async (queryInput) => {
  try {
    console.log("Request URL:", `/api/search?q=${queryInput}`);

    const response = await axios.get("/api/search", {
      params: {
        q: queryInput,
      },
      headers: {
        Accept: "application/json",
      },
    });
    console.log("Search Results:", response.data);
  } catch (error) {
    console.error("Error fetching search results:", error.message);
  }
};

const scrollContainer = ref(null);
const messageContainer = ref(null);

const scrollToBottom = () => {
  if (scrollContainer.value) {
    const container = scrollContainer.value;
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }
};

const smoothScrollToBottom = () => {
  if (scrollContainer.value) {
    const container = scrollContainer.value;
    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }
};

const handleClickSearch = async () => {
  if (newMessage.value === undefined || newMessage.value === "") {
    console.log("");
  } else {
    const input = newMessage.value;
    newMessage.value = "";
    console.log(input);

    isLoading.value = true;
    try {
      await fetchAllSnippets(input);
      await messageStore.saveConversation(messages.value);
    } finally {
      isLoading.value = false;
      await nextTick();
      smoothScrollToBottom();
    }
  }
};

// Thêm hook onMounted để scroll khi component được mount
onMounted(async () => {
  // Đợi một chút để đảm bảo dữ liệu đã được load
  await nextTick();
  setTimeout(() => {
    smoothScrollToBottom();
  }, 100);
});
</script>

<style scoped>
.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
