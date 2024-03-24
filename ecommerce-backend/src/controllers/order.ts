import { Request, Response, NextFunction } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { Order } from "../models/order.js";
import { myCache } from "../app.js";

export const newOrder = async (
  req: Request<{}, {}, NewOrderRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;
    console.log(shippingInfo, orderItems, tax, user, subtotal, total);
    if (!shippingInfo || !orderItems || !user || !subtotal || !total)
      return res.status(404).json({
        success: false,
        message: "all fields are required",
      });

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    invalidateCache({
      product: true,
      order: true,
      admin: true,
    });

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in order creation",
    });
  }
};

export const myOrders = async (req: Request, res: Response) => {
  try {
    const { id: user } = req.query;

    const key = `my-orders-${user}`;

    let orders = [];

    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
      orders = await Order.find({ user });
      myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in my control",
    });
  }
};

export const allOrders = async (req: Request, res: Response) => {
  try {
    const key = `all-orders`;

    let orders = [];

    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
      orders = await Order.find().populate("user", "name");
      myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in fetching all orders",
    });
  }
};
