<template>
  <Header />
  <!-- <div v-if="isLoading">
    <div class="loader"></div>
  </div>  -->

  <div
    class="h-screen bg-[#003049] overflow-x-hidden flex flex-col lg:flex-row mainscreen"
    ref="scrollContainer"
  >
    <div
      class="flex flex-col bg-[#003049] content-between min-w-[50%] flex-auto chatscreen"
      ref="scrollContainer"
    >
      <div className=" ">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex flex-col first:mt-[15vh]"
          ref="messageContainer"
        >
          <div
            class="message-container user-message lg:w-[30vw] md:w-[50vw] sm:w-[70vw] w-[100vw] h-fit pr-[15px] mx-[10px] mb-[10px] relative overflow-y-auto text-[#003049] sm:ml-auto md:ml-auto lg:ml-auto"
            v-if="message.userMessage !== ''"
          >
            <pre class="rounded-lg shadow-lg user ml-[45px] mr-[45px]">{{
              message.userMessage
            }}</pre>
          </div>

          <div
            class="message-container bot-message lg:w-[30vw] md:w-[50vw] sm:w-[70vw] w-[100vw] h-fit pr-[15px] mx-[10px] mb-[10px] relative overflow-y-auto text-[#003049] flex flex-col space-y-2"
          >
            <pre class="rounded-lg bot shadow-lg space-y-2">{{
              message.botMessage.snippet
            }}</pre>
            <pre
              class="rounded-lg bot shadow-lg space-y-2"
              v-if="message.botMessage.title !== ''"
            >
Bạn có thể xem thêm thông tin tại: <a class=" underline  hover:text-blue-800 visited:text-purple-500" :href="message.botMessage.link">{{ message.botMessage.title }}</a></pre>
          </div>
        </div>
      </div>
    </div>

    <div
      class="p-5 flex flex-row bottom-0 right-0 left-0 w-full sticky z-10 flex-grow-0 mt-auto"
    >
      <div class="w-screen flex flex-col flex-auto">
        <input
          v-model="newMessage"
          type="text"
          class="w-full text-[#003049] font-semibold flex-auto bg-[#eae2b7] rounded-full px-[16px] border-[#003049] border-2 text-lg min-h-[66pxs]"
          placeholder="Input your question here"
          @keyup.enter="handleClickSearch"
        />
      </div>
      <button
        class="bg-[#eae2b7] p-2 m-2 text-center no-underline inline-block text-base w-12 h-12 cursor-pointer border-[#003049] border-2 text-[#003049] font-bold rounded-full shrink-0 hover:bg-[#d62828] hover:border-[#003049] hover:border-2 hover:text-[#eae2b7]"
        @click="handleClickSearch"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
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

const { sendMessage, newMessage, messages } = useSendMessage();
const { search, fetchAllSnippets } = useFiltering();
const ChatIDStore = useChatIDStore();

const data = ref(null);

const config = useRuntimeConfig();
const isLoading = ref(true);
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
    container.scrollTop = container.scrollHeight;
  }
};

const smoothScrollToBottom = () => {
  if (scrollContainer.value) {
    const container = scrollContainer.value;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }
};

const handleClickSearch = async () => {
  if (newMessage.value === undefined || newMessage.value === "") {
    console.log("");
  } else {
    const input = newMessage.value;
    newMessage.value = "";
    console.log(input);
    await fetchAllSnippets(input);
    await messageStore.saveConversation(messages.value);

    await nextTick();
    smoothScrollToBottom();
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

<style>
.loader {
  width: 50px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #25b09b;
  --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
  position: fixed;
  top: 50%;
  left: 50%;
  margin: 0 auto;
}

@keyframes l3 {
  to {
    transform: rotate(1turn);
  }
}

pre.user {
  background-color: #fcbf49;
  color: black;
}

pre.bot {
  background-color: #f77f00;
  margin-left: 45px;
  margin-right: 45px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;

  padding: 14px;
}

.swiper-button-prev,
.swiper-button-next {
  color: black;
  background-color: whitesmoke;
  border-radius: 100%;
  border: 2px solid black;
  width: 45px;
  height: 45px;
  font-size: large;
  font-weight: bold;
}

.swiper-pagination-bullet-active {
  background: #000;
}

.swiper {
  margin: 0 10px 10px 10px;
}

.options {
  display: flex;
  flex-direction: column;
}

.chatscreen {
  padding-bottom: 100px; /* Add space at bottom to prevent input overlap */
}

.mainscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Modify the message container width classes */

@media (max-width: 400px) {
  .mainscreen {
    flex-direction: column;
  }

  .chatscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: calc(100vh - 100px);
    padding-top: 20px;
    padding-bottom: 100px;
    overflow-y: auto;
    z-index: 1;
  }
}

.message-container {
  width: 100%;
  max-width: 100vw;
  height: fit-content;
  padding-right: 15px;
  margin: 0 10px 10px 10px;
  position: relative;
  overflow-y: auto;
  color: black;
}

.user-message {
  margin-left: auto; /* Push user messages to the right */
}

.bot-message {
  margin-right: auto; /* Push bot messages to the left */
}

@media (min-width: 640px) {
  .message-container {
    width: 70vw;
  }
}

@media (min-width: 768px) {
  .message-container {
    width: 50vw;
  }
}

@media (min-width: 1024px) {
  .message-container {
    width: 30vw;
  }
}
</style>
