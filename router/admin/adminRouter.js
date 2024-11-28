import { Router } from "express";
import {
  deleteBankDetailsController,
  getAdminDataController,
  getAdminFeaturesController,
  saveBankDetailsController,
  updateBankDetailsController,
} from "../../controllers/admin/adminController.js";

import {
  addManualNewsController,
  deleteManualNewsController,
  getManualNewsController,
  updateManualNewsController,
} from "../../controllers/admin/newsController.js";

import {
  adminTokenVerificationApi,
  fetchAdminDevice,
} from "../../controllers/admin/adminController.js";

import {
  adminLoginController,
  getPremiumDiscounts,
  premiumDiscounts,
} from "../../controllers/admin/adminController.js";
import { getBanner } from "../../controllers/admin/bannerController.js";
import { getServerController } from "../../controllers/admin/serverController.js";
import {
  createCommodity,
  deleteSpotRateCommodity,
  getCommodityController,
  getMetalCommodity,
  getSpotRate,
  updateCommodity,
  updateSpread,
} from "../../controllers/admin/spotRateController.js";
import { uploadSingle } from "../../middleware/multer.js";

// import {
//   createShopItem,
//   fetchShopItems,
//   editShopItem,
//   removeShopItem,
// } from "../../controllers/admin/shopController.js";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategories,
} from "../../controllers/admin/categoryController.js";
import {
  sendContactEmail,
  sendFeatureRequestEmail,
} from "../../controllers/admin/contactController.js";
import {
  getMessages,
  getUserAdmin,
  markAsRead,
} from "../../controllers/admin/messageController.js";
import {
  deleteNotification,
  getNotification,
} from "../../controllers/admin/notificationController.js";
import {
  getBackground,
  uploadBG,
} from "../../controllers/admin/previewController.js";
import {
  createProduct,
  deleteProduct,
  fetchProductData,
  updateProduct,
} from "../../controllers/admin/productController.js";
import {
  updateAdminProfileController,
  updateLogo,
} from "../../controllers/admin/profileController.js";
import {
  createMainCategory,
  createSubCategory,
  deleteMainCategory,
  deleteSubCategory,
  editMainCategory,
  editSubCategory,
  getMainCategories,
} from "../../controllers/admin/shopCategoryController.js";
import {
  addCustomSpread,
  deleteSpreadValueController,
  fetchSpreadValues,
} from "../../controllers/admin/spreadValuesController.js";
import {
  addUser,
  deleteUser,
  editUser,
  getUsers,
} from "../../controllers/admin/userController.js";
import {
  addUserCommodity,
  deleteUserCommodity,
  getUserCommodity,
  updateUserCommodity,
  updateUserSpread,
} from "../../controllers/admin/UserSpotRateController.js";

const router = Router();

//admin router
router.post("/login", adminLoginController);
router.post("/verify-token", adminTokenVerificationApi);
router.get("/data/:userName", getAdminDataController);
router.put("/update-profile/:id", updateAdminProfileController);
router.post("/update-logo", uploadSingle("logo"), updateLogo);
router.get("/server-url", getServerController);
router.post("/verify-token", adminTokenVerificationApi);

//spotrate routers
router.post("/update-spread", updateSpread);
router.get("/spotrates/:adminId", getSpotRate);
router.get("/commodities/:userName", getCommodityController);
router.post("/spotrate-commodity", createCommodity);
router.patch("/spotrate-commodity/:adminId/:commodityId", updateCommodity);
router.delete("/commodities/:adminId/:commodityId", deleteSpotRateCommodity);
router.get("metalCommodities/:userName", getMetalCommodity);

//Notification router
router.get("/notifications/:adminId", getNotification);
router.delete("/notifications/:adminId/:notificationId", deleteNotification);

//bank details
router.post("/save-bank-details", saveBankDetailsController);
router.delete("/delete-bank-details", deleteBankDetailsController);
router.put("/update-bank-details", updateBankDetailsController);

//features
router.get("/features", getAdminFeaturesController);
router.post("/request-feature", sendFeatureRequestEmail);

//banner
router.get("/banners/:adminId", getBanner);
router.get("/banners/:userId", getBanner);

//news-routers
router.post("/add-manual-news", addManualNewsController);
router.get("/get-manual-news", getManualNewsController);
router.patch(
  "/update-manual-news/:newsId/:newsItemId",
  updateManualNewsController
);
router.delete(
  "/delete-manual-news/:newsId/:newsItemId",
  deleteManualNewsController
);

//user router
router.get("/admin/:adminId/device", fetchAdminDevice);
router.post("/admin/:adminId/spread-values", addCustomSpread);
router.get("/admin/:adminId/spread-values", fetchSpreadValues);
router.delete(
  "/admin/spread-values/:spreadValueId/:userName",
  deleteSpreadValueController
);

//shop router
// router.post('/shop-items/:userName', uploadSingle('image'), createShopItem);
// router.get('/shop-items/:userName', fetchShopItems);
// router.patch('/shop-items/:id', uploadSingle('image'), editShopItem);
// router.delete('/shop-items/:id', removeShopItem);

//contact router
router.post("/contact", sendContactEmail);
router.get("/user-data", getUserData);

//messages router
router.get("/messages/:adminId/:userId", getMessages);
router.get("/user/:userId/:adminId", getUserAdmin);
router.post("/messages/markAsRead", markAsRead);

router.post("/upload/:userID", uploadBG);
router.get("/backgrounds/:userId", getBackground);

//premium and discount router
router.post("/premiumdiscounts/:userId", premiumDiscounts);
router.get("/premiumdiscounts/:userId", getPremiumDiscounts);

//category routers
router.post("/addCategory/:adminId", addCategory);
router.put("/editCategory/:id/:adminId", editCategory);
router.delete("/deleteCategory/:id/:adminId", deleteCategory);
router.get("/getCategories/:adminId", getCategories);

//user router
router.post("/admin/:adminId/users", addUser);
router.put("/admin/users/:userId/:adminId", editUser);
router.delete("/admin/users/:userId/:adminId", deleteUser);
router.get("/admin/:adminId/users", getUsers);
router.post("/admin/:adminId/users", addUser);
router.put("/admin/users/:userId/:adminId", editUser);
router.delete("/admin/users/:userId/:adminId", deleteUser);
router.get("/admin/:adminId/users", getUsers);

//user spotrate router
router.get("/spotrates/:adminId/:categoryId", getUserCommodity);
router.post("/update-user-spread", updateUserSpread);
router.post("/commodities/:adminId/:categoryId", addUserCommodity);
router.delete(
  "/commodities/:adminId/:categoryId/:commodityId",
  deleteUserCommodity
);
router.patch(
  "/spotrate-commodity/:adminId/:categoryId/:commodityId",
  updateUserCommodity
);

router.post("/main-category", uploadSingle("image"), createMainCategory);
router.put(
  "/main-category/:categoryId",
  uploadSingle("image"),
  editMainCategory
);
router.delete("/main-category/:categoryId", deleteMainCategory);
router.get("/main-categories/:adminId", getMainCategories);

router.post("/sub-category", createSubCategory);
router.put("/sub-category/:subCategoryId", editSubCategory);
router.delete("/sub-category/:subCategoryId", deleteSubCategory);

router.get("/products/:adminId", fetchProductData);
router.post("/products", uploadMultiple("image", 5), createProduct);
router.put("/products/:id", uploadMultiple("image", 5), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
