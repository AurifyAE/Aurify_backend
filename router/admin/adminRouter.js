import { Router } from "express";
import {
    adminLoginController,
    deleteBankDetailsController,
    deleteNotification,
    getAdminDataController,
    getAdminFeaturesController,
    getNotification,
    saveBankDetailsController,
    updateBankDetailsController
} from "../../controllers/Admin/adminController.js";

import {
    addManualNewsController,
    deleteManualNewsController,
    getManualNewsController,
    updateManualNewsController
} from "../../controllers/admin/newsController.js";

import {
    addCustomSpread,
    adminTokenVerificationApi,
    deleteSpreadValueController,
    fetchSpreadValues,
    fetchUsersForAdmin,
    getCommodityController,
    getSpotRate,
    updateAdminProfileController,
    updateLogo,
    updateSpread
} from '../../controllers/Admin/adminController.js';
import { getServerController } from "../../controllers/admin/serverController.js";
import { uploadSingle } from "../../middleware/multer.js";
// import { updateCommodity } from "../../controllers/admin/adminController.js";
import { createCommodity, getMetalCommodity, getSpotRateCommodity } from "../../controllers/Admin/adminController.js";
import { deleteSpotRateCommodity, updateCommodity } from "../../controllers/admin/spotRateController.js";

import { getBanner } from "../../controllers/admin/bannerController.js";

import { sendContactEmail } from "../../controllers/admin/contactController.js";
import { createShopItem, editShopItem, fetchShopItems, removeShopItem } from "../../controllers/admin/shopController.js";
import { getUserData } from "../../helper/admin/adminHelper.js";
import { validateContact } from "../../middleware/validators.js";
// import { validateUser } from "../../middleware/validators.js";

const router = Router()

router.post('/login', adminLoginController);
// router.post("/register/:adminId", validateUser, registerUser);
router.post('/verify-token', adminTokenVerificationApi);
router.get('/data/:email', getAdminDataController);
router.put('/update-profile/:id', updateAdminProfileController);
router.post('/update-logo', uploadSingle('logo'), updateLogo);
router.get('/server-url', getServerController);
router.post('/verify-token', adminTokenVerificationApi)
// router.post('/update-spotRate',getSpotRateData);
router.post('/update-spread', updateSpread);
router.get('/spotrates/:adminId', getSpotRate);

router.get('/commodities/:email', getCommodityController);
router.post('/spotrate-commodity', createCommodity);
router.get('/spotrates/:adminId', getSpotRateCommodity);
router.patch('/spotrate-commodity/:adminId/:commodityId', updateCommodity);
router.delete('/commodities/:adminId/:commodityId', deleteSpotRateCommodity);
router.get('metalCommodities/:email', getMetalCommodity);

router.get('/notifications/:adminId', getNotification);
router.delete('/notifications/:adminId/:notificationId', deleteNotification);


router.post('/save-bank-details', saveBankDetailsController);
router.delete('/delete-bank-details', deleteBankDetailsController);
router.put('/update-bank-details', updateBankDetailsController);

router.get('/features', getAdminFeaturesController);

router.get('/banners/:adminId', getBanner);


//news-routers
router.post('/add-manual-news', addManualNewsController);
router.get('/get-manual-news', getManualNewsController);
router.patch('/update-manual-news/:newsId/:newsItemId', updateManualNewsController);
router.delete('/delete-manual-news/:newsId/:newsItemId', deleteManualNewsController);

router.get('/admin/:adminId/users', fetchUsersForAdmin);
router.post('/admin/:adminId/spread-values', addCustomSpread);
router.get('/admin/:adminId/spread-values', fetchSpreadValues);
router.delete('/admin/spread-values/:spreadValueId', deleteSpreadValueController);

router.post('/shop-items/:email', uploadSingle('image'), createShopItem);
router.get('/shop-items', fetchShopItems);
router.patch('/shop-items/:id', uploadSingle('image'), editShopItem);
router.delete('/shop-items/:id', removeShopItem);


router.post('/contact', validateContact, sendContactEmail);
router.get('/user-data', getUserData);


export default router
