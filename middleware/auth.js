export default defineNuxtRouteMiddleware(async (to) => {
  if (to?.path && to.path.startsWith("/admin")) {
    const user = process.client ? localStorage.getItem("user") : null;

    if (!user) {
      return navigateTo("/login");
    }

    try {
      const userData = JSON.parse(user);
      if (!userData?.id) {
        if (process.client) {
          localStorage.removeItem("user");
        }
        return navigateTo("/login");
      }
    } catch (error) {
      if (process.client) {
        localStorage.removeItem("user");
      }
      return navigateTo("/login");
    }
  }
});
