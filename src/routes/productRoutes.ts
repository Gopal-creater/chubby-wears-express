import express from "express";
import authController from "../controllers/authController";
import productController from "../controllers/productController";

//Route Middleware
const productRouter = express.Router();

productRouter
  .route("/")
  .post(authController.protect, productController.createProduct);

export default productRouter;
