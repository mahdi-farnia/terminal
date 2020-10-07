const Terminal = require('../'),
  rl = require('readline');

const _interface = rl.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tasks = {
  exit: process.exit
};

const terminal = new Terminal(tasks);

const task = Terminal.createCommunication(terminal);

task.on('end', ({ success, which, error }) => {
  console.log(`\n ${error.type} \n ${error.message} \n`);
});

_interface.question('\n$:', (an) => {
  terminal.exec(an);
});
