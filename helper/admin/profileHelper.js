import adminModel from "../../model/adminSchema.js";

export const updateUserData = async (
  id,
  email,
  companyName,
  fullName,
  mobile,
  whatsapp,
  location,
  latitude,
  longitude
) => {
  try {
    const updateData = {
      email: email,
      companyName: companyName,
      userName: fullName,
      contact: mobile,
      whatsapp: whatsapp,
      address: location,
    };
    // Add latitude and longitude only if provided
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    return await adminModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .select("-password");
  } catch (error) {
    console.error("Error updating the user:", error.message);
    throw new Error("Updation failed: " + error.message);
  }
};

export const updateUserLogo = async (userName, logoName) => {
  try {
    return await adminModel.findOneAndUpdate(
      { userName: userName },
      { logo: logoName },
      { new: true }
    );
  } catch (error) {
    console.error("Error in updating the logo:", error.message);
    throw new Error("Logo Updation failed: " + error.message);
  }
};
