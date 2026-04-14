import { saveFamilyProfile, completeOnboarding, getUserProfile } from 'backend/onboarding.web';
import { getCoordsFromZip } from 'backend/location.web';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';

let finalLat = null;
let finalLng = null;

const STATES = ["stateBasics", "stateNeeds", "stateEnvironment"];
let currentStateIndex = 0;
let currentUser = null;

$w.onReady(async function () {
    $w('#errorText').hide();

    // Ensure current user is logged in
    currentUser = await currentMember.getMember();
    if (!currentUser) {
        wixLocationFrontend.to("/");
        return;
    }

    // ✅ Verify Role from Database
    const profile = await getUserProfile(currentUser._id);
    if (!profile || profile.role !== "family") {
        console.warn("Unauthorized access: User is not a family member.");
        wixLocationFrontend.to("/");
        return;
    }

    updateUIBasedOnState();

    $w('#nextBtn').onClick(async () => {
        $w('#nextBtn').disable();
        
        let isValid = false;
        
        if (currentStateIndex === 0) {
            $w('#nextBtn').label = "Checking...";
            isValid = await validateAndProcessStep1();
        } else if (currentStateIndex === 1) {
            isValid = validateStep2();
        } else if (currentStateIndex === STATES.length - 1) {
            isValid = validateStep3();
            if (isValid) {
                await submitForm();
            }
            $w('#nextBtn').enable();
            return;
        }

        if (isValid) {
            currentStateIndex++;
            updateUIBasedOnState();
        } else {
            if (currentStateIndex === 0) {
                $w('#nextBtn').label = "Next"; // Restore
            }
        }
        $w('#nextBtn').enable();
    });

    $w('#backBtn').onClick(() => {
        if (currentStateIndex > 0) {
            currentStateIndex--;
            updateUIBasedOnState();
        }
    });
});

function updateUIBasedOnState() {
    $w('#multiStateBox').changeState(STATES[currentStateIndex]);
    $w('#progressBar').value = Math.round(((currentStateIndex + 1) / STATES.length) * 100);
    
    if (currentStateIndex === 0) {
        $w('#backBtn').hide();
    } else {
        $w('#backBtn').show();
    }
    
    if (currentStateIndex === STATES.length - 1) {
        $w('#nextBtn').label = "Submit";
    } else {
        $w('#nextBtn').label = "Next";
    }
}

async function validateAndProcessStep1() {
    if (!validateStep1()) return false;
    
    try {
        const zip = $w('#zipCode').value;
        const geoResult = await getCoordsFromZip(zip);
        
        if (geoResult.success) {
            finalLat = geoResult.lat;
            finalLng = geoResult.lng;
            return true;
        } else {
            showError("Invalid ZIP code. Please check and try again.");
            return false;
        }
    } catch (err) {
        showError("Location check failed. Please try again.");
        return false;
    }
}

async function submitForm() {
    $w('#nextBtn').label = "Processing...";
    try {
        const familyData = collectFamilyData(currentUser._id);
        await saveFamilyProfile(familyData);
        await completeOnboarding(currentUser._id);
        wixLocationFrontend.to("/pricing-plans/plans-pricing");
    } catch (error) {
        console.error(error);
        showError("Submission failed. Please try again later.");
        $w('#nextBtn').label = "Submit"; // revert
    }
}

function validateStep1() {
    let isValid = true;
    if (!$w('#familyName').value) isValid = false;
    if (!$w('#zipCode').value || !/^[0-9]{5}$/.test($w('#zipCode').value)) isValid = false;
    if (!isValid) showError("Please fill in the family name and a valid 5-digit ZIP code.");
    return isValid;
}

function validateStep2() {
    if (!$w('#childCount').value || !$w('#childAges').value || !$w('#careType').value) {
        showError("Please provide details about your care needs.");
        return false;
    }
    return true;
}

function validateStep3() {
    if (!$w('#preferences').value) {
        showError("Please specify your ideal match preferences.");
        return false;
    }
    return true;
}

function collectFamilyData(userId) {
    return {
        userId: userId,
        familyName: $w('#familyName').value,
        chosenNames: $w('#chosenNames').value,
        zipCode: $w('#zipCode').value,
        location: {
            latitude: finalLat,
            longitude: finalLng
        },
        childCount: Number($w('#childCount').value),
        childAges: $w('#childAges').value,
        careTypeNeeded: $w('#careType').value,
        specialNeeds: $w('#specialNeeds').value,
        homeNotes: $w('#homeNotes').value,
        preferences: $w('#preferences').value
    };
}

function showError(message) {
    if ($w('#errorText')) {
        $w('#errorText').text = message;
        $w('#errorText').show();
        setTimeout(() => $w('#errorText').hide(), 5000);
    }
}
