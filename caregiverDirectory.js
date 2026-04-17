import { getNearbyCaregivers } from 'backend/directory.web';
import { currentMember } from 'wix-members-frontend';
import { getUserProfile } from 'backend/onboarding.web';
import { hasAnyActivePlan } from 'backend/pricing.web';


$w.onReady(async function () {
    $w('#loadingText').show();
    $w('#directoryRepeater').hide();

    try {
        const member = await currentMember.getMember();
        let familyUserId = null;

        if (member) {
            const [profile, hasPlan] = await Promise.all([
                getUserProfile(member._id),
                hasAnyActivePlan()
            ]);
            
            if (profile && profile.role === "family" && hasPlan) {
                familyUserId = member._id;
            }
        }

        const caregivers = await getNearbyCaregivers(familyUserId);
        
        if (caregivers.length === 0) {
            $w('#loadingText').text = "No caregivers found.";
            return;
        }

        $w('#directoryRepeater').data = caregivers.map(cg => ({
            ...cg, 
            _id: cg._id || cg.userId
        }));

        $w('#directoryRepeater').onItemReady(($item, itemData, index) => {
            $item('#nameText').text = itemData.fullName;
            
            if (itemData.isPublic) {
                // 🔒 Public/Restricted View
                if ($item('#bioText')) $item('#bioText').hide();
                if ($item('#distanceText')) $item('#distanceText').hide();
                if ($item('#expText')) $item('#expText').hide();
                if ($item('#rateText')) $item('#rateText').hide();
            } else {
                // ✅ Full View (Authorized Families with Plan)
                if ($item('#bioText')) {
                    $item('#bioText').text = itemData.bio;
                    $item('#bioText').show();
                }
                if ($item('#distanceText')) {
                    $item('#distanceText').text = `${itemData.distance.toFixed(1)} miles away`;
                    $item('#distanceText').show();
                }
                if ($item('#expText')) {
                    $item('#expText').text = `${itemData.yearsOfExperience} yrs exp.`;
                    $item('#expText').show();
                }
                if ($item('#rateText')) {
                    $item('#rateText').text = `$${itemData.hourlyRate}/hr`;
                    $item('#rateText').show();
                }
                if ($item('#viewProfileBtn')) $item('#viewProfileBtn').label = "View Profile";
            }

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
