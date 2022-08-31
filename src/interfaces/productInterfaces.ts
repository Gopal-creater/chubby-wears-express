import { Document } from "mongoose";

export interface IProductDocument extends Document {
  name: {
    type: string;
    required: [true, "Product name is required"];
  };
  category: {
    type: string;
    required: [true, "Product category is required"];
  };
  brand: {
    type: string;
    required: [true, "Product brand is required"];
  };
  price: {
    type: number;
    required: [true, "Product price is required"];
  };
  rating?: {
    type: number;
    min: [0, "Rating must be greater than zero or zero"];
    max: [5, "Rating must not exceed five"];
  };
  addedAt: {
    type: Date;
  };
}
