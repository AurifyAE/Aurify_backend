import { Router } from "express";
import {
  addItemToCart,
  addItemToWishlist,
  decrementCartItem,
  deleteCartItem,
  deleteWishlist,
  getProductDetails,
  getUserCart,
  getUserWishlist,
  incrementCartItem,
  getMainCategories,
  fixedProductPrice,
  getBestSeller,
  getTopRated,
  getNewArrival,
  getViewAll
} from "../../controllers/user/productController.js";
import { saveBooking } from "../../controllers/user/bookingController.js";
import {
  fetchAdminBankDetails,
  forgotPassword,
  getCommodities,
  getCurrentNews,
  getPremiumDiscounts,
  getServerDetails,
  getSpotrateDetails,
  requestAdmin,
  updateSpread,
  userLoginController,
  getProfile,
  getBanner,
  getVideoBanner
} from "../../controllers/user/userController.js";

const router = Router();

router.post("/login/:adminId", userLoginController);
router.patch("/update-spread/:adminId/:userId", updateSpread);
router.post("/request-admin/:adminId", requestAdmin);
router.get("/get-spotrates/:adminId", getSpotrateDetails);
router.get("/get-banks/:adminId", fetchAdminBankDetails);
router.get("/get-news/:adminId", getCurrentNews);
router.get("/get-commodities/:adminId", getCommodities);
router.get("/get-server", getServerDetails);

router.get("/main-categories/:adminId", getMainCategories);
router.get("/get-product/:mainCateId", getProductDetails);
router.get("/best-seller", getBestSeller);
router.get("/top-rated", getTopRated);
router.get("/new-arrival", getNewArrival)
router.get("/view-all", getViewAll)
router.get("/get-cart/:userId", getUserCart);
router.get("/get-wishlist/:userId", getUserWishlist);
router.get("/get-banner/:adminId", getBanner);
router.get("/get-VideoBanner/:adminId", getVideoBanner);

router.post("/cart/:adminId/:userId/:productId", addItemToCart);
router.patch("/cart/increment/:adminId/:userId/:productId", incrementCartItem);
router.patch("/cart/decrement/:adminId/:userId/:productId", decrementCartItem);
router.delete("/cart/:adminId/:userId/:productId", deleteCartItem);

router.patch("/wishlist/:adminId/:userId/:productId", addItemToWishlist);
router.delete("/wishlist/:adminId/:userId/:productId", deleteWishlist);

router.put("/forgot-password/:adminId", forgotPassword);
router.get('/get-profile/:adminId',getProfile)

router.post('/booking/:adminId/:userId',saveBooking)
router.put('/products/fix-prices',fixedProductPrice)

router.get("/get-premium-discount/:adminId", getPremiumDiscounts); // New route for premium discounts

export default router;
