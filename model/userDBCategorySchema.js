import mongoose from "mongoose";

const UserDBCategorySchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const UserDBCategoryModel = mongoose.model("UserDBCategory", UserDBCategorySchema);
export { UserDBCategoryModel };
