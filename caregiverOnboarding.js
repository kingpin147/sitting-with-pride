import { saveCaregiverProfile, completeOnboarding, getUserProfile } from 'backend/onboarding.web';
import { getCoordsFromZip } from 'backend/location.web';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';

let finalLat = null;
let finalLng = null;

const STATES = ["stateIdentity", "stateProfessional", "stateProfile"];
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
    if (!profile || profile.role !== "caregiver") {
        console.warn("Unauthorized access: User is not a caregiver.");
        wixLocationFrontend.to("/"); // Or a generic unauthorized page
        return;
    }

    // ✅ Handle Already Onboarded Case
    if (profile.onboardingCompleted) {
        $w('#headingText').text = "You have already applied wait for a family to contact you";
        $w('#multiStateBox').hide();
        $w('#nextBtn').hide();
        $w('#backBtn').hide();
        $w('#progressBar').hide();
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
            // Restore context if validation fails
            if (currentStateIndex === 0) {
                $w('#nextBtn').label = "Next";
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
        showError("Location verification failed. Please try again.");
        return false;
    }
}

async function submitForm() {
    $w('#nextBtn').label = "Uploading Photo...";
    try {
        let photoUrl = "";
        
        // 📸 Handle File Upload
        if ($w('#uploadPhoto').value.length > 0) {
            const uploadResult = await $w('#uploadPhoto').startUpload();
            photoUrl = uploadResult.url;
        }

        $w('#nextBtn').label = "Saving Profile...";
        const profileData = collectCaregiverData(currentUser._id, photoUrl);
        await saveCaregiverProfile(profileData);
        await completeOnboarding(currentUser._id);
        wixLocationFrontend.to("/pricing-plans/plans-pricing");
    } catch (error) {
        console.error("Submission error:", error);
        showError("Submission failed. Please check your internet and try again.");
        $w('#nextBtn').label = "Submit"; // revert
    }
}

// Validation logic
function validateStep1() {
    let isValid = true;
    if (!$w('#firstName').value) isValid = false;
    if (!$w('#lastName').value) isValid = false;
    if (!$w('#pronouns').value) isValid = false;
    if (!$w('#zipCode').value || !/^[0-9]{5}$/.test($w('#zipCode').value)) isValid = false;
    
    if (!isValid) showError("Please fill in all required fields with a valid 5-digit ZIP code.");
    return isValid;
}

function validateStep2() {
    let valid = true;
    if ($w('#yearsExp').value === "" || Number($w('#yearsExp').value) < 0) valid = false;
    if (!$w('#certs').value || $w('#certs').value.length < 1) valid = false;
    if ($w('#hourlyRate').value === "" || Number($w('#hourlyRate').value) < 15) valid = false;
    if (!$w('#services').value || $w('#services').value.length < 1) valid = false;

    if (!valid) {
        showError("Please verify your experience (min 0), rate (min $15), and select at least 1 cert and service.");
        return false;
    }
    return true;
}

function validateStep3() {
    let valid = true;
    if (!$w('#bio').value || $w('#bio').value.length < 100) valid = false;
    if (!$w('#languages').value || $w('#languages').value.length < 1) valid = false;
    if (!$w('#uploadPhoto').value || $w('#uploadPhoto').value.length < 1) valid = false;

    if (!valid) {
        showError("Please write a bio (min 100 chars), select languages, and upload a photo.");
        return false;
    }
    return true;
}

function collectCaregiverData(userId, photoUrl) {
    return {
        userId: userId,
        fullName: $w('#firstName').value + " " + $w('#lastName').value,
        chosenName: $w('#chosenName').value,
        pronouns: $w('#pronouns').value,
        zipCode: $w('#zipCode').value,
        location: {
            latitude: finalLat,
            longitude: finalLng
        },
        yearsOfExperience: Number($w('#yearsExp').value),
        certifications: $w('#certs').value,
        hourlyRate: Number($w('#hourlyRate').value),
        services: $w('#services').value,
        bio: $w('#bio').value,
        languages: $w('#languages').value,
        profilePhoto: photoUrl || ""
    };
}

function showError(message) {
    if ($w('#errorText')) {
        $w('#errorText').text = message;
        $w('#errorText').show();
        setTimeout(() => $w('#errorText').hide(), 5000);
    }
}
