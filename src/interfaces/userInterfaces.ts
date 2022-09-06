import { Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;
  comparePassword(candidatePassword: string, userPassword: string): boolean;
  changedPasswordAfter(JwtTimeStamp: number): boolean;
  createPasswordResetToken(): string;
}
