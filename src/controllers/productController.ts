import { Request, Response, NextFunction } from "express";
import KeyFields from "../interfaces/IApiFeatures";
import Product from "../models/productModel";
import ApiFeatures from "../utils/apiFeatures";
import catchAsync from "../utils/catchAsync";

class productController {
  getAllProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const features = new ApiFeatures(Product.find(), req.query as KeyFields)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const products = await features.query;

      res.status(201).json({
        status: "success",
        results: products.length,
        data: {
          products,
        },
      });
    }
  );

  createProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // const newProduct = await Product.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          product: "1",
        },
      });
    }
  );

  deleteProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.status(201).json({
        status: "success",
        data: {
          product: "1",
        },
      });
    }
  );
}

export default new productController();
