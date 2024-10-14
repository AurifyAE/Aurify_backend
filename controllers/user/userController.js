import {
  getNewsByAdminId,
  getSportrate,
  requestPassInAdmin,
  updateUserPassword,
  userCollectionSave,
  userUpdateSpread,
  userVerfication,
} from "../../helper/user/userHelper.js";
import adminModel from "../../model/adminSchema.js";
import DiscountModel from "../../model/discountSchema.js";
import PremiumModel from "../../model/premiumSchema.js";
import { serverModel } from "../../model/serverSchema.js";

export const registerUser = async (req, res, next) => {
  try {
    const { userName, contact, location, email, password } = req.body;
    const { adminId } = req.params;
    const data = {
      userName,
      contact,
      location,
      email,
      password,
    };

    const response = await userCollectionSave(data, adminId);
    res
      .status(200)
      .json({ message: response.message, success: response.success });
  } catch (error) {
    next(error);
  }
};

export const userLoginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { adminId } = req.params;
    const response = await userVerfication(adminId, email, password);
    res
      .status(200)
      .json({ message: response.message, success: response.success });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { adminId } = req.params;
    const response = await updateUserPassword(adminId, email, password);
    res
      .status(200)
      .json({ message: response.message, success: response.success });
  } catch (error) {
    next(error);
  }
};

export const updateSpread = async (req, res, next) => {
  try {
    const { adminId, userId } = req.params;
    const { spread, title } = req.body;
    const response = await userUpdateSpread(adminId, userId, spread, title);
    res
      .status(200)
      .json({ message: response.message, success: response.success });
  } catch (error) {
    next(error);
  }
};

export const requestAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { request } = req.body;
    const response = await requestPassInAdmin(adminId, request);
    res
      .status(200)
      .json({ message: response.message, success: response.success });
  } catch (error) {
    next(error);
  }
};
export const fetchAdminBankDetails = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const adminData = await adminModel.findById(adminId, "bankDetails");
    if (!adminData) {
      return res.status(204).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      commodities: adminData,
      message: "Fetch banking details successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getSpotrateDetails = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { success, fetchSpotRate } = await getSportrate(adminId);

    if (!success || !fetchSpotRate) {
      return res.status(204).json({
        success: false,
        message: "SpotRate data not found",
      });
    }

    return res.status(200).json({
      success: true,
      info: fetchSpotRate,
      message: "Fetching SpotRate successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getServerDetails = async (req, res, next) => {
  try {
    const serverInfo = await serverModel.findOne(
      {},
      "selectedServerName selectedServerURL"
    );

    if (!serverInfo) {
      return res.status(204).json({
        success: false,
        message: "No server information found",
      });
    }

    return res.status(200).json({
      success: true,
      info: {
        serverURL: serverInfo.selectedServerURL,
        serverName: serverInfo.selectedServerName,
      },
      message: "Fetching ServerURL & ServerName successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentNews = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { success, news, message } = await getNewsByAdminId(adminId);

    if (!success) {
      return res.status(204).json({
        success: false,
        message,
      });
    }

    return res.status(200).json({
      success: true,
      news,
      message: "News fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCommodities = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const adminData = await adminModel.findById(adminId, "commodities.symbol");
    if (!adminData) {
      return res.status(204).json({
        success: false,
        message: "Admin not found",
      });
    }
    const commoditySymbols = adminData.commodities.map((commodity) =>
      commodity.symbol.toUpperCase()
    );
    return res.status(200).json({
      success: true,
      commodities: commoditySymbols,
      message: "Commodities fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Function to fetch premium and discount data
export const getPremiumDiscounts = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const premiums = await PremiumModel.findOne({ createdBy: adminId });
    const discounts = await DiscountModel.findOne({ createdBy: adminId });

    let premiumDiscounts = [];

    if (premiums) {
      premiumDiscounts = premiumDiscounts.concat(
        premiums.premium.map((sub) => ({
          _id: sub._id,
          type: "Premium",
          value: sub.value,
          time: sub.timestamp,
        }))
      );
    }

    if (discounts) {
      premiumDiscounts = premiumDiscounts.concat(
        discounts.discount.map((sub) => ({
          _id: sub._id,
          type: "Discount",
          value: sub.value,
          time: sub.timestamp,
        }))
      );
    }

    // Sort by time
    premiumDiscounts.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Separate the latest premium and discount
    const lastPremium = premiumDiscounts.find(
      (item) => item.type === "Premium"
    );
    const lastDiscount = premiumDiscounts.find(
      (item) => item.type === "Discount"
    );

    res.json({
      lastPremium: lastPremium
        ? {
            ...lastPremium,
            time: new Date(lastPremium.time).toLocaleString(),
          }
        : null,
      lastDiscount: lastDiscount
        ? {
            ...lastDiscount,
            time: new Date(lastDiscount.time).toLocaleString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Error in fetching:", error);
    res.status(500).json({ message: "Server error" });
  }
};
