const ngrok = require('./ngrok-callback');
const pkg = require('../../package.json');
const { SECRET = '1234', NODE_ENV, PORT = 8082 } = process.env;

if (NODE_ENV === 'development') {
  ngrok({
    addr: PORT,
    subdomain: pkg.name
  });
  exitHook(() => {
    console.log('Disconnecting Ngrok');
    ngrok.disconnect();
    ngrok.kill();
  });
}
