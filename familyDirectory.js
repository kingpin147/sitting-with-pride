import { getNearbyFamilies } from 'backend/directory.web';
import { currentMember } from 'wix-members-frontend';
import { getUserProfile } from 'backend/onboarding.web';
import { hasAnyActivePlan } from 'backend/pricing.web';

$w.onReady(async function () {
    $w('#loadingText').show();
    $w('#directoryRepeater').hide();

    try {
        const member = await currentMember.getMember();
        let caregiverUserId = null;

        if (member) {
            const [profile, hasPlan] = await Promise.all([
                getUserProfile(member._id),
                hasAnyActivePlan()
            ]);
            
            if (profile && profile.role === "caregiver" && hasPlan) {
                caregiverUserId = member._id;
            }
        }

        const families = await getNearbyFamilies(caregiverUserId);
        
        if (families.length === 0) {
            $w('#loadingText').text = "No families found.";
            return;
        }

        $w('#directoryRepeater').data = families.map(f => ({
            ...f, 
            _id: f._id || f.userId
        }));

        $w('#directoryRepeater').onItemReady(($item, itemData, index) => {
            $item('#nameText').text = itemData.familyName;
            
            if (itemData.isPublic) {
                // 🔒 Public/Restricted View
                if ($item('#distanceText')) $item('#distanceText').hide();
            } else {
                // ✅ Full View (Authorized Caregivers with Plan)
                if ($item('#needsText')) {
                    $item('#needsText').text = `${itemData.careTypeNeeded} • ${itemData.childCount} Child(ren)`;
                    $item('#needsText').show();
                }
                if ($item('#distanceText')) {
                    $item('#distanceText').text = `${itemData.distance.toFixed(1)} miles away`;
                    $item('#distanceText').show();
                }
                if ($item('#viewProfileBtn')) $item('#viewProfileBtn').label = "View Profile";
            }

            if (itemData.familyPhoto && $item('#photoImage')) {
                $item('#photoImage').src = itemData.familyPhoto;
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
