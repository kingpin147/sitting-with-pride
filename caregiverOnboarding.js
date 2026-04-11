import { saveCaregiverProfile, completeOnboarding } from 'backend/onboarding.web';
import { getCoordsFromZip } from 'backend/location.web';
import { checkout } from 'wix-pricing-plans-frontend';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';

$w.onReady(function () {
    // 1. Initial State
    $w('#multiStateBox').changeState("stateIdentity");
    $w('#progressBar').value = 25;

    // --- STEP 1: IDENTITY ---
    $w('#nextBtn1').onClick(async () => {
        if (validateStep1()) {
            $w('#nextBtn1').disable();
            $w('#nextBtn1').label = "Saving...";

            try {
                // Geocode the ZIP code
                const zip = $w('#zipCode').value;
                const geoResult = await getCoordsFromZip(zip);
                
                if (geoResult.success) {
                    // Temporarily store geocoded data if needed or proceed
                    $w('#multiStateBox').changeState("stateProfessional");
                    $w('#progressBar').value = 50;
                } else {
                    showError("Invalid ZIP code. Please check and try again.");
                }
            } catch (err) {
                showError("Location verification failed. Please try again.");
            } finally {
                $w('#nextBtn1').enable();
                $w('#nextBtn1').label = "Next";
            }
        }
    });

    // --- STEP 2: PROFESSIONAL ---
    $w('#nextBtn2').onClick(() => {
        if (validateStep2()) {
            $w('#multiStateBox').changeState("stateProfile");
            $w('#progressBar').value = 75;
        }
    });

    // --- STEP 3: PROFILE ---
    $w('#nextBtn3').onClick(() => {
        if (validateStep3()) {
            $w('#multiStateBox').changeState("statePayment");
            $w('#progressBar').value = 100;
        }
    });

    // --- STEP 4: PAYMENT & FINAL SUBMIT ---
    $w('#verifyBtn').onClick(async () => {
        $w('#verifyBtn').disable();
        $w('#verifyBtn').label = "Processing...";

        try {
            const member = await currentMember.getMember();
            if (!member) {
                showError("Please log in to complete onboarding.");
                return;
            }

            // 1. Collect all data
            const profileData = collectCaregiverData(member._id);

            // 2. Save to CMS
            await saveCaregiverProfile(profileData);

            // 3. Mark phase 1 complete
            await completeOnboarding(member._id);

            // 4. Trigger Payment for Verification
            const planId = "YOUR_VERIFICATION_PLAN_ID"; // REPLACE WITH ACTUAL PLAN ID
            await checkout.startCheckout(planId);

        } catch (error) {
            console.error(error);
            showError("Standard submission failed. Please try again.");
        } finally {
            $w('#verifyBtn').enable();
            $w('#verifyBtn').label = "Verify & Pay";
        }
    });
});

/**
 * Validates Step 1: Identity
 */
function validateStep1() {
    let isValid = true;
    if (!$w('#firstName').valid) isValid = false;
    if (!$w('#lastName').valid) isValid = false;
    if (!$w('#zipCode').valid) isValid = false;
    
    if (!isValid) showError("Please fill in all required fields.");
    return isValid;
}

/**
 * Validates Step 2: Professional
 */
function validateStep2() {
    if (!$w('#yearsExperience').valid || !$w('#hourlyRate').valid) {
        showError("Please provide your experience and rate.");
        return false;
    }
    return true;
}

/**
 * Validates Step 3: Profile
 */
function validateStep3() {
    if (!$w('#bio').valid) {
        showError("Please write a short bio about yourself.");
        return false;
    }
    return true;
}

/**
 * Gathers all form data into a single object
 */
function collectCaregiverData(userId) {
    return {
        userId: userId,
        firstName: $w('#firstName').value,
        lastName: $w('#lastName').value,
        chosenName: $w('#chosenName').value,
        pronouns: $w('#pronouns').value,
        zipCode: $w('#zipCode').value,
        yearsExperience: Number($w('#yearsExperience').value),
        certifications: $w('#certifications').value, // Assumes multi-select or checkbox group
        hourlyRate: Number($w('#hourlyRate').value),
        services: $w('#services').value, // Assumes checkbox group
        bio: $w('#bio').value,
        languages: $w('#languages').value,
        profileImage: $w('#uploadPhoto').value[0] ? $w('#uploadPhoto').value[0].url : ""
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
