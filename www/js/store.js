const createStore = Framework7.createStore;
const store = createStore({
  state: {
    // 自分のプロフィールオブジェクト
    profile: null,
  },
  getters: {
    profile({ state }) {
      return state.profile;
    }
  },
  actions: {
    setProfile({ state }, profile) {
      state.profile = profile;
    },
  },
})

