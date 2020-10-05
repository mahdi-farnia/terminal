const Terminal = require('../');

const tasks = {
  say(message) {
    console.log(message);
  }
};

const terminal = new Terminal(tasks);

// Create Communication between task and client with events
const task = Terminal.createCommunication(terminal);

function start(e) {
  console.log('started: ' + e.which);
}

task.on('start', start);

task.on('end', (e) => {
  console.log('ended: ' + e.which);
});

// Events: start & end will fire
terminal.exec('say hello', { hello: 'Hello World' });

task.off();

// Nothing will showed in console, events detached...
terminal.exec('say age', { age: 22 });
