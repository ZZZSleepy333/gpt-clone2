export const useAuth = () => {
  const login = async (username, password) => {
    try {
      const { data } = await useFetch("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });

      if (data.value) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("user", JSON.stringify(data.value));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    return navigateTo("/login");
  };

  return {
    login,
    logout,
  };
};
