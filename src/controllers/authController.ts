import { IUserDocument } from "./../interfaces/userInterfaces";
import { promisify } from "util";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";

class authController {
  signToken = (id: String) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  verifyToken = (token: string) => {
    return new Promise((resolve, reject) =>
      jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      })
    );
  };

  protect = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let token = "";
      //Getting token and check if it's there
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return next(new AppError(401, "You are not authorized!"));
      }

      //Verification token
      const decoded = await this.verifyToken(token);
      console.log("decoded", decoded);

      //Check if user still exist

      //Check if user changed password after token was issued
      next();
    }
  );

  signUp = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
      });

      const token = this.signToken(newUser._id);

      res.status(201).json({
        status: "success",
        token,
        data: {
          user: newUser,
        },
      });
    }
  );

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      //check if email and password exist
      if (!email || !password) {
        return next(new AppError(400, "Please provide email and password!"));
      }

      //Check if user exists and password is correct
      const user = await User.findOne({ email }).select("+password");

      if (
        !user ||
        !(await user.comparePassword(password as string, user.password))
      ) {
        return next(new AppError(401, "Incorrect email or password"));
      }

      //If everything ok then send token to client
      const token = this.signToken(user._id);
      res.status(200).json({
        status: "success",
        token,
      });
    }
  );
}

export default new authController();
