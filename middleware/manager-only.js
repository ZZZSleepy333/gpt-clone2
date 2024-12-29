export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "manager") {
      return navigateTo("/admin");
    }
  }
});
