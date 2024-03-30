export class ContainerError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BadKeyError extends ContainerError {
  constructor() {
    super("bad key");
  }
}
