<template>
  <header class="bg-white shadow-md">
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center relative">
        <button
          title="Save and Open a new chat"
          @click="clearAllChats()"
          class="text-3xl text-[black] absolute left-0"
        >
          <i class="fa-regular fa-square-plus"></i>
        </button>
        <div class="flex-1 flex justify-center">
          <h1 class="text-xl font-bold text-gray-900">Hệ thống hỗ trợ Q&A</h1>
        </div>
      </div>
    </div>
  </header>
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
