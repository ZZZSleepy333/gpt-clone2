<template>
  <div
    class="w-screen h-[71.2px] fixed bg-[#d62828] text-[#eae2b7] flex justify-between items-center z-[100] border-b-2 border-[#d62828] shadow-md"
  >
    <div>
      <div class="h-full self-center flex ml-2.5">
        <!-- <button
          title="Open Sidebar"
          @click="modalStore.toggleSidebar"
          class="text-3xl text-[black] mx-5px"
        >
          <i class="fa-regular fa-square-caret-right"></i>
        </button> -->
        <button
          title="Save and Open a new chat"
          @click="clearAllChats()"
          class="text-3xl text-[#eae2b7] mx-[5px]"
        >
          <i class="fa-regular fa-square-plus"></i>
        </button>
      </div>
    </div>
    <p class="text-center text-lg font-bold mx-auto my-0">
      Ứng dụng hỗ trợ tìm kiếm thông tin cho sinh viên
    </p>
  </div>
</template>

<script lang="js" setup>
import { onMounted } from "vue";
import { useCleanChat } from "~/composables/useCleanChat";
import { useMessageStore } from "~/stores/useMessageStore";

const { clearChat } = useCleanChat();
import { useModalStore } from "~/stores/modal";
import { useChatIDStore } from "~/stores/useChatID";

import { useSendMessage } from "~/composables/useSendMessage.js";
const { sendMessage, newMessage, messages } = useSendMessage();

const modalStore = useModalStore();
const messageStore = useMessageStore();
const ChatIDStore = useChatIDStore();

const clearAllChats = () => {
  clearChat();
  ChatIDStore.createNewChatId();
  messageStore.saveConversation(messages.value);
};
</script>
