const Terminal = require('../src/terminal');

const terminal = new Terminal({
  get(arg, app) {
    if (arg.type === 'get') {
      return arg.getter(app);
    }
  }
});

const task = Terminal.createCommunication(terminal);

task.on('end', (e) => {
  console.log(e);
});

terminal.assignArguments({
  'apt-install': {
    type: 'get',
    getter: function (app) {
      console.log('getting app: ' + app);
      return 'app';
    }
  }
});

terminal.exec('get apt-install app', { app: 'g++' });
