import express from "express";
import authController from "../controllers/authController";

//Route Middleware
const userRouter = express.Router();

userRouter.post("/signup", authController.signUp);

export default userRouter;
