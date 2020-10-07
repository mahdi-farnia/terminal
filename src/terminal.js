const { isPlainObject } = require('is-plain-object');
const Communication = require('./communication');
const AnyArg = require('./AnyArg');

const defaults = {
  multipleCommandSplitter: ' && '
};

const Errors = {
  run: 'run',
  argument: 'argument'
};

const whiteSpaces = /\s+/g;

class Terminal {
  /**
   * @param { Function | Function[] | { [taskName: string]: Function } } taskParam
   * @param {{ multipleCommandSplitter: string }} [options]
   */
  constructor(taskParam, options) {
    /**
     * Commands goes here
     * @private {{ name: string, handler: Function, argumentsLength: number }}
     */
    this._tasks = [];

    /**
     * Alias keeper for command line arguments with value
     * @private { [argumentName: string]: any }
     */
    this._assignedArguments = {};

    // Extract
    if (isPlainObject(taskParam)) {
      for (const functionName in taskParam) {
        const _function = taskParam[functionName];

        // Should be function
        if (typeof _function !== 'function') continue;

        // Will pushed in tasks
        const taskObject = {
          name: functionName,
          handler: _function
        };

        this._tasks.push(taskObject);
      }
    } else if (Array.isArray(taskParam)) {
      var i = 0,
        len = taskParam.length;

      for (; i < len; i++) {
        const fn = taskParam[i];

        if (typeof fn !== 'function') continue;

        if (!fn.name) {
          throw new Error('\nTask function must has name\n');
        }

        const taskObject = {
          name: fn.name,
          handler: fn
        };

        this._tasks.push(taskObject);
      }
    } else if (typeof taskParam === 'function') {
      const taskObject = {
        name: taskParam.name,
        handler: taskParam
      };

      this._tasks.push(taskObject);
    } else {
      throw new TypeError(
        '\nTask param must be plain object of function or array of funtion or function\n'
      );
    }

    // Options for command line
    if (isPlainObject(options)) {
      this.options = {
        multipleCommandSplitter:
          options.multipleCommandSplitter || defaults.multipleCommandSplitter
      };
    } else {
      this.options = defaults;
    }
  }

  get tasks() {
    return this._tasks;
  }

  get assignedArguments() {
    return this._assignedArguments;
  }

  /**
   * @param { {[key: string]: any} } fn
   */
  set communicate(fn) {
    /**
     * @private { { [event: string]: (taskInfo) => void } }
     */
    this._communicate = fn;
  }

  /**
   * Defines alias for arguments that using in command line
   * @param {{ [argument: string]: any }} argumentsAssignmentObject
   */
  assignArguments(argumentsAssignmentObject) {
    if (!isPlainObject(argumentsAssignmentObject)) return this;

    for (const argName in argumentsAssignmentObject) {
      const argValue = argumentsAssignmentObject[argName];

      this._assignedArguments[argName] = argValue;
    }

    return this;
  }

  /**
   * @param {string} command
   * @param {{ [argument: string]: any }} [argumentsObject] arguments might be
   * changed or used wants, should have temporary value [ it doesn't update reserved arguments value ]
   */
  exec(command, argumentsObject) {
    // to String
    command += '';

    // Multiple Command
    const cmds = command.split(this.options.multipleCommandSplitter);

    // All of aliases
    const reservedArgs = isPlainObject(argumentsObject)
      ? (() => {
          // Copy them
          const o1 = Object.assign({}, this._assignedArguments),
            o2 = Object.assign({}, argumentsObject);

          // Over write new data
          return Object.assign(o1, o2);
        })()
      : this._assignedArguments;

    let i = 0,
      len = cmds.length;

    // Communication
    let noop = function (o) {},
      onStart = noop,
      onEnd = noop,
      onError = noop;

    if (this._communicate) {
      const { start, end, error } = this._communicate;
      onStart = start;
      onEnd = end;
      onError = error;
    }

    for (; i < len; i++) {
      // Remove white space from left and right
      const cmd = cmds[i].trim();

      // solve: get apt-install g++ &&
      if (!cmd) continue;

      const cmdArr = cmd.replace(whiteSpaces, ' ').trim().split(' ');

      // Gen Info
      const info = {
        name: cmdArr[0],
        arguments: cmdArr.slice(1) || '',
        success: true
      };

      // Run Task
      try {
        const taskObject = this._tasks.find(
          (taskObject) => taskObject.name === info.name
        );

        // Get arguments value
        const argsArr = Array.isArray(info.arguments)
          ? info.arguments.map((arg) => {
              // Argument not found
              if (!reservedArgs.hasOwnProperty(arg)) {
                // Check for any arg
                if (AnyArg.isThis(taskObject.handler)) {
                  return arg;
                }
                throw {
                  message: `Argument ${arg} was not specified`,
                  type: Errors.argument
                };
              }

              return reservedArgs[arg];
            })
          : [];

        onStart(info);

        // Simulate spread operator --> ...argsArr
        info.result = taskObject.handler.apply(void 0, argsArr);

        onEnd(info);
      } catch (err) {
        info.error =
          err.type !== Errors.argument
            ? { type: Errors.run, message: `${info.name || 'Task'} Run Failed` }
            : err;
        info.success = false;
        onError(info);
        onEnd(info);
      }
    }

    return this;
  }

  execSync() {}
}

// Use Any Argument without define it
Terminal.useAnyArg = Terminal.prototype.useAnyArg = function (task) {
  return new AnyArg(task).task;
};

/**
 * Communication Initer
 * @param {Terminal} terminal
 */
Terminal.createCommunication = (terminal) => {
  if (!(terminal instanceof Terminal)) {
    throw new TypeError(
      'Terminal object not found, Communication needs terminal object'
    );
  }
  return new Communication(terminal);
};

module.exports = Terminal;
