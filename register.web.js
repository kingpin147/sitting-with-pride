import { Permissions, webMethod } from "wix-web-module";
import { authentication } from "wix-members-backend";
import wixData from "wix-data";
import { logError, logInfo } from "backend/logger.web";

export const registerMember = webMethod(
  Permissions.Anyone,
  async (email, password, options, extraData) => {
    try {
      // 🔐 Register member in Wix
      const result = await authentication.register(email, password, options);

      const memberId = result.member._id;

      // 💾 Save custom data (role, name, etc.)
      await wixData.insert("UserProfiles", {
        userId: memberId,
        firstName: extraData.firstName,
        lastName: extraData.lastName,
        role: extraData.role,
        plan: "free",
        onboardingCompleted: false
      });

      await logInfo("register.web", `Registration successful for role: ${extraData.role}`, memberId);
      return result;

    } catch (error) {
      console.error("Registration error:", error);
      await logError("register.web", error);
      throw error;
    }
  }
);