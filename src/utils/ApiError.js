class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went Wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
      /*
            If no custom stack is given, this line generates a clean, native stack trace automatically.
            Error.captureStackTrace(...) is a Node.js method that attaches a trace to the error object.
            this.constructor excludes the constructor itself from the trace (for cleaner output).
        */
    }
    //The stack shows the trace of function calls that led to the error — extremely useful for debugging.
  }
}

export {ApiError}
