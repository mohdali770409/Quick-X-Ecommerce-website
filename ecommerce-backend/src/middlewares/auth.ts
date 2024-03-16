import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "user is not logged in",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user is not registered",
      });
    }
    if (user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "you are not allowed to do change",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in authorization",
    });
  }
};
