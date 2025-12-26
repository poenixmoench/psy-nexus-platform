import { defineStore } from 'pinia';
export const useAuthStore = defineStore('auth', {
  state: () => ({ token: 'mock-token-m80' }),
  actions: {
    getToken() { return this.token; },
  },
});
