import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
export const connectDB = (uri:string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce_2024",
    })
    .then(() => console.log("db connected successfully"))
    .catch((e) => {
      console.log("error in connecting db");
      console.log(e);
      process.exit(1);
    });
};

export const invalidateCache = async ({
  product,
  order,
  admin,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];
    const productId = await Product.find({}).select("_id");
    productId.forEach((i) => {
      productKeys.push(`product-${i._id}`);
    });
    myCache.del(productKeys);
  }
  if (order) {
  }
  if (admin) {
  }
};
