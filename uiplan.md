Onboarding UI & Frontend Code Guide
To build a premium onboarding experience, we will use the Multi-State Box component in Wix Studio. This allows us to keep the user focused on one category of information at a time without overwhelming them.

🎨 Visual Design Principles
Progress Tracking: Always show a Progress Bar at the top so users know how much is left.
Inclusive Microcopy: Use labels like "What is your chosen name?" and "What are your pronouns?" to affirm identity.
Visual Feedback: Use subtle hover effects on buttons and clear error messages ($w('#errorText').show()).
🧑⚕️ Caregiver Onboarding (4 Steps)
Step 1: Basic Identity (stateIdentity)
Inputs: #firstName, #lastName, #chosenName, #pronouns (Dropdown), #zipCode.
Logic: Click "Next" -> Call getCoordsFromZip (Backend) -> Move to next state.
Step 2: Professional Info (stateProfessional)
Inputs: #yearsExperience (Number), #certifications (Multi-Select or Checkboxes), #hourlyRate (Number).
Services: Checkbox group for Live-In, Part-Time, Travel, etc.
Step 3: Profile & About (stateProfile)
Inputs: #bio (Rich Text or Text Box), #languages (Tags/Selection).
Media: #uploadPhoto (Wix Upload Button).
Step 4: Verification Paywall (statePayment)
Content: Information about the $35 background check.
Action: #verifyBtn -> Triggers wix-pricing-plans-frontend.checkout.
👨👩👧 Family Onboarding (3 Steps)
Step 1: Family Basics
Inputs: #familyName, #chosenNames, #zipCode.
Step 2: Care Needs
Inputs: #childCount, #childAges, #careType (Dropdown).
Step 3: Environment & Preferences
Inputs: #specialNeeds (Text Box), #homeNotes, #matchPreferences.
💻 Generic Velo Logic (Copy & Adapt)
Add this to your Onboarding Page Code:

javascript
import { saveCaregiverProfile, completeOnboarding } from 'backend/onboarding.web';
import { getCoordsFromZip } from 'backend/location.web';
import { checkout } from 'wix-pricing-plans-frontend';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members-frontend';
$w.onReady(function () {
    // Initial State
    $w('#multiStateBox').changeState("stateIdentity");
    $w('#progressBar').value = 25;
    // Navigation: Step 1 -> Step 2
    $w('#nextBtn1').onClick(async () => {
        if (validateStep1()) {
            $w('#multiStateBox').changeState("stateProfessional");
            $w('#progressBar').value = 50;
        }
    });
    // Final Submission & Payment
    $w('#verifyBtn').onClick(async () => {
        const member = await currentMember.getMember();
        
        // 1. Save all data to CMS
        const profileData = collectFormData();
        await saveCaregiverProfile(profileData);
        
        // 2. Mark onboarding phase 1 complete
        await completeOnboarding(member._id);
        // 3. Open Payment for $35 Verification Plan
        const planId = "YOUR_VERIFICATION_PLAN_ID"; // Get from Wix Dashboard
        await checkout.startCheckout(planId);
    });
});
function validateStep1() {
    // Add logic to check if required fields are filled
    return true; 
}
function collectFormData() {
    // Return an object with all input values
    return {
        fullName: $w('#firstName').value + " " + $w('#lastName').value,
        zipCode: $w('#zipCode').value,
        // ... add all other fields
    };
}
🛠️ Wix Components to Add
Multi-State Box (ID: #multiStateBox)
Progress Bar (ID: #progressBar)
Text Inputs / Dropdowns (Match IDs in code)
Upload Button (For photos)
Success Lightbox (Optional, to show after payment)