import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  shops: [
    {
      name: {
        type: String,
        required: true,
        unique: false,
      },
      type: {
        type: String,
        required: true,
      },
      purity: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

const shopModel = mongoose.model("Shop", shopSchema);

export default shopModel;
