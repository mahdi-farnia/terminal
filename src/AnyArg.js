class AnyArg {
  /**
   * @param {Function} task
   */
  constructor(task) {
    task.constructor = AnyArg;
  }

  static isThis(arg) {
    return arg.constructor === AnyArg;
  }
}

module.exports = AnyArg;
