import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';
import { getUserProfile } from 'backend/onboarding.web';
import { hasAnyActivePlan } from 'backend/pricing.web';

$w.onReady(async function () {
    const member = await currentMember.getMember();
    if (!member) return;

    try {
        const [profile, hasPlan] = await Promise.all([
            getUserProfile(member._id),
            hasAnyActivePlan()
        ]);

        if (!profile) return;

        const path = wixLocationFrontend.path;

        // 🛡️ Caregiver Redirection Logic
        if (profile.role === 'caregiver' && hasPlan && !profile.onboardingCompleted) {
            if (!path.includes('caregiver-onboarding')) {
                wixLocationFrontend.to('/caregiver-onboarding');
            }
        }

        // 🏠 Family Redirection Logic
        if (profile.role === 'family' && !profile.onboardingCompleted) {
            if (!path.includes('family-onboarding')) {
                wixLocationFrontend.to('/family-onboarding');
            }
        }

        // 🛠️ Dynamic Menu Restructuring
        const menu = $w('#menu1');
        if (menu) {
            let menuItems = menu.menuItems;

            // 1. Handle "Family" Dropdown
            let familyMenu = menuItems.find(item => item.label === "Family" || item.label === "Families");
            if (familyMenu) {
                familyMenu.label = "Family"; // Fix typo: "Families" -> "Family"
                familyMenu.menuItems = familyMenu.menuItems || [];
                const onboardingExists = familyMenu.menuItems.some(i => i.label === "Family Onboarding");
                if (!onboardingExists) {
                    familyMenu.menuItems.push({
                        label: "Family Onboarding",
                        link: "/family-onboarding"
                    });
                }
                
                // Add Caregiver Directory if plan active
                if (hasPlan) {
                     const directoryExists = familyMenu.menuItems.some(item => item.label === "Caregiver Directory");
                     if (!directoryExists) {
                         familyMenu.menuItems.push({
                             label: "Caregiver Directory",
                             link: "/caregiver-directory"
                         });
                     }
                }
            }

            // 2. Handle "Caregivers" Dropdown
            let caregiverMenu = menuItems.find(item => item.label === "Caregivers");
            if (caregiverMenu) {
                caregiverMenu.menuItems = caregiverMenu.menuItems || [];
                const onboardingExists = caregiverMenu.menuItems.some(i => i.label === "Caregiver Onboarding");
                if (!onboardingExists) {
                    caregiverMenu.menuItems.push({
                        label: "Caregiver Onboarding",
                        link: "/caregiver-onboarding"
                    });
                }

                // Background Check
                const bgCheckExists = caregiverMenu.menuItems.some(item => item.label === "Background Check");
                if (!bgCheckExists) {
                    caregiverMenu.menuItems.push({
                        label: "Background Check",
                        link: "/bgchecker"
                    });
                }
            }

            menu.menuItems = menuItems;
        }

        // 🔙 Navigation "Back" button for Pricing Page
        if (path.includes('plans-pricing')) {
            if ($w('#backToOnboarding')) {
                $w('#backToOnboarding').show();
                $w('#backToOnboarding').onClick(() => {
                    if (profile.role === 'caregiver') wixLocationFrontend.to('/caregiver-onboarding');
                    else wixLocationFrontend.to('/family-onboarding');
                });
            }
        } else {
            if ($w('#backToOnboarding')) $w('#backToOnboarding').hide();
        }

    } catch (err) {
        console.error("Master Page Logic Error:", err);
    }
});