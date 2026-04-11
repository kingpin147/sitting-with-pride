import { saveFamilyProfile, completeOnboarding } from 'backend/onboarding.web';
import { getCoordsFromZip } from 'backend/location.web';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';

$w.onReady(function () {
    // 1. Initial State
    $w('#multiStateBox').changeState("stateFamilyBasics");
    $w('#progressBar').value = 33;

    // --- STEP 1: FAMILY BASICS ---
    $w('#nextBtn1').onClick(async () => {
        if (validateStep1()) {
            $w('#nextBtn1').disable();
            $w('#nextBtn1').label = "Checking...";

            try {
                const zip = $w('#zipCode').value;
                const geoResult = await getCoordsFromZip(zip);
                
                if (geoResult.success) {
                    $w('#multiStateBox').changeState("stateCareNeeds");
                    $w('#progressBar').value = 66;
                } else {
                    showError("Invalid ZIP code. Please check and try again.");
                }
            } catch (err) {
                showError("Location check failed. Please try again.");
            } finally {
                $w('#nextBtn1').enable();
                $w('#nextBtn1').label = "Next";
            }
        }
    });

    // --- STEP 2: CARE NEEDS ---
    $w('#nextBtn2').onClick(() => {
        if (validateStep2()) {
            $w('#multiStateBox').changeState("stateEnvironment");
            $w('#progressBar').value = 100;
        }
    });

    // --- STEP 3: ENVIRONMENT & PREFERENCES ---
    $w('#submitBtn').onClick(async () => {
        $w('#submitBtn').disable();
        $w('#submitBtn').label = "Saving...";

        try {
            const member = await currentMember.getMember();
            if (!member) {
                showError("Please log in to complete onboarding.");
                return;
            }

            // 1. Collect all family data
            const familyData = collectFamilyData(member._id);

            // 2. Save to CMS
            await saveFamilyProfile(familyData);

            // 3. Mark onboarding complete
            await completeOnboarding(member._id);

            // 4. Redirect to Dashboard or Success Page
            wixLocationFrontend.to("/dashboard");

        } catch (error) {
            console.error(error);
            showError("Submission failed. Please try again later.");
        } finally {
            $w('#submitBtn').enable();
            $w('#submitBtn').label = "Complete Registration";
        }
    });
});

/**
 * Validates Step 1: Family Basics
 */
function validateStep1() {
    let isValid = true;
    if (!$w('#familyName').valid) isValid = false;
    if (!$w('#zipCode').valid) isValid = false;
    
    if (!isValid) showError("Please fill in the family name and ZIP code.");
    return isValid;
}

/**
 * Validates Step 2: Care Needs
 */
function validateStep2() {
    if (!$w('#childCount').valid || !$w('#careType').valid) {
        showError("Please provide details about your care needs.");
        return false;
    }
    return true;
}

/**
 * Gathers all form data into a single object
 */
function collectFamilyData(userId) {
    return {
        userId: userId,
        familyName: $w('#familyName').value,
        chosenNames: $w('#chosenNames').value,
        zipCode: $w('#zipCode').value,
        childCount: Number($w('#childCount').value),
        childAges: $w('#childAges').value,
        careType: $w('#careType').value,
        specialNeeds: $w('#specialNeeds').value,
        homeNotes: $w('#homeNotes').value,
        matchPreferences: $w('#matchPreferences').value
    };
}

/**
 * Utility to show error messages
 */
function showError(message) {
    $w('#errorText').text = message;
    $w('#errorText').show();
    setTimeout(() => $w('#errorText').hide(), 5000);
}
