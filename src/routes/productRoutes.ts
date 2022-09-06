import express from "express";
import { userRoles } from "../constants";
import authController from "../controllers/authController";
import productController from "../controllers/productController";

//Route Middleware
const productRouter = express.Router();

productRouter
  .route("/")
  .get(authController.protect, productController.getAllProduct)
  .post(
    authController.protect,
    authController.restrictTo(userRoles.admin, userRoles.vendor),
    productController.createProduct
  );

productRouter
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrictTo(userRoles.admin),
    productController.deleteProduct
  );

export default productRouter;
