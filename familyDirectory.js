import { getNearbyFamilies } from 'backend/directory.web';
import { currentMember } from 'wix-members-frontend';

$w.onReady(async function () {
    $w('#loadingText').show();
    $w('#directoryRepeater').hide();

    try {
        const member = await currentMember.getMember();
        if (!member) {
            $w('#loadingText').text = "Please log in to view families.";
            return;
        }

        const families = await getNearbyFamilies(member._id);
        
        if (families.length === 0) {
            $w('#loadingText').text = "No families found near your area.";
            return;
        }

        // Map data uniquely for the repeater
        $w('#directoryRepeater').data = families.map(f => ({
            ...f, 
            _id: f._id || f.userId
        }));

        $w('#directoryRepeater').onItemReady(($item, itemData, index) => {
            $item('#nameText').text = itemData.familyName;
            $item('#needsText').text = `${itemData.careTypeNeeded} • ${itemData.childCount} Child(ren)`;
            $item('#distanceText').text = `${itemData.distance.toFixed(1)} miles away`;
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
