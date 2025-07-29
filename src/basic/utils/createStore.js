import createObserver from './createObserver';

const createStore = (reducer, initialState) => {
  const { subscribe, notify } = createObserver();

  let state = initialState;

  const getState = () => state;

  const dispatch = (action) => {
    const newState = reducer(state, action);
    if (!Object.is(newState, state)) {
      state = newState;
      notify(state);
    }
  };

  return {
    getState,
    dispatch,
    subscribe,
  };
};

export default createStore;
