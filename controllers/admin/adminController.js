import {
  adminVerfication,
  getUsersForAdmin,
  addSpreadValue,
  getSpreadValues,
  deleteSpreadValue
} from "../../helper/admin/adminHelper.js";
import { createAppError } from "../../utils/errorHandler.js";
import bcrypt from "bcrypt";
import adminModel from "../../model/adminSchema.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/jwt.js";
// const SECRET_KEY = 'aurify@JWT';

export const adminLoginController = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const authLogin = await adminVerfication(email);

    if (authLogin) {
      const encryptPassword = authLogin.password;
      const matchPassword = await bcrypt.compare(password, encryptPassword);

      if (!matchPassword) {
        throw createAppError("Incorrect password.", 401);
      }
      // await addFCMToken(email, fcmToken);
      const expiresIn = rememberMe ? "30d" : "3d";
      const token = generateToken({ adminId: authLogin._id }, expiresIn);

      res.status(200).json({
        success: true,
        message: "Authentication successful.",
        token,
      });
    } else {
      throw createAppError("User not found.", 404);
    }
  } catch (error) {
    next(error);
  }
};

export const adminTokenVerificationApi = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch admin data using the decoded adminId
    const admin = await adminModel.findById(decoded.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const currentDate = new Date();
    const serviceEndDate = new Date(admin.serviceEndDate);

    if (serviceEndDate < currentDate) {
      // If service has expired
      return res.status(403).json({
        message: 'Your service has ended. Please renew to continue using the system.',
        serviceExpired: true
      });
    }

    // If the token is valid and service is active
    res.status(200).json({
      admin: {
        adminId: admin._id,
        serviceEndDate: admin.serviceEndDate,
      },
      serviceExpired: false
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired', tokenExpired: true });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', tokenInvalid: true });
    }
    next(error);
  }
};

export const getAdminDataController = async (req, res, next) => {
  try {
    const { email } = req.query; // Get email from query parameters

    if (!email) {
      throw createAppError("Email parameter is required.", 400);
    }

    const adminData = await adminModel.findOne({ email: email }).select('-password'); // Find admin by email and exclude password

    if (!adminData) {
      throw createAppError("Admin data not found.", 404);
    }

    res.status(200).json({
      success: true,
      data: adminData,
    });
  } catch (error) {
    console.log('error error:', error.message);
    next(error); // Pass the error to the global error handler
  }
};

//Add BankDetails section
export const saveBankDetailsController = async (req, res, next) => {
  try {
    const { email, bankDetails } = req.body;
    // console.log('haaaai', bankDetails);
    if (!email || !bankDetails) {
      return res.status(400).json({ success: false, message: "Email and bank details are required." });
    }

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    // Push the new bank details to the bankDetails array
    admin.bankDetails.push(bankDetails);

    // Save the updated admin document
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Bank details saved successfully",
      data: admin.bankDetails
    });
  } catch (error) {
    console.log('Error saving bank details:', error.message);
    next(error);
  }
};

// Update bank details
export const updateBankDetailsController = async (req, res, next) => {
  try {
    const { email, bankDetails } = req.body;

    if (!email || !bankDetails) {
      return res.status(400).json({ success: false, message: "Email and bank details are required." });
    }

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    // Find the index of the bank details to update
    const bankIndex = admin.bankDetails.findIndex(b => b.accountNumber === bankDetails.accountNumber);

    if (bankIndex === -1) {
      return res.status(404).json({ success: false, message: "Bank details not found." });
    }

    // Update the bank details
    admin.bankDetails[bankIndex] = { ...admin.bankDetails[bankIndex], ...bankDetails };

    // Save the updated admin document
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully",
      data: admin.bankDetails
    });
  } catch (error) {
    console.error('Error updating bank details:', error.message);
    next(error);
  }
};


// Delete bank details
export const deleteBankDetailsController = async (req, res, next) => {
  try {
    const { email, accountNumber } = req.body;

    if (!email || !accountNumber) {
      return res.status(400).json({ success: false, message: "Email and account number are required." });
    }

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    // Remove the bank details
    admin.bankDetails = admin.bankDetails.filter(b => b.accountNumber !== accountNumber);

    // Save the updated admin document
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Bank details deleted successfully",
      data: admin.bankDetails
    });
  } catch (error) {
    console.error('Error deleting bank details:', error.message);
    next(error);
  }
};


//Sidebar Features 
export const getAdminFeaturesController = async (req, res, next) => {
  try {
    const { email } = req.query; // Using query parameter for consistency with your frontend

    console.log('Received email:', email);

    if (!email) {
      return res.status(400).json({ success: false, message: "Email parameter is required." });
    }

    const admin = await adminModel.findOne({ email }).select('features');

    console.log('Found admin:', admin);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    // Assuming 'features' is an array in your admin document
    const features = admin.features || [];

    res.status(200).json({
      success: true,
      message: "Features fetched successfully",
      data: features
    });
  } catch (error) {
    console.error('Error fetching admin features:', error.message);
    next(error);
  }
};


export const fetchUsersForAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const response = await getUsersForAdmin(adminId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const addCustomSpread = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const { spreadValue, title } = req.body;
    const response = await addSpreadValue(adminId, spreadValue, title);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const fetchSpreadValues = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const response = await getSpreadValues(adminId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteSpreadValueController = async (req, res, next) => {
  try {
    const { spreadValueId } = req.params;
    const { email } = req.query; // Assuming you'll send admin email as a query parameter

    const result = await deleteSpreadValue(email, spreadValueId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    next(error);
  }
};