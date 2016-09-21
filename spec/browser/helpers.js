// Wait for an event to fire once on the given object.
const waitForEvent = (eventTarget, eventType) => {
  return new Promise((resolve, reject) => {
    let listener = (...args) => {
      eventTarget.removeEventListener(eventType, listener);
      resolve(...args);
    };
    eventTarget.addEventListener(eventType, listener);
  });
};

export {
  waitForEvent
};
