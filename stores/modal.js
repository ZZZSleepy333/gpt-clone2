import { defineStore } from "pinia";

export const useModalStore = defineStore("modal", {
  state: () => ({
    sidebar_visible: true,
    sidebar_auto_hidden: false,
    snackBarAnimation: "animate__animated animate__fadeInUp",
    isAnimating: false,
  }),
  actions: {
    toggleSidebar() {
      if (this.sidebar_visible) {
        this.isAnimating = true;
      } else {
        this.isAnimating = false;
        this.sidebar_auto_hidden = false;
        this.sidebar_visible = true;
      }
    },
    handleAnimationEnd() {
      if (this.isAnimating) {
        this.sidebar_visible = false;
      }
    },
  },
});
