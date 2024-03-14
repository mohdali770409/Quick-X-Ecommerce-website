import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  
//   virtual attribute 
  age: number;
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      require: ["true", "please enter ID"],
    },
    name: {
      type: String,
      require: ["true", "please enter Name"],
    },
    email: {
      type: String,
      unique: ["unique", "Email already exists"],
      require: ["true", "please enter Email"],
      validate: validator.default.isEmail,
    },
    photo: {
      type: String,
      require: ["true", "please add Photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      require: true,
    },
    dob: {
      type: Date,
      require: true,
    },
  },
  { timestamps: true }
);

schema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob?.getFullYear();
  if (
    today.getMonth() < dob?.getMonth() ||
    (today.getMonth() === dob?.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
});

export const User = mongoose.model<IUser>("User", schema);
