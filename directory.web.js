import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { logError } from 'backend/logger.web';

function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; 
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

export const getNearbyCaregivers = webMethod(
  Permissions.Anyone,
  async (familyUserId = null) => {
      let familyLoc = null;

      // 1. Get Family coords if ID provided
      if (familyUserId) {
          const familyQuery = await wixData.query("FamiliesCollection")
            .eq("userId", familyUserId)
            .find();
          
          if (familyQuery.items.length > 0) {
              familyLoc = familyQuery.items[0].location;
          }
      }

      // 2. Get all Caregivers
      const caregiversQuery = await wixData.query("CaregiversCollection")
        .eq("isVisible", true)
        .find();
      const caregivers = caregiversQuery.items;

      // 3. Compute distance and sort
      let results = caregivers.map(caregiver => {
          let distance = null;
          if (familyLoc && familyLoc.latitude && caregiver.location && caregiver.location.latitude) {
               distance = getDistanceFromLatLonInMiles(
                   familyLoc.latitude, 
                   familyLoc.longitude, 
                   caregiver.location.latitude,
                   caregiver.location.longitude
               );
          }

          // 🛡️ Privacy Layer: If no authorized user ID provided, strip sensitive data
          if (!familyUserId) {
              return {
                  _id: caregiver._id,
                  fullName: caregiver.fullName,
                  profilePhoto: caregiver.profilePhoto,
                  role: caregiver.role || "Caregiver", 
                  isPublic: true
              };
          }

          return {
              ...caregiver,
              email: caregiver.email || "", // Included for messaging
              distance: distance,
              isPublic: false
          };
      });

      if (familyLoc) {
          results = results.filter(c => c.distance !== null);
          results.sort((a, b) => a.distance - b.distance);
      }
      
      return results;
  }
);

export const getNearbyFamilies = webMethod(
  Permissions.Anyone,
  async (caregiverUserId = null) => {
      let cgLoc = null;

      // 1. Get Caregiver coords
      if (caregiverUserId) {
          const cgQuery = await wixData.query("CaregiversCollection")
            .eq("userId", caregiverUserId)
            .find();
          
          if (cgQuery.items.length > 0) {
              cgLoc = cgQuery.items[0].location;
          }
      }

      // 2. Get all Families
      const familiesQuery = await wixData.query("FamiliesCollection").find();
      const families = familiesQuery.items;

      // 3. Compute distance and sort
      let results = families.map(family => {
          let distance = null;
          if (cgLoc && cgLoc.latitude && family.location && family.location.latitude) {
               distance = getDistanceFromLatLonInMiles(
                   cgLoc.latitude, 
                   cgLoc.longitude, 
                   family.location.latitude,
                   family.location.longitude
               );
          }

          // 🛡️ Privacy Layer: If no authorized caregiver ID, strip sensitive data
          if (!caregiverUserId) {
              return {
                  _id: family._id,
                  familyName: family.familyName,
                  city: family.zipCode, 
                  isPublic: true
              };
          }

          return {
              ...family,
              email: family.email || "", // Included for messaging
              distance: distance,
              isPublic: false
          };
      });

      if (cgLoc) {
          results = results.filter(f => f.distance !== null);
          results.sort((a, b) => a.distance - b.distance);
      }
      
      return results;
  }
);
