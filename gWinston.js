const { createLogger, format, transports } = require("winston");
const Transport = require("winston-transport");
const { combine, timestamp, label, printf } = format;
const path = require("path");

// create a logger that throw away everything.
// https://github.com/NCIOCPL/winston-null-transport

class WinstonNullTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    //NOOP
    callback();
  }
}

const nullConfig = {
  format: format.simple(),
  transports: [new WinstonNullTransport()],
};

// human readable format.
const rawFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

class logger {
  constructor(config = {}) {
    this.config = config;
    if(typeof config === "string") config = {"label": config}
    this._fileFolder = this.config.logFileFolder = this.config.logFileFolder ? this.config.logFileFolder : "logs";
    this._consoleText = [];
    if (this.config.consoleText && typeof this.config.consoleText !== "string") this._consoleText.push(...this.config.consoleText);
    if (this.config.consoleText && typeof this.config.consoleText === "string") this._consoleText.push(this.config.consoleText);
    this._consoleTextTransports = [];
    this._consoleJson = [];
    if (this.config.consoleJson && typeof this.config.consoleJson !== "string") this._consoleJson.push(...this.config.consoleJson);
    if (this.config.consoleJson && typeof this.config.consoleJson === "string") this._consoleJson.push(this.config.consoleJson);
    this._consoleJsonTransports = [];
    this._fileText = [];
    if (this.config.fileText && typeof this.config.fileText !== "string") this._fileText.push(...this.config.fileText);
    if (this.config.fileText && typeof this.config.fileText === "string") this._fileText.push(this.config.fileText);
    this._fileTextTransports = [];
    this._fileJson = [];
    if (this.config.fileJson && typeof this.config.fileJson !== "string") this._fileJson.push(...this.config.fileJson);
    if (this.config.fileJson && typeof this.config.fileJson === "string") this._fileJson.push(this.config.fileJson);
    this._fileJsonTransports = [];
    this.label = "";
    if (this.config.label) {
      this.label = this.config.label;
    } else {
      const folders = path.posix.dirname(process.argv[1]).split("/");
      const folder = folders[folders.length - 1];
      const fileName = path.basename(process.argv[1], ".js");
      this.label = folder + "/" + fileName;
    }
    // set some default values if the environment is not set.
    // IF user don't know how to set process.env.NODE_ENV to production
    // and don't set them manually,
    // (s)he is most likely helped by as much logging as possible ;) //AGR 2022-06-23
    if (process.env.NODE_ENV !== "production") {
      if (!this._consoleText.length && !this._consoleJson.length) this._consoleText.push("debug");
      if (!this._fileText.length && !this._fileJson.length) this._fileText.push("debug");
    }
    if (process.env.NODE_ENV === "production") {
      if (!this._fileText.length && !this._fileJson.length) this._fileText.push("info");
    }

    this._consoleColors = this.config.consoleColors = this.config.consoleColors ? this.config.consoleColors : true;
    this._fileColors = this.config.fileColors = this.config.fileColors ? this.config.fileColors : false;
    this._nullTransports = [];
    this._nullTransports.push(new WinstonNullTransport());
    //if(this._consoleText.length + this._consoleJson.length + this.fileText.length + this._fileJson.length === 0) this.logger = createLogger(nullConfig);
    this.logger = createLogger({ format: combine(label({ label: this.label }), timestamp(), rawFormat), transports: [this._nullTransports[0]] });

    this._fileJson.forEach((level) => {
      this._fileJson.push(new transports.File({ level: level, filename: path.join(this._fileFolder, level + ".log.json"), format: format.json() }));
      this.logger.add(this._fileJson[this._fileJson.length - 1]);
    });

    this._fileText.forEach((level) => {
      this._fileTextTransports.push(new transports.File({ level: level, filename: path.join(this._fileFolder, level + ".log"), format: rawFormat }));
      this.logger.add(this._fileTextTransports[this._fileTextTransports.length - 1]);
    });

    this._consoleJson.forEach((level) => {
      this.consoleJson(level);
    });

    this._consoleText.forEach((level) => {
      this.consoleText(level);
    });
    if (this._consoleText.length + this._consoleJson.length + this.fileText.length + this._fileJson.length === 0) this.logger.remove();
    for (const [key, value] of Object.entries(this.logger.levels)) {
      this[key] = function (...args) {
        this.logger[key](...args);
      };
      if (key === "info") this.log = this[key];
    }
  }

  _logRemove(transportArray) {
    while (transportArray.length) {
      const transport = transportArray.pop();
      this.logger.remove(transport);
    }
  }
  consoleRemove() {
    this._logRemove(this._consoleJsonTransports);
    this._consoleJson.length = 0;
    this._logRemove(this._consoleTextTransports);
    this._consoleText.length = 0;
  }
  fileRemove() {
    this._logRemove(this._fileJsonTransports);
    this.fileJson.length = 0;
    this._logRemove(this._fileTextTransports);
    this.fileText.label = 0;
  }
  // TODO To be able to remove specific levels from fileTransporter
  consoleJson(level) {
    // remove any previous console logger
    this.consoleRemove();
    const thisFormat = this._consoleColors ? combine(format.colorize(), rawFormat) : rawFormat;
    this._consoleJsonTransports.push(new transports.Console({ level: level, format: thisFormat }));
    this.logger.add(this._consoleJsonTransports[this._consoleJsonTransports.length - 1]);
    this._consoleJson.push(level);
  }
  consoleText(level) {
    // remove any previous console logger
    this.consoleRemove();
    const thisFormat = this._consoleColors ? combine(format.colorize(), rawFormat) : rawFormat;
    this._consoleTextTransports.push(new transports.Console({ level: level, format: thisFormat }));
    this.logger.add(this._consoleTextTransports[this._consoleTextTransports.length - 1]);
    this._consoleText.push(level);
  }
  fileJson(level) {
    if (this._fileJson.indexOf(level) === -1) return;
    this._fileJsonTransports.push(new transports.File({ level: level, filename: path.join(this._fileFolder, level + ".log.json"), format: format.json() }));
    this.logger.add(this._fileJson[this._fileJson.length - 1]);
    this._fileJson.push(level);
  }
  fileText(level) {
    if (this._fileText.indexOf(level) === -1) return;
    this._fileTextTransports.push(new transports.File({ level: level, filename: path.join(this._fileFolder, level + ".log.json"), format: format.json() }));
    this.logger.add(this._fileText[this._fileText.length - 1]);
    this._fileText.push(level);
  }
  replaceConsole() {
    for (const [key, value] of Object.entries(this.logger.levels)) {
      console[key] = function (...args) {
        this.logger[key](...args);
      };
      if (key === "info") console.log = this[key];
    }
  }
}

module.exports = logger;
