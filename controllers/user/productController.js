import {
  fetchProductDetails,
  updateCartCollection,
  deleteCart,
  getUserCarts,
  updateWishlistCollection,
  getUserWishlists,
  deleteWishlistItem,
  fetchProductHelper,
  getMainCategoriesHelper,
  fixedProductFixHelper,
  fetchBestSellerProduct,
  fetchTopRatedProduct,
  fetchNewArrivalProduct,
  fetchAllProduct,
  updateCartItemCollection,
  incrementCartItemQuantity
} from "../../helper/user/productHelper.js";

export const getProductDetails = async (req, res, next) => {
  try {
    const { mainCateId } = req.params;
    const { result, success } = await fetchProductDetails(mainCateId);
    if (!success || !result) {
      return res.status(404).json({
        success: false,
        message: "Products data not found",
      });
    }
    return res.status(200).json({
      success: true,
      info: result,
      message: "Fetching products successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getBestSeller = async (req, res, next) => {
  try {
    const { result, success, message } = await fetchBestSellerProduct();
    if (!success) {
      return res.status(404).json({
        success: false,
        message: message || "Products data not found", 
      });
    }
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No 'Best Seller' products found.",
      });
    }

    return res.status(200).json({
      success: true,
      info: result,
      message: "Fetching products successfully",
    });

  } catch (error) {
    next(error)
  }
};
export const getViewAll = async (req, res, next) => {
  try {
    // Extracting query parameters correctly
    const { page = '1', tags, mainCategory, adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const filters = {
      tags,
      mainCategory,
      adminId,
    };

    const { result, success, message, totalCount, totalPages } = await fetchAllProduct(
      parseInt(page, 10) || 1, // Ensuring page is a valid number with default as 1
      filters
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: message || "Products data not found",
      });
    }

    return res.status(200).json({
      success: true,
      info: result,
      pagination: {
        totalCount,
        totalPages,
        currentPage: parseInt(page, 10),
      },
      message: "Fetching products successfully",
    });
  } catch (error) {
    next(error);
  }
};



export const getNewArrival = async (req, res, next) => {
  try {
    const { result, success, message } = await fetchNewArrivalProduct();
    if (!success) {
      return res.status(404).json({
        success: false,
        message: message || "Products data not found", 
      });
    }
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No 'New Arrival' products found.",
      });
    }

    return res.status(200).json({
      success: true,
      info: result,
      message: "Fetching products successfully",
    });

  } catch (error) {
    next(error)
  }
};

export const getTopRated = async (req, res, next) => {
  try {
    const { result, success, message } = await fetchTopRatedProduct();
    if (!success) {
      return res.status(404).json({
        success: false,
        message: message || "Products data not found", 
      });
    }
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No 'Top Rated' products found.",
      });
    }

    return res.status(200).json({
      success: true,
      info: result,
      message: "Fetching products successfully",
    });

  } catch (error) {
    next(error)
  }
};
export const addItemToCart = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { quantity = 1 } = req.body;
    const { success, data, message } = await updateCartCollection(
      userId,
      adminId,
      productId,
      quantity
    );
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item successfully added to cart",
        cart: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const incrementCartItem = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { quantity = 1 } = req.body;
    const { success, data, message } = await incrementCartItemQuantity(
      userId,
      adminId,
      productId,
      quantity
    );
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item successfully added to cart",
        cart: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { quantity } = req.body;

    // Ensure quantity is a valid number
    if (!Number.isInteger(quantity) || quantity === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity. It must be a non-zero integer.",
      });
    }

    const { success, data, message } = await updateCartItemCollection(
      userId,
      adminId,
      productId,
      quantity
    );

    if (success) {
      return res.status(200).json({
        success: true,
        message: "Cart item quantity updated successfully",
        cart: data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const decrementCartItem = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { quantity = -1 } = req.body;
    const { success, data, message } = await incrementCartItemQuantity(
      userId,
      adminId,
      productId,
      quantity
    );
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item successfully added to cart",
        cart: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { success, data, message } = await deleteCart(
      userId,
      productId,
      adminId
    );
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item deleted successfully from the cart.",
        cart: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message || "Failed to delete the item from the cart.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteWishlist = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { success, data, message } = await deleteWishlistItem(
      userId,
      productId,
      adminId
    );
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item deleted successfully from the Wishlist.",
        cart: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message || "Failed to delete the item from the Wishlist.",
      });
    }
  } catch (error) {
    next(error);
  }
};
export const getUserCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { success, data, message } = await getUserCarts(userId);
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item fetching successfully from the cart.",
        info: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message || "Failed to delete the item from the cart.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const addItemToWishlist = async (req, res, next) => {
  try {
    const { userId, adminId, productId } = req.params;
    const { action } = req.query;
    const { success, data, message } = await updateWishlistCollection(
      userId,
      adminId,
      productId,
      action
    );
    if (success) {
      const actionMessage =
        action === "add" ? "Added to Wishlist" : "Removed from Wishlist";
      res.status(200).json({
        success: true,
        message: actionMessage,
        wishlist: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { success, data, message } = await getUserWishlists(userId);
    if (success) {
      res.status(200).json({
        success: true,
        message: "Item fetching successfully from the wishlist.",
        info: data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: message || "Failed to delete the item from the wishlist.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const fetchProductData = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const result = await fetchProductHelper(adminId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMainCategories = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { userId } = req.query;
    const categories = await getMainCategoriesHelper(adminId, userId || null);
    const filteredCategories = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
    }));
    res.status(200).json({ success: true, data: filteredCategories });
  } catch (error) {
    next(error);
  }
};

export const fixedProductPrice = async (req, res, next) => {
  try {
    const { bookingData } = req.body;
    if (!bookingData) {
      return res.status(400).json({ message: "Booking data is required." });
    }
    const updatedProducts = await fixedProductFixHelper(bookingData);
    res.status(200).json({
      message: "Prices fixed successfully",
      updatedProducts,
    });
  } catch (error) {
    next(error);
  }
};
