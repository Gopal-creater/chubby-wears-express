import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlenght: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
});

//Password validation middleware------------------------------------------
userSchema.pre("validate", function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate("passwordConfirm", "must match password");
  }
  next();
});
//-----------------------------------------------------------------------

//Mongoose document middleware to encrypt the password before saving----
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // we dont want passwordConfirm to be stored in database.
  this.passwordConfirm = undefined!;
});
//----------------------------------------------------------------------

const User = mongoose.model("User", userSchema);

export default User;
