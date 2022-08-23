import dotenv from "dotenv";
import app from "./app";
import mongoose from "mongoose";

dotenv.config({ path: "./config.env" });

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
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
