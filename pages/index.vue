<script setup lang="js">
// import axios from "axios";
// import { onMounted } from "vue";

// async function uploadData() {
//   try {
//     // Gọi API upload dữ liệu
//     const response = await axios.get("/api/upload-data");
//     console.log(response.data.message);
//   } catch (error) {
//     console.error("Lỗi khi gọi API upload:", error);
//   }
// }

// onMounted(() => {
//   uploadData();
// });
</script>

<template>
  <div class="font-playwright">
    <!-- <Header className="fixed bg-slate-50 w-[100vw] " /> -->
    <!-- <file-input-header /> -->
    <!-- <Header /> -->
    <ChatScreen />
  </div>
</template>
