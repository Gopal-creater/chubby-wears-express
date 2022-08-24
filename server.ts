import dotenv from "dotenv";
import app from "./app";
import mongoose from "mongoose";

//Handling uncaught exception in sync code like x is not defined----
//It should be the first code such that to listen the rejection
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN...");
  process.exit(1);
});
//-------------------------------------------------------------------

//Loading our env file to node env variables--
dotenv.config({ path: "./config.env" });
//--------------------------------------------

//MongoDb Connection-------------------------
const DB = process.env.MONGODB_URI?.replace(
  "<PASSWORD>",
  process.env.MONGODB_PWD as string
);
mongoose.connect(DB!).then((con) => {
  console.log("DB connection successfull");
});
//-------------------------------------------

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//Handling unhandleRejection in async code like mongo connection error----
process.on("unhandledRejection", (err: any) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  server.close(() => {
    process.exit(1);
  });
});
//------------------------------------------------------------------------
