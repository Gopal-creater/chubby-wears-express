class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  status: string;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    //To not pollute
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
