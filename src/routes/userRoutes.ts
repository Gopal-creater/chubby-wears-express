import express from "express";
import authController from "../controllers/authController";
import userControlller from "../controllers/userControlller";

//Route Middleware
const userRouter = express.Router();

userRouter.post("/signup", authController.signUp);
userRouter.post("/login", authController.login);

userRouter.post("/forgot-password", authController.forgotPassword);
userRouter.patch("/reset-password/:token", authController.resetPassword);
userRouter.patch(
  "/update-password",
  authController.protect,
  authController.updatePassword
);

userRouter.patch(
  "/update-me",
  authController.protect,
  userControlller.updateMe
);
userRouter.delete(
  "/delete-me",
  authController.protect,
  userControlller.deleteMe
);

userRouter.route("/:id").get(authController.protect, userControlller.getUser);
userRouter.route("/").get(authController.protect, userControlller.getUsers);

export default userRouter;
