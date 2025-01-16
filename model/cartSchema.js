import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  totalPrice: {type:Number,default:0},
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Cart = mongoose.model("Cart", cartSchema);
