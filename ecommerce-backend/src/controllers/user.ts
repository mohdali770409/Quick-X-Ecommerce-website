import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import errorHandler from "../utils/utility-class.js";

export const newUser = async (
  req: Request<{}, {}, NewUserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, photo, gender, _id, dob } = req.body;

    let user = await User.findById(_id);
    if (user) {
      return res.status(200).json({
        success: true,
        message: `welcome back ${user?.name}`,
      });
    }

    if (!name || !email || !photo || !gender || !_id || !dob)
      return res.status(400).json("Please add all fields");

    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob,
    });

    return res.status(200).json({
      success: true,
      message: `welcome ${user.name}`,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    if (users)
      return res.status(200).json({
        success: true,
        users,
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error?.message,
    });
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid Id",
      });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
      return res.status(400).json({
        success: false,
        message: "user do not exist",
      });
    await user?.deleteOne();

    return res.status(200).json({
      success: true,
      message: "user got deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
