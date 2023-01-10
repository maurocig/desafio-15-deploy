// ARGS (PORT)
const minimist = require('minimist');
const args = minimist(process.argv.slice(2), {
  default: {
    port: process.env.PORT || 8080,
    mode: 'FORK',
  },
  alias: {
    p: 'port',
    m: 'mode',
  },
});

module.exports = args;
