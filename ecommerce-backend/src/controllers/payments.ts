import { resolveSoa } from "dns";
import { Request, Response } from "express";
import { Coupon } from "../models/coupon.js";
import { stripe } from "../app.js";

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount)
      return res.status(404).json({
        success: false,
        message: "please enter amount",
      });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
    });
    console.log(paymentIntent);
    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error!,
    });
  }
};

export const newCoupon = async (req: Request, res: Response) => {
  try {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
      return res.status(404).json({
        success: false,
        message: "please enter both coupon and amount",
      });

    await Coupon.create({
      code: coupon,
      amount,
    });

    return res.status(201).json({
      success: true,
      message: `coupon ${coupon} created successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in creating coupon",
    });
  }
};

export const applyDiscount = async (req: Request, res: Response) => {
  try {
    const { coupon } = req.query;

    const discount = await Coupon.findOne({ code: coupon });

    if (!discount)
      return res
        .status(400)
        .json({ success: false, message: "discount not available" });

    return res.status(200).json({
      success: true,
      discount: discount.amount,
    });
  } catch (error) {}
};
export const allCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({});

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in fetching all coupons",
    });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon)
      return res.status(400).json({
        success: false,
        message: "coupon do not exist",
      });

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} Deleted Successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in deleted coupon",
    });
  }
};
