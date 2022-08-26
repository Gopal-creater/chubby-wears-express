import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import globalErrorHandler from "./src/controllers/errorController";
import userRouter from "./src/routes/userRoutes";
import AppError from "./src/utils/appError";

const app: Express = express();

//Converts the incoming body to json data--
app.use(express.json());
//-----------------------------------------

//For consoling req only in development mode-------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//-------------------------------------------------

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

//Mounting our Routes-----------------
app.use("/api/v1/users", userRouter);
//------------------------------------

//Handling the other routes which are not cached above--------------------
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  //Anything we pass inside next will always be an error.
  next(new AppError(404, `Can't find ${req.originalUrl} on the server!`));
});
//------------------------------------------------------------------------

// Error Handling middleware---
app.use(globalErrorHandler);
//-----------------------------

export default app;
