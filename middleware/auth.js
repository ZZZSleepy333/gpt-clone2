export default defineNuxtRouteMiddleware((to) => {
  if (to?.path && to.path.startsWith("/admin")) {
    if (process.client) {
      const user = localStorage.getItem("user");
      if (!user) {
        return navigateTo("/login");
      }
    }
  }
});
