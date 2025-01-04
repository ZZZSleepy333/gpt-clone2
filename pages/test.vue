<template>
  <div class="container">
    <h2>Hỏi Đáp</h2>
    <textarea
      v-model="userQuestion"
      placeholder="Nhập câu hỏi của bạn"
      rows="4"
      class="question-input"
    ></textarea>
    <button @click="fetchAnswer" class="submit-button">Gửi câu hỏi</button>

    <div v-if="answer" class="answer-box">
      <h3>Câu trả lời:</h3>
      <p>{{ answer }}</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const userQuestion = ref("");
const answer = ref("");
const error = ref("");

const fetchAnswer = async () => {
  try {
    error.value = "";
    const response = await axios.post("http://127.0.0.1:8000/get_answer", {
      user_question: userQuestion.value,
    });
    answer.value = response.data.answer;
  } catch (err) {
    error.value = "Đã có lỗi xảy ra khi tìm kiếm câu trả lời.";
    console.error("Error:", err);
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.question-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
}

.submit-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.answer-box,
.error-message {
  margin-top: 20px;
}

.error-message {
  color: red;
}
</style>
