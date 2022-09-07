import { Request, Response, NextFunction } from "express";
import { IGetUserAuthInfoRequest } from "../interfaces/iGetUserAuthInfoRequest";
import User from "../models/userModel";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

class userControlller {
  filterObj = (obj: any, ...allowedFields: any[]) => {
    const newObj = {} as any;
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
  };

  updateUser = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
      //Create error if user posts password data
      if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            404,
            "This route is not for password updates. Please use /update-password."
          )
        );
      }

      //Filter out unwanted field that are not allowed to update
      const filteredBody = this.filterObj(req.body, "name", "email");

      console.log("filteredBody", filteredBody);

      //Update user document
      const updatedUser = await User.findByIdAndUpdate(
        req?.user?.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        status: "success",
        data: {
          user: updatedUser,
        },
      });
    }
  );

  deleteUser = catchAsync(
    async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
      await User.findByIdAndUpdate(req?.user?.id, { active: false });

      res.status(200).json({
        status: "success",
        data: null,
      });
    }
  );

  getUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await User.find();

      res.status(200).json({
        status: "success",
        data: {
          users,
        },
      });
    }
  );

  getUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await User.findById(req.params.id);

      if (!user) return next(new AppError(404, "User not found with the id."));

      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    }
  );
}

export default new userControlller();
