import { Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  photo?: string;
  password: string;
  passwordConfirm: string;
  comparePassword(candidatePassword: string, userPassword: string): boolean;
}
