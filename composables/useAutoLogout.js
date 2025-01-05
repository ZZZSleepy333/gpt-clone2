import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export function useAutoLogout(timeoutMinutes = 30) {
  const router = useRouter();
  let inactivityTimeout;

  const resetTimer = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(logout, timeoutMinutes * 60 * 1000);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("chatId");
    router.push("/login");
  };

  const handleTabClose = (event) => {
    logout();
  };

  onMounted(() => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    window.addEventListener("beforeunload", handleTabClose);

    resetTimer();
  });

  onUnmounted(() => {
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
