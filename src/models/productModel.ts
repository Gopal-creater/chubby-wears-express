import mongoose from "mongoose";
import { IProductDocument } from "../interfaces/productInterfaces";

const productSchema = new mongoose.Schema<IProductDocument>({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
  },
  brand: {
    type: String,
    required: [true, "Product brand is required"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
  },
  rating: {
    type: Number,
    min: [0, "Rating must be greater than zero or zero"],
    max: [5, "Rating must not exceed five"],
  },
  addedAt: {
    type: Date,
    default: () => Date.now(),
  },
});

const Product = mongoose.model<IProductDocument>("Product", productSchema);

export default Product;
