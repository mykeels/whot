import colors from "./colors";

export const createLogger = (name: string) => {
  return {
    log: (message: string, ...args: any[]) =>
      console.log(`${name}:`, colors.FgCyan, message, ...args, colors.Reset),
    warn: (message: string, ...args: any[]) =>
      console.warn(
        `${name} (warn):`,
        colors.FgYellow,
        message,
        ...args,
        colors.Reset
      ),
    error: (message: string, ...args: any[]) =>
      console.error(
        `${name} (error):`,
        colors.FgRed,
        message,
        ...args,
        colors.Reset
      ),
  };
};

export default createLogger;
