const createObserver = () => {
  const listeners = new Set();

  const subscribe = (listener) => {
    if (listeners.has(listener)) {
      return () => unsubscribe(listener);
    }

    listeners.add(listener);

    return () => {
      unsubscribe(listener);
    };
  };

  const unsubscribe = (listener) => {
    listeners.delete(listener);
  };

  const notify = (data) => {
    listeners.forEach((listener) => {
      listener(data);
    });
  };

  const clear = () => listeners.clear();

  return {
    subscribe,
    unsubscribe,
    notify,
    clear,
  };
};

export default createObserver;
