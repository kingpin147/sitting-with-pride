import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { logError, logInfo } from "backend/logger.web";

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
          ...profileData,
          isVisible: profileData.isVisible !== undefined ? profileData.isVisible : existing.items[0].isVisible
        });
      } else {
        // Insert new
        const toInsert = {
          ...profileData,
          verificationStatus: "pending",
          isVisible: profileData.isVisible || false,
          badge: "community"
        };
        return await wixData.insert("CaregiversCollection", toInsert);
      }
    } catch (error) {
      console.error("Save Caregiver failed:", error);
      await logError("onboarding.web.saveCaregiverProfile", error, profileData.userId);
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
      await logError("onboarding.web.saveFamilyProfile", error, profileData.userId);
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
        const result = await wixData.update("UserProfiles", {
          ...profile.items[0],
          onboardingCompleted: true
        });
        await logInfo("onboarding.web.completeOnboarding", "Onboarding marked as complete", userId);
        return result;
      } else {
        const err = new Error(`User profile not found for Complete Onboarding. UserID: ${userId}`);
        await logError("onboarding.web.completeOnboarding", err, userId);
        throw err;
      }
    } catch (error) {
      console.error("Complete onboarding failed:", error);
      await logError("onboarding.web.completeOnboarding", error, userId);
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
      if (profile.items.length > 0) {
        return profile.items[0];
      } else {
        const err = new Error(`User profile not found in UserProfiles collection for UserID: ${userId}`);
        await logError("onboarding.web.getUserProfile", err, userId);
        return null;
      }
    } catch (error) {
      console.error("Get user profile failed:", error);
       // We add extra info on the error to clarify
      const descriptiveError = new Error(`Failed to query UserProfiles for UserID: ${userId}. Original error: ${error.message}`);
      await logError("onboarding.web.getUserProfile", descriptiveError, userId);
      throw descriptiveError;
    }
  }
);
