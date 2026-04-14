import { getNearbyCaregivers } from 'backend/directory.web';
import { currentMember } from 'wix-members-frontend';
import { getUserProfile } from 'backend/onboarding.web';
import { hasAnyActivePlan } from 'backend/pricing.web';

$w.onReady(async function () {
    $w('#loadingText').show();
    $w('#directoryRepeater').hide();

    try {
        const member = await currentMember.getMember();
        if (!member) {
            $w('#loadingText').text = "Please log in to view caregivers.";
            return;
        }

        // ✅ Verify Role from Database
        const profile = await getUserProfile(member._id);
        if (!profile || profile.role !== "family") {
             $w('#loadingText').text = "Access denied. The directory is only for family members.";
             return;
        }

        // ✅ Check for ANY Active Pricing Plan
        const planActive = await hasAnyActivePlan();
        if (!planActive) {
             $w('#loadingText').text = "An active pricing plan is required to view the directory.";
             return;
        }

        const caregivers = await getNearbyCaregivers(member._id);
        
        if (caregivers.length === 0) {
            $w('#loadingText').text = "No caregivers found near your area.";
            return;
        }

        // Map data uniquely for the repeater
        $w('#directoryRepeater').data = caregivers.map(cg => ({
            ...cg, 
            _id: cg._id || cg.userId
        }));

        $w('#directoryRepeater').onItemReady(($item, itemData, index) => {
            $item('#nameText').text = itemData.fullName;
            $item('#bioText').text = itemData.bio;
            $item('#distanceText').text = `${itemData.distance.toFixed(1)} miles away`;
            $item('#expText').text = `${itemData.yearsOfExperience} yrs exp.`;
            $item('#rateText').text = `$${itemData.hourlyRate}/hr`;
            if (itemData.profilePhoto && $item('#photoImage')) {
                $item('#photoImage').src = itemData.profilePhoto;
            }
        });

        $w('#loadingText').hide();
        $w('#directoryRepeater').show();

    } catch (error) {
        console.error(error);
        if (error.message.includes("no geolocation data")) {
             $w('#loadingText').text = "Please complete your Onboarding to set your location first.";
        } else {
             $w('#loadingText').text = "An error occurred while loading the directory.";
        }
    }
});
