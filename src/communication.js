const TaskEvent = require('./taskEvent');
const { EventEmitter } = require('events');

// Communication between task
class Communication {
  constructor(terminal) {
    /**
     * @private
     */
    this._terminal = terminal;

    /**
     * Listener Store
     * @private
     */
    this.eventListeners = {};

    const communicateObj = {};

    // Terminal communicator object declaration ( For event listeners )
    for (const event in TaskEvent.events) {
      this.eventListeners[event] = [];

      communicateObj[event] = (info) => {
        const evObject = new TaskEvent(TaskEvent.events[event], info);
        this.eventListeners[event].forEach((listener) => listener(evObject));
      };
    }

    terminal.communicate = communicateObj;
  }

  get terminal() {
    return this._terminal;
  }

  /**
   * Listener For Tasks Status
   * @param { 'start' | 'end' | 'error' } event
   * @param { (eventData: { which: string, result: any, success?: boolean, arguments: { name: string, value: any }[], message?: string } ) => void } listener
   */
  on(event, listener) {
    event += '';
    if (Array.isArray(this.eventListeners[event])) {
      if (typeof listener === 'function') {
        this.eventListeners[event].push(listener);
      }
    }
    return this;
  }

  once(event, listener) {
    const _this = this;
    return this.on(event, function local(e) {
      _this.off(event, local);
      listener(e);
    });
  }

  off(event, listener) {
    event += '';

    if (typeof listener !== 'function') return this;

    const i = this.eventListeners[event].indexOf(listener);

    // Delete listener
    this.eventListeners[event].splice(i, 1);

    return this;
  }
}

module.exports = Communication;
