import { Request, Response, NextFunction } from "express";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import { rmSync, rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
export const newProduct = async (
  req: Request<{}, {}, NewProductRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { name, category, price, stock } = req.body;
  const photo = req.file;
  if (!photo)
    return res.status(400).json({
      success: false,
      message: "Please add photo",
    });
  if (!name || !category || !price || !stock) {
    rm(photo.path, (error) => {
      console.log("photo deleted ");
    });
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    const product = await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo?.path,
    });
    await invalidateCache({ product: true });
    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in creating product",
    });
  }
};

export const getlatestProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let products;
    if (myCache.has("latest-products")) {
      products = JSON.parse(myCache.get("latest-products") as string);
    } else {
      products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-products", JSON.stringify(products));
    }

    if (!products)
      return res.status(400).json({
        success: false,
        message: "error in fetching product",
      });

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let categories;
    if (myCache.has("categories")) {
      categories = JSON.parse(myCache.get("categories") as string);
    } else {
      categories = await Product.distinct("category");
      myCache.set("categories", JSON.stringify(categories));
    }

    if (!categories)
      return res.status(400).json({
        success: false,
        message: "error in fetching categories",
      });
    console.log(categories);
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    let products;
    if (myCache.has("all-products"))
      products = JSON.parse(myCache.get("all-products") as string);
    else {
      products = await Product.find({});
      myCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "error in fetching all products",
    });
  }
};

export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    let product;
    const id = req.params.id;
    if (myCache.has(`product-${id}`))
      product = JSON.parse(myCache.get(`product-${id}`) as string);
    else {
      product = await Product.findById(id);

      if (!product)
        return res.status(404).json({
          success: false,
          message: "product not found",
        });

      myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in getting single product",
    });
  }
};
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const product = await Product.findById(id);
    const photo = req.file;

    if (!product)
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    if (photo) {
      rm(product.photo, () => {
        console.log("old photo deleted");
      });
      product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    await product.save();
    await invalidateCache({ product: true });
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in getting single product",
    });
  }
};
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    rm(product.photo, () => {
      console.log("product picture deleted");
    });
    await product.deleteOne();
    await invalidateCache({ product: true });
    return res.status(200).json({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error in deleting product",
    });
  }
};

export const getAllProducts = async (
  req: Request<{}, {}, {}, SearchRequestQuery>,
  res: Response
) => {
  try {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  } catch (error) {}
};
