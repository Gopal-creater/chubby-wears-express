import { Request } from "express";
import { Types } from "mongoose";
import { IUserDocument } from "./userInterfaces";

export interface IGetUserAuthInfoRequest extends Request {
  user?: IUserDocument & {
    _id: Types.ObjectId;
  }; // or any other type
}
