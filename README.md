# griffinwinston

Wraps around winston to create a plug'n play logger.
Unlike winston, it's not a pain to setup.

## TL;DR

Run npm install griffinwinston

Add to code

    const gWinston = require("griffinwinston");
    const logger = new gWinston();
    // test examples
    logger.debug('debug');
    logger.info('info');
    logger.error('error');

Less will be logged to files if process.env.NODE_ENV === "production", and nothing will be logged to console.

## Configuration

    const gWinston = require("./griffinwinston");
    const config { consoleColors: true, // Shall colors be used in console? (Default true)
    consoleJson: 'silly', // consoleJson or consoleText can be used depending on what format you want the data in.
    fileColors: true, // Shall colors be used in files? (Default false)
    fileJson: 'silly', // Level of logging to Json log files
    fileText: ['debug','info','warn', 'error'] // Level of logging to text log files
    label: 'myApp' // Label on the lines in the logging. Defaults to folder + running program filename. }

    const logger = new gWinston(config);
    logger.debug('debug');
    logger.info('info');
    logger.error('error');
