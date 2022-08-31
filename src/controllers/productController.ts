import { Request, Response, NextFunction } from "express";
import Product from "../models/productModel";
import catchAsync from "../utils/catchAsync";

class productController {
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
}

export default new productController();
