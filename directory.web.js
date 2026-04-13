import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";

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
  async (familyUserId) => {
      // 1. Get Family coords
      const familyQuery = await wixData.query("Families")
        .eq("userId", familyUserId)
        .find();
      
      if (familyQuery.items.length === 0) throw new Error("Family user not found");
      const familyLoc = familyQuery.items[0].location;
      if (!familyLoc || !familyLoc.latitude) throw new Error("Family has no geolocation data");

      // 2. Get all Caregivers
      const caregiversQuery = await wixData.query("Caregivers").find();
      const caregivers = caregiversQuery.items;

      // 3. Compute distance and sort
      let results = caregivers.map(caregiver => {
          let distance = null;
          if (caregiver.location && caregiver.location.latitude) {
               distance = getDistanceFromLatLonInMiles(
                   familyLoc.latitude, 
                   familyLoc.longitude, 
                   caregiver.location.latitude,
                   caregiver.location.longitude
               );
          }
          return {
              ...caregiver,
              distance: distance
          };
      });

      // Filter out caregivers without location and sort
      results = results.filter(c => c.distance !== null);
      results.sort((a, b) => a.distance - b.distance);
      
      return results;
  }
);

export const getNearbyFamilies = webMethod(
  Permissions.Anyone,
  async (caregiverUserId) => {
      // 1. Get Caregiver coords
      const cgQuery = await wixData.query("Caregivers")
        .eq("userId", caregiverUserId)
        .find();
      
      if (cgQuery.items.length === 0) throw new Error("Caregiver user not found");
      const cgLoc = cgQuery.items[0].location;
      if (!cgLoc || !cgLoc.latitude) throw new Error("Caregiver has no geolocation data");

      // 2. Get all Families
      const familiesQuery = await wixData.query("Families").find();
      const families = familiesQuery.items;

      // 3. Compute distance and sort
      let results = families.map(family => {
          let distance = null;
          if (family.location && family.location.latitude) {
               distance = getDistanceFromLatLonInMiles(
                   cgLoc.latitude, 
                   cgLoc.longitude, 
                   family.location.latitude,
                   family.location.longitude
               );
          }
          return {
              ...family,
              distance: distance
          };
      });

      results = results.filter(f => f.distance !== null);
      results.sort((a, b) => a.distance - b.distance);
      
      return results;
  }
);
