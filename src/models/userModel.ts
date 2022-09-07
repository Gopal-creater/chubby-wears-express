import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { IUserDocument } from "../interfaces/userInterfaces";
import { userRoles } from "../constants";
import crypto from "crypto";

const userSchema = new mongoose.Schema<IUserDocument>({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true, //Not a validator but transforms email to lowercase
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: Object.values(userRoles),
    default: userRoles.user,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//Password validation middleware------------------------------------------
userSchema.pre("validate", function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate("passwordConfirm", "must match password");
  }
  next();
});
//------------------------------------------------------------------------

//Mongoose document middleware to encrypt the password before saving----
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password.toString(), 12);

  // we dont want passwordConfirm to be stored in database.
  this.passwordConfirm = undefined!;
});
//----------------------------------------------------------------------

//Mongoose document middleware to change passwordChangedAt--------------
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});
//----------------------------------------------------------------------

//Mongoose document middleware to find all active users---------------
userSchema.pre(/^find/, function (next) {
  console.log("Calling");
  this.find({ active: { $ne: false } });
  next();
});
//--------------------------------------------------------------------

//Mongoose instance method to compare password--------------------
userSchema.methods.comparePassword = async function (
  candidatePassword: String,
  userPassword: String
): Promise<boolean> {
  return await bcrypt.compare(
    candidatePassword.toString(),
    userPassword.toString()
  );
};
//-----------------------------------------------------------------

//Mongoose instance method to compare if password change--------------------
userSchema.methods.changedPasswordAfter = function (JwtTimeStamp: number) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );

    return JwtTimeStamp < changedTimeStamp;
  }

  //false means no password change
  return false;
};
//--------------------------------------------------------------------------

//Mongoose instance method to generate password reset token---------------
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//------------------------------------------------------------------------

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
