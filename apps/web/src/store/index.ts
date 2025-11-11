import { createStore } from 'vuex';

export default createStore({
  state: {
    token: null,
    user: null
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    }
  },
  actions: {
    login({ commit }, payload) {
      commit('SET_TOKEN', payload.token);
      commit('SET_USER', payload.user);
    },
    logout({ commit }) {
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  }
});
