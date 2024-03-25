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

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
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
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
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

export const getSingleOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const key = `order-${id}`;

    let order;

    if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
    else {
      order = await Order.findById(id).populate("user", "name");

      if (!order)
        return res.status(404).json({
          success: false,
          message: "order is not provided",
        });

      myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in single order",
    });
  }
};

export const processOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order)
      return res.status(404).json({
        success: false,
        message: "order not found",
      });

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }

    await order.save();

    invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });

    return res.status(200).json({
      success: true,
      message: "Order Processed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in process order",
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({
        success: false,
        message: "order not found",
      });

    await order.deleteOne();

    invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: String(order._id),
    });

    return res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in deleting order",
    });
  }
};
