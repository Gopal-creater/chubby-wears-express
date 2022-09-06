import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import { IGetUserAuthInfoRequest } from "../interfaces/iGetUserAuthInfoRequest";
import sendMail from "../utils/email";
import crypto from "crypto";

class authController {
  signToken = (id: String) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN as string,
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

  createSendToken = (user: any, statusCode: number, res: Response) => {
    const token = this.signToken(user._id);

    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  };

  protect = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
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
      const decoded = (await this.verifyToken(token)) as {
        id: string;
        iat: number;
        exp: number;
      };
      console.log("decoded", decoded);

      //Check if user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(
          new AppError(
            401,
            "The user belonging to this id does no longer exist"
          )
        );
      }

      //Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError(
            401,
            "User recently changed password! Please log in again."
          )
        );
      }

      //Grant access to protected route
      req.user = currentUser;
      next();
    }
  );

  restrictTo = (...roles: string[]) => {
    return (
      req: IGetUserAuthInfoRequest,
      res: Response,
      next: NextFunction
    ) => {
      if (!roles.includes(req.user!.role)) {
        return next(
          new AppError(403, "You do not have permission to perform this action")
        );
      }

      next();
    };
  };

  signUp = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
      });

      this.createSendToken(newUser, 201, res);
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
      this.createSendToken(user, 200, res);
    }
  );

  forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      //Get user based on posted email
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(new AppError(404, "There is no user with email address."));
      }

      //Generate random reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      //send it to user's email
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/reset-password/${resetToken}`;

      const message = `Forgot your password? Submit a PATCH request with your new password
       and password confirm to :${resetUrl}.\n If you didn't forgot your password ,please
        ignore this email!`;

      try {
        await sendMail({
          email: user.email,
          subject: "Your password reset token (valid for 10 min)",
          message,
        });

        res.status(200).json({
          status: "success",
          message: "Token sent to email!",
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new AppError(
            500,
            "There was an error sending the email. Try again later!"
          )
        );
      }
    }
  );

  resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      //Get user based on the tokenExpiredError
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      //If token has not expired and there is user, set the new password
      if (!user) {
        return next(new AppError(400, "Token is invalid or has expired"));
      }

      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      //update changePasswordAt property for user using middleware

      //Log the user in , send JWT
      this.createSendToken(user, 200, res);
    }
  );

  updatePassword = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
      //Get user from collection
      const user = await User.findById(req?.user?.id).select("+password");

      if (!user)
        return next(new AppError(400, "User with the id is not found"));

      //Check if posted current password is correct
      if (
        !(await user.comparePassword(req.body.currentPassword, user.password))
      ) {
        return next(new AppError(401, "Your current password is wrong"));
      }

      //If so update password
      //user.findBuIdAndUpdate wont work to update
      user.password = req.body.newPassword;
      user.passwordConfirm = req.body.passwordConfirm;
      await user.save();

      //Log the user in ,send JWT
      this.createSendToken(user, 200, res);
    }
  );
}

export default new authController();
