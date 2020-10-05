const { isPlainObject } = require('is-plain-object');

class TaskEvent {
  /**
   * @param {string} which event name
   * @param {{ name: string, result?: any, success?: boolean, arguments: { name: string, value: any }[], message?: string }} taskInfo
   */
  constructor(which, taskInfo) {
    which += '';

    if (!TaskEvent.events.hasOwnProperty(which)) {
      throw new Error('event not found!');
    }

    if (!isPlainObject(taskInfo)) {
      throw new TypeError('task info object not found or invalid');
    }

    this.status = which;

    this.result = taskInfo.result;

    this.which = taskInfo.name;

    this.success = taskInfo.success;

    this.arguments = taskInfo.arguments;

    this.message = taskInfo.message;
  }

  // Keys and values should be same
  static events = { start: 'start', end: 'end', error: 'error' };
}

module.exports = TaskEvent;
