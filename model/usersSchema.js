import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  users: [
    {
      name: {
        type: String,
        required: true,
      },
      contact: {
        type: Number,
        required: true,
        unique: true,
      },
      location: {
        type: String,
        required: true,
      },
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      passwordAccessKey: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Check if the model already exists before creating it
const UsersModel =
  mongoose.models.Users || mongoose.model("Users", UsersSchema);

export { UsersModel };
