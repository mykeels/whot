import { EventEmitter } from "events";

export const emitter = new EventEmitter();

export default emitter;

export { EventEmitter };

export const raiseEvent = (name: string, ...args: any[]) => {
  emitter.emit(name, ...args);
};

type EventListener = (...dataArgs: any[]) => any;
type Emitter<TOriginal> = Partial<{
  events: Record<string, EventListener[]>;
  on: (
    event: string,
    listener: EventListener
  ) => TOriginal & Emitter<TOriginal>;
  removeListener: (
    event: string,
    listener: EventListener
  ) => TOriginal & Emitter<TOriginal>;
  emit: (event: string, ...dataArgs: any[]) => TOriginal & Emitter<TOriginal>;
  once: (
    event: string,
    listener: EventListener
  ) => TOriginal & Emitter<TOriginal>;
}>;
type EventifiedObject<TOriginal extends Record<string, any>> = TOriginal &
  Emitter<TOriginal>;

export const eventify = <TSelf extends Record<string, any>>(
  self: EventifiedObject<TSelf>
): EventifiedObject<TSelf> => {
  self.events = {};
  self.on = function (
    event: string,
    listener: EventListener
  ): EventifiedObject<TSelf> {
    if (self.events && !Array.isArray(self.events?.[event])) {
      self.events[event] = [];
    }

    self.events?.[event]?.push(listener);
    return self;
  };

  self.removeListener = function (event, listener) {
    let idx;

    if (self.events && Array.isArray(self.events?.[event])) {
      idx = self.events[event].indexOf(listener);

      if (idx > -1) {
        self.events[event].splice(idx, 1);
      }
    }
    return self;
  };

  self.emit = function (event, data) {
    var i, listeners, length;

    if (self.events && Array.isArray(self.events?.[event])) {
      listeners = self.events[event].slice();
      length = listeners.length;

      for (i = 0; i < length; i++) {
        listeners[i].apply(self, [data]);
      }
    }
    return self;
  };

  self.once = function (event, listener) {
    if (typeof self.on === "function") {
      self.on(event, function g(data) {
        if (typeof self.removeListener === "function") {
          self.removeListener(event, g);
        }
        listener.apply(self, [data]);
      });
    }
    return self;
  };

  return self;
};
