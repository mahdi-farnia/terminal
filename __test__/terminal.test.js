const Terminal = require('../');

function say(message) {
  console.log(message);
}

Terminal.useAnyArg(say);

const tasks = { say };

const terminal = new Terminal(tasks);

// Create Communication between task and client with events
const task = Terminal.createCommunication(terminal);

function start(e) {
  console.log('\nTask Started: ' + e.which + '\n');
}

task.on('start', start);

task.on('end', (e) => {
  console.log(
    '\nTask Ended: ' + e.which + '\n' + 'With Status Of: ' + e.success
  );
});

// Events: start & end will fire
terminal.exec('say hello');

task.off();

// Nothing will showed in console, events detached...
// Any Arg Accepted If argument value not provided -->
terminal.exec('say age', { age: 22 });
