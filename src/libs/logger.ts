import pino from 'pino';

export const logger = pino({
  level: import.meta.env.DEV ? 'debug' : 'warn',
  serializers: {
    err(value: unknown) {
      if (value instanceof Error) {
        return { name: value.name, message: value.message, stack: value.stack };
      }
      return String(value);
    },
  },
});
