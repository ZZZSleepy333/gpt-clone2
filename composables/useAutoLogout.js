import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export function useAutoLogout(timeoutMinutes = 30) {
  const router = useRouter();
  let inactivityTimeout;

  // Reset timer khi có hoạt động
  const resetTimer = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(logout, timeoutMinutes * 60 * 1000);
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("chatId");
    router.push("/login");
  };

  // Xử lý khi đóng tab/window
  const handleTabClose = (event) => {
    logout();
  };

  onMounted(() => {
    // Theo dõi các sự kiện người dùng
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // Theo dõi sự kiện đóng tab
    window.addEventListener("beforeunload", handleTabClose);

    // Khởi tạo timer
    resetTimer();
  });

  onUnmounted(() => {
    // Cleanup
    window.removeEventListener("mousemove", resetTimer);
    window.removeEventListener("keypress", resetTimer);
    window.removeEventListener("click", resetTimer);
    window.removeEventListener("scroll", resetTimer);
    window.removeEventListener("beforeunload", handleTabClose);
    clearTimeout(inactivityTimeout);
  });

  return {
    resetTimer,
    logout,
  };
}
