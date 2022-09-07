import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import globalErrorHandler from "./src/controllers/errorController";
import productRouter from "./src/routes/productRoutes";
import userRouter from "./src/routes/userRoutes";
import AppError from "./src/utils/appError";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
import hpp from "hpp";

const app: Express = express();

//Global middleware--------------------------------------------------------
//Set Security http headers--
app.use(helmet());
//---------------------------

//Rate limiting the same api to avoid brute force attack and dos----------
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this ip,Please try again in an hour!",
});

app.use("/api", limiter);
//-------------------------------------------------------------------------

//Converts the incoming body to json data--
app.use(express.json({ limit: "10kb" }));
//-----------------------------------------

//Data sanitization agains NoSQL query injection attack------
app.use(mongoSanitize());
//-----------------------------------------------------------

//Data sanitization agains XSS attack--
//ToDo
//-------------------------------------

//Prevent parameter pollution and attack-------
app.use(hpp());
//---------------------------------------------

//For consoling req only in development mode-------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//-------------------------------------------------
//--------------------------------------------------------------------------

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

//Mounting our Routes-----------------------
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
//------------------------------------------

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
