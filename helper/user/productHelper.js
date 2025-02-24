import mongoose from "mongoose";
import { Cart } from "../../model/cartSchema.js";
import Product from "../../model/productSchema.js";
import { Wishlist } from "../../model/wishlistSchema.js";
import MainCategory from "../../model/mainCategoryModel.js";
import SubCategory from "../../model/subCategoryModel.js";
import { createAppError } from "../../utils/errorHandler.js";

export const fetchBestSellerProduct = async () => {
  try {
    const result = await Product.find({ tags: "Best Seller" })
      .sort({ createdAt: -1 })
      .limit(3);

    if (result.length === 0) {
      return {
        success: false,
        message: "No 'Best Seller' products found.",
      };
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching product details: " + error.message,
    };
  }
};

export const fetchAllProduct = async (page = 1, filters = {}, limit = 10) => {
  try {

    const skip = (page - 1) * limit;
    const matchStage = {};
    if (filters.tags) matchStage.tags = filters.tags;
    if (filters.mainCategory)
      matchStage["mainCategoryDetails._id"] = new mongoose.Types.ObjectId(
        filters.mainCategory
      );

    // Add the match for adminId if provided
    if (filters.adminId) matchStage.addedBy = new mongoose.Types.ObjectId(filters.adminId);
    const pipeline = [
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "maincategories",
          localField: "subCategoryDetails.mainCategory",
          foreignField: "_id",
          as: "mainCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$mainCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage, // Apply filters, including adminId match
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }], // Total count
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await mongoose.model("Product").aggregate(pipeline);

    const totalCount = result[0]?.metadata[0]?.totalCount || 0;
    const products = result[0]?.data || [];

    return {
      success: true,
      result: products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return {
      success: false,
      message: "Error fetching product details: " + error.message,
    };
  }
};


export const fetchNewArrivalProduct = async () => {
  try {
    const result = await Product.find({ tags: "New Arrival" })
      .sort({ createdAt: -1 })
      .limit(3);

    if (result.length === 0) {
      return {
        success: false,
        message: "No 'New Arrival' products found.",
      };
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching product details: " + error.message,
    };
  }
};

export const fetchTopRatedProduct = async () => {
  try {
    const result = await Product.find({ tags: "Top Rated" })
      .sort({ createdAt: -1 })
      .limit(3);

    if (result.length === 0) {
      return {
        success: false,
        message: "No 'Top Rated' products found.",
      };
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching product details: " + error.message,
    };
  }
};

export const fetchProductDetails = async (mainCategoryId) => {
  try {
    if (!mainCategoryId) {
      throw new Error("Main category ID is required");
    }

    const subCategories = await SubCategory.find(
      { mainCategory: mainCategoryId },
      "_id"
    );

    if (!subCategories || subCategories.length === 0) {
      throw new Error("No subcategories found for the given main category");
    }

    const subCategoryIds = subCategories.map((sub) => sub._id);

    const result = await mongoose.model("Product").aggregate([
      {
        $match: {
          subCategory: { $in: subCategoryIds },
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "maincategories",
          localField: "subCategoryDetails.mainCategory",
          foreignField: "_id",
          as: "mainCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$mainCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          images: 1,
          price: 1,
          weight: 1,
          purity: 1,
          stock: 1,
          makingCharge:1,
          tags: 1,
          type: 1,
          sku: 1,
          subCategoryDetails: {
            _id: "$subCategoryDetails._id",
            name: "$subCategoryDetails.name",
          },
          mainCategoryDetails: {
            _id: "$mainCategoryDetails._id",
            name: "$mainCategoryDetails.name",
            image: "$mainCategoryDetails.image",
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching product details: " + error.message,
    };
  }
};
export const updateCartItemCollection = async (userId, adminId, productId, userPassedQuantity) => {
  try {
    if (!userId || !adminId || !productId) {
      throw new Error("Missing required fields: userId, adminId, or productId");
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if the user has a cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return { success: false, message: "Cart does not exist for the user" };
    }

    // Find the item in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex !== -1) {
      let existingQuantity = cart.items[existingItemIndex].quantity;

      if (existingQuantity === 1) {
        // If the existing quantity is 1, update it with user-passed quantity
        cart.items[existingItemIndex].quantity = userPassedQuantity;
      } else {
        // Otherwise, add the user-passed quantity to the existing quantity
        cart.items[existingItemIndex].quantity += userPassedQuantity;
      }

      // Remove item if quantity becomes 0 or less
      if (cart.items[existingItemIndex].quantity <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].totalPrice =
          cart.items[existingItemIndex].quantity * product.price;
      }
    } else {
      // If the product is not in the cart, add it with the user-passed quantity
      if (userPassedQuantity > 0) {
        cart.items.push({
          productId,
          quantity: userPassedQuantity,
          totalPrice: userPassedQuantity * product.price,
        });
      } else {
        return { success: false, message: "Cannot decrement a non-existing item in the cart" };
      }
    }

    // Update total cart price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * product.price;
    }, 0);

    cart.updatedAt = Date.now();

    // Save the updated cart
    await cart.save();

    return { success: true, data: cart };
  } catch (error) {
    return { success: false, message: "Error updating cart: " + error.message };
  }
};

export const incrementCartItemQuantity = async (userId, adminId, productId, quantityChange) => {
  try {
    if (!userId || !adminId || !productId) {
      throw new Error("Missing required fields");
    }

    // Fetch the product details
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());

    if (existingItem) {
      // Increment or decrement the quantity
      existingItem.quantity += quantityChange;

      // Remove item if quantity is zero or negative
      if (existingItem.quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
      } else {
        // Update the total price of the existing item
        existingItem.totalPrice = existingItem.quantity * product.price;
      }
    } else {
      // Add new item to cart if quantity is positive
      if (quantityChange > 0) {
        cart.items.push({
          productId,
          quantity: quantityChange,
          totalPrice: quantityChange * product.price,
        });
      } else {
        throw new Error("Cannot decrement non-existing product in cart");
      }
    }

    // Recalculate total cart price
    cart.totalPrice = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.updatedAt = Date.now();

    await cart.save();
    return { success: true, data: cart };
  } catch (error) {
    return { success: false, message: "Error updating cart: " + error.message };
  }
};


export const updateCartCollection = async (userId, adminId, productId) => {
  try {
    if (!userId || !adminId || !productId) {
      throw new Error("Missing required fields");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart with the first product added
      cart = new Cart({
        userId,
        items: [{ productId, quantity: 1, totalPrice: product.price }],
        totalPrice: product.price,
      });
      await cart.save();
      return { success: true, message: "Product added to cart", data: cart };
    }

    // Check if the product is already in the cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItem) {
      return { success: false, message: "Product already exists in cart" };
    }

    // Add new product to the cart with quantity 1
    cart.items.push({
      productId,
      quantity: 1,
      totalPrice: product.price,
    });

    // Update total cart price
    cart.totalPrice += product.price;
    cart.updatedAt = Date.now();

    await cart.save();
    return { success: true, message: "Product added to cart", data: cart };
  } catch (error) {
    return { success: false, message: "Error updating cart: " + error.message };
  }
};

export const deleteCart = async (userId, productId, adminId) => {
  try {
    if (!userId || !productId || !adminId) {
      throw new Error("Missing required fields");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    const shop = await Product.findOne({
      _id: productId,
      addedBy: adminId,
    });

    if (!shop) {
      throw new Error("Shop or product not found");
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );
    if (existingItemIndex === -1) {
      throw new Error("Product not found in cart");
    }
    cart.items.splice(existingItemIndex, 1);

    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    cart.totalPrice = cart.items.reduce((total, item) => {
      const product = products.find(
        (product) => product._id.toString() === item.productId.toString()
      );
      return product ? total + item.quantity * product.price : total;
    }, 0);

    cart.updatedAt = Date.now();
    await cart.save();
    return { success: true, data: cart };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting cart item: " + error.message,
    };
  }
};

export const deleteWishlistItem = async (userId, productId, adminId) => {
  try {
    if (!userId || !productId || !adminId) {
      throw new Error("Missing required fields");
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }
    const shop = await Product.findOne({
      _id: productId,
      addedBy: adminId,
    });

    if (!shop) {
      throw new Error("Shop or product not found");
    }

    // Remove the product from the user's wishlist
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!updatedWishlist) {
      throw new Error("Wishlist not found or product was not in wishlist");
    }

    return { success: true, data: updatedWishlist };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting wishlist item: " + error.message,
    };
  }
};

export const getUserCarts = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    const objectId = new mongoose.Types.ObjectId(userId);
    const cartInfo = await Cart.aggregate([
      { $match: { userId: objectId } },
      { $unwind: "$items" }, // Unwind the items array
      {
        $lookup: {
          from: "products", // Collection name for the `Product` model
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Unwind product details
      {
        $lookup: {
          from: "subcategories", // Collection name for SubCategory model
          localField: "productDetails.subCategory",
          foreignField: "_id",
          as: "productDetails.subCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails.subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "maincategories", // Collection name for MainCategory model
          localField: "productDetails.subCategoryDetails.mainCategory",
          foreignField: "_id",
          as: "productDetails.mainCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails.mainCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id", // Cart ID
          userId: { $first: "$userId" },
          items: {
            $push: {
              productId: "$items.productId",
              quantity: "$items.quantity",
              productDetails: {
                title: "$productDetails.title",
                description: "$productDetails.description",
                images: "$productDetails.images",
                price: "$productDetails.price",
                purity: "$productDetails.purity",
                sku: "$productDetails.sku",
                stock: "$productDetails.stock",
                makingCharge: "$productDetails.makingCharge",
                type: "$productDetails.type",
                tags: "$productDetails.tags",
                weight: "$productDetails.weight",
                subCategory: "$productDetails.subCategoryDetails.name",
                mainCategory: "$productDetails.mainCategoryDetails.name",
              },
              itemTotal: {
                $multiply: ["$items.quantity", "$productDetails.price"],
              },
            },
          },
          totalPrice: {
            $sum: { $multiply: ["$items.quantity", "$productDetails.price"] },
          },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          items: 1,
          totalPrice: 1,
          updatedAt: 1,
        },
      },
    ]);

    return { success: true, data: cartInfo };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching cart item: " + error.message,
    };
  }
};

export const updateWishlistCollection = async (
  userId,
  adminId,
  productId,
  action
) => {
  try {
    if (!userId || !adminId || !productId || !action) {
      throw new Error("Missing required fields");
    }

    // Find the shop and product
    const shop = await Product.findOne({
      _id: productId,
      addedBy: adminId,
    });

    if (!shop) {
      throw new Error("Shop or product not found");
    }

    // Find or create the user's wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Add or remove the product based on the action
    const existingItemIndex = wishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (action === "add") {
      if (existingItemIndex === -1) {
        wishlist.items.push({ productId });
      } else {
        return { success: false, message: "Product already in wishlist" };
      }
    } else if (action === "remove") {
      if (existingItemIndex !== -1) {
        wishlist.items.splice(existingItemIndex, 1);
      } else {
        return { success: false, message: "Product not found in wishlist" };
      }
    } else {
      throw new Error("Invalid action specified");
    }

    wishlist.updatedAt = Date.now();
    await wishlist.save();

    return { success: true, data: wishlist };
  } catch (error) {
    return {
      success: false,
      message: "Error updating wishlist: " + error.message,
    };
  }
};

export const getUserWishlists = async (userId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const wishlistDetails = await Wishlist.aggregate([
      { $match: { userId: objectId } },
      { $unwind: "$items" }, // Unwind the items array
      {
        $lookup: {
          from: "products", // Collection name for the `Product` model
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Unwind product details
      {
        $lookup: {
          from: "subcategories", // Collection name for SubCategory model
          localField: "productDetails.subCategory",
          foreignField: "_id",
          as: "productDetails.subCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails.subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "maincategories", // Collection name for MainCategory model
          localField: "productDetails.subCategoryDetails.mainCategory",
          foreignField: "_id",
          as: "productDetails.mainCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$productDetails.mainCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id", // Cart ID
          userId: { $first: "$userId" },
          items: {
            $push: {
              productId: "$items.productId",
              quantity: "$items.quantity",
              productDetails: {
                title: "$productDetails.title",
                description: "$productDetails.description",
                images: "$productDetails.images",
                price: "$productDetails.price",
                purity: "$productDetails.purity",
                type: "$productDetails.type",
                tags: "$productDetails.tags",
                sku: "$productDetails.sku",
                stock: "$productDetails.stock",
                makingCharge: "$productDetails.makingCharge",
                weight: "$productDetails.weight",
                subCategory: "$productDetails.subCategoryDetails.name",
                mainCategory: "$productDetails.mainCategoryDetails.name",
              },
            },
          },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          items: 1,
          updatedAt: 1,
        },
      },
    ]);

    return { success: true, data: wishlistDetails };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching wishlist details: " + error.message,
    };
  }
};

export const fetchProductHelper = async (adminId) => {
  try {
    const result = await mongoose.model("Product").aggregate([
      {
        $match: {
          $or: [
            { addedBy: new mongoose.Types.ObjectId(adminId) },
            { addedBy: null },
          ],
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },

      {
        $unwind: {
          path: "$subCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "maincategories",
          localField: "subCategoryDetails.mainCategory",
          foreignField: "_id",
          as: "mainCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$mainCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          images: 1,
          price: 1,
          weight: 1,
          purity: 1,
          stock: 1,
          makingCharge:1,
          tags: 1,
          type: 1,
          sku: 1,
          subCategoryDetails: 1,
          mainCategoryDetails: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    return result;
  } catch (error) {
    if (error.isOperational) throw error;

    throw createAppError(`Error Fetching product: ${error.message}`, 500);
  }
};

export const getMainCategoriesHelper = async (adminId, userId) => {
  try {
    let query;
    if (userId) {
      query = {
        createdByUserId: userId,
      };
    } else {
      query = {
        $and: [
          { $or: [{ createdBy: adminId }, { createdBy: null }] },
          { createdByUserId: null },
        ],
      };
    }
    const mainCategories = await MainCategory.find(query).lean();
    return mainCategories;
  } catch (error) {
    throw createAppError(
      `Error fetching main categories: ${error.message}`,
      500 // Internal server error
    );
  }
};

export const fixedProductFixHelper = async (bookingData) => {
  try {
    if (!Array.isArray(bookingData) || bookingData.length === 0) {
      throw new Error("Invalid or empty booking data.");
    }

    const updatePromises = bookingData.map((item) => {
      const { productId, fixedPrice } = item;

      if (fixedPrice <= 0) {
        throw new Error(`Invalid fixed price for productId: ${productId}`);
      }

      return Product.findByIdAndUpdate(
        productId,
        { price: fixedPrice },
        { new: true }
      );
    });

    const updatedProducts = await Promise.all(updatePromises);
    return updatedProducts;
  } catch (error) {
    throw createAppError(`Error fixing product prices: ${error.message}`, 500);
  }
};
