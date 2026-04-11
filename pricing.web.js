import { orders } from 'wix-pricing-plans-backend';
import { Permissions, webMethod } from "wix-web-module";

/**
 * Checks if the current member has any active pricing plans.
 * @returns {Promise<Array>} List of active subscriptions
 */
export const getCurrentMemberPlans = webMethod(
  Permissions.Anyone, // We check internal logic inside
  async () => {
    try {
      const results = await orders.listCurrentMemberOrders();
      
      // Filter only for active or pending orders
      const activePlans = results.filter(order => order.status === 'ACTIVE');
      
      return activePlans.map(plan => ({
        planId: plan.planId,
        planName: plan.planName,
        status: plan.status,
        dateCreated: plan._createdDate
      }));

    } catch (error) {
      console.error("Error fetching member plans:", error);
      throw new Error("Could not retrieve membership info.");
    }
  }
);

/**
 * Checks if the member has a specific plan by Name
 * Useful for checking "Pride Priority" status
 */
export const hasActivePlan = webMethod(
  Permissions.Anyone,
  async (planName) => {
    try {
      const activePlans = await orders.listCurrentMemberOrders();
      return activePlans.some(order => order.planName.includes(planName) && order.status === 'ACTIVE');
    } catch (error) {
      console.error("Plan check failed:", error);
      return false;
    }
  }
);
