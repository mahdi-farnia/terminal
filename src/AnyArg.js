const { isPlainObject } = require('is-plain-object');

class AnyArg {
  /**
   * @param { Function | Function[] | { [key: string]: Function } } task
   */
  constructor(task) {
    /**
     * @private { Function | Function[] | { [key: string]: Function } }
     */
    this._task = null;

    if (isPlainObject(task)) {
      for (const functionName in task) {
        const fn = task[functionName];

        if (typeof fn !== 'function') continue;

        fn.constructor = AnyArg;
      }
      this._task = task;
    } else if (Array.isArray(task)) {
      // Use <for> loop for using continue;
      var i = 0,
        len = task.length;

      for (; i < len; i++) {
        const fn = task[i];

        if (typeof fn !== 'function') continue;

        fn.constructor = AnyArg;
      }

      this._task = task;
    } else if (typeof task === 'function') {
      task.constructor = AnyArg;
      this._task = task;
    } else {
      throw new TypeError(
        '\ntask argument should be plain object of function or array of function or function\n'
      );
    }
  }

  /**
   * @returns { Function | Function[] | { [key: string]: Function } }
   */
  get task() {
    return this._task;
  }

  static isThis(arg) {
    return arg.constructor === AnyArg;
  }
}

module.exports = AnyArg;
