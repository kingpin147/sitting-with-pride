import { Permissions, webMethod } from "wix-web-module";
import { authentication } from "wix-members-backend";
import wixData from "wix-data";

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

      return result;

    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }
);