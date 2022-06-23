const { silly } = require("winston");
const logger = require("./g_winston");

function runTest(logger, name) {
  logger.silly(name + " silly message");
  logger.debug(name + " debug message");
  logger.info(name + " info message")
  logger.http(name + " http message")
  logger.warn(name + " warn message");
  logger.error(name + " error message");
}

const log1 = new logger(); // everything default
runTest(log1, 'log1');
const log2 = new logger({label: "customLabel"});
runTest(log2, 'log2');
const log3 = new logger({consoleJson: 'silly', fileJson: 'silly', fileText: ['debug','info','warn', 'error']})
runTest(log3, 'log3');