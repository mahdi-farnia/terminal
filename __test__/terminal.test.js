const Terminal = require('../'),
  rl = require('readline');

const _interface = rl.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tasks = Terminal.useAnyArg({
  say(...msg) {
    console.log.apply(void 0, msg);
  },
  name(name) {
    console.log('my name is ' + name);
  }
});

const terminal = new Terminal(tasks);

const task = Terminal.createCommunication(terminal);

task.on('end', ({ success, which }) => {
  console.log(
    `\n Task: ${which} was ${success ? 'successful' : 'not successful'}\n`
  );
});

_interface.question('Enter Command:\n', (an) => {
  terminal.exec(an);
});
