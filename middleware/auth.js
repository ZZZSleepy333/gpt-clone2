export default defineNuxtRouteMiddleware((to) => {
  // Chỉ check auth khi vào các route bắt đầu bằng /admin
  if (to?.path && to.path.startsWith("/admin")) {
    if (process.client) {
      const user = localStorage.getItem("user");
      if (!user) {
        return navigateTo("/login");
      }
    }
  }
});
