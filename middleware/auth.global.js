export default defineNuxtRouteMiddleware((to) => {
  console.log("Checking auth...", {
    path: to.path,
    isClient: process.client,
    user: process.client ? localStorage.getItem("user") : null,
  });

  if (!to.path.startsWith("/admin")) {
    return;
  }

  if (to.path === "/login") {
    return;
  }

  if (!process.client) {
    console.log("Server side - redirecting to login");
    return navigateTo("/login");
  }

  const user = localStorage.getItem("user");
  console.log("User data:", user);

  if (!user) {
    console.log("No user found - redirecting to login");
    return navigateTo("/login", { replace: true });
  }

  try {
    const userData = JSON.parse(user);
    if (!userData?.id) {
      console.log("Invalid user data - redirecting to login");
      localStorage.removeItem("user");
      return navigateTo("/login", { replace: true });
    }
  } catch (e) {
    console.log("Error parsing user data:", e);
    localStorage.removeItem("user");
    return navigateTo("/login", { replace: true });
  }
});
