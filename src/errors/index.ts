export const createError = (name: string) => {
  return (message: string) => {
    const error = new Error(message);
    error.name = name;
    return error;
  };
};

export default createError;

type WhotTypeError = InstanceType<typeof TypeError> & { type?: Function };
export const createTypeError = (name: string) => {
  return (message: string, type: Function) => {
    const error: WhotTypeError = new TypeError(message);
    error.type = type;
    error.name = name;
    return error;
  };
};
