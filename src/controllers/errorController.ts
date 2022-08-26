import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../utils/appError";

const handleValidationError = (err: any) => {
  const errors: string[] = Object.values(err.errors).map(
    (el: any) => el.message
  );

  const message = `Invalid input data. ${errors.join(". ")}`;
  console.log("message");
  return new AppError(400, message);
};

const handleDuplicateIdsError = (err: any) => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const keys: string[] = [];
  for (const [key, val] of Object.entries(err.keyValue)) {
    keys.push(key);
  }
  const message = `Duplicate field value:${keys.join(
    ","
  )}. Please use another value!`;
  return new AppError(400, message);
};

const handleCastError = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

const sendErrDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrProd = (err: any, res: Response) => {
  //Operational,trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other unknown error:don't leak error details
  } else {
    console.error("Programming or other unknown----------");

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// Error Handling middleware,express automatically knows it if middleware
//  consit of four arguments.--------------------------------------------------
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error: any = { ...err, message: err.message };

    //Handle the cast Error
    if (err instanceof mongoose.Error.CastError) error = handleCastError(error);

    //Handle Duplicate Id Error
    if (error.code === 11000) error = handleDuplicateIdsError(error);

    //Handle validation error from mongodb
    if (err instanceof mongoose.Error.ValidationError)
      error = handleValidationError(error);

    sendErrProd(error, res);
  }
};

export default globalErrorHandler;
