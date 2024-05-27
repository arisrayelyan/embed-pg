import pino from "pino";

const options: pino.LoggerOptions = {
  messageKey: "message",
  errorKey: "error",
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    error: pino.stdSerializers.err,
  },
};

if (process.env.NODE_ENV === "development") {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  };
}

const logger = pino(options);

export default logger;
