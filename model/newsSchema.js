import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    news: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default:null
    },
    isAutomated: {
      type: Boolean,
      default: false, // Flag for automated news added by superadmin
    },
  },
  { timestamps: true }
);

const newsModel = mongoose.model("News", newsSchema);

export default newsModel;
