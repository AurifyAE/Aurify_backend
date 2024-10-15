import { UserDBCategoryModel } from "../../model/userDBCategorySchema.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { adminId } = req.params;

    const newCategory = new UserDBCategoryModel({
      name,
      createdBy: adminId,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: savedCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error adding category",
      error: error.message,
    });
  }
};

export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { adminId } = req.params;

    const updatedCategory = await UserDBCategoryModel.findOneAndUpdate(
      { _id: id, createdBy: adminId },
      { $set: { name } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id, adminId } = req.params;

    const deletedCategory = await UserDBCategoryModel.findOneAndDelete({
      _id: id,
      createdBy: adminId,
    });

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found or unauthorized",
      });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { adminId } = req.params;

    const categories = await UserDBCategoryModel.find({ createdBy: adminId });

    res.json({ success: true, categories });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};
