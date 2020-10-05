const { isPlainObject } = require('is-plain-object');
const Communication = require('./communication');
const AnyArg = require('./AnyArg');

const defaults = {
  multipleCommandSplitter: ' && '
};

const whiteSpaces = /\s+/g;

class Terminal {
  /**
   * @param { { [taskName: string]: Function } } commandsObject
   * @param {{ multipleCommandSplitter: string }} [options]
   */
  constructor(commandsObject, options) {
    // Should be plain object
    if (!isPlainObject(commandsObject)) return this;

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
    for (const functionName in commandsObject) {
      const _function = commandsObject[functionName];

      // Should be function
      if (typeof _function !== 'function') continue;

      // Will pushed in tasks
      const taskObject = {
        name: functionName,
        handler: _function
      };

      this._tasks.push(taskObject);
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
              // Check for any arg
              if (AnyArg.isThis(taskObject.handler)) {
                return arg;
              }

              // Argument not found
              if (!reservedArgs.hasOwnProperty(arg)) {
                throw new Error(`Argument ${arg} was not specified`);
              }

              return reservedArgs[arg];
            })
          : [];

        onStart(info);

        // Simulate spread operator --> ...argsArr
        info.result = taskObject.handler.apply(void 0, argsArr);

        onEnd(info);
      } catch (err) {
        info.message = err;
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
  return new AnyArg(task);
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
