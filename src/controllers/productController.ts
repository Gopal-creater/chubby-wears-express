import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

class productController {
  getAllProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // const newProduct = await Product.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          product: "All products",
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
