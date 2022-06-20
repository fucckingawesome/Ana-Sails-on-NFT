import providerRegistry from '../services/providers/common/providerRegistry';

const defaultTimeout = 5000;

export default {
  namespaced: true,
  state: {
    items: [],
  },
  mutations: {
    setItems: (state, value) => {
      state.items = value;
    },
  },
  actions: {
    showItem({ state, commit }, item) {
      if (state.items.every(other => other.type !== item.type || other.content !== item.content)) {
        commit('setItems', [...state.items, item]);
        setTimeout(
          () => commit('setItems', state.items.filter(otherItem => otherItem !== item)),
          item.timeout || defaultTimeout,
        );
      }
    },
    info({ dispatch }, info) {
      dispatch('showItem', {
        type: 'info',
        content: info,
      });
    },
    error({ dispatch, rootState }, error) {
      const item = { type: 'error' };
      if (error) {
        if (error.message) {
          item.content = error.message;
        } else if (error.status) {
          const location = rootState.queue.currentLocation;
          if (location.providerId) {
            const provider = providerRegistry.providersById[location.providerId];
            item.content = `HTTP error ${error.status} on ${provider.name} location.`;
          } else {
            item.content = `HTTP error ${error.status}.`;
          }
        } else {
          item.content = `${error}`;
        }
      }
      if (!item.content || item.content === '[object Object]') {
        item.content = 'Unknown error.';
      }
      dispatch('showItem', item);
    },
  },
};
