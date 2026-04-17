import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

/**
 * Logs a connection request to the 'ConnectionRequests' collection.
 */
export const saveConnectionRequest = webMethod(
  Permissions.Anyone,
  async (requestData) => {
    try {
      const toInsert = {
        senderUserId: requestData.senderUserId,
        recipientUserId: requestData.recipientUserId,
        senderName: requestData.senderName,
        senderEmail: requestData.senderEmail,
        recipientName: requestData.recipientName,
        recipientEmail: requestData.recipientEmail,
        whoToConnect: requestData.whoToConnect,
        lookingFor: requestData.lookingFor,
        extraInfo: requestData.extraInfo,
        timestamp: new Date()
      };
      
      const result = await wixData.insert("ConnectionRequests", toInsert);
      console.log("Connection Request logged to DB:", result._id);
      return result;
    } catch (error) {
      console.error("Failed to log connection request to DB:", error);
      throw error;
    }
  }
);
