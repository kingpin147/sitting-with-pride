import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";

/**
 * Saves or updates a Caregiver profile.
 */
export const saveCaregiverProfile = webMethod(
  Permissions.Anyone,
  async (profileData) => {
    try {
      // Check if profile exists
      const existing = await wixData.query("CaregiversCollection")
        .eq("userId", profileData.userId)
        .find();

      if (existing.items.length > 0) {
        // Update
        return await wixData.update("CaregiversCollection", {
          ...existing.items[0],
          ...profileData
        });
      } else {
        // Insert new
        const toInsert = {
          ...profileData,
          verificationStatus: "pending",
          isVisible: false,
          badge: "community"
        };
        return await wixData.insert("CaregiversCollection", toInsert);
      }
    } catch (error) {
      console.error("Save Caregiver failed:", error);
      throw error;
    }
  }
);

/**
 * Saves or updates a Family profile.
 */
export const saveFamilyProfile = webMethod(
  Permissions.Anyone,
  async (profileData) => {
    try {
      const existing = await wixData.query("FamiliesCollection")
        .eq("userId", profileData.userId)
        .find();

      if (existing.items.length > 0) {
        return await wixData.update("FamiliesCollection", {
          ...existing.items[0],
          ...profileData
        });
      } else {
        const toInsert = {
          ...profileData,
          plan: "free",
          bookingFee: 8
        };
        return await wixData.insert("FamiliesCollection", toInsert);
      }
    } catch (error) {
      console.error("Save Family failed:", error);
      throw error;
    }
  }
);

/**
 * Marks onboarding as complete in UserProfiles
 */
export const completeOnboarding = webMethod(
  Permissions.Anyone,
  async (userId) => {
    try {
      const profile = await wixData.query("UserProfiles")
        .eq("userId", userId)
        .find();

      if (profile.items.length > 0) {
        return await wixData.update("UserProfiles", {
          ...profile.items[0],
          onboardingCompleted: true
        });
      }
    } catch (error) {
      console.error("Complete onboarding failed:", error);
      throw error;
    }
  }
);
/**
 * Fetches the user profile including role and onboarding status
 */
export const getUserProfile = webMethod(
  Permissions.Anyone,
  async (userId) => {
    try {
      const profile = await wixData.query("UserProfiles")
        .eq("userId", userId)
        .find();
      
      return profile.items.length > 0 ? profile.items[0] : null;
    } catch (error) {
      console.error("Get user profile failed:", error);
      throw error;
    }
  }
);
